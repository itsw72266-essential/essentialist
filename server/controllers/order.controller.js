// import crypto from "crypto";
// import Stripe from "../config/stripe.js";
// import CartProductModel from "../models/cartproduct.model.js";
// import OrderModel from "../models/order.model.js";
// import UserModel from "../models/user.model.js";
// import mongoose from "mongoose";
// import {
//   sendOrderNotificationToAdmin,
//   sendOrderNotificationToCustomer,
// } from "../utils/mail.js";
// import AddressModel from "../models/address.model.js";

// export const ORDER_DEFAULT_CURRENCY =
//   process.env.ORDER_DEFAULT_CURRENCY?.trim() || "INR";
// const DEFAULT_CURRENCY = ORDER_DEFAULT_CURRENCY;
// const RECEIPT_PRIVATE_KEY = process.env.RECEIPT_PRIVATE_KEY
//   ? process.env.RECEIPT_PRIVATE_KEY.replace(/\\n/g, "\n").trim()
//   : "";
// const RECEIPT_SIGNATURE_ALGORITHM = "RSA-SHA256";

// function normalizeStripePaymentStatus(raw) {
//   const upper = String(raw ?? "").trim().toUpperCase();
//   if (upper === "PAID" || upper === "SUCCESS" || upper === "SUCCESSFUL") {
//     return "SUCCESSFUL";
//   }
//   if (upper === "NO_PAYMENT_REQUIRED") {
//     return "SUCCESSFUL";
//   }
//   if (upper === "UNPAID" || upper === "PENDING" || upper === "OPEN") {
//     return "PENDING";
//   }
//   if (upper === "FAILED" || upper === "CANCELED" || upper === "CANCELLED") {
//     return "FAILED";
//   }
//   return upper || "UNKNOWN";
// }

// /**
//  * Canonical JSON stringifier (stable key order, no whitespace)
//  */
// function canonicalStringify(value) {
//   if (value === null || typeof value !== "object") {
//     return JSON.stringify(value);
//   }
//   if (Array.isArray(value)) {
//     return `[${value.map((item) => canonicalStringify(item)).join(",")}]`;
//   }
//   const keys = Object.keys(value).sort();
//   const entries = keys.map(
//     (key) => `"${key}":${canonicalStringify(value[key])}`,
//   );
//   return `{${entries.join(",")}}`;
// }

// /**
//  * Resolve product line items regardless of storage shape.
//  */
// function resolveProductList(orderDoc = {}) {
//   if (Array.isArray(orderDoc.products) && orderDoc.products.length) {
//     return orderDoc.products;
//   }

//   if (orderDoc.productId || orderDoc.product_details) {
//     return [
//       {
//         productId: orderDoc.productId,
//         product_details: {
//           name: orderDoc.product_details?.name,
//           image: orderDoc.product_details?.image,
//           sku: orderDoc.product_details?.sku,
//           price: orderDoc.product_details?.price,
//         },
//         quantity:
//           orderDoc.quantity ??
//           orderDoc.totalQuantity ??
//           (orderDoc.subTotalAmt ? 1 : 0),
//         price:
//           orderDoc.price ??
//           orderDoc.unitPrice ??
//           orderDoc.product_details?.price ??
//           orderDoc.subTotalAmt ??
//           orderDoc.totalAmt ??
//           0,
//         total: orderDoc.totalAmt ?? orderDoc.subTotalAmt ?? 0,
//         sku:
//           orderDoc.sku ??
//           orderDoc.product_details?.sku ??
//           orderDoc.product_details?.productCode,
//       },
//     ];
//   }

//   return [];
// }

// /**
//  * Build normalized line items and totals.
//  */
// function normalizeProducts(orderDoc = {}) {
//   const products = resolveProductList(orderDoc);
//   const items = [];
//   let totalQuantity = 0;

//   products.forEach((item, index) => {
//     const quantity = Number(item.quantity ?? item.qty ?? 1) || 0;
//     const unitPrice =
//       Number(
//         item.unitPrice ?? item.price ?? item.product_details?.price ?? 0,
//       ) || 0;
//     const total =
//       Number(item.total ?? item.lineTotal ?? unitPrice * quantity) || 0;
//     const sku =
//       item.sku ??
//       item.product_details?.sku ??
//       item.product_details?.productCode ??
//       null;

//     totalQuantity += quantity;

//     items.push({
//       lineId: item.lineId ?? item.productId ?? `LINE-${index + 1}`,
//       name: item.product_details?.name ?? item.name ?? `Item ${index + 1}`,
//       quantity,
//       unitPrice,
//       total,
//       sku,
//     });
//   });

//   return { items, totalQuantity };
// }

// /**
//  * Assemble the payload that gets signed with RSA-PSS SHA-256.
//  */
// function buildReceiptPayload(orderDoc = {}, { integrityToken } = {}) {
//   const { items, totalQuantity } = normalizeProducts(orderDoc);
//   const totalAmount =
//     Number(
//       orderDoc.totalAmt ?? orderDoc.totalAmount ?? orderDoc.subTotalAmt ?? 0,
//     ) || 0;
//   const currency = orderDoc.currency ?? DEFAULT_CURRENCY;
//   const paymentStatus =
//     orderDoc.payment_status ?? orderDoc.paymentStatus ?? "Processing";
//   const paymentMethod =
//     orderDoc.paymentMethod ??
//     orderDoc.payment_method ??
//     (orderDoc.payment_status === "CASH ON DELIVERY"
//       ? "Cash on Delivery"
//       : "Online Payment");
//   const issuedOn = orderDoc.createdAt
//     ? new Date(orderDoc.createdAt).toISOString()
//     : new Date().toISOString();
//   const contact = orderDoc.contact_info ?? orderDoc.customer ?? {};

//   return {
//     orderId: orderDoc.orderId,
//     totalAmount,
//     currency,
//     totalQuantity,
//     issuedOn,
//     paymentStatus,
//     paymentMethod,
//     integrityToken: integrityToken ?? orderDoc.integrityToken ?? "",
//     items: items.map((item) => ({
//       name: item.name,
//       quantity: item.quantity,
//       unitPrice: item.unitPrice,
//       total: item.total,
//       sku: item.sku ?? "",
//     })),
//     customer: {
//       email: contact.customer_email ?? contact.email ?? "",
//       phone: contact.mobile ?? contact.phone ?? "",
//     },
//   };
// }

// /**
//  * Sanitize and normalize guest address payloads.
//  */
// export function sanitizeGuestAddress(addressData = {}) {
//   if (!addressData || typeof addressData !== "object") {
//     return {};
//   }

//   return {
//     name: addressData.name?.toString().trim() ?? "",
//     address_line:
//       addressData.address_line ??
//       addressData.addressLine ??
//       addressData.street ??
//       "",
//     landmark: addressData.landmark ?? "",
//     city: addressData.city ?? "",
//     state: addressData.state ?? "",
//     country: addressData.country ?? "",
//     pincode:
//       addressData.pincode ??
//       addressData.postalCode ??
//       addressData.zip ??
//       addressData.pinCode ??
//       "",
//     mobile: addressData.mobile ?? addressData.phone ?? "",
//     alt_phone: addressData.alt_phone ?? addressData.altPhone ?? "",
//   };
// }

// /**
//  * Sanitize and normalize guest contact information.
//  */
// export function sanitizeGuestContact(addressData = {}) {
//   const emailRaw =
//     addressData.customer_email ?? addressData.email ?? addressData.contactEmail;
//   const normalizedEmail = emailRaw
//     ? emailRaw.toString().trim().toLowerCase()
//     : "";
//   return {
//     name: addressData.name?.toString().trim() ?? "",
//     customer_email: normalizedEmail,
//     mobile: addressData.mobile ?? addressData.phone ?? "",
//   };
// }

// /**
//  * Resolve product information for guest orders that may only include product IDs.
//  */
// export async function resolveGuestOrderProducts(listItems = []) {
//   if (!Array.isArray(listItems)) return [];

//   const normalizedItems = [];
//   const missingProductIds = new Set();

//   listItems.forEach((item, index) => {
//     const productInput = item?.productId ?? item?.product ?? null;
//     const productDoc =
//       typeof productInput === "object" && productInput?._id
//         ? productInput
//         : null;
//     const productId =
//       productDoc?._id ??
//       (typeof productInput === "string" ? productInput : null) ??
//       (typeof item === "string" ? item : null);

