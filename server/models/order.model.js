


import mongoose from "mongoose";
import { buildOrderFingerprint } from "../utils/orderFingerprint.js";

const orderProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.ObjectId, ref: "product" },
    product_details: {
      name: String,
      image: [String],
      sku: String,
      price: Number,
    },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
  },
  { _id: false }
);

const deliveryEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.ObjectId, ref: "User" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    orderId: {
      type: String,
      required: [true, "Provide orderId"],
      unique: true,
      index: true,
    },
    products: [orderProductSchema],
    paymentId: { type: String, default: "" },
    payment_status: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
    delivery_address: {
      type: mongoose.Schema.ObjectId,
      ref: "address",
    },
    contact_info: {
      name: String,
      customer_email: String,
      mobile: String,
      address_snapshot: mongoose.Schema.Types.Mixed,
    },
    subTotalAmt: { type: Number, default: 0 },
    totalAmt: { type: Number, default: 0 },
    totalQuantity: { type: Number, default: 0 },
    currency: { type: String, default: "XAF" },
    invoice_receipt: { type: String, default: "" },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    integrityToken: { type: String, index: true },
    receiptSignature: { type: String, default: "" },
    signatureGeneratedAt: { type: Date },
    is_guest: { type: Boolean, default: false },
    fulfillment_status: { type: String, default: "Processing" },
    deliveredAt: { type: Date },
    deliveryTimeline: {
      type: [deliveryEventSchema],
      default: () => [],
    },
    orderFingerprint: { type: String, index: true },
  },
  { timestamps: true }
);

// --- Indexes ---
orderSchema.index({ is_guest: 1, integrityToken: 1 });
orderSchema.index({ orderFingerprint: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });

/**
 * HARDENED PRE-SAVE HOOK
 * Uses async/await to prevent "next is not a function" crashes.
 */
orderSchema.pre("save", async function () {
  try {
    // Only generate fingerprint if it doesn't exist
    if (!this.orderFingerprint) {
      this.orderFingerprint = buildOrderFingerprint({
        userId: this.userId,
        customerEmail: this.contact_info?.customer_email,
        customerPhone: this.contact_info?.mobile,
        products: this.products,
        totalAmt: this.totalAmt,
        currency: this.currency,
      });
    }
  } catch (error) {
    // Log the error but allow the order to save
    console.error("⚠️ Order Fingerprint generation failed:", error.message);
    this.orderFingerprint = `err_gen_${new mongoose.Types.ObjectId()}`;
  }
});

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;