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
  register: { url: '/api/next/user/register', method: 'post' },
  login: { url: '/api/next/user/login', method: 'post' },
  forgot_password: { url: '/api/next/user/forgot-password', method: 'put' },
  forgot_password_otp_verification: {
    url: '/api/next/user/verify-forgot-password-otp',
    method: 'put',
  },
  resetPassword: { url: '/api/next/user/reset-password', method: 'put' },
  refreshToken: { url: '/api/next/user/refresh-token', method: 'post' },
  userDetails: { url: '/api/next/user/user-details', method: 'get' },
  logout: { url: '/api/next/user/logout', method: 'get' },
  uploadAvatar: { url: '/api/next/user/upload-avatar', method: 'put' },
  updateUserDetails: { url: '/api/next/user/update-user', method: 'put' },
  mergeGuestData: { url: '/api/next/user/merge-guest-data', method: 'post' },
  addCategory: { url: '/api/next/category/add-category', method: 'post' },
  uploadImage: { url: '/api/next/file/upload', method: 'post' },
  getCategory: { url: '/api/next/category/get', method: 'get' },
  updateCategory: { url: '/api/next/category/update', method: 'put' },
  deleteCategory: { url: '/api/next/category/delete', method: 'delete' },
  createSubCategory: { url: '/api/next/subcategory/create', method: 'post' },
  getSubCategory: { url: '/api/next/subcategory/get', method: 'post' },
  updateSubCategory: { url: '/api/next/subcategory/update', method: 'put' },
  deleteSubCategory: { url: '/api/next/subcategory/delete', method: 'delete' },
  createProduct: { url: '/api/next/product/create', method: 'post' },
  getProduct: { url: '/api/next/product/get', method: 'post' },
  getProductByCategory: {
    url: '/api/next/product/get-product-by-category',
    method: 'post',
  },
  getProductByCategoryAndSubCategory: {
    url: '/api/next/product/get-product-by-category-and-subcategory',
    method: 'post',
  },
  getProductDetails: {
    url: '/api/next/product/get-product-details',
    method: 'post',
  },
  updateProductDetails: {
    url: '/api/next/product/update-product-details',
    method: 'put',
  },
  deleteProduct: { url: '/api/next/product/delete-product', method: 'delete' },
  searchProduct: { url: '/api/next/product/search-product', method: 'post' },
  addTocart: { url: '/api/next/cart/create', method: 'post' },
  getCartItem: { url: '/api/next/cart/get', method: 'get' },
  updateCartItemQty: { url: '/api/next/cart/update-qty', method: 'put' },
  deleteCartItem: { url: '/api/next/cart/delete-cart-item', method: 'delete' },
  createAddress: { url: '/api/next/address/create', method: 'post' },
  getAddress: { url: '/api/next/address/get', method: 'get' },
  updateAddress: { url: '/api/next/address/update', method: 'put' },
  disableAddress: { url: '/api/next/address/disable', method: 'delete' },
  CashOnDeliveryOrder: { url: '/api/next/order/cash-on-delivery', method: 'post' },
  GuestCashOnDeliveryOrder: { url: '/api/next/order/guest-cod', method: 'post' },
  guestOrderCreate: { url: '/api/guest-orders', method: 'post' },
  guestOrderReceipt: { url: '/api/guest-orders', method: 'get' },
  payment_url: { url: '/api/next/order/checkout', method: 'post' },
  guestStripePayment: { url: '/api/next/order/guest-checkout', method: 'post' },
  payunitMtn: { url: '/api/next/payments/mtn', method: 'post' },
  payunitOrange: { url: '/api/next/payments/orange', method: 'post' },
  payunitGuestMtn: { url: '/api/next/payments/guest-mtn', method: 'post' },
  payunitGuestOrange: { url: '/api/next/payments/guest-orange', method: 'post' },
  payunitStatus: (transactionId) => ({
    url: `/api/next/payments/status/${transactionId}`,
    method: 'get',
  }),
  payunitOrderStatus: (orderId) => ({
    url: `/api/next/payments/order-status/${orderId}`,
    method: 'get',
  }),
  payunitGuestOrderStatus: (orderId, token) => ({
    url: `/api/next/payments/guest-order-status/${orderId}${
      token ? `?token=${encodeURIComponent(token)}` : ''
    }`,
    method: 'get',
  }),
  getOrderItems: { url: '/api/next/order/order-list', method: 'get' },
  verifyReceipt: { url: '/api/next/order/verify-receipt', method: 'post' },
  downloadReceipt: (orderId) => ({
    url: `/api/next/order/receipt/${orderId}`,
    method: 'get',
  }),
  getProductsByIds: { url: '/api/next/product/get-by-ids', method: 'post' },
  ratingsGet: {
    url: (productId) => `/api/next/ratings/${productId}`,
    method: 'get',
  },
  ratingsUpsert: { url: '/api/next/ratings', method: 'post' },
  ratingsDelete: {
    url: (productId) => `/api/next/ratings/${productId}`,
    method: 'delete' },
  reviewsList: {
    url: (productId, q = '') => `/api/next/reviews/product/${productId}${q}`,
    method: 'get',
  },
  reviewsUpsert: { url: '/api/next/reviews', method: 'post' },
  reviewsDelete: {
    url: (productId) => `/api/next/reviews/product/${productId}`,
    method: 'delete',
  },
  reviewsDeleteById: (reviewId) => ({
    url: `/api/next/reviews/id/${reviewId}`,
    method: 'delete',
  }),
  reviewsAdminList: { url: '/api/next/reviews', method: 'get' },
  reviewsAdminCreate: { url: '/api/next/reviews/admin', method: 'post' },
  reviewsAdminUpdate: (reviewId) => ({
    url: `/api/next/reviews/admin/${reviewId}`,
    method: 'put',
  }),
  reviewsAdminDelete: (reviewId) => ({
    url: `/api/next/reviews/admin/${reviewId}`,
    method: 'delete',
  }),
  indexNowSubmitUrl: { url: '/api/next/indexnow/submit-url', method: 'post' },
  indexNowSubmitUrls: { url: '/api/next/indexnow/submit-urls', method: 'post' },
  indexNowNotifyContentChange: {
    url: '/api/next/indexnow/notify-content-change',
    method: 'post',
  },
  indexNowGetKey: { url: '/api/next/indexnow/key', method: 'get' },
  indexNowRegenerateKey: {
    url: '/api/next/indexnow/regenerate-key',
    method: 'post',
  },
  createBrand: { url: '/api/next/brand/create', method: 'post' },
  getBrands: { url: '/api/next/brand/list', method: 'get' },
  getBrandDetails: (identifier) => ({
    url: `/api/next/brand/${identifier}`,
    method: 'get',
  }),
  updateBrand: (id) => ({
    url: `/api/next/brand/update/${id}`,
    method: 'put',
  }),
  deleteBrand: (id) => ({
    url: `/api/next/brand/delete/${id}`,
    method: 'delete',
  }),
  blogCreate: { url: '/api/next/blog/create', method: 'post' },
  blogUpdate: (id) => ({
    url: `/api/next/blog/update/${id}`,
    method: 'put',
  }),
  blogDelete: (id) => ({
    url: `/api/next/blog/delete/${id}`,
    method: 'delete',
  }),
  blogList: { url: '/api/next/blog/list', method: 'get' },
  blogBySlug: (slug) => ({
    url: `/api/next/blog/${slug}`,
    method: 'get',
  }),
  productFilterMeta: { url: '/api/next/product/filter-meta', method: 'post' },
  adminDashboard: { url: '/api/next/admin/dashboard', method: 'get' },
  getGuestOrders: { url: '/api/next/admin/guest-orders', method: 'get' },
  adminOrders: { url: '/api/next/admin/orders', method: 'get' },
  markOrderDelivered: (orderId) => ({
    url: `/api/next/admin/orders/${orderId}/deliver`,
    method: 'patch',
  }),
  reviews: {
    listPublic: { url: '/api/next/reviews/public', method: 'get' },
    listByProduct: (productId) => ({
      url: `/api/next/reviews/public/product/${productId}`,
      method: 'get',
    }),
    create: { url: '/api/next/reviews', method: 'post' },
    deleteMine: (productId, subjectType = 'product') => ({
      url: `/api/next/reviews/product/${productId}?subjectType=${subjectType}`,
      method: 'delete',
    }),
    deleteById: (reviewId, token) => ({
      url: `/api/next/reviews/id/${reviewId}${token ? `?token=${token}` : ''}`,
      method: 'delete',
    }),
    comments: {
      list: (reviewId) => ({
        url: `/api/next/reviews/review/${reviewId}/comments`,
        method: 'get',
      }),
      create: (reviewId) => ({
        url: `/api/next/reviews/review/${reviewId}/comments`,
        method: 'post',
      }),
      delete: (commentId, token) => ({
        url: `/api/next/reviews/comments/${commentId}${
          token ? `?token=${token}` : ''
        }`,
        method: 'delete',
      }),
    },
    admin: {
      list: { url: '/api/next/reviews', method: 'get' },
      create: { url: '/api/next/reviews/admin', method: 'post' },
      update: (reviewId) => ({
        url: `/api/next/reviews/admin/${reviewId}`,
        method: 'put',
      }),
      delete: (reviewId) => ({
        url: `/api/next/reviews/admin/${reviewId}`,
        method: 'delete',
      }),
      deleteComment: (commentId) => ({
        url: `/api/next/reviews/admin/comments/${commentId}`,
        method: 'delete',
      }),
    },
  },
}

export { SummaryApi }
export default SummaryApi
