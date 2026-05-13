// import express from "express";
// import mongoose from "mongoose";
// import { client } from "../config/payunit.js";
// import { paymentsLimiter } from "../middleware/rateLimiter.js";
// import { requireIdempotencyKey } from "../middleware/idempotency.js";
// import auth from "../middleware/auth.js";
// import AddressModel from "../models/address.model.js";
// import OrderModel from "../models/order.model.js";
// import CartProductModel from "../models/cartproduct.model.js";
// import UserModel from "../models/user.model.js";
// import {
//   ensureIntegrityProof,
//   formatOrderForClient,
//   sanitizeGuestAddress,
//   sanitizeGuestContact,
//   resolveGuestOrderProducts,
//   buildInitialDeliveryTimeline,
//   getTimelineActor,
//   ORDER_DEFAULT_CURRENCY,
// } from "../controllers/order.controller.js";
// import {
//   sendPayunitPaymentNotification,
//   sendOrderNotificationToAdmin,
//   sendOrderNotificationToCustomer,
// } from "../utils/mail.js";

// const router = express.Router();

// const stripTrailingSlash = (value = "") =>
//   value.toString().trim().replace(/\/+$/, "");

// const FRONTEND_URL = stripTrailingSlash(
//   process.env.FRONTEND_URL ||
//     process.env.NEXT_PUBLIC_SITE_URL ||
//     "https://esmakeupstore.com"
// );

// const BACKEND_URL = stripTrailingSlash(
//   process.env.BACKEND_URL || process.env.API_URL
// );

// const ORDER_CURRENCY =
//   ORDER_DEFAULT_CURRENCY && ORDER_DEFAULT_CURRENCY.length
//     ? ORDER_DEFAULT_CURRENCY
//     : "XAF";

// const PAYUNIT_CHANNEL_LABEL = {
//   CM_MTNMOMO: "MTN Mobile Money",
//   CM_ORANGE: "Orange Money",
// };

// const PAYUNIT_SUCCESS = new Set([
//   "SUCCESS",
//   "SUCCESSFUL",
//   "COMPLETED",
//   "PAID",
//   "APPROVED",
// ]);

// const PAYUNIT_FAILED = new Set([
//   "FAILED",
//   "FAIL",
//   "CANCELLED",
//   "CANCELED",
//   "EXPIRED",
//   "TIMEOUT",
//   "REJECTED",
//   "DECLINED",
//   "ERROR",
// ]);

// const PAYUNIT_PENDING = new Set([
//   "PENDING",
//   "PROCESSING",
//   "INITIATED",
//   "CREATED",
//   "WAITING",
// ]);

// const TERMINAL_PAYMENT_STATUSES = new Set([
//   "PAID",
//   "SUCCESS",
//   "SUCCESSFUL",
//   "COMPLETED",
//   "APPROVED",
//   "FAILED",
//   "CANCELLED",
//   "CANCELED",
//   "DECLINED",
//   "REJECTED",
//   "EXPIRED",
//   "ERROR",
//   "CASH ON DELIVERY",
// ]);

// function getChannelLabel(code) {
//   return PAYUNIT_CHANNEL_LABEL[code] ?? "Payunit";
// }

// function generateOrderId(customerType) {
//   const prefix = customerType === "guest" ? "GUEST" : "ORD";
//   return `${prefix}-${new mongoose.Types.ObjectId()}`;
// }

// function buildReturnUrl(orderId, integrityToken, text = "Payment") {
//   const params = new URLSearchParams({ orderId, text });
//   if (integrityToken) {
//     params.set("token", integrityToken);
//   }
//   return `${FRONTEND_URL}/success?${params.toString()}`;
// }

// function validationError(message) {
//   const error = new Error(message);
//   error.statusCode = 400;
//   return error;
// }

// function validatePaymentBody(body = {}) {
//   const { amount, list_items } = body;
//   return (
//     Number(amount) > 0 &&
//     Array.isArray(list_items) &&
//     list_items.length > 0
//   );
// }

// function normalizePayunitStatus(rawStatus) {
//   const rawUpper = String(rawStatus ?? "").trim().toUpperCase();
//   if (PAYUNIT_SUCCESS.has(rawUpper))
//     return { normalized: "SUCCESS", category: "success", rawUpper };
//   if (PAYUNIT_FAILED.has(rawUpper))
//     return { normalized: "FAILED", category: "failed", rawUpper };
//   if (PAYUNIT_PENDING.has(rawUpper))
//     return { normalized: "PENDING", category: "pending", rawUpper };
//   return { normalized: rawUpper || "UNKNOWN", category: "unknown", rawUpper };
// }

// function mapPayunitPaymentStatusForDb({ category, rawUpper }) {
//   if (category === "success") {
//     if (rawUpper === "COMPLETED") return "COMPLETED";
//     if (rawUpper === "SUCCESSFUL") return "SUCCESSFUL";
//     if (rawUpper === "PAID") return "PAID";
//     if (rawUpper === "APPROVED") return "APPROVED";
//     return "SUCCESSFUL";
//   }

//   if (category === "failed") {
//     if (rawUpper === "CANCELLED" || rawUpper === "CANCELED") return "CANCELLED";
//     if (rawUpper === "DECLINED") return "DECLINED";
//     if (rawUpper === "REJECTED") return "REJECTED";
//     if (rawUpper === "EXPIRED") return "EXPIRED";
//     if (rawUpper === "ERROR") return "ERROR";
//     return "FAILED";
//   }

//   if (category === "pending") {
//     if (
//       rawUpper === "PROCESSING" ||
//       rawUpper === "INITIATED" ||
//       rawUpper === "CREATED" ||
//       rawUpper === "WAITING"
//     ) {
//       return rawUpper;
//     }
//     return "PENDING";
//   }

//   return rawUpper || "UNKNOWN";
// }

// async function applyPayunitStatusUpdate({
//   orderRecord,
//   statusPayload,
//   amount,
//   currency,
//   channel,
//   channelLabel,
//   transactionId,
//   source = "webhook",
//   rawPayload,
// }) {
//   if (!orderRecord) return { updated: false };

//   const { normalized, category, rawUpper } = normalizePayunitStatus(statusPayload);
//   const previousPayunitStatus = String(
//     orderRecord?.metadata?.payunit?.status ?? ""
//   ).toUpperCase();

//   const currentPaymentStatus = String(orderRecord.payment_status ?? "").toUpperCase();
//   const isAlreadyPaid =
//     currentPaymentStatus === "PAID" ||
//     currentPaymentStatus === "SUCCESSFUL" ||
//     currentPaymentStatus === "COMPLETED" ||
//     currentPaymentStatus === "APPROVED";

//   if (isAlreadyPaid && category !== "success") {
//     return { updated: false, isSuccess: true, isFailed: false };
//   }

//   const statusChanged = normalized !== previousPayunitStatus;

//   const updatedMetadata = {
//     ...(orderRecord.metadata ?? {}),
//     payunit: {
//       ...(orderRecord.metadata?.payunit ?? {}),
//       status: normalized,
//       rawStatus: rawUpper || orderRecord.metadata?.payunit?.rawStatus,
//       transactionId: transactionId ?? orderRecord.metadata?.payunit?.transactionId,
//       lastWebhookAt: new Date(),
//       lastStatusSource: source,
//       amount: amount ?? orderRecord.metadata?.payunit?.amount,
//       currency: currency ?? orderRecord.metadata?.payunit?.currency ?? "XAF",
//       channel,
//       channelLabel,
//       rawWebhook: rawPayload ?? orderRecord.metadata?.payunit?.rawWebhook,
//     },
//   };

//   const updatePayload = { $set: { metadata: updatedMetadata } };
//   let timelineEntry = null;

