/**
 * Route options for `asAuthPost` / `asPublicPost` — mirrors Express
 * `server/route/order.route.js`, `server/route/payments.js` (idempotency + rate limits).
 */

export const codOrderPostOpts = {
  idempotencyPrefix: "cod-order",
  duplicateOrderGuard: true,
  rateLimitKind: "orders",
};

export const guestCodOrderPostOpts = {
  idempotencyPrefix: "guest-cod",
  duplicateOrderGuard: true,
  rateLimitKind: "orders",
};

export const stripeCheckoutPostOpts = {
  idempotencyPrefix: "stripe-checkout",
  rateLimitKind: "payments",
};

export const payunitMtnPostOpts = {
  idempotencyPrefix: "payunit-mtn",
  rateLimitKind: "payments",
};
export const payunitOrangePostOpts = {
  idempotencyPrefix: "payunit-orange",
  rateLimitKind: "payments",
};
export const payunitGuestMtnPostOpts = {
  idempotencyPrefix: "payunit-guest-mtn",
  rateLimitKind: "payments",
};
export const payunitGuestOrangePostOpts = {
  idempotencyPrefix: "payunit-guest-orange",
  rateLimitKind: "payments",
};
export const payunitInvoicePostOpts = {
  idempotencyPrefix: "payunit-invoice",
  rateLimitKind: "payments",
};
export const payunitDisbursePostOpts = {
  idempotencyPrefix: "payunit-disburse",
  rateLimitKind: "payments",
};

/** GET /payments/status|order-status|guest-order-status|invoice/:id — Express `paymentsLimiter`. */
export const paymentsPollGetOpts = { rateLimitKind: "payments" };