//     if (!productDoc && !productId) {
//       throw new Error(
//         `Line item at position ${index + 1} is missing product information.`,
//       );
//     }

//     if (!productDoc && productId) {
//       missingProductIds.add(productId.toString());
//     }

//     normalizedItems.push({
//       index,
//       productDoc,
//       productId: productId ? productId.toString() : productDoc._id.toString(),
//       quantity: Number(item.quantity ?? item.qty ?? 1) || 1,
//       price: item.price ?? item.unitPrice ?? productDoc?.price ?? null,
//       total: item.total ?? item.lineTotal ?? null,
//       discount: item.discount ?? productDoc?.discount ?? 0,
//     });
//   });

//   let fetchedProducts = [];
//   if (missingProductIds.size > 0) {
//     let ProductModel;
//     try {
//       ProductModel = mongoose.model("product");
//     } catch (error) {
//       throw new Error(
//         "Product model is not registered. Ensure product.model.js is imported before order controller.",
//       );
//     }

//     fetchedProducts = await ProductModel.find({
//       _id: { $in: Array.from(missingProductIds) },
//     })
//       .select("name image sku productCode price discount")
//       .lean();
//   }

//   const fetchedProductMap = new Map(
//     fetchedProducts.map((doc) => [doc._id.toString(), doc]),
//   );

//   return normalizedItems.map((entry) => {
//     const productDoc =
//       entry.productDoc ?? fetchedProductMap.get(entry.productId.toString());

//     if (!productDoc) {
//       throw new Error(
//         `Unable to resolve product details for product ${entry.productId}.`,
//       );
//     }

//     const unitPrice = Number(entry.price ?? productDoc.price ?? 0) || 0;
//     const quantity = entry.quantity;
//     const total =
//       entry.total != null
//         ? Number(entry.total) || 0
//         : Number(unitPrice * quantity);

//     const images = Array.isArray(productDoc.image)
//       ? productDoc.image
//       : productDoc.image
//         ? [productDoc.image]
//         : [];

//     return {
//       productId: productDoc._id,
//       product_details: {
//         name: productDoc.name,
//         image: images,
//         sku: productDoc.sku ?? productDoc.productCode ?? undefined,
//         price: unitPrice,
//       },
//       quantity,
//       price: unitPrice,
//       total,
//       discount: Number(entry.discount ?? productDoc.discount ?? 0) || 0,
//     };
//   });
// }

// /**
//  * Ensure integrity token + signature exist and are persisted.
//  */
// export async function ensureIntegrityProof(orderDoc) {
//   if (!orderDoc) return null;

//   const integrityToken =
//     orderDoc.integrityToken ?? crypto.randomBytes(24).toString("base64url");
//   let receiptSignature = orderDoc.receiptSignature ?? null;
//   let shouldPersist = false;
//   const updatedFields = {};

//   const payload = buildReceiptPayload(orderDoc, { integrityToken });

//   if (!orderDoc.integrityToken) {
//     shouldPersist = true;
//     updatedFields.integrityToken = integrityToken;
//   }

//   if (RECEIPT_PRIVATE_KEY) {
//     const signer = crypto.createSign("RSA-SHA256");
//     signer.update(canonicalStringify(payload));
//     signer.end();

//     const signatureBuffer = signer.sign({
//       key: RECEIPT_PRIVATE_KEY,
//       padding: crypto.constants.RSA_PKCS1_PADDING,
//     });

//     const signatureBase64 = signatureBuffer.toString("base64");
//     if (signatureBase64 !== receiptSignature) {
//       receiptSignature = signatureBase64;
//       shouldPersist = true;
//       updatedFields.receiptSignature = signatureBase64;
//       updatedFields.signatureGeneratedAt = new Date();
//     }
//   }

//   if (!orderDoc.currency && DEFAULT_CURRENCY) {
//     shouldPersist = true;
//     updatedFields.currency = DEFAULT_CURRENCY;
//   }

//   if (shouldPersist) {
//     await OrderModel.updateOne(
//       { _id: orderDoc._id },
//       {
//         $set: {
//           integrityToken,
//           receiptSignature,
//           currency: orderDoc.currency ?? DEFAULT_CURRENCY,
//           signatureGeneratedAt:
//             updatedFields.signatureGeneratedAt ?? orderDoc.signatureGeneratedAt,
//         },
//       },
//     );
//   }

//   return {
//     ...orderDoc,
//     integrityToken,
//     receiptSignature,
//     currency: orderDoc.currency ?? DEFAULT_CURRENCY,
//     signatureGeneratedAt:
//       updatedFields.signatureGeneratedAt ??
//       orderDoc.signatureGeneratedAt ??
//       null,
//   };
// }

// /**
//  * Resolve the most appropriate delivery address payload for an order.
//  */
// function resolveDeliveryAddressCandidate(orderDoc = {}) {
//   const sources = [
//     orderDoc.delivery_address,
//     orderDoc.metadata?.guest_delivery_address,
//     orderDoc.contact_info?.address_snapshot,
//   ];

//   for (const candidate of sources) {
//     if (candidate) {
//       return candidate;
//     }
//   }

//   return null;
// }

// /**
//  * Format order for API consumers.
//  */
// export function formatOrderForClient(orderDoc) {
//   const { totalQuantity } = normalizeProducts(orderDoc);
//   const receiptDownloadPath = `/api/order/receipt/${encodeURIComponent(
//     orderDoc.orderId,
//   )}`;

//   const fulfillmentStatus =
//     orderDoc.fulfillment_status ?? orderDoc.fulfillmentStatus ?? "Processing";

//   const deliveryTimeline = Array.isArray(orderDoc.deliveryTimeline)
//     ? orderDoc.deliveryTimeline.map((entry) => ({
//         status: entry.status,
//         note: entry.note ?? "",
//         timestamp: entry.timestamp ? new Date(entry.timestamp) : null,
//         updatedBy: entry.updatedBy ? entry.updatedBy.toString() : null,
//       }))
//     : [];

//   const deliveryAddressRaw = resolveDeliveryAddressCandidate(orderDoc);
//   let deliveryAddressId = null;

//   if (deliveryAddressRaw && typeof deliveryAddressRaw === "object") {
//     deliveryAddressId =
//       deliveryAddressRaw._id ??
//       deliveryAddressRaw.id ??
//       deliveryAddressRaw.addressId ??
//       null;
//   } else if (deliveryAddressRaw) {
//     deliveryAddressId = deliveryAddressRaw;
//   }

//   const deliveryAddressIdString =
//     deliveryAddressId != null
//       ? (deliveryAddressId.toString?.() ?? String(deliveryAddressId))
//       : null;

//   return {
//     _id: orderDoc._id?.toString?.() ?? orderDoc._id,
//     orderId: orderDoc.orderId,
//     userId: orderDoc.userId,
//     products: resolveProductList(orderDoc),
//     payment_status: orderDoc.payment_status,
//     paymentStatus: orderDoc.payment_status,
//     paymentMethod:
//       orderDoc.paymentMethod ??
//       orderDoc.payment_method ??
//       (orderDoc.payment_status === "CASH ON DELIVERY"
//         ? "Cash on Delivery"
//         : "Online Payment"),
//     paymentId: orderDoc.paymentId ?? "",
//     delivery_address: deliveryAddressRaw,
//     delivery_address_id: deliveryAddressIdString,
//     contact_info: orderDoc.contact_info ?? {},
//     subTotalAmt: orderDoc.subTotalAmt ?? orderDoc.subTotal ?? null,
//     totalAmt: Number(orderDoc.totalAmt ?? orderDoc.totalAmount ?? 0) ?? 0,
//     totalAmount: Number(orderDoc.totalAmt ?? orderDoc.totalAmount ?? 0) ?? 0,
//     totalQuantity,
//     currency: orderDoc.currency ?? DEFAULT_CURRENCY,
//     metadata: orderDoc.metadata ?? {},
//     is_guest: Boolean(orderDoc.is_guest),
//     integrityToken: orderDoc.integrityToken,
//     receiptSignature: orderDoc.receiptSignature,
//     signature: orderDoc.receiptSignature,
//     signatureGeneratedAt: orderDoc.signatureGeneratedAt,
//     receiptDownloadPath,
//     receiptDownloadRequiresToken: Boolean(orderDoc.is_guest),
//     fulfillment_status: fulfillmentStatus,
//     fulfillmentStatus,
//     deliveredAt: orderDoc.deliveredAt ?? null,
//     deliveryTimeline,
//     createdAt: orderDoc.createdAt,
//     updatedAt: orderDoc.updatedAt,
//   };
// }