//   if (category === "success") {
//     const mappedStatus = mapPayunitPaymentStatusForDb({ category, rawUpper });
//     updatePayload.$set.payment_status = mappedStatus;
//     updatePayload.$set.paymentMethod = channelLabel ?? orderRecord.paymentMethod;
//     updatePayload.$set.paymentId = transactionId ?? orderRecord.paymentId;
//     if (
//       orderRecord.totalAmt == null ||
//       Number(orderRecord.totalAmt) === 0
//     ) {
//       updatePayload.$set.totalAmt = Number(amount ?? 0) || orderRecord.totalAmt;
//     }
//     timelineEntry = {
//       status: "Payment Confirmed",
//       note: `${channelLabel ?? "Payunit"} payment confirmed${
//         transactionId ? ` (Txn ${transactionId})` : ""
//       }`,
//       timestamp: new Date(),
//       updatedBy: getTimelineActor(orderRecord.userId),
//     };
//   } else if (category === "failed") {
//     updatePayload.$set.payment_status = mapPayunitPaymentStatusForDb({
//       category,
//       rawUpper,
//     });
//     if (
//       String(orderRecord.fulfillment_status ?? "").toUpperCase() !== "DELIVERED"
//     ) {
//       updatePayload.$set.fulfillment_status = "Canceled";
//     }
//     timelineEntry = {
//       status: "Payment Failed",
//       note: `${channelLabel ?? "Payunit"} payment failed (${
//         rawUpper || "FAILED"
//       })`,
//       timestamp: new Date(),
//       updatedBy: getTimelineActor(orderRecord.userId),
//     };
//   } else if (category === "pending") {
//     if (!currentPaymentStatus || currentPaymentStatus === "PENDING") {
//       updatePayload.$set.payment_status = mapPayunitPaymentStatusForDb({
//         category,
//         rawUpper,
//       });
//     }
//   }

//   if (timelineEntry && statusChanged) {
//     updatePayload.$push = { deliveryTimeline: timelineEntry };
//   }

//   if (!statusChanged && !updatePayload.$set.payment_status) {
//     await OrderModel.updateOne(
//       { _id: orderRecord._id },
//       { $set: { metadata: updatedMetadata } }
//     );
//     return { updated: false, isSuccess: category === "success", isFailed: category === "failed" };
//   }

//   await OrderModel.updateOne({ _id: orderRecord._id }, updatePayload);

//   const refreshed = await OrderModel.findById(orderRecord._id)
//     .populate("delivery_address")
//     .lean();

//   const orderWithProof = await ensureIntegrityProof(refreshed);

//   return {
//     updated: true,
//     isSuccess: category === "success",
//     isFailed: category === "failed",
//     statusChanged,
//     order: orderWithProof,
//     normalizedStatus: normalized,
//   };
// }

// async function initiatePayunitPayment({
//   paymentChannel,
//   body,
//   customerType,
//   notifyUrlOverride,
//   returnUrlOverride,
//   customFields = {},
// }) {
//   const {
//     amount,
//     phone,
//     order_id,
//     email,
//     name,
//     notify_url = `${BACKEND_URL}/api/payments/webhook`,
//     return_url = `${FRONTEND_URL}/success`,
//   } = body;

//   if (!phone || !String(phone).trim().length) {
//     throw validationError("A valid mobile number is required for Payunit payments.");
//   }

//   return client.collections.initiatePayment({
//     total_amount: amount,
//     currency: "XAF",
//     transaction_id: order_id,
//     return_url: returnUrlOverride ?? return_url,
//     notify_url: notifyUrlOverride ?? notify_url,
//     payment_country: "CM",
//     pay_with: paymentChannel,
//     custom_fields: {
//       order_id,
//       customer_type: customerType,
//       phone,
//       email,
//       name,
//       ...customFields,
//     },
//   });
// }

// async function createPendingPayunitOrder({
//   req,
//   channelCode,
//   customerType,
// }) {
//   const body = req.body ?? {};
//   const isGuest = customerType === "guest";
//   const listItems = Array.isArray(body.list_items) ? body.list_items : [];
//   if (!listItems.length) {
//     throw validationError("Provide at least one cart item.");
//   }

//   const requestedOrderId =
//     typeof body.order_id === "string" && body.order_id.trim().length >= 6
//       ? body.order_id.trim()
//       : null;
//   const orderId = requestedOrderId ?? generateOrderId(isGuest ? "GUEST" : "ORD");
//   const channelLabel = getChannelLabel(channelCode);
//   const baseMetadata =
//     body.metadata && typeof body.metadata === "object" ? body.metadata : {};

//   let orderPayload = null;

//   if (isGuest) {
//     const contactInfoBase = sanitizeGuestContact(body);
//     if (!contactInfoBase.customer_email) {
//       throw validationError("Guest email address is required.");
//     }

//     const sanitizedAddress = sanitizeGuestAddress(body);
//     const contactInfo = {
//       ...contactInfoBase,
//       address_snapshot: sanitizedAddress,
//     };

//     const products = await resolveGuestOrderProducts(listItems);
//     const totalQuantity = products.reduce(
//       (sum, item) => sum + (item.quantity || 0),
//       0,
//     );
//     const computedTotal = products.reduce(
//       (sum, item) => sum + (Number(item.total) || 0),
//       0,
//     );

//     orderPayload = {
//       orderId,
//       products,
//       paymentId: "",
//       payment_status: "PENDING",
//       paymentMethod: channelLabel,
//       delivery_address: null,
//       contact_info: contactInfo,
//       subTotalAmt: Number(body.subTotalAmt ?? computedTotal),
//       totalAmt: Number(body.totalAmt ?? computedTotal),
//       totalQuantity,
//       currency: ORDER_CURRENCY,
//       is_guest: true,
//       metadata: {
//         ...baseMetadata,
//         guest_delivery_address: sanitizedAddress,
//         payload_autoTaggedGuest: true,
//         payunit: {
//           provider: "Payunit",
//           channel: channelCode,
//           channelLabel,
//           transactionId: null,
//           status: "PENDING",
//           initiatedAt: new Date(),
//           customerType,
//           amount: Number(body.totalAmt ?? computedTotal),
//           currency: ORDER_CURRENCY,
//         },
//       },
//       fulfillment_status: "Processing",
//       deliveryTimeline: buildInitialDeliveryTimeline({
//         note: `Order initiated via ${channelLabel}`,
//       }),
//     };
//   } else {
//     const addressId = body.addressId ?? body.delivery_address ?? null;
//     if (!addressId) {
//       throw validationError("Delivery address is required for authenticated payments.");
//     }

//     const addressDoc = await AddressModel.findById(addressId).lean();
//     if (!addressDoc) {
//       throw validationError(
//         "Delivery address not found. Please refresh your addresses and try again."
//       );
//     }

//     const products = listItems.map((el, index) => {
//       const productDoc = el.productId ?? el.product ?? null;
//       if (!productDoc || !productDoc._id) {
//         throw validationError(
//           `Cart item #${index + 1} is missing product details. Please refresh your cart.`
//         );
//       }
//       return {
//         productId: productDoc._id,
//         product_details: {
//           name: productDoc.name,
//           image: productDoc.image,
//           sku: productDoc.sku ?? productDoc.productCode ?? undefined,
//           price: productDoc.price,
//         },
//         quantity: el.quantity ?? 1,
//         price: productDoc.price,
//         total: productDoc.price * (el.quantity ?? 1),
//         discount: productDoc.discount ?? 0,
//       };
//     });

//     const totalQuantity = products.reduce(
//       (sum, item) => sum + (item.quantity || 0),
//       0,
//     );
//     const computedTotal = products.reduce(
//       (sum, item) => sum + (item.total || 0),
//       0,
//     );

//     orderPayload = {
//       userId: req.userId,
//       orderId,
//       products,
//       paymentId: "",
//       payment_status: "PENDING",
//       paymentMethod: channelLabel,
//       delivery_address: addressDoc._id,
//       contact_info: {
//         name: addressDoc?.name ?? "",
//         customer_email: addressDoc?.customer_email ?? "",
//         mobile: addressDoc?.mobile ?? "",
//       },
//       subTotalAmt: Number(body.subTotalAmt ?? computedTotal),
//       totalAmt: Number(body.totalAmt ?? computedTotal),
//       totalQuantity,
//       currency: ORDER_CURRENCY,
//       is_guest: false,
//       metadata: {
//         ...baseMetadata,
//         payunit: {
//           provider: "Payunit",
//           channel: channelCode,
//           channelLabel,
//           transactionId: null,
//           status: "PENDING",
//           initiatedAt: new Date(),
//           customerType,
//           amount: Number(body.totalAmt ?? computedTotal),
//           currency: ORDER_CURRENCY,
//         },
//       },
//       fulfillment_status: "Processing",
//       deliveryTimeline: buildInitialDeliveryTimeline({
//         note: `Order initiated via ${channelLabel}`,
//         updatedBy: getTimelineActor(req.userId),
//       }),
//     };
//   }

