// import crypto from 'crypto';
// import redisClient, { isRedisAvailable } from '../config/redisClient.js';

// const DEFAULT_TTL_SECONDS = 120;
// const INDEX_PREFIX = 'cache:index';
// const KEY_PREFIX = 'cache:item';

// const toPositiveNumber = (value, fallback) => {
//   const parsed = Number(value);
//   return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
// };

// const MAX_CACHEABLE_BODY_BYTES = toPositiveNumber(
//   process.env.CACHE_MAX_BODY_BYTES,
//   64 * 1024
// );
// const MAX_CACHEABLE_RESPONSE_BYTES = toPositiveNumber(
//   process.env.CACHE_MAX_RESPONSE_BYTES,
//   512 * 1024
// );
// const MAX_CACHEABLE_SIGNATURE_BYTES = toPositiveNumber(
//   process.env.CACHE_MAX_SIGNATURE_BYTES,
//   32 * 1024
// );
// const INVALIDATION_CHUNK_SIZE = toPositiveNumber(
//   process.env.CACHE_INVALIDATION_CHUNK,
//   200
// );

// const normalizeValue = (value) => {
//   if (Array.isArray(value)) {
//     return value.map(normalizeValue);
//   }

//   if (value && typeof value === 'object') {
//     return Object.keys(value)
//       .sort()
//       .reduce((acc, key) => {
//         acc[key] = normalizeValue(value[key]);
//         return acc;
//       }, {});
//   }

//   return value;
// };

// const buildCacheMetadata = (namespace, req) => {
//   const method = req.method?.toUpperCase?.() || 'GET';
//   const baseUrl = req.baseUrl || '';
//   const path = req.path || req.originalUrl || '';
//   const query = normalizeValue(req.query || {});

//   const fingerprint = { method, baseUrl, path, query };

//   let bodyBytes = 0;
//   if (method !== 'GET' && req.body && Object.keys(req.body).length) {
//     const normalizedBody = normalizeValue(req.body);
//     fingerprint.body = normalizedBody;
//     const bodyString = JSON.stringify(normalizedBody);
//     bodyBytes = Buffer.byteLength(bodyString, 'utf8');
//   }

//   const fingerprintString = JSON.stringify(fingerprint);
//   const fingerprintBytes = Buffer.byteLength(fingerprintString, 'utf8');
//   const hash = crypto.createHash('sha256').update(fingerprintString).digest('hex');

//   return {
//     cacheKey: `${KEY_PREFIX}:${namespace}:${hash}`,
//     bodyBytes,
//     fingerprintBytes,
//   };
// };

// const namespaceIndexKey = (namespace) => `${INDEX_PREFIX}:${namespace}`;

// const registerCacheKey = async (namespace, cacheKey, ttlSeconds) => {
//   try {
//     const indexKey = namespaceIndexKey(namespace);
//     const indexTtl = Math.max(ttlSeconds * 2, 600);

//     await Promise.all([
//       redisClient.sadd(indexKey, cacheKey),
//       redisClient.expire(indexKey, indexTtl),
//     ]);
//   } catch (error) {
//     console.error(`[cache] Failed to register cache key for namespace "${namespace}":`, error);
//   }
// };

// const chunkArray = (array, size) => {
//   if (size <= 0) return [array];
//   const chunks = [];
//   for (let i = 0; i < array.length; i += size) {
//     chunks.push(array.slice(i, i + size));
//   }
//   return chunks;
// };

// const deleteKeysInChunks = async (keys) => {
//   const chunks = chunkArray(keys, INVALIDATION_CHUNK_SIZE);
//   for (const chunk of chunks) {
//     try {
//       await redisClient.del(...chunk);
//     } catch (error) {
//       console.error('[cache] Failed to delete cache chunk:', error);
//     }
//   }
// };

// const toUtf8String = (value) => {
//   if (value == null) return null;
//   if (Buffer.isBuffer(value)) return value.toString('utf8');
//   if (typeof value === 'object') return JSON.stringify(value);
//   return String(value);
// };

// const shouldBypassCache = (req) => {
//   if (!isRedisAvailable) return 'DISABLED';

