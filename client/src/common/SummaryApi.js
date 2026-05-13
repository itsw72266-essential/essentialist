const isServer = typeof window === 'undefined'
const isProd = process.env.NODE_ENV === 'production'

function sanitizeBase(input) {
  if (!input || typeof input !== 'string') return ''
  return input.trim().replace(/\/+$/, '')
}

const envClientBase = sanitizeBase(process.env.NEXT_PUBLIC_API_URL)
const envServerBase = sanitizeBase(process.env.API_URL)
const envSiteUrl = sanitizeBase(process.env.NEXT_PUBLIC_SITE_URL)
const envVercelUrl = sanitizeBase(process.env.VERCEL_URL)

let cachedFallbackOrigin = null
function fallbackOrigin() {
  if (cachedFallbackOrigin) return cachedFallbackOrigin

  if (!isServer && typeof window !== 'undefined' && window.location) {
    cachedFallbackOrigin = sanitizeBase(window.location.origin)
    return cachedFallbackOrigin
  }

  if (envServerBase) {
    cachedFallbackOrigin = envServerBase
    return cachedFallbackOrigin
  }

  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
  const host = envSiteUrl || envVercelUrl || `localhost:${process.env.PORT || 3000}`

  cachedFallbackOrigin = sanitizeBase(`${protocol}://${host}`)
  return cachedFallbackOrigin
}

const resolvedBaseURL = envClientBase || fallbackOrigin()
const resolvedSiteURL = envSiteUrl || fallbackOrigin()

function getBrowserLocale() {
  if (typeof window === 'undefined') return null
  const value =
    window.localStorage?.getItem('essentialist_lang') ||
    document.documentElement?.lang ||
    window.navigator?.language
  return value ? String(value).split('-')[0] : null
}

let hasWarnedForMissingPublicApi = false
if (!envClientBase && !hasWarnedForMissingPublicApi) {
  hasWarnedForMissingPublicApi = true
  const message =
    'SummaryApi: NEXT_PUBLIC_API_URL is not defined. Requests will use ' +
    `"${resolvedBaseURL}". Set NEXT_PUBLIC_API_URL to silence this warning.`
  if (isServer) {
    console.warn(message)
  } else if (!isProd) {
    console.error(message)
  }
}

export const baseURL = resolvedBaseURL
export const siteURL = resolvedSiteURL

function ensureAbsoluteUrl(path) {
  if (!path) return baseURL || '/'
  if (/^https?:\/\//i.test(path)) return sanitizeBase(path)
  return `${baseURL}${path.startsWith('/') ? '' : '/'}${path}`
}

function normalizePath(path = '') {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function buildUrl(path, params) {
  const absolute = ensureAbsoluteUrl(normalizePath(path))
  if (!params || !Object.keys(params).length) return absolute

  const url = new URL(absolute)
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item))
    } else {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

export async function apiFetch(
  path,
  {
    method = 'GET',
    body,
    headers = {},
    params,
    cache = 'no-store',
    next,
    credentials = 'include',
    signal,
    timeout = 0,
  } = {},
) {
  const controller = signal ? null : new AbortController()
  const requestSignal = signal ?? controller?.signal

  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getBrowserLocale() ? { 'X-Locale': getBrowserLocale() } : {}),
      ...(getBrowserLocale() ? { 'Accept-Language': getBrowserLocale() } : {}),
      ...headers,
    },
    cache,
    credentials,
    signal: requestSignal,
  }

  if (next) init.next = next

  const upperMethod = method.toUpperCase()
  if (body !== undefined && !['GET', 'HEAD'].includes(upperMethod)) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  const requestUrl = buildUrl(path, params)

  let abortTimer
  if (timeout > 0 && controller) {
    abortTimer = setTimeout(() => controller.abort(), timeout)
  }

  try {
    const response = await fetch(requestUrl, init)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `API ${upperMethod} ${requestUrl} failed: ${response.status} ${response.statusText} — ${errorText}`,
      )
    }

    if (response.status === 204) return null

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } finally {
    if (abortTimer) clearTimeout(abortTimer)
  }
}

export async function callSummaryApi(
  endpoint,
  {
    payload,
    params,
    headers,
    cache = 'no-store',
    credentials = 'include',
    signal,
    timeout,
  } = {},
) {
  const endpointConfig =
    typeof endpoint === 'function' ? endpoint() : endpoint

  if (!endpointConfig?.url) {
    throw new Error('callSummaryApi: endpoint definition must include a url.')
  }

  const method = endpointConfig.method?.toUpperCase?.() ?? 'GET'
  const isBodyMethod = !['GET', 'DELETE', 'HEAD'].includes(method)
  const body = isBodyMethod ? payload : undefined
  const finalParams =
    !isBodyMethod && payload && typeof payload === 'object'
      ? { ...(params || {}), ...payload }
      : params

  return apiFetch(endpointConfig.url, {
    method,
    body,
    params: finalParams,
    headers,
    cache,
    credentials,
    signal,
    timeout: timeout ?? 0,
  })
}