// /**
//  * Build structured payload returned by the secure download endpoint.
//  */
// function buildReceiptDownloadResponse(orderDoc) {
//   const payload = buildReceiptPayload(orderDoc);
//   return {
//     receipt: payload,
//     signature: orderDoc.receiptSignature ?? "",
//     signatureAlgorithm: RECEIPT_SIGNATURE_ALGORITHM,
//     signatureGeneratedAt: orderDoc.signatureGeneratedAt
//       ? new Date(orderDoc.signatureGeneratedAt).toISOString()
//       : new Date(
//           orderDoc.updatedAt ?? orderDoc.createdAt ?? Date.now(),
//         ).toISOString(),
//     integrityToken: orderDoc.integrityToken ?? "",
//     isGuest: Boolean(orderDoc.is_guest),
//     orderId: orderDoc.orderId,
//   };
// }

// export function buildInitialDeliveryTimeline({ note, updatedBy }) {
//   return [
//     {
//       status: "Processing",
//       note: note ?? "Order created",
//       timestamp: new Date(),
//       updatedBy: updatedBy ?? undefined,
//     },
//   ];
// }

// export function getTimelineActor(userId) {
//   if (!userId) return undefined;
//   return mongoose.Types.ObjectId.isValid(userId)
//     ? new mongoose.Types.ObjectId(userId)
//     : undefined;
// }

// // -----------------------------------------------------------------------------
// // Controllers
// // -----------------------------------------------------------------------------

// export async function CashOnDeliveryOrderController(request, response) {
//   try {
//     const userId = request.userId;
//     const { list_items, totalAmt, addressId, subTotalAmt, metadata } =
//       request.body;

//     if (!Array.isArray(list_items) || !list_items.length) {
//       return response.status(400).json({
//         message: "Provide at least one product.",
//         error: true,
//         success: false,
//       });
//     }

//     const addressObj = await AddressModel.findById(addressId).lean();
//     if (!addressObj) {
//       return response.status(404).json({
//         message: "Delivery address not found.",
//         error: true,
//         success: false,
//       });
//     }

//     const orderId = `ORD-${new mongoose.Types.ObjectId()}`;
//     const products = list_items.map((el) => ({
//       productId: el.productId._id,
//       product_details: {
//         name: el.productId.name,
//         image: el.productId.image,
//         sku: el.productId.sku ?? el.productId.productCode ?? undefined,
//         price: el.productId.price,
//       },
//       quantity: el.quantity,
//       price: el.productId.price,
//       total: el.productId.price * el.quantity,
//       discount: el.productId.discount ?? 0,
//     }));
//     const totalQuantity = products.reduce(
//       (sum, item) => sum + (item.quantity || 0),
//       0,
//     );

//     const computedTotal = products.reduce(
//       (sum, item) => sum + (item.total || 0),
//       0,
//     );
//     const safeSubtotal = Number(subTotalAmt ?? computedTotal);
//     const safeTotal = Number(totalAmt ?? computedTotal);
//     const orderPayload = {
//       userId,
//       orderId,
//       products,
//       paymentId: "",
//       payment_status: "CASH ON DELIVERY",
//       paymentMethod: "Cash on Delivery",
//       delivery_address: addressId,
//       contact_info: {
//         name: addressObj?.name || "",
//         customer_email: addressObj?.customer_email || "",
//         mobile: addressObj?.mobile || "",
//       },
//       subTotalAmt: safeSubtotal,
//       totalAmt: safeTotal,
//       totalQuantity,
//       currency: DEFAULT_CURRENCY,
//       is_guest: false,
//       metadata: metadata && typeof metadata === "object" ? metadata : {},
//       fulfillment_status: "Processing",
//       deliveryTimeline: buildInitialDeliveryTimeline({
//         note: "Order created via Cash on Delivery",
//         updatedBy: getTimelineActor(userId),
//       }),
//     };

//     const newOrder = await OrderModel.create(orderPayload);
//     const populatedOrder = await OrderModel.findById(newOrder._id)
//       .populate("delivery_address")
//       .lean();

//     const orderWithProof = await ensureIntegrityProof(populatedOrder);
//     await sendOrderNotificationToAdmin([orderWithProof]);
//     await sendOrderNotificationToCustomer(orderWithProof);

//     await CartProductModel.deleteMany({ userId });
//     await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

//     return response.json({
//       message: "Order placed successfully",
//       error: false,
//       success: true,
//       data: formatOrderForClient(orderWithProof),
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// export async function GuestCashOnDeliveryOrderController(request, response) {
//   try {
//     const {
//       list_items,
//       totalAmt,
//       subTotalAmt,
//       isGuestOrder,
//       metadata,
//       ...addressData
//     } = request.body;

//     if (!Array.isArray(list_items) || !list_items.length) {
//       return response.status(400).json({
//         message: "Provide at least one product to place an order.",
//         error: true,
//         success: false,
//       });
//     }

//     const contactInfoBase = sanitizeGuestContact(addressData);
//     if (!contactInfoBase.customer_email) {
//       return response.status(400).json({
//         message: "Guest email address is required to place an order.",
//         error: true,
//         success: false,
//       });
//     }

//     const sanitizedAddress = sanitizeGuestAddress(addressData);
//     const contactInfo = {
//       ...contactInfoBase,
//       address_snapshot: sanitizedAddress,
//     };

//     const metadataPayload = {
//       ...(metadata && typeof metadata === "object" ? metadata : {}),
//       payload_autoTaggedGuest: true,
//       guest_delivery_address: sanitizedAddress,
//     };

//     const products = await resolveGuestOrderProducts(list_items);
//     const totalQuantity = products.reduce(
//       (sum, item) => sum + (item.quantity || 0),
//       0,
//     );
//     const computedTotal = products.reduce(
//       (sum, item) => sum + (Number(item.total) || 0),
//       0,
//     );

//     const guestOrderId = `GUEST-${Date.now()}-${Math.floor(
//       Math.random() * 10000,
//     )
//       .toString()
//       .padStart(4, "0")}`;

//     const orderPayload = {
//       orderId: guestOrderId,
//       products,
//       paymentId: "",
//       payment_status: "CASH ON DELIVERY",
//       paymentMethod: "Cash on Delivery",
//       delivery_address: null,
//       contact_info: contactInfo,
//       subTotalAmt: Number(subTotalAmt ?? computedTotal),
//       totalAmt: Number(totalAmt ?? computedTotal),
//       totalQuantity,
//       currency: DEFAULT_CURRENCY,
//       is_guest: true,
//       metadata: metadataPayload,
//       fulfillment_status: "Processing",
//       deliveryTimeline: buildInitialDeliveryTimeline({
//         note: "Guest order created via Cash on Delivery",
//       }),
//     };

//     const newOrder = await OrderModel.create(orderPayload);
//     const storedOrder = await OrderModel.findById(newOrder._id).lean();
//     const orderWithProof = await ensureIntegrityProof(storedOrder);

//     const guestAddressSnapshot =
//       orderWithProof.metadata?.guest_delivery_address ??
//       orderWithProof.contact_info?.address_snapshot ??
//       null;

//     if (!orderWithProof.delivery_address && guestAddressSnapshot) {
//       orderWithProof.delivery_address = guestAddressSnapshot;
//     }

//     await sendOrderNotificationToAdmin([orderWithProof]);
//     await sendOrderNotificationToCustomer(orderWithProof);

//     const clientOrder = formatOrderForClient(orderWithProof);

//     return response.json({
//       message: "Guest order placed successfully",
//       error: false,
//       success: true,
//       orderId: guestOrderId,
//       data: clientOrder,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// export const pricewithDiscount = (price, dis = 1) => {
//   const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
//   const actualPrice = Number(price) - Number(discountAmout);
//   return actualPrice;
// };

