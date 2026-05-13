// import { NextResponse } from "next/server";
// import mongoose from "mongoose";

// const { MONGODB_URI, MONGODB_DB } = process.env;

// if (!MONGODB_URI) {
//   throw new Error("Missing MONGODB_URI environment variable");
// }

// let cachedConnection = globalThis.__MONGOOSE_CONN__;

// async function dbConnect() {
//   if (cachedConnection && cachedConnection.readyState === 1) {
//     return cachedConnection;
//   }
//   cachedConnection = await mongoose.connect(MONGODB_URI, {
//     dbName: MONGODB_DB || undefined,
//   });
//   globalThis.__MONGOOSE_CONN__ = cachedConnection;
//   return cachedConnection;
// }

// function getOrderModel() {
//   try {
//     return mongoose.model("order");
//   } catch {
//     const orderProductSchema = new mongoose.Schema(
//       {
//         productId: { type: mongoose.Schema.ObjectId, ref: "product" },
//         product_details: {
//           name: String,
//           image: [String],
//           sku: String,
//           price: Number,
//         },
//         quantity: { type: Number, default: 1 },
//         price: { type: Number, default: 0 },
//         total: { type: Number, default: 0 },
//         discount: { type: Number, default: 0 },
//       },
//       { _id: false }
//     );

//     const orderSchema = new mongoose.Schema(
//       {
//         userId: {
//           type: mongoose.Schema.ObjectId,
//           ref: "User",
//         },
//         orderId: {
//           type: String,
//           required: [true, "Provide orderId"],
//           unique: true,
//           index: true,
//         },
//         products: [orderProductSchema],
//         paymentId: { type: String, default: "" },
//         payment_status: { type: String, default: "" },
//         paymentMethod: { type: String, default: "" },
//         delivery_address: { type: mongoose.Schema.Types.Mixed, required: true },
//         contact_info: {
//           name: String,
//           customer_email: String,
//           mobile: String,
//         },
//         subTotalAmt: { type: Number, default: 0 },
//         totalAmt: { type: Number, default: 0 },
//         totalQuantity: { type: Number, default: 0 },
//         currency: { type: String, default: "INR" },
//         metadata: {
//           type: mongoose.Schema.Types.Mixed,
//           default: () => ({}),
//         },
//         integrityToken: { type: String, index: true },
//         receiptSignature: { type: String, default: "" },
//         signatureGeneratedAt: { type: Date },
//         is_guest: { type: Boolean, default: false },
//       },
//       { timestamps: true }
//     );

//     orderSchema.index({ is_guest: 1, integrityToken: 1 });

//     return mongoose.model("order", orderSchema);
//   }
// }

// function getAddressModel() {
//   try {
//     return mongoose.model("address");
//   } catch {
//     const addressSchema = new mongoose.Schema(
//       {
//         name: String,
//         customer_email: String,
//         mobile: String,
//         address_line: String,
//         addressLine: String,
//         city: String,
//         state: String,
//         country: String,
//         pincode: String,
//         postalCode: String,
//         landmark: String,
//         alt_phone: String,
//       },
//       { timestamps: true, strict: false }
//     );

//     return mongoose.model("address", addressSchema);
//   }
// }

// const OrderModel = getOrderModel();

// function ensureArrayImages(value) {
//   if (!value) return [];
//   if (Array.isArray(value)) return value;
//   return [value];
// }

// function formatOrderForAdmin(orderDoc = {}, addressMap = new Map()) {
//   const products = Array.isArray(orderDoc.products)
//     ? orderDoc.products.map((product) => ({
//         ...product,
//         productId: product.productId ?? product._id ?? null,
//         product_details: {
//           ...(product.product_details || {}),
//           image: ensureArrayImages(product.product_details?.image),
//         },
//       }))
//     : [];

//   const totalQuantity =
//     Number(orderDoc.totalQuantity) ||
//     products.reduce(
//       (sum, item) => sum + (Number(item.quantity) || 0),
//       0
//     ) ||
//     0;