//   const createdOrder = await OrderModel.create(orderPayload);
//   const hydratedOrder = await OrderModel.findById(createdOrder._id)
//     .populate("delivery_address")
//     .lean();

//   const orderWithProof = await ensureIntegrityProof(hydratedOrder);

//   return { orderWithProof, channelLabel, orderId };
// }

// async function handlePaymentRequest(req, res, channel, customerType) {
//   if (!validatePaymentBody(req.body ?? {})) {
//     return res.status(400).json({
//       error: "amount and list_items are required.",
//     });
//   }

//   let pendingOrder = null;
//   let paymentInitialized = false;

//   try {
//     const { orderWithProof, channelLabel, orderId } =
//       await createPendingPayunitOrder({
//         req,
//         channelCode: channel,
//         customerType,
//       });

//     pendingOrder = orderWithProof;

//     const notifyUrl = `${BACKEND_URL}/api/payments/webhook`;
//     const returnUrl = buildReturnUrl(orderId, orderWithProof.integrityToken);

//     const paymentPayload = {
//       ...req.body,
//       amount:
//         Number(req.body.amount ?? orderWithProof.totalAmt ?? 0) ||
//         orderWithProof.totalAmt ||
//         orderWithProof.subTotalAmt,
//       order_id: orderId,
//       phone:
//         req.body.phone ??
//         orderWithProof.contact_info?.mobile ??
//         orderWithProof.contact_info?.phone,
//       email:
//         req.body.email ??
//         orderWithProof.contact_info?.customer_email ??
//         orderWithProof.contact_info?.email,
//       name:
//         req.body.name ??
//         orderWithProof.contact_info?.name ??
//         (customerType === "guest" ? "Guest Customer" : "Customer"),
//     };

//     if (!paymentPayload.phone) {
//       throw validationError(
//         "A valid mobile number is required for Payunit payments."
//       );
//     }

//     const payment = await initiatePayunitPayment({
//       paymentChannel: channel,
//       body: paymentPayload,
//       customerType,
//       notifyUrlOverride: notifyUrl,
//       returnUrlOverride: returnUrl,
//       customFields: {
//         order_db_id: orderWithProof._id?.toString?.(),
//         order_id: orderId,
//         integrity_token: orderWithProof.integrityToken,
//         channel_label: channelLabel,
//         customer_type: customerType,
//         email: paymentPayload.email,
//         phone: paymentPayload.phone,
//       },
//     });

//     paymentInitialized = true;

//     await OrderModel.updateOne(
//       { _id: orderWithProof._id },
//       {
//         $set: {
//           paymentId: payment.transaction_id,
//           "metadata.payunit.transactionId": payment.transaction_id,
//           "metadata.payunit.payment_url": payment.transaction_url,
//           "metadata.payunit.return_url": returnUrl,
//           "metadata.payunit.notify_url": notifyUrl,
//         },
//       }
//     );

//     const updatedOrder = await OrderModel.findById(orderWithProof._id)
//       .populate("delivery_address")
//       .lean();
//     const updatedOrderWithProof = await ensureIntegrityProof(updatedOrder);

//     const alreadyNotified =
//       Boolean(updatedOrderWithProof.metadata?.notifications?.orderEmailSentAt);

//     if (!alreadyNotified) {
//       await sendOrderNotificationToAdmin([updatedOrderWithProof]);
//       await sendOrderNotificationToCustomer(updatedOrderWithProof);
//       await OrderModel.updateOne(
//         { _id: updatedOrderWithProof._id },
//         { $set: { "metadata.notifications.orderEmailSentAt": new Date() } }
//       );
//     }

//     return res.json({
//       payment_url: payment.transaction_url,
//       transaction_id: payment.transaction_id,
//       orderId,
//       integrityToken: updatedOrderWithProof.integrityToken,
//       order: formatOrderForClient(updatedOrderWithProof),
//     });
//   } catch (err) {
//     console.error(`[Payunit:${channel}]`, err);
//     if (pendingOrder?._id && !paymentInitialized) {
//       await OrderModel.deleteOne({ _id: pendingOrder._id }).catch((error) =>
//         console.error("Failed to cleanup pending Payunit order:", error)
//       );
//     }
//     const statusCode = err.statusCode ?? 500;
//     return res.status(statusCode).json({
//       error: err.message ?? "Payment initiation failed",
//     });
//   }
// }

// // --------------------
// // Customer payments
// // --------------------
// router.post(
//   "/mtn",
//   auth,
//   paymentsLimiter,
//   requireIdempotencyKey({ prefix: "payunit-mtn" }),
//   (req, res) => handlePaymentRequest(req, res, "CM_MTNMOMO", "web")
// );

// router.post(
//   "/orange",
//   auth,
//   paymentsLimiter,
//   requireIdempotencyKey({ prefix: "payunit-orange" }),
//   (req, res) => handlePaymentRequest(req, res, "CM_ORANGE", "web")
// );

// // --------------------
// // Guest payments
// // --------------------
// router.post(
//   "/guest-mtn",
//   paymentsLimiter,
//   requireIdempotencyKey({ prefix: "payunit-guest-mtn" }),
//   (req, res) => handlePaymentRequest(req, res, "CM_MTNMOMO", "guest")
// );

// router.post(
//   "/guest-orange",
//   paymentsLimiter,
//   requireIdempotencyKey({ prefix: "payunit-guest-orange" }),
//   (req, res) => handlePaymentRequest(req, res, "CM_ORANGE", "guest")
// );

// // --------------------
// // Payunit webhook
// // --------------------
// router.post("/webhook", paymentsLimiter, async (req, res) => {
//   const payload = req.body ?? {};
//   const customFields =
//     payload.custom_fields ??
//     payload.customFields ??
//     payload.data?.custom_fields ??
//     payload.data?.customFields ??
//     {};

//   const transactionId =
//     payload.transaction_id ??
//     payload.transactionId ??
//     payload.txn_id ??
//     payload.data?.transaction_id ??
//     payload.data?.transactionId ??
//     payload.data?.txn_id ??
//     null;

//   const orderId =
//     payload.order_id ??
//     payload.orderId ??
//     payload.data?.order_id ??
//     payload.data?.orderId ??
//     customFields.order_id ??
//     null;

//   let status =
//     payload.status ??
//     payload.transaction_status ??
//     payload.data?.status ??
//     payload.data?.transaction_status ??
//     null;

//   let amount =
//     payload.amount ??
//     payload.total_amount ??
//     payload.data?.amount ??
//     payload.data?.total_amount ??
//     null;

//   let currency = payload.currency ?? payload.data?.currency ?? "XAF";
//   let channel =
//     payload.pay_with ??
//     payload.channel ??
//     payload.data?.pay_with ??
//     payload.data?.channel ??
//     customFields.channel_label ??
//     null;

//   const customerName =
//     payload.name ??
//     payload.customer_name ??
//     payload.data?.name ??
//     payload.data?.customer_name ??
//     customFields.name ??
//     null;

//   const customerEmail =
//     payload.email ??
//     payload.customer_email ??
//     payload.data?.email ??
//     payload.data?.customer_email ??
//     customFields.email ??
//     null;

//   const customerPhone =
//     payload.phone ??
//     payload.mobile ??
//     payload.data?.phone ??
//     payload.data?.mobile ??
//     customFields.phone ??
//     null;

//   try {
//     if (transactionId) {
//       const statusResponse = await client.collections.getTransactionStatus(
//         transactionId
//       );
//       const statusPayload = statusResponse?.data ?? statusResponse ?? {};
//       status =
//         statusPayload.status ??
//         statusPayload.transaction_status ??
//         status;
//       amount =
//         amount ??
//         statusPayload.amount ??
//         statusPayload.total_amount;
//       currency = currency ?? statusPayload.currency;
//       channel =
//         channel ??
//         statusPayload.pay_with ??
//         statusPayload.channel ??
//         customFields.channel_label;
//     }
//   } catch (error) {
//     console.error("[Payunit:webhook status check]", error);
//   }

//   if (!orderId) {
//     console.warn("[Payunit:webhook] Missing orderId in webhook payload.");
//     return res.json({ received: true });
//   }

//   const orderRecord = await OrderModel.findOne({ orderId })
//     .populate("delivery_address")
//     .lean();