// export async function paymentController(request, response) {
//   try {
//     const userId = request.userId;
//     const { list_items, totalAmt, addressId, subTotalAmt, metadata } =
//       request.body;

//     const user = await UserModel.findById(userId)
//       .populate("shopping_cart")
//       .populate("orderHistory")
//       .populate("address_details");

//     const line_items = list_items.map((item) => {
//       return {
//         price_data: {
//           currency: DEFAULT_CURRENCY.toLowerCase(),
//           product_data: {
//             name: item.productId.name,
//             images: item.productId.image,
//             metadata: {
//               productId: item.productId._id,
//             },
//           },
//           unit_amount: pricewithDiscount(
//             item.productId.price,
//             item.productId.discount,
//           ),
//         },
//         adjustable_quantity: {
//           enabled: true,
//           minimum: 1,
//         },
//         quantity: item.quantity,
//       };
//     });

//     const params = {
//       submit_type: "pay",
//       mode: "payment",
//       payment_method_types: ["card"],
//       customer_email: user.email,
//       metadata: {
//         userId: userId,
//         addressId: addressId,
//         forwardedMetadata: metadata ? JSON.stringify(metadata) : undefined,
//       },
//       line_items: line_items,
//       success_url: `${process.env.FRONTEND_URL}/success`,
//       cancel_url: `${process.env.FRONTEND_URL}/cancel`,
//     };

//     const session = await Stripe.checkout.sessions.create(params);

//     return response.status(200).json(session);
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// const getOrderProductItems = async ({
//   lineItems,
//   userId,
//   addressId,
//   paymentId,
//   payment_status,
//   customer,
//   currency = DEFAULT_CURRENCY,
//   metadata,
// }) => {
//   const productList = [];

//   if (lineItems?.data?.length) {
//     const timelineEntry = {
//       status: "Processing",
//       note: "Order created via Stripe checkout",
//       timestamp: new Date(),
//       updatedBy: getTimelineActor(userId),
//     };

//     const normalizedStripeStatus = normalizeStripePaymentStatus(payment_status);

//     for (const item of lineItems.data) {
//       const product = await Stripe.products.retrieve(item.price.product);

//       const payload = {
//         userId: userId,
//         orderId: `ORD-${new mongoose.Types.ObjectId()}`,
//         productId: product.metadata.productId,
//         product_details: {
//           name: product.name,
//           image: product.images,
//           sku: product.metadata?.sku,
//         },
//         paymentId: paymentId,
//         payment_status: normalizedStripeStatus,
//         paymentMethod: "Stripe Checkout",
//         delivery_address: addressId,
//         contact_info: {
//           name: customer?.name ?? "",
//           customer_email: customer?.email ?? "",
//           mobile: customer?.phone ?? "",
//         },
//         subTotalAmt: Number(item.amount_subtotal / 100),
//         totalAmt: Number(item.amount_total / 100),
//         totalQuantity: item.quantity ?? 1,
//         currency,
//         is_guest: false,
//         metadata: {
//           ...(metadata && typeof metadata === "object" ? metadata : {}),
//           stripe_product_id: product.id,
//           stripe_price_id: item.price.id,
//           stripe_payment_status_raw: payment_status,
//         },
//         fulfillment_status: "Processing",
//         deliveryTimeline: [timelineEntry],
//       };

//       productList.push(payload);
//     }
//   }

//   return productList;
// };

// export async function webhookStripe(request, response) {
//   const event = request.body;

//   try {
//     switch (event.type) {
//       case "checkout.session.completed": {
//         const session = event.data.object;
//         const lineItems = await Stripe.checkout.sessions.listLineItems(
//           session.id,
//         );
//         const userId = session.metadata.userId;
//         const forwardedMetadata = session.metadata.forwardedMetadata
//           ? JSON.parse(session.metadata.forwardedMetadata)
//           : {};
//         const orderProduct = await getOrderProductItems({
//           lineItems: lineItems,
//           userId: userId,
//           addressId: session.metadata.addressId,
//           paymentId: session.payment_intent,
//           payment_status: session.payment_status,
//           customer: session.customer_details ?? {
//             email: session.customer_email ?? "",
//           },
//           currency: session.currency?.toUpperCase() ?? DEFAULT_CURRENCY,
//           metadata: {
//             stripe_session_id: session.id,
//             ...forwardedMetadata,
//           },
//         });

//         const insertedOrders = await OrderModel.insertMany(orderProduct);

//         if (Array.isArray(insertedOrders) && insertedOrders.length) {
//           await Promise.all(
//             insertedOrders.map(async (doc) => {
//               const leanDoc = doc.toObject();
//               await ensureIntegrityProof(leanDoc);
//             }),
//           );

//           const refreshedOrders = await OrderModel.find({
//             _id: { $in: insertedOrders.map((doc) => doc._id) },
//           }).lean();

//           await sendOrderNotificationToAdmin(refreshedOrders);
//           await Promise.all(
//             refreshedOrders.map((order) => sendOrderNotificationToCustomer(order))
//           );

//           await UserModel.findByIdAndUpdate(userId, {
//             shopping_cart: [],
//           });
//           await CartProductModel.deleteMany({ userId: userId });
//         }
//         break;
//       }
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     response.json({ received: true });
//   } catch (error) {
//     console.error("Stripe webhook error:", error);
//     response.status(500).json({
//       received: false,
//       error: true,
//       message: error.message || error,
//     });
//   }
// }

// export async function getOrderDetailsController(request, response) {
//   try {
//     const userId = request.userId;

//     const orderlist = await OrderModel.find({ userId: userId })
//       .sort({ createdAt: -1 })
//       .populate("delivery_address")
//       .lean();

//     const ordersWithProof = await Promise.all(
//       orderlist.map(async (order) => {
//         const enriched = await ensureIntegrityProof(order);
//         if (
//           !enriched.delivery_address &&
//           (enriched.metadata?.guest_delivery_address ||
//             enriched.contact_info?.address_snapshot)
//         ) {
//           enriched.delivery_address =
//             enriched.metadata?.guest_delivery_address ??
//             enriched.contact_info?.address_snapshot;
//         }
//         return formatOrderForClient(enriched);
//       }),
//     );

//     return response.json({
//       message: "order list",
//       data: ordersWithProof,
//       error: false,
//       success: true,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// export async function verifyReceiptByTokenController(request, response) {
//   try {
//     const { orderId, integrityToken } = request.body;

//     if (!orderId) {
//       return response.status(400).json({
//         message: "orderId is required",
//         error: true,
//         success: false,
//       });
//     }

//     if (!integrityToken) {
//       return response.status(400).json({
//         message: "integrityToken is required for guest verification",
//         error: true,
//         success: false,
//       });
//     }

//     const orderRecord = await OrderModel.findOne({ orderId }).lean();

//     if (!orderRecord) {
//       return response.status(404).json({
//         message: "Order not found",
//         error: true,
//         success: false,
//       });
//     }

//     const orderWithProof = await ensureIntegrityProof(orderRecord);

//     if (!orderWithProof?.integrityToken) {
//       return response.status(409).json({
//         message: "This order does not have an integrity token yet.",
//         error: true,
//         success: false,
//       });
//     }

//     if (orderWithProof.integrityToken !== integrityToken) {
//       return response.status(403).json({
//         message: "Integrity token mismatch",
//         error: true,
//         success: false,
//       });
//     }

//     if (
//       !orderWithProof.delivery_address &&
//       (orderWithProof.metadata?.guest_delivery_address ||
//         orderWithProof.contact_info?.address_snapshot)
//     ) {
//       orderWithProof.delivery_address =
//         orderWithProof.metadata?.guest_delivery_address ??
//         orderWithProof.contact_info?.address_snapshot;
//     }

//     return response.json({
//       message: "Receipt verified",
//       error: false,
//       success: true,
//       data: formatOrderForClient(orderWithProof),
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }

// export async function downloadReceiptController(request, response) {
//   try {
//     const { orderId } = request.params;
//     const integrityToken =
//       request.query.token ?? request.headers["x-receipt-token"] ?? "";

//     if (!orderId) {
//       return response.status(400).json({
//         message: "orderId is required",
//         error: true,
//         success: false,
//       });
//     }

