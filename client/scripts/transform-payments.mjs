import fs from "fs";

const bodyPath = "src/fullstack/controllers/payments/_payments_body.txt";
const outPath = "src/fullstack/controllers/payments/paymentsHandlers.js";

let s = fs.readFileSync(bodyPath, "utf8");
s = s.replace(/^const router = express\.Router\(\);\s*\r?\n\r?\n/m, "");

s = s.replace(
  /router\.post\(\s*"\/mtn",\s*auth,\s*paymentsLimiter,\s*requireIdempotencyKey\(\{ prefix: "payunit-mtn" \}\),\s*\(req, res\) => handlePaymentRequest\(req, res, "CM_MTNMOMO", "web"\)\s*\);/m,
  `export async function paymentsPostMtn(req, res) {
  return handlePaymentRequest(req, res, "CM_MTNMOMO", "web");
}`
);

s = s.replace(
  /router\.post\(\s*"\/orange",\s*auth,\s*paymentsLimiter,\s*requireIdempotencyKey\(\{ prefix: "payunit-orange" \}\),\s*\(req, res\) => handlePaymentRequest\(req, res, "CM_ORANGE", "web"\)\s*\);/m,
  `export async function paymentsPostOrange(req, res) {
  return handlePaymentRequest(req, res, "CM_ORANGE", "web");
}`
);

s = s.replace(
  /router\.post\(\s*"\/guest-mtn",\s*paymentsLimiter,\s*requireIdempotencyKey\(\{ prefix: "payunit-guest-mtn" \}\),\s*\(req, res\) => handlePaymentRequest\(req, res, "CM_MTNMOMO", "guest"\)\s*\);/m,
  `export async function paymentsPostGuestMtn(req, res) {
  return handlePaymentRequest(req, res, "CM_MTNMOMO", "guest");
}`
);

s = s.replace(
  /router\.post\(\s*"\/guest-orange",\s*paymentsLimiter,\s*requireIdempotencyKey\(\{ prefix: "payunit-guest-orange" \}\),\s*\(req, res\) => handlePaymentRequest\(req, res, "CM_ORANGE", "guest"\)\s*\);/m,
  `export async function paymentsPostGuestOrange(req, res) {
  return handlePaymentRequest(req, res, "CM_ORANGE", "guest");
}`
);

s = s.replace(
  /router\.post\("\/webhook",\s*paymentsLimiter,\s*async \(req, res\) =>/m,
  "export async function paymentsWebhook(req, res)"
);

s = s.replace(
  /router\.get\(\s*"\/status\/:transactionId",\s*paymentsLimiter,\s*async \(req, res\) =>/m,
  "export async function paymentsGetTransactionStatus(req, res)"
);

s = s.replace(
  /router\.get\(\s*"\/order-status\/:orderId",\s*auth,\s*paymentsLimiter,\s*async \(req, res\) =>/m,
  "export async function paymentsGetOrderStatus(req, res)"
);

s = s.replace(
  /router\.get\(\s*"\/guest-order-status\/:orderId",\s*paymentsLimiter,\s*async \(req, res\) =>/m,
  "export async function paymentsGetGuestOrderStatus(req, res)"
);

s = s.replace(
  /router\.post\(\s*"\/invoice",\s*paymentsLimiter,\s*requireIdempotencyKey\(\{ prefix: "payunit-invoice" \}\),\s*async \(req, res\) =>/m,
  "export async function paymentsPostInvoice(req, res)"
);

s = s.replace(
  /router\.get\(\s*"\/invoice\/:invoiceId",\s*paymentsLimiter,\s*async \(req, res\) =>/m,
  "export async function paymentsGetInvoice(req, res)"
);

s = s.replace(
  /router\.post\(\s*"\/disburse",\s*paymentsLimiter,\s*requireIdempotencyKey\(\{ prefix: "payunit-disburse" \}\),\s*async \(req, res\) =>/m,
  "export async function paymentsPostDisburse(req, res)"
);

s = s.replace(/export default router;\s*$/m, "");

const header = `import mongoose from "mongoose";
import { client } from "../../config/payunit.js";
import AddressModel from "../../models/address.model.js";
import OrderModel from "../../models/order.model.js";
import CartProductModel from "../../models/cartproduct.model.js";
import UserModel from "../../models/user.model.js";
import {
  ensureIntegrityProof,
  formatOrderForClient,
  sanitizeGuestAddress,
  sanitizeGuestContact,
  resolveGuestOrderProducts,
  buildInitialDeliveryTimeline,
  getTimelineActor,
  ORDER_DEFAULT_CURRENCY,
} from "../order/handlers.js";
import {
  sendPayunitPaymentNotification,
  sendOrderNotificationToAdmin,
  sendOrderNotificationToCustomer,
} from "../../lib/mail.js";

`;

fs.writeFileSync(outPath, header + s.trim() + "\n");
console.log("Wrote", outPath, "bytes", fs.statSync(outPath).size);