//   if (!orderRecord) {
//     console.warn(`[Payunit:webhook] Order ${orderId} not found.`);
//     return res.json({ received: true });
//   }

//   const channelLabel =
//     getChannelLabel(channel) ??
//     orderRecord.metadata?.payunit?.channelLabel ??
//     "Payunit";

//   const updateResult = await applyPayunitStatusUpdate({
//     orderRecord,
//     statusPayload: status,
//     amount,
//     currency,
//     channel,
//     channelLabel,
//     transactionId,
//     source: "webhook",
//     rawPayload: payload,
//   });

//   if (!updateResult?.order) {
//     return res.json({ received: true });
//   }

//   const orderWithProof = updateResult.order;

//   if (updateResult.isSuccess && updateResult.statusChanged) {
//     const alreadyNotified =
//       Boolean(orderWithProof.metadata?.notifications?.orderEmailSentAt);

//     if (!alreadyNotified) {
//       await sendOrderNotificationToAdmin([orderWithProof]);
//       await sendOrderNotificationToCustomer(orderWithProof);
//       await OrderModel.updateOne(
//         { _id: orderWithProof._id },
//         { $set: { "metadata.notifications.orderEmailSentAt": new Date() } }
//       );
//     }

//     await sendPayunitPaymentNotification({
//       orderId: orderWithProof.orderId,
//       transactionId,
//       amount: amount ?? orderWithProof.totalAmt,
//       currency: currency ?? orderWithProof.currency ?? "XAF",
//       status: updateResult.normalizedStatus ?? status,
//       channel: channelLabel,
//       customerName: orderWithProof.contact_info?.name,
//       customerEmail: orderWithProof.contact_info?.customer_email,
//       customerPhone: orderWithProof.contact_info?.mobile,
//     });

//     if (orderWithProof.userId) {
//       await CartProductModel.deleteMany({ userId: orderWithProof.userId });
//       await UserModel.updateOne(
//         { _id: orderWithProof.userId },
//         { shopping_cart: [] }
//       );
//     }
//   }

//   if (updateResult.isFailed && updateResult.statusChanged) {
//     await sendPayunitPaymentNotification({
//       orderId: orderWithProof.orderId,
//       transactionId,
//       amount: amount ?? orderWithProof.totalAmt,
//       currency: currency ?? orderWithProof.currency ?? "XAF",
//       status: updateResult.normalizedStatus ?? status,
//       channel: channelLabel,
//       customerName: orderWithProof.contact_info?.name,
//       customerEmail: orderWithProof.contact_info?.customer_email,
//       customerPhone: orderWithProof.contact_info?.mobile,
//     });
//   }

//   return res.json({ received: true });
// });

// // --------------------
// // Transaction status
// // --------------------
// router.get(
//   "/status/:transactionId",
//   paymentsLimiter,
//   async (req, res) => {
//     try {
//       const status = await client.collections.getTransactionStatus(
//         req.params.transactionId
//       );
//       res.json(status);
//     } catch (err) {
//       console.error("[Payunit:status]", err);
//       res.status(500).json({ error: "Failed to fetch status" });
//     }
//   }
// );

// // --------------------
// // Order status (auth + guest)
// // --------------------
// router.get(
//   "/order-status/:orderId",
//   auth,
//   paymentsLimiter,
//   async (req, res) => {
//     try {
//       const { orderId } = req.params;
//       const orderRecord = await OrderModel.findOne({ orderId })
//         .populate("delivery_address")
//         .lean();

//       if (!orderRecord) {
//         return res.status(404).json({ error: "Order not found" });
//       }

//       if (
//         orderRecord.userId &&
//         orderRecord.userId.toString() !== req.userId?.toString()
//       ) {
//         return res.status(403).json({ error: "Not authorized" });
//       }

//       const orderWithProof = await ensureIntegrityProof(orderRecord);

//       const transactionId =
//         orderWithProof?.metadata?.payunit?.transactionId ?? null;

//       let updatedOrder = orderWithProof;

//       if (
//         transactionId &&
//         !TERMINAL_PAYMENT_STATUSES.has(
//           String(orderWithProof.payment_status ?? "").toUpperCase()
//         )
//       ) {
//         try {
//           const statusResponse = await client.collections.getTransactionStatus(
//             transactionId
//           );
//           const statusPayload = statusResponse?.data ?? statusResponse ?? {};
//           const status = statusPayload.status ?? statusPayload.transaction_status;
//           const amount = statusPayload.amount ?? statusPayload.total_amount;
//           const currency = statusPayload.currency ?? orderWithProof.currency;
//           const channel =
//             statusPayload.pay_with ??
//             statusPayload.channel ??
//             orderWithProof.metadata?.payunit?.channel;

//           const channelLabel =
//             getChannelLabel(channel) ??
//             orderWithProof.metadata?.payunit?.channelLabel ??
//             "Payunit";

//           const updateResult = await applyPayunitStatusUpdate({
//             orderRecord: orderWithProof,
//             statusPayload: status,
//             amount,
//             currency,
//             channel,
//             channelLabel,
//             transactionId,
//             source: "poll",
//             rawPayload: statusPayload,
//           });

//           updatedOrder = updateResult?.order ?? orderWithProof;
//         } catch (error) {
//           console.error("[Payunit:order-status poll]", error);
//         }
//       }

//       return res.json({
//         success: true,
//         order: formatOrderForClient(updatedOrder),
//       });
//     } catch (error) {
//       return res.status(500).json({ error: error.message || error });
//     }
//   }
// );

// router.get(
//   "/guest-order-status/:orderId",
//   paymentsLimiter,
//   async (req, res) => {
//     try {
//       const { orderId } = req.params;
//       const token =
//         req.query.token ?? req.headers["x-receipt-token"] ?? "";

//       const orderRecord = await OrderModel.findOne({ orderId })
//         .populate("delivery_address")
//         .lean();

//       if (!orderRecord) {
//         return res.status(404).json({ error: "Order not found" });
//       }

//       const orderWithProof = await ensureIntegrityProof(orderRecord);

//       if (orderWithProof.is_guest) {
//         if (!token || token !== orderWithProof.integrityToken) {
//           return res.status(403).json({ error: "Invalid token" });
//         }
//       }

//       const transactionId =
//         orderWithProof?.metadata?.payunit?.transactionId ?? null;

//       let updatedOrder = orderWithProof;

//       if (
//         transactionId &&
//         !TERMINAL_PAYMENT_STATUSES.has(
//           String(orderWithProof.payment_status ?? "").toUpperCase()
//         )
//       ) {
//         try {
//           const statusResponse = await client.collections.getTransactionStatus(
//             transactionId
//           );
//           const statusPayload = statusResponse?.data ?? statusResponse ?? {};
//           const status = statusPayload.status ?? statusPayload.transaction_status;
//           const amount = statusPayload.amount ?? statusPayload.total_amount;
//           const currency = statusPayload.currency ?? orderWithProof.currency;
//           const channel =
//             statusPayload.pay_with ??
//             statusPayload.channel ??
//             orderWithProof.metadata?.payunit?.channel;

//           const channelLabel =
//             getChannelLabel(channel) ??
//             orderWithProof.metadata?.payunit?.channelLabel ??
//             "Payunit";

//           const updateResult = await applyPayunitStatusUpdate({
//             orderRecord: orderWithProof,
//             statusPayload: status,
//             amount,
//             currency,
//             channel,
//             channelLabel,
//             transactionId,
//             source: "poll",
//             rawPayload: statusPayload,
//           });

//           updatedOrder = updateResult?.order ?? orderWithProof;
//         } catch (error) {
//           console.error("[Payunit:guest-order-status poll]", error);
//         }
//       }

//       return res.json({
//         success: true,
//         order: formatOrderForClient(updatedOrder),
//       });
//     } catch (error) {
//       return res.status(500).json({ error: error.message || error });
//     }
//   }
// );

// // --------------------
// // Invoices
// // --------------------
// router.post(
//   "/invoice",
//   paymentsLimiter,
//   requireIdempotencyKey({ prefix: "payunit-invoice" }),
//   async (req, res) => {
//     try {
//       const invoice = await client.invoice.createInvoice({
//         ...req.body,
//         partial_payment: false,
//         type: "NORMAL",
//         currency: "XAF",
//         callback_url: "https://esmakeupstore.com/callback",
//       });
//       res.json(invoice);
//     } catch (err) {
//       console.error("[Payunit:invoice]", err);
//       res.status(500).json({ error: "Invoice creation failed" });
//     }
//   }
// );