//     const orderRecord = await OrderModel.findOne({ orderId }).lean();
//     if (!orderRecord) {
//       return response.status(404).json({
//         message: "Order not found",
//         error: true,
//         success: false,
//       });
//     }

//     const orderWithProof = await ensureIntegrityProof(orderRecord);

//     if (
//       !orderWithProof.delivery_address &&
//       (orderWithProof.metadata?.guest_delivery_address ||
//         orderWithProof.contact_info?.address_snapshot)
//     ) {
//       orderWithProof.delivery_address =
//         orderWithProof.metadata?.guest_delivery_address ??
//         orderWithProof.contact_info?.address_snapshot;
//     }

//     const requestUserId = request.userId ?? null;

//     if (orderWithProof.is_guest) {
//       if (!orderWithProof.integrityToken) {
//         return response.status(409).json({
//           message: "Guest order does not yet have an integrity token.",
//           error: true,
//           success: false,
//         });
//       }
//       if (!integrityToken || integrityToken !== orderWithProof.integrityToken) {
//         return response.status(403).json({
//           message: "Valid integrity token is required for guest downloads.",
//           error: true,
//           success: false,
//         });
//       }
//     } else {
//       if (!requestUserId) {
//         return response.status(401).json({
//           message: "Authentication required to download this receipt.",
//           error: true,
//           success: false,
//         });
//       }
//       if (
//         orderWithProof.userId &&
//         orderWithProof.userId.toString() !== requestUserId.toString()
//       ) {
//         return response.status(403).json({
//           message: "You are not authorized to download this receipt.",
//           error: true,
//           success: false,
//         });
//       }
//     }

//     const downloadPayload = buildReceiptDownloadResponse(orderWithProof);
//     const filenameSafeId = orderId.replace(/[^\w.-]/g, "_");

//     response.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${filenameSafeId}_receipt.json"`,
//     );

//     return response.status(200).json({
//       success: true,
//       error: false,
//       message: "Receipt ready for download.",
//       suggestedFilename: `${filenameSafeId}_receipt.json`,
//       data: downloadPayload,
//     });
//   } catch (error) {
//     return response.status(500).json({
//       message: error.message || error,
//       error: true,
//       success: false,
//     });
//   }
// }




import crypto from "crypto";
import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";
import {
  sendOrderNotificationToAdmin,
  sendOrderNotificationToCustomer,
} from "../utils/mail.js";
import AddressModel from "../models/address.model.js";

export const ORDER_DEFAULT_CURRENCY =
  process.env.ORDER_DEFAULT_CURRENCY?.trim() || "INR";
const DEFAULT_CURRENCY = ORDER_DEFAULT_CURRENCY;
const RECEIPT_PRIVATE_KEY = process.env.RECEIPT_PRIVATE_KEY
  ? process.env.RECEIPT_PRIVATE_KEY.replace(/\\n/g, "\n").trim()
  : "";
const RECEIPT_SIGNATURE_ALGORITHM = "RSA-SHA256";

function runInBackground(label, task) {
  setImmediate(() => {
    Promise.resolve()
      .then(task)
      .catch((error) => console.error(`[bg:${label}]`, error));
  });
}

function normalizeStripePaymentStatus(raw) {
  const upper = String(raw ?? "").trim().toUpperCase();
  if (upper === "PAID" || upper === "SUCCESS" || upper === "SUCCESSFUL") {
    return "SUCCESSFUL";
  }
  if (upper === "NO_PAYMENT_REQUIRED") {
    return "SUCCESSFUL";
  }
  if (upper === "UNPAID" || upper === "PENDING" || upper === "OPEN") {
    return "PENDING";
  }
  if (upper === "FAILED" || upper === "CANCELED" || upper === "CANCELLED") {
    return "FAILED";
  }
  return upper || "UNKNOWN";
}

/**
 * Canonical JSON stringifier (stable key order, no whitespace)
 */
function canonicalStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  const entries = keys.map(
    (key) => `"${key}":${canonicalStringify(value[key])}`,
  );
  return `{${entries.join(",")}}`;
}

/**
 * Resolve product line items regardless of storage shape.
 */
function resolveProductList(orderDoc = {}) {
  if (Array.isArray(orderDoc.products) && orderDoc.products.length) {
    return orderDoc.products;
  }

  if (orderDoc.productId || orderDoc.product_details) {
    return [
      {
        productId: orderDoc.productId,
        product_details: {
          name: orderDoc.product_details?.name,
          image: orderDoc.product_details?.image,
          sku: orderDoc.product_details?.sku,
          price: orderDoc.product_details?.price,
        },
        quantity:
          orderDoc.quantity ??
          orderDoc.totalQuantity ??
          (orderDoc.subTotalAmt ? 1 : 0),
        price:
          orderDoc.price ??
          orderDoc.unitPrice ??
          orderDoc.product_details?.price ??
          orderDoc.subTotalAmt ??
          orderDoc.totalAmt ??
          0,
        total: orderDoc.totalAmt ?? orderDoc.subTotalAmt ?? 0,
        sku:
          orderDoc.sku ??
          orderDoc.product_details?.sku ??
          orderDoc.product_details?.productCode,
      },
    ];
  }

  return [];
}

/**
 * Build normalized line items and totals.
 */
function normalizeProducts(orderDoc = {}) {
  const products = resolveProductList(orderDoc);
  const items = [];
  let totalQuantity = 0;

  products.forEach((item, index) => {
    const quantity = Number(item.quantity ?? item.qty ?? 1) || 0;
    const unitPrice =
      Number(
        item.unitPrice ?? item.price ?? item.product_details?.price ?? 0,
      ) || 0;
    const total =
      Number(item.total ?? item.lineTotal ?? unitPrice * quantity) || 0;
    const sku =
      item.sku ??
      item.product_details?.sku ??
      item.product_details?.productCode ??
      null;

    totalQuantity += quantity;

    items.push({
      lineId: item.lineId ?? item.productId ?? `LINE-${index + 1}`,
      name: item.product_details?.name ?? item.name ?? `Item ${index + 1}`,
      quantity,
      unitPrice,
      total,
      sku,
    });
  });

  return { items, totalQuantity };
}

/**
 * Assemble the payload that gets signed with RSA-PSS SHA-256.
 */
function buildReceiptPayload(orderDoc = {}, { integrityToken } = {}) {
  const { items, totalQuantity } = normalizeProducts(orderDoc);
  const totalAmount =
    Number(
      orderDoc.totalAmt ?? orderDoc.totalAmount ?? orderDoc.subTotalAmt ?? 0,
    ) || 0;
  const currency = orderDoc.currency ?? DEFAULT_CURRENCY;
  const paymentStatus =
    orderDoc.payment_status ?? orderDoc.paymentStatus ?? "Processing";
  const paymentMethod =
    orderDoc.paymentMethod ??
    orderDoc.payment_method ??
    (orderDoc.payment_status === "CASH ON DELIVERY"
      ? "Cash on Delivery"
      : "Online Payment");
  const issuedOn = orderDoc.createdAt
    ? new Date(orderDoc.createdAt).toISOString()
    : new Date().toISOString();
  const contact = orderDoc.contact_info ?? orderDoc.customer ?? {};

  return {
    orderId: orderDoc.orderId,
    totalAmount,
    currency,
    totalQuantity,
    issuedOn,
    paymentStatus,
    paymentMethod,
    integrityToken: integrityToken ?? orderDoc.integrityToken ?? "",
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      sku: item.sku ?? "",
    })),
    customer: {
      email: contact.customer_email ?? contact.email ?? "",
      phone: contact.mobile ?? contact.phone ?? "",
    },
  };
}

/**
 * Sanitize and normalize guest address payloads.
 */
export function sanitizeGuestAddress(addressData = {}) {
  if (!addressData || typeof addressData !== "object") {
    return {};
  }

  return {
    name: addressData.name?.toString().trim() ?? "",
    address_line:
      addressData.address_line ??
      addressData.addressLine ??
      addressData.street ??
      "",
    landmark: addressData.landmark ?? "",
    city: addressData.city ?? "",
    state: addressData.state ?? "",
    country: addressData.country ?? "",
    pincode:
      addressData.pincode ??
      addressData.postalCode ??
      addressData.zip ??
      addressData.pinCode ??
      "",
    mobile: addressData.mobile ?? addressData.phone ?? "",
    alt_phone: addressData.alt_phone ?? addressData.altPhone ?? "",
  };
}