//   const method = req.method?.toUpperCase?.() || '';
//   if (!['GET', 'POST'].includes(method)) return 'METHOD';

//   if (req.headers['cache-control']?.includes('no-store')) return 'REQ_NO_STORE';
//   if (req.headers['pragma']?.includes('no-cache')) return 'REQ_NO_CACHE';
//   if (req.headers['x-cache-bypass'] === '1') return 'BYPASS_HEADER';
//   if (req.headers['x-anon-id']) return 'ANON_HEADER';
//   if (req.query?.anonId) return 'ANON_QUERY';
//   if (req.body?.anonId) return 'ANON_BODY';
//   if (req.user) return 'AUTH_USER';
//   if (req.headers.authorization) return 'AUTH_HEADER';

//   return null;
// };

// export const cacheResponse = ({
//   namespace,
//   ttlSeconds = DEFAULT_TTL_SECONDS,
// } = {}) => {
//   if (!namespace) {
//     throw new Error('cacheResponse middleware requires a "namespace" option.');
//   }

//   return async (req, res, next) => {
//     const skipReason = shouldBypassCache(req);
//     if (skipReason) {
//       res.set('X-Cache', `SKIP-${skipReason}`);
//       return next();
//     }

//     if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
//       res.set('X-Cache', 'SKIP-TTL');
//       return next();
//     }

//     const { cacheKey, bodyBytes, fingerprintBytes } = buildCacheMetadata(namespace, req);

//     if (bodyBytes > MAX_CACHEABLE_BODY_BYTES) {
//       res.set('X-Cache', 'SKIP-REQ-LARGE');
//       return next();
//     }

//     if (fingerprintBytes > MAX_CACHEABLE_SIGNATURE_BYTES) {
//       res.set('X-Cache', 'SKIP-SIGNATURE-LARGE');
//       return next();
//     }

//     try {
//       const cachedPayload = await redisClient.get(cacheKey);

//       if (cachedPayload) {
//         const cachedString = toUtf8String(cachedPayload);
//         let parsed;

//         try {
//           parsed = JSON.parse(cachedString);
//         } catch (parseErr) {
//           console.warn(
//             `[cache] Corrupt JSON for key "${cacheKey}", deleting`,
//             parseErr.message
//           );
//           await redisClient.del(cacheKey);
//           res.set('X-Cache', 'MISS-CORRUPT');
//           return next();
//         }

//         res.set('X-Cache', 'HIT');
//         res.set('X-Cache-TTL', String(ttlSeconds));
//         return res.json(parsed);
//       }
//     } catch (error) {
//       console.error(`[cache] Failed to read cache key "${cacheKey}":`, error);
//     }

//     res.set('X-Cache', 'MISS');

//     const originalJson = res.json.bind(res);
//     res.json = (body) => {
//       const result = originalJson(body);

//       const statusOk = res.statusCode >= 200 && res.statusCode < 300;
//       const explicitError = body && (body.error === true || body.success === false);

//       if (!statusOk || explicitError) {
//         return result;
//       }

//       let payload;
//       try {
//         payload = JSON.stringify(body);
//       } catch (error) {
//         console.error(`[cache] Failed to serialize response for key "${cacheKey}":`, error);
//         return result;
//       }

//       const payloadBytes = Buffer.byteLength(payload, 'utf8');
//       if (payloadBytes > MAX_CACHEABLE_RESPONSE_BYTES) {
//         res.set('X-Cache-Store', 'SKIP-RESP-LARGE');
//         return result;
//       }

//       redisClient
//         .set(cacheKey, payload, { ex: ttlSeconds })
//         .then(() => registerCacheKey(namespace, cacheKey, ttlSeconds))
//         .catch((error) => {
//           console.error(`[cache] Failed to store cache key "${cacheKey}":`, error);
//         });

//       return result;
//     };

//     return next();
//   };
// };

// export const invalidateCacheNamespaces = async (namespaces = []) => {
//   if (!isRedisAvailable) return;

//   const list = Array.isArray(namespaces) ? namespaces : [namespaces];
//   const uniqueNamespaces = [...new Set(list.filter(Boolean))];

//   await Promise.all(
//     uniqueNamespaces.map(async (namespace) => {
//       const indexKey = namespaceIndexKey(namespace);