// router.get(
//   "/invoice/:invoiceId",
//   paymentsLimiter,
//   async (req, res) => {
//     try {
//       const invoice = await client.invoice.getInvoice(req.params.invoiceId);
//       res.json(invoice);
//     } catch (err) {
//       console.error("[Payunit:get invoice]", err);
//       res.status(500).json({ error: "Failed to fetch invoice" });
//     }
//   }
// );

// // --------------------
// // Disbursement (payout)
// // --------------------
// router.post(
//   "/disburse",
//   paymentsLimiter,
//   requireIdempotencyKey({ prefix: "payunit-disburse" }),
//   async (req, res) => {
//     try {
//       const {
//         account_number,
//         amount,
//         beneficiary_name,
//         account_bank,
//       } = req.body;

//       const disbursement = await client.disbursement.createDisbursement({
//         destination_currency: "XAF",
//         debit_currency: "XAF",
//         account_number,
//         amount,
//         beneficiary_name,
//         deposit_type: "MOBILE_MONEY",
//         transaction_id: `DISB_${Date.now()}`,
//         country: "CM",
//         account_bank,
//       });

//       res.json(disbursement);
//     } catch (err) {
//       console.error("[Payunit:disburse]", err);
//       res.status(500).json({ error: "Disbursement failed" });
//     }
//   }
// );

// export default router;




import express from "express";
import mongoose from "mongoose";
import { client } from "../config/payunit.js";
import { paymentsLimiter } from "../middleware/rateLimiter.js";
import { requireIdempotencyKey } from "../middleware/idempotency.js";
import auth from "../middleware/auth.js";
import AddressModel from "../models/address.model.js";
import OrderModel from "../models/order.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";
import {
  ensureIntegrityProof,
  formatOrderForClient,
  sanitizeGuestAddress,
  sanitizeGuestContact,
  resolveGuestOrderProducts,
  buildInitialDeliveryTimeline,
  getTimelineActor,
  ORDER_DEFAULT_CURRENCY,
} from "../controllers/order.controller.js";
import {
  sendPayunitPaymentNotification,
  sendOrderNotificationToAdmin,
  sendOrderNotificationToCustomer,
} from "../utils/mail.js";

const router = express.Router();

function runInBackground(label, task) {
  setImmediate(() => {
    Promise.resolve()
      .then(task)
      .catch((error) => console.error(`[bg:${label}]`, error));
  });
}

const stripTrailingSlash = (value = "") =>
  value.toString().trim().replace(/\/+$/, "");

const FRONTEND_URL = stripTrailingSlash(
  process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://esmakeupstore.com"
);

const BACKEND_URL = stripTrailingSlash(
  process.env.BACKEND_URL || process.env.API_URL
);

const ORDER_CURRENCY =
  ORDER_DEFAULT_CURRENCY && ORDER_DEFAULT_CURRENCY.length
    ? ORDER_DEFAULT_CURRENCY
    : "XAF";

const PAYUNIT_CHANNEL_LABEL = {
  CM_MTNMOMO: "MTN Mobile Money",
  CM_ORANGE: "Orange Money",
};

const PAYUNIT_SUCCESS = new Set([
  "SUCCESS",
  "SUCCESSFUL",
  "COMPLETED",
  "PAID",
  "APPROVED",
]);

const PAYUNIT_FAILED = new Set([
  "FAILED",
  "FAIL",
  "CANCELLED",
  "CANCELED",
  "EXPIRED",
  "TIMEOUT",
  "REJECTED",
  "DECLINED",
  "ERROR",
]);

const PAYUNIT_PENDING = new Set([
  "PENDING",
  "PROCESSING",
  "INITIATED",
  "CREATED",
  "WAITING",
]);

const TERMINAL_PAYMENT_STATUSES = new Set([
  "PAID",
  "SUCCESS",
  "SUCCESSFUL",
  "COMPLETED",
  "APPROVED",
  "FAILED",
  "CANCELLED",
  "CANCELED",
  "DECLINED",
  "REJECTED",
  "EXPIRED",
  "ERROR",
  "CASH ON DELIVERY",
]);

function getChannelLabel(code) {
  return PAYUNIT_CHANNEL_LABEL[code] ?? "Payunit";
}

function generateOrderId(customerType) {
  const prefix = customerType === "guest" ? "GUEST" : "ORD";
  return `${prefix}-${new mongoose.Types.ObjectId()}`;
}

function buildReturnUrl(orderId, integrityToken, text = "Payment") {
  const params = new URLSearchParams({ orderId, text });
  if (integrityToken) {
    params.set("token", integrityToken);
  }
  return `${FRONTEND_URL}/success?${params.toString()}`;
}

function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validatePaymentBody(body = {}) {
  const { amount, list_items } = body;
  return (
    Number(amount) > 0 &&
    Array.isArray(list_items) &&
    list_items.length > 0
  );
}

function normalizePayunitStatus(rawStatus) {
  const rawUpper = String(rawStatus ?? "").trim().toUpperCase();
  if (PAYUNIT_SUCCESS.has(rawUpper))
    return { normalized: "SUCCESS", category: "success", rawUpper };
  if (PAYUNIT_FAILED.has(rawUpper))
    return { normalized: "FAILED", category: "failed", rawUpper };
  if (PAYUNIT_PENDING.has(rawUpper))
    return { normalized: "PENDING", category: "pending", rawUpper };
  return { normalized: rawUpper || "UNKNOWN", category: "unknown", rawUpper };
}

function mapPayunitPaymentStatusForDb({ category, rawUpper }) {
  if (category === "success") {
    if (rawUpper === "COMPLETED") return "COMPLETED";
    if (rawUpper === "SUCCESSFUL") return "SUCCESSFUL";
    if (rawUpper === "PAID") return "PAID";
    if (rawUpper === "APPROVED") return "APPROVED";
    return "SUCCESSFUL";
  }

  if (category === "failed") {
    if (rawUpper === "CANCELLED" || rawUpper === "CANCELED") return "CANCELLED";
    if (rawUpper === "DECLINED") return "DECLINED";
    if (rawUpper === "REJECTED") return "REJECTED";
    if (rawUpper === "EXPIRED") return "EXPIRED";
    if (rawUpper === "ERROR") return "ERROR";
    return "FAILED";
  }

  if (category === "pending") {
    if (
      rawUpper === "PROCESSING" ||
      rawUpper === "INITIATED" ||
      rawUpper === "CREATED" ||
      rawUpper === "WAITING"
    ) {
      return rawUpper;
    }
    return "PENDING";
  }

  return rawUpper || "UNKNOWN";
}

