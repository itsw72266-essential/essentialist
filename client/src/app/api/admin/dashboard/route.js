import { NextResponse } from "next/server";
import mongoose from "mongoose";

const { MONGODB_URI, MONGODB_DB } = process.env;

let cachedConnection = globalThis.__MONGOOSE_CONN__;

async function dbConnect() {
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }
  cachedConnection = await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB || undefined,
  });
  globalThis.__MONGOOSE_CONN__ = cachedConnection;
  return cachedConnection;
}

function getOrderModel() {
  try {
    return mongoose.model("order");
  } catch {
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
        delivery_address: { type: mongoose.Schema.Types.Mixed, required: true },
        contact_info: {
          name: String,
          customer_email: String,
          mobile: String,
        },
        subTotalAmt: { type: Number, default: 0 },
        totalAmt: { type: Number, default: 0 },
        totalQuantity: { type: Number, default: 0 },
        currency: { type: String, default: "INR" },
        metadata: {
          type: mongoose.Schema.Types.Mixed,
          default: () => ({}),
        },
        integrityToken: { type: String, index: true },
        receiptSignature: { type: String, default: "" },
        signatureGeneratedAt: { type: Date },
        is_guest: { type: Boolean, default: false },
      },
      { timestamps: true }
    );

    orderSchema.index({ is_guest: 1, integrityToken: 1 });

    return mongoose.model("order", orderSchema);
  }
}

function getUserModel() {
  try {
    return mongoose.model("User");
  } catch {
    const userSchema = new mongoose.Schema(
      {
        name: String,
        email: String,
        password: String,
        admin: { type: Boolean, default: false },
        // ...other fields
      },
      { timestamps: true }
    );
    return mongoose.model("User", userSchema);
  }
}

export async function GET(req, res) {
  try {
    await dbConnect();

    const Order = getOrderModel();
    const User = getUserModel();

    // All orders, including guests
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    // All registered users
    const users = await User.find({}).lean();

    // Totals
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.totalAmt || 0)),
      0
    );
    const totalSalesUnits = orders.reduce((sum, o) => {
      if (Array.isArray(o.products)) {
        return sum + o.products.reduce((s, p) => s + (p.quantity || 0), 0);
      }
      return sum;
    }, 0);
    const totalProfit = Math.round(totalRevenue * 0.35);

    // Unique users (including guests)
    const uniqueUsers = new Set();
    orders.forEach((o) => {
      if (o.userId) uniqueUsers.add(String(o.userId));
      else if (o.contact_info?.customer_email)
        uniqueUsers.add(o.contact_info.customer_email.toLowerCase());
      else uniqueUsers.add("guest");
    });

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          totalProducts: null, // let frontend fetch if needed
          totalUsers: uniqueUsers.size,
          totalRevenue,
          totalSalesUnits,
          totalProfit,
        },
        growth: {
          revenueGrowth: Math.random() * 30,
          salesGrowth: Math.random() * 18,
          profitGrowth: Math.random() * 25,
        },
        orders,
        users,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || err },
      { status: 500 }
    );
  }
}