//       try {
//         const members = await redisClient.smembers(indexKey);
//         if (members?.length) {
//           await deleteKeysInChunks(members);
//         }
//         await redisClient.del(indexKey);
//       } catch (error) {
//         console.error(`[cache] Failed to invalidate namespace "${namespace}":`, error);
//       }
//     })
//   );
// };




// path: src/middleware/cache.middleware.js
import crypto from 'crypto';
import redisClient, { isRedisAvailable } from '../config/redisClient.js';

const INDEX_PREFIX = 'cache:index';
const KEY_PREFIX = 'cache:item';

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const NORMAL_CACHE_TTL_SECONDS = 300;
const DEFAULT_TTL_SECONDS = toPositiveNumber(
  process.env.CACHE_DEFAULT_TTL_SECONDS,
  NORMAL_CACHE_TTL_SECONDS
);

const MAX_CACHEABLE_BODY_BYTES = toPositiveNumber(
  process.env.CACHE_MAX_BODY_BYTES,
  64 * 1024
);
const MAX_CACHEABLE_RESPONSE_BYTES = toPositiveNumber(
  process.env.CACHE_MAX_RESPONSE_BYTES,
  512 * 1024
);
const MAX_CACHEABLE_SIGNATURE_BYTES = toPositiveNumber(
  process.env.CACHE_MAX_SIGNATURE_BYTES,
  32 * 1024
);
const INVALIDATION_CHUNK_SIZE = toPositiveNumber(
  process.env.CACHE_INVALIDATION_CHUNK,
  200
);

const normalizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeValue(value[key]);
        return acc;
      }, {});
  }

  return value;
};

const buildCacheMetadata = (namespace, req) => {
  const method = req.method?.toUpperCase?.() || 'GET';
  const baseUrl = req.baseUrl || '';
  const path = req.path || req.originalUrl || '';
  const query = normalizeValue(req.query || {});
  const locale =
    req.query?.lang ||
    req.query?.locale ||
    req.body?.lang ||
    req.body?.locale ||
    req.headers?.['x-locale'] ||
    req.headers?.['x-language'] ||
    req.headers?.['accept-language'] ||
    '';

  const fingerprint = { method, baseUrl, path, query, locale };

  let bodyBytes = 0;
  if (method !== 'GET' && req.body && Object.keys(req.body).length) {
    const normalizedBody = normalizeValue(req.body);
    fingerprint.body = normalizedBody;
    const bodyString = JSON.stringify(normalizedBody);
    bodyBytes = Buffer.byteLength(bodyString, 'utf8');
  }

  const fingerprintString = JSON.stringify(fingerprint);
  const fingerprintBytes = Buffer.byteLength(fingerprintString, 'utf8');
  const hash = crypto.createHash('sha256').update(fingerprintString).digest('hex');

  return {
    cacheKey: `${KEY_PREFIX}:${namespace}:${hash}`,
    bodyBytes,
    fingerprintBytes,
  };
};

const namespaceIndexKey = (namespace) => `${INDEX_PREFIX}:${namespace}`;

const registerCacheKey = async (namespace, cacheKey, ttlSeconds) => {
  try {
    const indexKey = namespaceIndexKey(namespace);
    const indexTtl = Math.max(ttlSeconds * 2, 600);

    await Promise.all([
      redisClient.sadd(indexKey, cacheKey),
      redisClient.expire(indexKey, indexTtl),
    ]);
  } catch (error) {
    console.error(`[cache] Failed to register cache key for namespace "${namespace}":`, error);
  }
};