async function applyPayunitStatusUpdate({
  orderRecord,
  statusPayload,
  amount,
  currency,
  channel,
  channelLabel,
  transactionId,
  source = "webhook",
  rawPayload,
}) {
  if (!orderRecord) return { updated: false };

  const { normalized, category, rawUpper } = normalizePayunitStatus(statusPayload);
  const previousPayunitStatus = String(
    orderRecord?.metadata?.payunit?.status ?? ""
  ).toUpperCase();

  const currentPaymentStatus = String(orderRecord.payment_status ?? "").toUpperCase();
  const isAlreadyPaid =
    currentPaymentStatus === "PAID" ||
    currentPaymentStatus === "SUCCESSFUL" ||
    currentPaymentStatus === "COMPLETED" ||
    currentPaymentStatus === "APPROVED";

  if (isAlreadyPaid && category !== "success") {
    return { updated: false, isSuccess: true, isFailed: false };
  }

  const statusChanged = normalized !== previousPayunitStatus;

  const updatedMetadata = {
    ...(orderRecord.metadata ?? {}),
    payunit: {
      ...(orderRecord.metadata?.payunit ?? {}),
      status: normalized,
      rawStatus: rawUpper || orderRecord.metadata?.payunit?.rawStatus,
      transactionId: transactionId ?? orderRecord.metadata?.payunit?.transactionId,
      lastWebhookAt: new Date(),
      lastStatusSource: source,
      amount: amount ?? orderRecord.metadata?.payunit?.amount,
      currency: currency ?? orderRecord.metadata?.payunit?.currency ?? "XAF",
      channel,
      channelLabel,
      rawWebhook: rawPayload ?? orderRecord.metadata?.payunit?.rawWebhook,
    },
  };

  const updatePayload = { $set: { metadata: updatedMetadata } };
  let timelineEntry = null;

  if (category === "success") {
    const mappedStatus = mapPayunitPaymentStatusForDb({ category, rawUpper });
    updatePayload.$set.payment_status = mappedStatus;
    updatePayload.$set.paymentMethod = channelLabel ?? orderRecord.paymentMethod;
    updatePayload.$set.paymentId = transactionId ?? orderRecord.paymentId;
    if (
      orderRecord.totalAmt == null ||
      Number(orderRecord.totalAmt) === 0
    ) {
      updatePayload.$set.totalAmt = Number(amount ?? 0) || orderRecord.totalAmt;
    }
    timelineEntry = {
      status: "Payment Confirmed",
      note: `${channelLabel ?? "Payunit"} payment confirmed${
        transactionId ? ` (Txn ${transactionId})` : ""
      }`,
      timestamp: new Date(),
      updatedBy: getTimelineActor(orderRecord.userId),
    };
  } else if (category === "failed") {
    updatePayload.$set.payment_status = mapPayunitPaymentStatusForDb({
      category,
      rawUpper,
    });
    if (
      String(orderRecord.fulfillment_status ?? "").toUpperCase() !== "DELIVERED"
    ) {
      updatePayload.$set.fulfillment_status = "Canceled";
    }
    timelineEntry = {
      status: "Payment Failed",
      note: `${channelLabel ?? "Payunit"} payment failed (${
        rawUpper || "FAILED"
      })`,
      timestamp: new Date(),
      updatedBy: getTimelineActor(orderRecord.userId),
    };
  } else if (category === "pending") {
    if (!currentPaymentStatus || currentPaymentStatus === "PENDING") {
      updatePayload.$set.payment_status = mapPayunitPaymentStatusForDb({
        category,
        rawUpper,
      });
    }
  }

  if (timelineEntry && statusChanged) {
    updatePayload.$push = { deliveryTimeline: timelineEntry };
  }

  if (!statusChanged && !updatePayload.$set.payment_status) {
    await OrderModel.updateOne(
      { _id: orderRecord._id },
      { $set: { metadata: updatedMetadata } }
    );
    return { updated: false, isSuccess: category === "success", isFailed: category === "failed" };
  }

  await OrderModel.updateOne({ _id: orderRecord._id }, updatePayload);

  const refreshed = await OrderModel.findById(orderRecord._id)
    .populate("delivery_address")
    .lean();

  const orderWithProof = await ensureIntegrityProof(refreshed);

  return {
    updated: true,
    isSuccess: category === "success",
    isFailed: category === "failed",
    statusChanged,
    order: orderWithProof,
    normalizedStatus: normalized,
  };
}

async function initiatePayunitPayment({
  paymentChannel,
  body,
  customerType,
  notifyUrlOverride,
  returnUrlOverride,
  customFields = {},
}) {
  const {
    amount,
    phone,
    order_id,
    email,
    name,
    notify_url = `${BACKEND_URL}/api/payments/webhook`,
    return_url = `${FRONTEND_URL}/success`,
  } = body;

  if (!phone || !String(phone).trim().length) {
    throw validationError("A valid mobile number is required for Payunit payments.");
  }

  return client.collections.initiatePayment({
    total_amount: amount,
    currency: "XAF",
    transaction_id: order_id,
    return_url: returnUrlOverride ?? return_url,
    notify_url: notifyUrlOverride ?? notify_url,
    payment_country: "CM",
    pay_with: paymentChannel,
    custom_fields: {
      order_id,
      customer_type: customerType,
      phone,
      email,
      name,
      ...customFields,
    },
  });
}

async function createPendingPayunitOrder({
  req,
  channelCode,
  customerType,
}) {
  const body = req.body ?? {};
  const isGuest = customerType === "guest";
  const listItems = Array.isArray(body.list_items) ? body.list_items : [];
  if (!listItems.length) {
    throw validationError("Provide at least one cart item.");
  }

  const requestedOrderId =
    typeof body.order_id === "string" && body.order_id.trim().length >= 6
      ? body.order_id.trim()
      : null;
  const orderId = requestedOrderId ?? generateOrderId(isGuest ? "GUEST" : "ORD");
  const channelLabel = getChannelLabel(channelCode);
  const baseMetadata =
    body.metadata && typeof body.metadata === "object" ? body.metadata : {};

  let orderPayload = null;

  if (isGuest) {
    const contactInfoBase = sanitizeGuestContact(body);
    if (!contactInfoBase.customer_email) {
      throw validationError("Guest email address is required.");
    }

    const sanitizedAddress = sanitizeGuestAddress(body);
    const contactInfo = {
      ...contactInfoBase,
      address_snapshot: sanitizedAddress,
    };

    const products = await resolveGuestOrderProducts(listItems);
    const totalQuantity = products.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const computedTotal = products.reduce(
      (sum, item) => sum + (Number(item.total) || 0),
      0,
    );

    orderPayload = {
      orderId,
      products,
      paymentId: "",
      payment_status: "PENDING",
      paymentMethod: channelLabel,
      delivery_address: null,
      contact_info: contactInfo,
      subTotalAmt: Number(body.subTotalAmt ?? computedTotal),
      totalAmt: Number(body.totalAmt ?? computedTotal),
      totalQuantity,
      currency: ORDER_CURRENCY,
      is_guest: true,
      metadata: {
        ...baseMetadata,
        guest_delivery_address: sanitizedAddress,
        payload_autoTaggedGuest: true,
        payunit: {
          provider: "Payunit",
          channel: channelCode,
          channelLabel,
          transactionId: null,
          status: "PENDING",
          initiatedAt: new Date(),
          customerType,
          amount: Number(body.totalAmt ?? computedTotal),
          currency: ORDER_CURRENCY,
        },
      },
      fulfillment_status: "Processing",
      deliveryTimeline: buildInitialDeliveryTimeline({
        note: `Order initiated via ${channelLabel}`,
      }),
    };
  } else {
    const addressId = body.addressId ?? body.delivery_address ?? null;
    if (!addressId) {
      throw validationError("Delivery address is required for authenticated payments.");
    }

    const addressDoc = await AddressModel.findById(addressId).lean();
    if (!addressDoc) {
      throw validationError(
        "Delivery address not found. Please refresh your addresses and try again."
      );
    }

    const products = listItems.map((el, index) => {
      const productDoc = el.productId ?? el.product ?? null;
      if (!productDoc || !productDoc._id) {
        throw validationError(
          `Cart item #${index + 1} is missing product details. Please refresh your cart.`
        );
      }
      return {
        productId: productDoc._id,
        product_details: {
          name: productDoc.name,
          image: productDoc.image,
          sku: productDoc.sku ?? productDoc.productCode ?? undefined,
          price: productDoc.price,
        },
        quantity: el.quantity ?? 1,
        price: productDoc.price,
        total: productDoc.price * (el.quantity ?? 1),
        discount: productDoc.discount ?? 0,
      };
    });

    const totalQuantity = products.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const computedTotal = products.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );

    orderPayload = {
      userId: req.userId,
      orderId,
      products,
      paymentId: "",
      payment_status: "PENDING",
      paymentMethod: channelLabel,
      delivery_address: addressDoc._id,
      contact_info: {
        name: addressDoc?.name ?? "",
        customer_email: addressDoc?.customer_email ?? "",
        mobile: addressDoc?.mobile ?? "",
      },
      subTotalAmt: Number(body.subTotalAmt ?? computedTotal),
      totalAmt: Number(body.totalAmt ?? computedTotal),
      totalQuantity,
      currency: ORDER_CURRENCY,
      is_guest: false,
      metadata: {
        ...baseMetadata,
        payunit: {
          provider: "Payunit",
          channel: channelCode,
          channelLabel,
          transactionId: null,
          status: "PENDING",
          initiatedAt: new Date(),
          customerType,
          amount: Number(body.totalAmt ?? computedTotal),
          currency: ORDER_CURRENCY,
        },
      },
      fulfillment_status: "Processing",
      deliveryTimeline: buildInitialDeliveryTimeline({
        note: `Order initiated via ${channelLabel}`,
        updatedBy: getTimelineActor(req.userId),
      }),
    };
  }

  const createdOrder = await OrderModel.create(orderPayload);
  const hydratedOrder = await OrderModel.findById(createdOrder._id)
    .populate("delivery_address")
    .lean();

  const orderWithProof = await ensureIntegrityProof(hydratedOrder);

  return { orderWithProof, channelLabel, orderId };
}