/**
 * Sanitize and normalize guest contact information.
 */
export function sanitizeGuestContact(addressData = {}) {
  const emailRaw =
    addressData.customer_email ?? addressData.email ?? addressData.contactEmail;
  const normalizedEmail = emailRaw
    ? emailRaw.toString().trim().toLowerCase()
    : "";
  return {
    name: addressData.name?.toString().trim() ?? "",
    customer_email: normalizedEmail,
    mobile: addressData.mobile ?? addressData.phone ?? "",
  };
}

/**
 * Resolve product information for guest orders that may only include product IDs.
 */
export async function resolveGuestOrderProducts(listItems = []) {
  if (!Array.isArray(listItems)) return [];

  const normalizedItems = [];
  const missingProductIds = new Set();

  listItems.forEach((item, index) => {
    const productInput = item?.productId ?? item?.product ?? null;
    const productDoc =
      typeof productInput === "object" && productInput?._id
        ? productInput
        : null;
    const productId =
      productDoc?._id ??
      (typeof productInput === "string" ? productInput : null) ??
      (typeof item === "string" ? item : null);

    if (!productDoc && !productId) {
      throw new Error(
        `Line item at position ${index + 1} is missing product information.`,
      );
    }

    if (!productDoc && productId) {
      missingProductIds.add(productId.toString());
    }

    normalizedItems.push({
      index,
      productDoc,
      productId: productId ? productId.toString() : productDoc._id.toString(),
      quantity: Number(item.quantity ?? item.qty ?? 1) || 1,
      price: item.price ?? item.unitPrice ?? productDoc?.price ?? null,
      total: item.total ?? item.lineTotal ?? null,
      discount: item.discount ?? productDoc?.discount ?? 0,
    });
  });

  let fetchedProducts = [];
  if (missingProductIds.size > 0) {
    let ProductModel;
    try {
      ProductModel = mongoose.model("product");
    } catch (error) {
      throw new Error(
        "Product model is not registered. Ensure product.model.js is imported before order controller.",
      );
    }

    fetchedProducts = await ProductModel.find({
      _id: { $in: Array.from(missingProductIds) },
    })
      .select("name image sku productCode price discount")
      .lean();
  }

  const fetchedProductMap = new Map(
    fetchedProducts.map((doc) => [doc._id.toString(), doc]),
  );

  return normalizedItems.map((entry) => {
    const productDoc =
      entry.productDoc ?? fetchedProductMap.get(entry.productId.toString());

    if (!productDoc) {
      throw new Error(
        `Unable to resolve product details for product ${entry.productId}.`,
      );
    }

    const unitPrice = Number(entry.price ?? productDoc.price ?? 0) || 0;
    const quantity = entry.quantity;
    const total =
      entry.total != null
        ? Number(entry.total) || 0
        : Number(unitPrice * quantity);

    const images = Array.isArray(productDoc.image)
      ? productDoc.image
      : productDoc.image
        ? [productDoc.image]
        : [];

    return {
      productId: productDoc._id,
      product_details: {
        name: productDoc.name,
        image: images,
        sku: productDoc.sku ?? productDoc.productCode ?? undefined,
        price: unitPrice,
      },
      quantity,
      price: unitPrice,
      total,
      discount: Number(entry.discount ?? productDoc.discount ?? 0) || 0,
    };
  });
}

/**
 * Ensure integrity token + signature exist and are persisted.
 */
export async function ensureIntegrityProof(orderDoc) {
  if (!orderDoc) return null;

  const integrityToken =
    orderDoc.integrityToken ?? crypto.randomBytes(24).toString("base64url");
  let receiptSignature = orderDoc.receiptSignature ?? null;
  let shouldPersist = false;
  const updatedFields = {};

  const payload = buildReceiptPayload(orderDoc, { integrityToken });

  if (!orderDoc.integrityToken) {
    shouldPersist = true;
    updatedFields.integrityToken = integrityToken;
  }

  if (RECEIPT_PRIVATE_KEY) {
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(canonicalStringify(payload));
    signer.end();

    const signatureBuffer = signer.sign({
      key: RECEIPT_PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    });

    const signatureBase64 = signatureBuffer.toString("base64");
    if (signatureBase64 !== receiptSignature) {
      receiptSignature = signatureBase64;
      shouldPersist = true;
      updatedFields.receiptSignature = signatureBase64;
      updatedFields.signatureGeneratedAt = new Date();
    }
  }

  if (!orderDoc.currency && DEFAULT_CURRENCY) {
    shouldPersist = true;
    updatedFields.currency = DEFAULT_CURRENCY;
  }

  if (shouldPersist) {
    await OrderModel.updateOne(
      { _id: orderDoc._id },
      {
        $set: {
          integrityToken,
          receiptSignature,
          currency: orderDoc.currency ?? DEFAULT_CURRENCY,
          signatureGeneratedAt:
            updatedFields.signatureGeneratedAt ?? orderDoc.signatureGeneratedAt,
        },
      },
    );
  }

  return {
    ...orderDoc,
    integrityToken,
    receiptSignature,
    currency: orderDoc.currency ?? DEFAULT_CURRENCY,
    signatureGeneratedAt:
      updatedFields.signatureGeneratedAt ??
      orderDoc.signatureGeneratedAt ??
      null,
  };
}

/**
 * Resolve the most appropriate delivery address payload for an order.
 */
function resolveDeliveryAddressCandidate(orderDoc = {}) {
  const sources = [
    orderDoc.delivery_address,
    orderDoc.metadata?.guest_delivery_address,
    orderDoc.contact_info?.address_snapshot,
  ];

  for (const candidate of sources) {
    if (candidate) {
      return candidate;
    }
  }

  return null;
}

/**
 * Format order for API consumers.
 */
export function formatOrderForClient(orderDoc) {
  const { totalQuantity } = normalizeProducts(orderDoc);
  const receiptDownloadPath = `/api/order/receipt/${encodeURIComponent(
    orderDoc.orderId,
  )}`;

  const fulfillmentStatus =
    orderDoc.fulfillment_status ?? orderDoc.fulfillmentStatus ?? "Processing";

  const deliveryTimeline = Array.isArray(orderDoc.deliveryTimeline)
    ? orderDoc.deliveryTimeline.map((entry) => ({
        status: entry.status,
        note: entry.note ?? "",
        timestamp: entry.timestamp ? new Date(entry.timestamp) : null,
        updatedBy: entry.updatedBy ? entry.updatedBy.toString() : null,
      }))
    : [];

  const deliveryAddressRaw = resolveDeliveryAddressCandidate(orderDoc);
  let deliveryAddressId = null;

  if (deliveryAddressRaw && typeof deliveryAddressRaw === "object") {
    deliveryAddressId =
      deliveryAddressRaw._id ??
      deliveryAddressRaw.id ??
      deliveryAddressRaw.addressId ??
      null;
  } else if (deliveryAddressRaw) {
    deliveryAddressId = deliveryAddressRaw;
  }

  const deliveryAddressIdString =
    deliveryAddressId != null
      ? (deliveryAddressId.toString?.() ?? String(deliveryAddressId))
      : null;

  return {
    _id: orderDoc._id?.toString?.() ?? orderDoc._id,
    orderId: orderDoc.orderId,
    userId: orderDoc.userId,
    products: resolveProductList(orderDoc),
    payment_status: orderDoc.payment_status,
    paymentStatus: orderDoc.payment_status,
    paymentMethod:
      orderDoc.paymentMethod ??
      orderDoc.payment_method ??
      (orderDoc.payment_status === "CASH ON DELIVERY"
        ? "Cash on Delivery"
        : "Online Payment"),
    paymentId: orderDoc.paymentId ?? "",
    delivery_address: deliveryAddressRaw,
    delivery_address_id: deliveryAddressIdString,
    contact_info: orderDoc.contact_info ?? {},
    subTotalAmt: orderDoc.subTotalAmt ?? orderDoc.subTotal ?? null,
    totalAmt: Number(orderDoc.totalAmt ?? orderDoc.totalAmount ?? 0) ?? 0,
    totalAmount: Number(orderDoc.totalAmt ?? orderDoc.totalAmount ?? 0) ?? 0,
    totalQuantity,
    currency: orderDoc.currency ?? DEFAULT_CURRENCY,
    metadata: orderDoc.metadata ?? {},
    is_guest: Boolean(orderDoc.is_guest),
    integrityToken: orderDoc.integrityToken,
    receiptSignature: orderDoc.receiptSignature,
    signature: orderDoc.receiptSignature,
    signatureGeneratedAt: orderDoc.signatureGeneratedAt,
    receiptDownloadPath,
    receiptDownloadRequiresToken: Boolean(orderDoc.is_guest),
    fulfillment_status: fulfillmentStatus,
    fulfillmentStatus,
    deliveredAt: orderDoc.deliveredAt ?? null,
    deliveryTimeline,
    createdAt: orderDoc.createdAt,
    updatedAt: orderDoc.updatedAt,
  };
}