const chunkArray = (array, size) => {
  if (size <= 0) return [array];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const deleteKeysInChunks = async (keys) => {
  const chunks = chunkArray(keys, INVALIDATION_CHUNK_SIZE);
  for (const chunk of chunks) {
    try {
      await redisClient.del(...chunk);
    } catch (error) {
      console.error('[cache] Failed to delete cache chunk:', error);
    }
  }
};

const toUtf8String = (value) => {
  if (value == null) return null;
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const shouldBypassCache = (req) => {
  if (!isRedisAvailable) return 'DISABLED';

  const method = req.method?.toUpperCase?.() || '';
  if (!['GET', 'POST'].includes(method)) return 'METHOD';

  if (req.headers['cache-control']?.includes('no-store')) return 'REQ_NO_STORE';
  if (req.headers['pragma']?.includes('no-cache')) return 'REQ_NO_CACHE';
  if (req.headers['x-cache-bypass'] === '1') return 'BYPASS_HEADER';
  if (req.headers['x-anon-id']) return 'ANON_HEADER';
  if (req.query?.anonId) return 'ANON_QUERY';
  if (req.body?.anonId) return 'ANON_BODY';
  if (req.user) return 'AUTH_USER';
  if (req.headers.authorization) return 'AUTH_HEADER';

  return null;
};

export const cacheResponse = ({
  namespace,
  ttlSeconds = DEFAULT_TTL_SECONDS,
} = {}) => {
  if (!namespace) {
    throw new Error('cacheResponse middleware requires a "namespace" option.');
  }

  return async (req, res, next) => {
    const skipReason = shouldBypassCache(req);
    if (skipReason) {
      res.set('X-Cache', `SKIP-${skipReason}`);
      return next();
    }

    if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
      res.set('X-Cache', 'SKIP-TTL');
      return next();
    }

    const { cacheKey, bodyBytes, fingerprintBytes } = buildCacheMetadata(namespace, req);

    if (bodyBytes > MAX_CACHEABLE_BODY_BYTES) {
      res.set('X-Cache', 'SKIP-REQ-LARGE');
      return next();
    }

    if (fingerprintBytes > MAX_CACHEABLE_SIGNATURE_BYTES) {
      res.set('X-Cache', 'SKIP-SIGNATURE-LARGE');
      return next();
    }

    try {
      const cachedPayload = await redisClient.get(cacheKey);

      if (cachedPayload) {
        const cachedString = toUtf8String(cachedPayload);
        let parsed;

        try {
          parsed = JSON.parse(cachedString);
        } catch (parseErr) {
          console.warn(
            `[cache] Corrupt JSON for key "${cacheKey}", deleting`,
            parseErr.message
          );
          await redisClient.del(cacheKey);
          res.set('X-Cache', 'MISS-CORRUPT');
          return next();
        }

        res.set('X-Cache', 'HIT');
        res.set('X-Cache-TTL', String(ttlSeconds));
        return res.json(parsed);
      }
    } catch (error) {
      console.error(`[cache] Failed to read cache key "${cacheKey}":`, error);
    }

    res.set('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const result = originalJson(body);

      const statusOk = res.statusCode >= 200 && res.statusCode < 300;
      const explicitError = body && (body.error === true || body.success === false);

      if (!statusOk || explicitError) {
        return result;
      }

      let payload;
      try {
        payload = JSON.stringify(body);
      } catch (error) {
        console.error(`[cache] Failed to serialize response for key "${cacheKey}":`, error);
        return result;
      }

      const payloadBytes = Buffer.byteLength(payload, 'utf8');
      if (payloadBytes > MAX_CACHEABLE_RESPONSE_BYTES) {
        res.set('X-Cache-Store', 'SKIP-RESP-LARGE');
        return result;
      }

      redisClient
        .set(cacheKey, payload, { ex: ttlSeconds })
        .then(() => registerCacheKey(namespace, cacheKey, ttlSeconds))
        .catch((error) => {
          console.error(`[cache] Failed to store cache key "${cacheKey}":`, error);
        });

      return result;
    };

    return next();
  };
};

export const invalidateCacheNamespaces = async (namespaces = []) => {
  if (!isRedisAvailable) return;

  const list = Array.isArray(namespaces) ? namespaces : [namespaces];
  const uniqueNamespaces = [...new Set(list.filter(Boolean))];

  await Promise.all(
    uniqueNamespaces.map(async (namespace) => {
      const indexKey = namespaceIndexKey(namespace);

      try {
        const members = await redisClient.smembers(indexKey);
        if (members?.length) {
          await deleteKeysInChunks(members);
        }
        await redisClient.del(indexKey);
      } catch (error) {
        console.error(`[cache] Failed to invalidate namespace "${namespace}":`, error);
      }
    })
  );
};