async function handlePaymentRequest(req, res, channel, customerType) {
  if (!validatePaymentBody(req.body ?? {})) {
    return res.status(400).json({
      error: "amount and list_items are required.",
    });
  }

  let pendingOrder = null;
  let paymentInitialized = false;

  try {
    const { orderWithProof, channelLabel, orderId } =
      await createPendingPayunitOrder({
        req,
        channelCode: channel,
        customerType,
      });

    pendingOrder = orderWithProof;

    const notifyUrl = `${BACKEND_URL}/api/payments/webhook`;
    const returnUrl = buildReturnUrl(orderId, orderWithProof.integrityToken);

    const paymentPayload = {
      ...req.body,
      amount:
        Number(req.body.amount ?? orderWithProof.totalAmt ?? 0) ||
        orderWithProof.totalAmt ||
        orderWithProof.subTotalAmt,
      order_id: orderId,
      phone:
        req.body.phone ??
        orderWithProof.contact_info?.mobile ??
        orderWithProof.contact_info?.phone,
      email:
        req.body.email ??
        orderWithProof.contact_info?.customer_email ??
        orderWithProof.contact_info?.email,
      name:
        req.body.name ??
        orderWithProof.contact_info?.name ??
        (customerType === "guest" ? "Guest Customer" : "Customer"),
    };

    if (!paymentPayload.phone) {
      throw validationError(
        "A valid mobile number is required for Payunit payments."
      );
    }

    const payment = await initiatePayunitPayment({
      paymentChannel: channel,
      body: paymentPayload,
      customerType,
      notifyUrlOverride: notifyUrl,
      returnUrlOverride: returnUrl,
      customFields: {
        order_db_id: orderWithProof._id?.toString?.(),
        order_id: orderId,
        integrity_token: orderWithProof.integrityToken,
        channel_label: channelLabel,
        customer_type: customerType,
        email: paymentPayload.email,
        phone: paymentPayload.phone,
      },
    });

    paymentInitialized = true;

    await OrderModel.updateOne(
      { _id: orderWithProof._id },
      {
        $set: {
          paymentId: payment.transaction_id,
          "metadata.payunit.transactionId": payment.transaction_id,
          "metadata.payunit.payment_url": payment.transaction_url,
          "metadata.payunit.return_url": returnUrl,
          "metadata.payunit.notify_url": notifyUrl,
        },
      }
    );

    const updatedOrder = await OrderModel.findById(orderWithProof._id)
      .populate("delivery_address")
      .lean();
    const updatedOrderWithProof = await ensureIntegrityProof(updatedOrder);

    const alreadyNotified =
      Boolean(updatedOrderWithProof.metadata?.notifications?.orderEmailSentAt);

    if (!alreadyNotified) {
      await OrderModel.updateOne(
        { _id: updatedOrderWithProof._id },
        { $set: { "metadata.notifications.orderEmailSentAt": new Date() } }
      );

      runInBackground("payunit-init-notify", async () => {
        await sendOrderNotificationToAdmin([updatedOrderWithProof]);
        await sendOrderNotificationToCustomer(updatedOrderWithProof);
      });
    }

    return res.json({
      payment_url: payment.transaction_url,
      transaction_id: payment.transaction_id,
      orderId,
      integrityToken: updatedOrderWithProof.integrityToken,
      order: formatOrderForClient(updatedOrderWithProof),
    });
  } catch (err) {
    console.error(`[Payunit:${channel}]`, err);
    if (pendingOrder?._id && !paymentInitialized) {
      await OrderModel.deleteOne({ _id: pendingOrder._id }).catch((error) =>
        console.error("Failed to cleanup pending Payunit order:", error)
      );
    }
    const statusCode = err.statusCode ?? 500;
    return res.status(statusCode).json({
      error: err.message ?? "Payment initiation failed",
    });
  }
}

// --------------------
// Customer payments
// --------------------
router.post(
  "/mtn",
  auth,
  paymentsLimiter,
  requireIdempotencyKey({ prefix: "payunit-mtn" }),
  (req, res) => handlePaymentRequest(req, res, "CM_MTNMOMO", "web")
);

router.post(
  "/orange",
  auth,
  paymentsLimiter,
  requireIdempotencyKey({ prefix: "payunit-orange" }),
  (req, res) => handlePaymentRequest(req, res, "CM_ORANGE", "web")
);

// --------------------
// Guest payments
// --------------------
router.post(
  "/guest-mtn",
  paymentsLimiter,
  requireIdempotencyKey({ prefix: "payunit-guest-mtn" }),
  (req, res) => handlePaymentRequest(req, res, "CM_MTNMOMO", "guest")
);

router.post(
  "/guest-orange",
  paymentsLimiter,
  requireIdempotencyKey({ prefix: "payunit-guest-orange" }),
  (req, res) => handlePaymentRequest(req, res, "CM_ORANGE", "guest")
);

// --------------------
// Payunit webhook
// --------------------
router.post("/webhook", paymentsLimiter, async (req, res) => {
  const payload = req.body ?? {};
  const customFields =
    payload.custom_fields ??
    payload.customFields ??
    payload.data?.custom_fields ??
    payload.data?.customFields ??
    {};

  const transactionId =
    payload.transaction_id ??
    payload.transactionId ??
    payload.txn_id ??
    payload.data?.transaction_id ??
    payload.data?.transactionId ??
    payload.data?.txn_id ??
    null;

  const orderId =
    payload.order_id ??
    payload.orderId ??
    payload.data?.order_id ??
    payload.data?.orderId ??
    customFields.order_id ??
    null;

  let status =
    payload.status ??
    payload.transaction_status ??
    payload.data?.status ??
    payload.data?.transaction_status ??
    null;

  let amount =
    payload.amount ??
    payload.total_amount ??
    payload.data?.amount ??
    payload.data?.total_amount ??
    null;

  let currency = payload.currency ?? payload.data?.currency ?? "XAF";
  let channel =
    payload.pay_with ??
    payload.channel ??
    payload.data?.pay_with ??
    payload.data?.channel ??
    customFields.channel_label ??
    null;

  const customerName =
    payload.name ??
    payload.customer_name ??
    payload.data?.name ??
    payload.data?.customer_name ??
    customFields.name ??
    null;

  const customerEmail =
    payload.email ??
    payload.customer_email ??
    payload.data?.email ??
    payload.data?.customer_email ??
    customFields.email ??
    null;

  const customerPhone =
    payload.phone ??
    payload.mobile ??
    payload.data?.phone ??
    payload.data?.mobile ??
    customFields.phone ??
    null;

  try {
    if (transactionId) {
      const statusResponse = await client.collections.getTransactionStatus(
        transactionId
      );
      const statusPayload = statusResponse?.data ?? statusResponse ?? {};
      status =
        statusPayload.status ??
        statusPayload.transaction_status ??
        status;
      amount =
        amount ??
        statusPayload.amount ??
        statusPayload.total_amount;
      currency = currency ?? statusPayload.currency;
      channel =
        channel ??
        statusPayload.pay_with ??
        statusPayload.channel ??
        customFields.channel_label;
    }
  } catch (error) {
    console.error("[Payunit:webhook status check]", error);
  }

  if (!orderId) {
    console.warn("[Payunit:webhook] Missing orderId in webhook payload.");
    return res.json({ received: true });
  }

  const orderRecord = await OrderModel.findOne({ orderId })
    .populate("delivery_address")
    .lean();

  if (!orderRecord) {
    console.warn(`[Payunit:webhook] Order ${orderId} not found.`);
    return res.json({ received: true });
  }

  const channelLabel =
    getChannelLabel(channel) ??
    orderRecord.metadata?.payunit?.channelLabel ??
    "Payunit";

  const updateResult = await applyPayunitStatusUpdate({
    orderRecord,
    statusPayload: status,
    amount,
    currency,
    channel,
    channelLabel,
    transactionId,
    source: "webhook",
    rawPayload: payload,
  });

  if (!updateResult?.order) {
    return res.json({ received: true });
  }

  const orderWithProof = updateResult.order;

  // Respond quickly to Payunit, then process notifications/cleanup in background
  res.json({ received: true });

  runInBackground("payunit-webhook-post", async () => {
    if (updateResult.isSuccess && updateResult.statusChanged) {
      const alreadyNotified =
        Boolean(orderWithProof.metadata?.notifications?.orderEmailSentAt);

      if (!alreadyNotified) {
        await OrderModel.updateOne(
          { _id: orderWithProof._id },
          { $set: { "metadata.notifications.orderEmailSentAt": new Date() } }
        );

        await sendOrderNotificationToAdmin([orderWithProof]);
        await sendOrderNotificationToCustomer(orderWithProof);
      }

      await sendPayunitPaymentNotification({
        orderId: orderWithProof.orderId,
        transactionId,
        amount: amount ?? orderWithProof.totalAmt,
        currency: currency ?? orderWithProof.currency ?? "XAF",
        status: updateResult.normalizedStatus ?? status,
        channel: channelLabel,
        customerName: orderWithProof.contact_info?.name ?? customerName,
        customerEmail:
          orderWithProof.contact_info?.customer_email ?? customerEmail,
        customerPhone: orderWithProof.contact_info?.mobile ?? customerPhone,
      });

      if (orderWithProof.userId) {
        await CartProductModel.deleteMany({ userId: orderWithProof.userId });
        await UserModel.updateOne(
          { _id: orderWithProof.userId },
          { shopping_cart: [] }
        );
      }
    }

    if (updateResult.isFailed && updateResult.statusChanged) {
      await sendPayunitPaymentNotification({
        orderId: orderWithProof.orderId,
        transactionId,
        amount: amount ?? orderWithProof.totalAmt,
        currency: currency ?? orderWithProof.currency ?? "XAF",
        status: updateResult.normalizedStatus ?? status,
        channel: channelLabel,
        customerName: orderWithProof.contact_info?.name ?? customerName,
        customerEmail:
          orderWithProof.contact_info?.customer_email ?? customerEmail,
        customerPhone: orderWithProof.contact_info?.mobile ?? customerPhone,
      });
    }
  });

  return;
});

