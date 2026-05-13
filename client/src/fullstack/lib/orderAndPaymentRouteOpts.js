/**
 * Route options for `asAuthPost` / `asPublicPost` — mirrors Express
 * `server/route/order.route.js` and `server/route/payments.js` idempotency prefixes.
 */

export const codOrderPostOpts = {
  idempotencyPrefix: "cod-order",
  duplicateOrderGuard: true,
};

export const guestCodOrderPostOpts = {
  idempotencyPrefix: "guest-cod",
  duplicateOrderGuard: true,
};

export const stripeCheckoutPostOpts = {
  idempotencyPrefix: "stripe-checkout",
};

export const payunitMtnPostOpts = { idempotencyPrefix: "payunit-mtn" };
export const payunitOrangePostOpts = { idempotencyPrefix: "payunit-orange" };
export const payunitGuestMtnPostOpts = {
  idempotencyPrefix: "payunit-guest-mtn",
};
export const payunitGuestOrangePostOpts = {
  idempotencyPrefix: "payunit-guest-orange",
};
export const payunitInvoicePostOpts = { idempotencyPrefix: "payunit-invoice" };
export const payunitDisbursePostOpts = { idempotencyPrefix: "payunit-disburse" };