const SummaryApi = {
  register: { url: '/api/user/register', method: 'post' },
  login: { url: '/api/user/login', method: 'post' },
  forgot_password: { url: '/api/user/forgot-password', method: 'put' },
  forgot_password_otp_verification: {
    url: '/api/user/verify-forgot-password-otp',
    method: 'put',
  },
  resetPassword: { url: '/api/user/reset-password', method: 'put' },
  refreshToken: { url: '/api/user/refresh-token', method: 'post' },
  userDetails: { url: '/api/user/user-details', method: 'get' },
  logout: { url: '/api/user/logout', method: 'get' },
  uploadAvatar: { url: '/api/user/upload-avatar', method: 'put' },
  updateUserDetails: { url: '/api/user/update-user', method: 'put' },
  addCategory: { url: '/api/category/add-category', method: 'post' },
  uploadImage: { url: '/api/file/upload', method: 'post' },
  getCategory: { url: '/api/category/get', method: 'get' },
  updateCategory: { url: '/api/category/update', method: 'put' },
  deleteCategory: { url: '/api/category/delete', method: 'delete' },
  createSubCategory: { url: '/api/subcategory/create', method: 'post' },
  getSubCategory: { url: '/api/subcategory/get', method: 'post' },
  updateSubCategory: { url: '/api/subcategory/update', method: 'put' },
  deleteSubCategory: { url: '/api/subcategory/delete', method: 'delete' },
  createProduct: { url: '/api/product/create', method: 'post' },
  getProduct: { url: '/api/product/get', method: 'post' },
  getProductByCategory: {
    url: '/api/product/get-product-by-category',
    method: 'post',
  },
  getProductByCategoryAndSubCategory: {
    url: '/api/product/get-product-by-category-and-subcategory',
    method: 'post',
  },
  getProductDetails: {
    url: '/api/product/get-product-details',
    method: 'post',
  },
  updateProductDetails: {
    url: '/api/product/update-product-details',
    method: 'put',
  },
  deleteProduct: { url: '/api/product/delete-product', method: 'delete' },
  searchProduct: { url: '/api/product/search-product', method: 'post' },
  addTocart: { url: '/api/cart/create', method: 'post' },
  getCartItem: { url: '/api/cart/get', method: 'get' },
  updateCartItemQty: { url: '/api/cart/update-qty', method: 'put' },
  deleteCartItem: { url: '/api/cart/delete-cart-item', method: 'delete' },
  createAddress: { url: '/api/address/create', method: 'post' },
  getAddress: { url: '/api/address/get', method: 'get' },
  updateAddress: { url: '/api/address/update', method: 'put' },
  disableAddress: { url: '/api/address/disable', method: 'delete' },
  CashOnDeliveryOrder: { url: '/api/order/cash-on-delivery', method: 'post' },
  GuestCashOnDeliveryOrder: { url: '/api/order/guest-cod', method: 'post' },
  guestOrderCreate: { url: '/api/guest-orders', method: 'post' },
  guestOrderReceipt: { url: '/api/guest-orders', method: 'get' },
  payment_url: { url: '/api/order/checkout', method: 'post' },
  guestStripePayment: { url: '/api/payment/guest-stripe', method: 'post' },
  payunitMtn: { url: '/api/payments/mtn', method: 'post' },
  payunitOrange: { url: '/api/payments/orange', method: 'post' },
  payunitGuestMtn: { url: '/api/payments/guest-mtn', method: 'post' },
  payunitGuestOrange: { url: '/api/payments/guest-orange', method: 'post' },
  payunitStatus: (transactionId) => ({
    url: `/api/payments/status/${transactionId}`,
    method: 'get',
  }),
  payunitOrderStatus: (orderId) => ({
    url: `/api/payments/order-status/${orderId}`,
    method: 'get',
  }),
  payunitGuestOrderStatus: (orderId, token) => ({
    url: `/api/payments/guest-order-status/${orderId}${
      token ? `?token=${encodeURIComponent(token)}` : ''
    }`,
    method: 'get',
  }),
  getOrderItems: { url: '/api/order/order-list', method: 'get' },
  verifyReceipt: { url: '/api/order/verify-receipt', method: 'post' },
  downloadReceipt: (orderId) => ({
    url: `/api/order/receipt/${orderId}`,
    method: 'get',
  }),
  getProductsByIds: { url: '/api/product/get-by-ids', method: 'post' },
  ratingsGet: {
    url: (productId) => `/api/ratings/${productId}`,
    method: 'get',
  },
  ratingsUpsert: { url: '/api/ratings', method: 'post' },
  ratingsDelete: {
    url: (productId) => `/api/ratings/${productId}`,
    method: 'delete' },
  reviewsList: {
    url: (productId, q = '') => `/api/reviews/${productId}${q}`,
    method: 'get',
  },
  reviewsUpsert: { url: '/api/reviews', method: 'post' },
  reviewsDelete: {
    url: (productId) => `/api/reviews/${productId}`,
    method: 'delete',
  },
  reviewsDeleteById: (reviewId) => ({
    url: `/api/reviews/id/${reviewId}`,
    method: 'delete',
  }),
  reviewsAdminList: { url: '/api/reviews', method: 'get' },
  reviewsAdminCreate: { url: '/api/reviews/admin', method: 'post' },
  reviewsAdminUpdate: (reviewId) => ({
    url: `/api/reviews/admin/${reviewId}`,
    method: 'put',
  }),
  reviewsAdminDelete: (reviewId) => ({
    url: `/api/reviews/admin/${reviewId}`,
    method: 'delete',
  }),
  indexNowSubmitUrl: { url: '/api/indexnow/submit-url', method: 'post' },
  indexNowSubmitUrls: { url: '/api/indexnow/submit-urls', method: 'post' },
  indexNowNotifyContentChange: {
    url: '/api/indexnow/notify-content-change',
    method: 'post',
  },
  indexNowGetKey: { url: '/api/indexnow/key', method: 'get' },
  indexNowRegenerateKey: {
    url: '/api/indexnow/regenerate-key',
    method: 'post',
  },
  createBrand: { url: '/api/brand/create', method: 'post' },
  getBrands: { url: '/api/brand/list', method: 'get' },
  getBrandDetails: (identifier) => ({
    url: `/api/brand/${identifier}`,
    method: 'get',
  }),
  updateBrand: (id) => ({
    url: `/api/brand/update/${id}`,
    method: 'put',
  }),
  deleteBrand: (id) => ({
    url: `/api/brand/delete/${id}`,
    method: 'delete',
  }),
  blogCreate: { url: '/api/blog/create', method: 'post' },
  blogUpdate: (id) => ({
    url: `/api/blog/update/${id}`,
    method: 'put',
  }),
  blogDelete: (id) => ({
    url: `/api/blog/delete/${id}`,
    method: 'delete',
  }),
  blogList: { url: '/api/blog/list', method: 'get' },
  blogBySlug: (slug) => ({
    url: `/api/blog/${slug}`,
    method: 'get',
  }),
  productFilterMeta: { url: '/api/product/filter-meta', method: 'post' },
  adminDashboard: { url: '/api/admin/dashboard', method: 'get' },
  getGuestOrders: { url: '/api/admin/guest-orders', method: 'get' },
  adminOrders: { url: '/api/admin/orders', method: 'get' },
  markOrderDelivered: (orderId) => ({
    url: `/api/admin/orders/${orderId}/deliver`,
    method: 'patch',
  }),
  reviews: {
    listPublic: { url: '/api/reviews/public', method: 'get' },
    listByProduct: (productId) => ({
      url: `/api/reviews/public/product/${productId}`,
      method: 'get',
    }),
    create: { url: '/api/reviews', method: 'post' },
    deleteMine: (productId, subjectType = 'product') => ({
      url: `/api/reviews/${productId}?subjectType=${subjectType}`,
      method: 'delete',
    }),
    deleteById: (reviewId, token) => ({
      url: `/api/reviews/id/${reviewId}${token ? `?token=${token}` : ''}`,
      method: 'delete',
    }),
    comments: {
      list: (reviewId) => ({
        url: `/api/reviews/${reviewId}/comments`,
        method: 'get',
      }),
      create: (reviewId) => ({
        url: `/api/reviews/${reviewId}/comments`,
        method: 'post',
      }),
      delete: (commentId, token) => ({
        url: `/api/reviews/comments/${commentId}${
          token ? `?token=${token}` : ''
        }`,
        method: 'delete',
      }),
    },
    admin: {
      list: { url: '/api/reviews', method: 'get' },
      create: { url: '/api/reviews/admin', method: 'post' },
      update: (reviewId) => ({
        url: `/api/reviews/admin/${reviewId}`,
        method: 'put',
      }),
      delete: (reviewId) => ({
        url: `/api/reviews/admin/${reviewId}`,
        method: 'delete',
      }),
      deleteComment: (commentId) => ({
        url: `/api/reviews/admin/comments/${commentId}`,
        method: 'delete',
      }),
    },
  },
}

export { SummaryApi }
export default SummaryApi