/**
 * Build structured payload returned by the secure download endpoint.
 */
function buildReceiptDownloadResponse(orderDoc) {
  const payload = buildReceiptPayload(orderDoc);
  return {
    receipt: payload,
    signature: orderDoc.receiptSignature ?? "",
    signatureAlgorithm: RECEIPT_SIGNATURE_ALGORITHM,
    signatureGeneratedAt: orderDoc.signatureGeneratedAt
      ? new Date(orderDoc.signatureGeneratedAt).toISOString()
      : new Date(
          orderDoc.updatedAt ?? orderDoc.createdAt ?? Date.now(),
        ).toISOString(),
    integrityToken: orderDoc.integrityToken ?? "",
    isGuest: Boolean(orderDoc.is_guest),
    orderId: orderDoc.orderId,
  };
}

export function buildInitialDeliveryTimeline({ note, updatedBy }) {
  return [
    {
      status: "Processing",
      note: note ?? "Order created",
      timestamp: new Date(),
      updatedBy: updatedBy ?? undefined,
    },
  ];
}

export function getTimelineActor(userId) {
  if (!userId) return undefined;
  return mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : undefined;
}

// -----------------------------------------------------------------------------
// Controllers
// -----------------------------------------------------------------------------

export async function CashOnDeliveryOrderController(request, response) {
  try {
    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt, metadata } =
      request.body;

    if (!Array.isArray(list_items) || !list_items.length) {
      return response.status(400).json({
        message: "Provide at least one product.",
        error: true,
        success: false,
      });
    }

    const addressObj = await AddressModel.findById(addressId).lean();
    if (!addressObj) {
      return response.status(404).json({
        message: "Delivery address not found.",
        error: true,
        success: false,
      });
    }

    const orderId = `ORD-${new mongoose.Types.ObjectId()}`;
    const products = list_items.map((el) => ({
      productId: el.productId._id,
      product_details: {
        name: el.productId.name,
        image: el.productId.image,
        sku: el.productId.sku ?? el.productId.productCode ?? undefined,
        price: el.productId.price,
      },
      quantity: el.quantity,
      price: el.productId.price,
      total: el.productId.price * el.quantity,
      discount: el.productId.discount ?? 0,
    }));
    const totalQuantity = products.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );

    const computedTotal = products.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );
    const safeSubtotal = Number(subTotalAmt ?? computedTotal);
    const safeTotal = Number(totalAmt ?? computedTotal);
    const orderPayload = {
      userId,
      orderId,
      products,
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      paymentMethod: "Cash on Delivery",
      delivery_address: addressId,
      contact_info: {
        name: addressObj?.name || "",
        customer_email: addressObj?.customer_email || "",
        mobile: addressObj?.mobile || "",
      },
      subTotalAmt: safeSubtotal,
      totalAmt: safeTotal,
      totalQuantity,
      currency: DEFAULT_CURRENCY,
      is_guest: false,
      metadata: metadata && typeof metadata === "object" ? metadata : {},
      fulfillment_status: "Processing",
      deliveryTimeline: buildInitialDeliveryTimeline({
        note: "Order created via Cash on Delivery",
        updatedBy: getTimelineActor(userId),
      }),
    };

    const newOrder = await OrderModel.create(orderPayload);
    const populatedOrder = await OrderModel.findById(newOrder._id)
      .populate("delivery_address")
      .lean();

    const orderWithProof = await ensureIntegrityProof(populatedOrder);

    runInBackground("cod-notify", async () => {
      await sendOrderNotificationToAdmin([orderWithProof]);
      await sendOrderNotificationToCustomer(orderWithProof);
    });

    await CartProductModel.deleteMany({ userId });
    await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

    return response.json({
      message: "Order placed successfully",
      error: false,
      success: true,
      data: formatOrderForClient(orderWithProof),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function GuestCashOnDeliveryOrderController(request, response) {
  try {
    const {
      list_items,
      totalAmt,
      subTotalAmt,
      isGuestOrder,
      metadata,
      ...addressData
    } = request.body;

    if (!Array.isArray(list_items) || !list_items.length) {
      return response.status(400).json({
        message: "Provide at least one product to place an order.",
        error: true,
        success: false,
      });
    }

    const contactInfoBase = sanitizeGuestContact(addressData);
    if (!contactInfoBase.customer_email) {
      return response.status(400).json({
        message: "Guest email address is required to place an order.",
        error: true,
        success: false,
      });
    }

    const sanitizedAddress = sanitizeGuestAddress(addressData);
    const contactInfo = {
      ...contactInfoBase,
      address_snapshot: sanitizedAddress,
    };

    const metadataPayload = {
      ...(metadata && typeof metadata === "object" ? metadata : {}),
      payload_autoTaggedGuest: true,
      guest_delivery_address: sanitizedAddress,
    };

    const products = await resolveGuestOrderProducts(list_items);
    const totalQuantity = products.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const computedTotal = products.reduce(
      (sum, item) => sum + (Number(item.total) || 0),
      0,
    );

    const guestOrderId = `GUEST-${Date.now()}-${Math.floor(
      Math.random() * 10000,
    )
      .toString()
      .padStart(4, "0")}`;

    const orderPayload = {
      orderId: guestOrderId,
      products,
      paymentId: "",
      payment_status: "CASH ON DELIVERY",
      paymentMethod: "Cash on Delivery",
      delivery_address: null,
      contact_info: contactInfo,
      subTotalAmt: Number(subTotalAmt ?? computedTotal),
      totalAmt: Number(totalAmt ?? computedTotal),
      totalQuantity,
      currency: DEFAULT_CURRENCY,
      is_guest: true,
      metadata: metadataPayload,
      fulfillment_status: "Processing",
      deliveryTimeline: buildInitialDeliveryTimeline({
        note: "Guest order created via Cash on Delivery",
      }),
    };

    const newOrder = await OrderModel.create(orderPayload);
    const storedOrder = await OrderModel.findById(newOrder._id).lean();
    const orderWithProof = await ensureIntegrityProof(storedOrder);

    const guestAddressSnapshot =
      orderWithProof.metadata?.guest_delivery_address ??
      orderWithProof.contact_info?.address_snapshot ??
      null;

    if (!orderWithProof.delivery_address && guestAddressSnapshot) {
      orderWithProof.delivery_address = guestAddressSnapshot;
    }

    runInBackground("guest-cod-notify", async () => {
      await sendOrderNotificationToAdmin([orderWithProof]);
      await sendOrderNotificationToCustomer(orderWithProof);
    });

    const clientOrder = formatOrderForClient(orderWithProof);

    return response.json({
      message: "Guest order placed successfully",
      error: false,
      success: true,
      orderId: guestOrderId,
      data: clientOrder,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export const pricewithDiscount = (price, dis = 1) => {
  const discountAmout = Math.ceil((Number(price) * Number(dis)) / 100);
  const actualPrice = Number(price) - Number(discountAmout);
  return actualPrice;
};

export async function paymentController(request, response) {
  try {
    const userId = request.userId;
    const { list_items, totalAmt, addressId, subTotalAmt, metadata } =
      request.body;

    const user = await UserModel.findById(userId)
      .populate("shopping_cart")
      .populate("orderHistory")
      .populate("address_details");

    const line_items = list_items.map((item) => {
      return {
        price_data: {
          currency: DEFAULT_CURRENCY.toLowerCase(),
          product_data: {
            name: item.productId.name,
            images: item.productId.image,
            metadata: {
              productId: item.productId._id,
            },
          },
          unit_amount: pricewithDiscount(
            item.productId.price,
            item.productId.discount,
          ),
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: item.quantity,
      };
    });

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId: userId,
        addressId: addressId,
        forwardedMetadata: metadata ? JSON.stringify(metadata) : undefined,
      },
      line_items: line_items,
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);

    return response.status(200).json(session);
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

const getOrderProductItems = async ({
  lineItems,
  userId,
  addressId,
  paymentId,
  payment_status,
  customer,
  currency = DEFAULT_CURRENCY,
  metadata,
}) => {
  const productList = [];

  if (lineItems?.data?.length) {
    const timelineEntry = {
      status: "Processing",
      note: "Order created via Stripe checkout",
      timestamp: new Date(),
      updatedBy: getTimelineActor(userId),
    };

    const normalizedStripeStatus = normalizeStripePaymentStatus(payment_status);

    for (const item of lineItems.data) {
      const product = await Stripe.products.retrieve(item.price.product);

      const payload = {
        userId: userId,
        orderId: `ORD-${new mongoose.Types.ObjectId()}`,
        productId: product.metadata.productId,
        product_details: {
          name: product.name,
          image: product.images,
          sku: product.metadata?.sku,
        },
        paymentId: paymentId,
        payment_status: normalizedStripeStatus,
        paymentMethod: "Stripe Checkout",
        delivery_address: addressId,
        contact_info: {
          name: customer?.name ?? "",
          customer_email: customer?.email ?? "",
          mobile: customer?.phone ?? "",
        },
        subTotalAmt: Number(item.amount_subtotal / 100),
        totalAmt: Number(item.amount_total / 100),
        totalQuantity: item.quantity ?? 1,
        currency,
        is_guest: false,
        metadata: {
          ...(metadata && typeof metadata === "object" ? metadata : {}),
          stripe_product_id: product.id,
          stripe_price_id: item.price.id,
          stripe_payment_status_raw: payment_status,
        },
        fulfillment_status: "Processing",
        deliveryTimeline: [timelineEntry],
      };

      productList.push(payload);
    }
  }

  return productList;
};

export async function webhookStripe(request, response) {
  const event = request.body;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const lineItems = await Stripe.checkout.sessions.listLineItems(
          session.id,
        );
        const userId = session.metadata.userId;
        const forwardedMetadata = session.metadata.forwardedMetadata
          ? JSON.parse(session.metadata.forwardedMetadata)
          : {};
        const orderProduct = await getOrderProductItems({
          lineItems: lineItems,
          userId: userId,
          addressId: session.metadata.addressId,
          paymentId: session.payment_intent,
          payment_status: session.payment_status,
          customer: session.customer_details ?? {
            email: session.customer_email ?? "",
          },
          currency: session.currency?.toUpperCase() ?? DEFAULT_CURRENCY,
          metadata: {
            stripe_session_id: session.id,
            ...forwardedMetadata,
          },
        });

        const insertedOrders = await OrderModel.insertMany(orderProduct);

        if (Array.isArray(insertedOrders) && insertedOrders.length) {
          await Promise.all(
            insertedOrders.map(async (doc) => {
              const leanDoc = doc.toObject();
              await ensureIntegrityProof(leanDoc);
            }),
          );

          const refreshedOrders = await OrderModel.find({
            _id: { $in: insertedOrders.map((doc) => doc._id) },
          }).lean();

          runInBackground("stripe-notify", async () => {
            await sendOrderNotificationToAdmin(refreshedOrders);
            await Promise.allSettled(
              refreshedOrders.map((order) => sendOrderNotificationToCustomer(order))
            );
          });

          await UserModel.findByIdAndUpdate(userId, {
            shopping_cart: [],
          });
          await CartProductModel.deleteMany({ userId: userId });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    response.status(500).json({
      received: false,
      error: true,
      message: error.message || error,
    });
  }
}

export async function getOrderDetailsController(request, response) {
  try {
    const userId = request.userId;

    const orderlist = await OrderModel.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate("delivery_address")
      .lean();

    const ordersWithProof = await Promise.all(
      orderlist.map(async (order) => {
        const enriched = await ensureIntegrityProof(order);
        if (
          !enriched.delivery_address &&
          (enriched.metadata?.guest_delivery_address ||
            enriched.contact_info?.address_snapshot)
        ) {
          enriched.delivery_address =
            enriched.metadata?.guest_delivery_address ??
            enriched.contact_info?.address_snapshot;
        }
        return formatOrderForClient(enriched);
      }),
    );

    return response.json({
      message: "order list",
      data: ordersWithProof,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function verifyReceiptByTokenController(request, response) {
  try {
    const { orderId, integrityToken } = request.body;

    if (!orderId) {
      return response.status(400).json({
        message: "orderId is required",
        error: true,
        success: false,
      });
    }

    if (!integrityToken) {
      return response.status(400).json({
        message: "integrityToken is required for guest verification",
        error: true,
        success: false,
      });
    }

    const orderRecord = await OrderModel.findOne({ orderId }).lean();

    if (!orderRecord) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    const orderWithProof = await ensureIntegrityProof(orderRecord);

    if (!orderWithProof?.integrityToken) {
      return response.status(409).json({
        message: "This order does not have an integrity token yet.",
        error: true,
        success: false,
      });
    }

    if (orderWithProof.integrityToken !== integrityToken) {
      return response.status(403).json({
        message: "Integrity token mismatch",
        error: true,
        success: false,
      });
    }

    if (
      !orderWithProof.delivery_address &&
      (orderWithProof.metadata?.guest_delivery_address ||
        orderWithProof.contact_info?.address_snapshot)
    ) {
      orderWithProof.delivery_address =
        orderWithProof.metadata?.guest_delivery_address ??
        orderWithProof.contact_info?.address_snapshot;
    }

    return response.json({
      message: "Receipt verified",
      error: false,
      success: true,
      data: formatOrderForClient(orderWithProof),
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function downloadReceiptController(request, response) {
  try {
    const { orderId } = request.params;
    const integrityToken =
      request.query.token ?? request.headers["x-receipt-token"] ?? "";

    if (!orderId) {
      return response.status(400).json({
        message: "orderId is required",
        error: true,
        success: false,
      });
    }

    const orderRecord = await OrderModel.findOne({ orderId }).lean();
    if (!orderRecord) {
      return response.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    const orderWithProof = await ensureIntegrityProof(orderRecord);

    if (
      !orderWithProof.delivery_address &&
      (orderWithProof.metadata?.guest_delivery_address ||
        orderWithProof.contact_info?.address_snapshot)
    ) {
      orderWithProof.delivery_address =
        orderWithProof.metadata?.guest_delivery_address ??
        orderWithProof.contact_info?.address_snapshot;
    }

    const requestUserId = request.userId ?? null;

    if (orderWithProof.is_guest) {
      if (!orderWithProof.integrityToken) {
        return response.status(409).json({
          message: "Guest order does not yet have an integrity token.",
          error: true,
          success: false,
        });
      }
      if (!integrityToken || integrityToken !== orderWithProof.integrityToken) {
        return response.status(403).json({
          message: "Valid integrity token is required for guest downloads.",
          error: true,
          success: false,
        });
      }
    } else {
      if (!requestUserId) {
        return response.status(401).json({
          message: "Authentication required to download this receipt.",
          error: true,
          success: false,
        });
      }
      if (
        orderWithProof.userId &&
        orderWithProof.userId.toString() !== requestUserId.toString()
      ) {
        return response.status(403).json({
          message: "You are not authorized to download this receipt.",
          error: true,
          success: false,
        });
      }
    }

    const downloadPayload = buildReceiptDownloadResponse(orderWithProof);
    const filenameSafeId = orderId.replace(/[^\w.-]/g, "_");

    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameSafeId}_receipt.json"`,
    );

    return response.status(200).json({
      success: true,
      error: false,
      message: "Receipt ready for download.",
      suggestedFilename: `${filenameSafeId}_receipt.json`,
      data: downloadPayload,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}