//   let deliveryAddress = null;
//   const rawDelivery = orderDoc.delivery_address;
//   if (
//     rawDelivery &&
//     typeof rawDelivery === "object" &&
//     !Array.isArray(rawDelivery)
//   ) {
//     deliveryAddress = rawDelivery;
//   } else if (rawDelivery) {
//     const idString =
//       typeof rawDelivery === "string"
//         ? rawDelivery
//         : rawDelivery.toString?.();
//     if (idString && addressMap.has(idString)) {
//       deliveryAddress = addressMap.get(idString);
//     }
//   }

//   return {
//     _id: orderDoc._id?.toString?.() ?? orderDoc._id,
//     orderId: orderDoc.orderId,
//     userId: orderDoc.userId ?? null,
//     is_guest: Boolean(orderDoc.is_guest),
//     products,
//     payment_status: orderDoc.payment_status ?? orderDoc.paymentStatus ?? "",
//     paymentMethod: orderDoc.paymentMethod ?? orderDoc.payment_method ?? "",
//     paymentId: orderDoc.paymentId ?? "",
//     delivery_address: deliveryAddress,
//     contact_info:
//       orderDoc.contact_info && typeof orderDoc.contact_info === "object"
//         ? orderDoc.contact_info
//         : {},
//     subTotalAmt:
//       Number(orderDoc.subTotalAmt ?? orderDoc.subTotal ?? 0) || 0,
//     totalAmt:
//       Number(orderDoc.totalAmt ?? orderDoc.totalAmount ?? 0) || 0,
//     totalQuantity,
//     currency: orderDoc.currency ?? "INR",
//     metadata:
//       orderDoc.metadata && typeof orderDoc.metadata === "object"
//         ? orderDoc.metadata
//         : {},
//     integrityToken: orderDoc.integrityToken ?? "",
//     receiptSignature: orderDoc.receiptSignature ?? "",
//     signatureGeneratedAt: orderDoc.signatureGeneratedAt ?? null,
//     createdAt: orderDoc.createdAt ?? null,
//     updatedAt: orderDoc.updatedAt ?? null,
//   };
// }

// export async function GET(request) {
//   try {
//     await dbConnect();

//     // const { searchParams } = new URL(request.url);
//     // const { searchParams } = request.nextUrl   // cheaper & avoids URL()
//     const { searchParams } = new URL(request.url);

//     const guestOnly = searchParams.get("guestOnly") === "true";
//     const includeGuestsParam = searchParams.get("includeGuests");
//     const includeGuests =
//       includeGuestsParam === null ? true : includeGuestsParam !== "false";
//     const limitParam = searchParams.get("limit");
//     const limit = limitParam ? Number(limitParam) : null;

//     const filters = {};
//     if (guestOnly) {
//       filters.is_guest = true;
//     } else if (!includeGuests) {
//       filters.$or = [{ is_guest: { $exists: false } }, { is_guest: false }];
//     }

//     let query = OrderModel.find(filters).sort({ createdAt: -1 });
//     if (limit && Number.isFinite(limit) && limit > 0) {
//       query = query.limit(limit);
//     }

//     const orderDocs = await query.lean();

//     const addressIds = new Set();
//     for (const order of orderDocs) {
//       const potentialId = order.delivery_address;
//       if (
//         potentialId &&
//         (typeof potentialId === "string" ||
//           potentialId instanceof mongoose.Types.ObjectId)
//       ) {
//         const idString =
//           typeof potentialId === "string"
//             ? potentialId
//             : potentialId.toString();
//         if (mongoose.Types.ObjectId.isValid(idString)) {
//           addressIds.add(idString);
//         }
//       }
//     }

//     let addressMap = new Map();
//     if (addressIds.size > 0) {
//       const AddressModel = getAddressModel();
//       const addresses = await AddressModel.find({
//         _id: { $in: Array.from(addressIds) },
//       })
//         .lean()
//         .exec();
//       addressMap = new Map(
//         addresses.map((address) => [address._id.toString(), address])
//       );
//     }

//     const orders = orderDocs.map((doc) =>
//       formatOrderForAdmin(doc, addressMap)
//     );

//     return NextResponse.json(
//       {
//         success: true,
//         count: orders.length,
//         data: orders,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("admin orders GET error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to fetch orders",
//         message: error?.message || "Unexpected error",
//       },
//       { status: 500 }
//     );
//   }
// }