// --------------------
// Transaction status
// --------------------
router.get(
  "/status/:transactionId",
  paymentsLimiter,
  async (req, res) => {
    try {
      const status = await client.collections.getTransactionStatus(
        req.params.transactionId
      );
      res.json(status);
    } catch (err) {
      console.error("[Payunit:status]", err);
      res.status(500).json({ error: "Failed to fetch status" });
    }
  }
);

// --------------------
// Order status (auth + guest)
// --------------------
router.get(
  "/order-status/:orderId",
  auth,
  paymentsLimiter,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const orderRecord = await OrderModel.findOne({ orderId })
        .populate("delivery_address")
        .lean();

      if (!orderRecord) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (
        orderRecord.userId &&
        orderRecord.userId.toString() !== req.userId?.toString()
      ) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const orderWithProof = await ensureIntegrityProof(orderRecord);

      const transactionId =
        orderWithProof?.metadata?.payunit?.transactionId ?? null;

      let updatedOrder = orderWithProof;

      if (
        transactionId &&
        !TERMINAL_PAYMENT_STATUSES.has(
          String(orderWithProof.payment_status ?? "").toUpperCase()
        )
      ) {
        try {
          const statusResponse = await client.collections.getTransactionStatus(
            transactionId
          );
          const statusPayload = statusResponse?.data ?? statusResponse ?? {};
          const status = statusPayload.status ?? statusPayload.transaction_status;
          const amount = statusPayload.amount ?? statusPayload.total_amount;
          const currency = statusPayload.currency ?? orderWithProof.currency;
          const channel =
            statusPayload.pay_with ??
            statusPayload.channel ??
            orderWithProof.metadata?.payunit?.channel;

          const channelLabel =
            getChannelLabel(channel) ??
            orderWithProof.metadata?.payunit?.channelLabel ??
            "Payunit";

          const updateResult = await applyPayunitStatusUpdate({
            orderRecord: orderWithProof,
            statusPayload: status,
            amount,
            currency,
            channel,
            channelLabel,
            transactionId,
            source: "poll",
            rawPayload: statusPayload,
          });

          updatedOrder = updateResult?.order ?? orderWithProof;
        } catch (error) {
          console.error("[Payunit:order-status poll]", error);
        }
      }

      return res.json({
        success: true,
        order: formatOrderForClient(updatedOrder),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || error });
    }
  }
);

router.get(
  "/guest-order-status/:orderId",
  paymentsLimiter,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const token =
        req.query.token ?? req.headers["x-receipt-token"] ?? "";

      const orderRecord = await OrderModel.findOne({ orderId })
        .populate("delivery_address")
        .lean();

      if (!orderRecord) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderWithProof = await ensureIntegrityProof(orderRecord);

      if (orderWithProof.is_guest) {
        if (!token || token !== orderWithProof.integrityToken) {
          return res.status(403).json({ error: "Invalid token" });
        }
      }

      const transactionId =
        orderWithProof?.metadata?.payunit?.transactionId ?? null;

      let updatedOrder = orderWithProof;

      if (
        transactionId &&
        !TERMINAL_PAYMENT_STATUSES.has(
          String(orderWithProof.payment_status ?? "").toUpperCase()
        )
      ) {
        try {
          const statusResponse = await client.collections.getTransactionStatus(
            transactionId
          );
          const statusPayload = statusResponse?.data ?? statusResponse ?? {};
          const status = statusPayload.status ?? statusPayload.transaction_status;
          const amount = statusPayload.amount ?? statusPayload.total_amount;
          const currency = statusPayload.currency ?? orderWithProof.currency;
          const channel =
            statusPayload.pay_with ??
            statusPayload.channel ??
            orderWithProof.metadata?.payunit?.channel;

          const channelLabel =
            getChannelLabel(channel) ??
            orderWithProof.metadata?.payunit?.channelLabel ??
            "Payunit";

          const updateResult = await applyPayunitStatusUpdate({
            orderRecord: orderWithProof,
            statusPayload: status,
            amount,
            currency,
            channel,
            channelLabel,
            transactionId,
            source: "poll",
            rawPayload: statusPayload,
          });

          updatedOrder = updateResult?.order ?? orderWithProof;
        } catch (error) {
          console.error("[Payunit:guest-order-status poll]", error);
        }
      }

      return res.json({
        success: true,
        order: formatOrderForClient(updatedOrder),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message || error });
    }
  }
);

// --------------------
// Invoices
// --------------------
router.post(
  "/invoice",
  paymentsLimiter,
  requireIdempotencyKey({ prefix: "payunit-invoice" }),
  async (req, res) => {
    try {
      const invoice = await client.invoice.createInvoice({
        ...req.body,
        partial_payment: false,
        type: "NORMAL",
        currency: "XAF",
        callback_url: "https://esmakeupstore.com/callback",
      });
      res.json(invoice);
    } catch (err) {
      console.error("[Payunit:invoice]", err);
      res.status(500).json({ error: "Invoice creation failed" });
    }
  }
);

router.get(
  "/invoice/:invoiceId",
  paymentsLimiter,
  async (req, res) => {
    try {
      const invoice = await client.invoice.getInvoice(req.params.invoiceId);
      res.json(invoice);
    } catch (err) {
      console.error("[Payunit:get invoice]", err);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  }
);

// --------------------
// Disbursement (payout)
// --------------------
router.post(
  "/disburse",
  paymentsLimiter,
  requireIdempotencyKey({ prefix: "payunit-disburse" }),
  async (req, res) => {
    try {
      const {
        account_number,
        amount,
        beneficiary_name,
        account_bank,
      } = req.body;

      const disbursement = await client.disbursement.createDisbursement({
        destination_currency: "XAF",
        debit_currency: "XAF",
        account_number,
        amount,
        beneficiary_name,
        deposit_type: "MOBILE_MONEY",
        transaction_id: `DISB_${Date.now()}`,
        country: "CM",
        account_bank,
      });

      res.json(disbursement);
    } catch (err) {
      console.error("[Payunit:disburse]", err);
      res.status(500).json({ error: "Disbursement failed" });
    }
  }
);

export default router;