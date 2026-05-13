// // backend/controllers/guestadmin.controller.js
// import mongoose from "mongoose";
// import OrderModel from "../models/order.model.js";
// import ProductModel from "../models/product.model.js";
// import UserModel from "../models/user.model.js";
// import {
//   ensureIntegrityProof,
//   formatOrderForClient,
//   getTimelineActor,
// } from "./order.controller.js";

// function safeNumber(n) {
//   const parsed = Number(n);
//   return Number.isFinite(parsed) ? parsed : 0;
// }

// function sum(list = [], selector = (x) => x) {
//   return list.reduce((acc, item) => acc + selector(item), 0);
// }

// function percentChange(current, previous) {
//   if (!Number.isFinite(previous) || previous === 0) {
//     return Number.isFinite(current) && current !== 0 ? 100 : 0;
//   }
//   return Math.round(((current - previous) / previous) * 1000) / 10;
// }

// function computeGrowthMetrics(orders = []) {
//   const now = Date.now();
//   const dayMs = 24 * 60 * 60 * 1000;
//   const thirtyDaysAgo = now - 30 * dayMs;
//   const sixtyDaysAgo = now - 60 * dayMs;

//   const currentOrders = orders.filter(
//     (order) => new Date(order.createdAt).getTime() >= thirtyDaysAgo
//   );
//   const previousOrders = orders.filter((order) => {
//     const timestamp = new Date(order.createdAt).getTime();
//     return timestamp >= sixtyDaysAgo && timestamp < thirtyDaysAgo;
//   });

//   const currentRevenue = sum(currentOrders, (order) =>
//     safeNumber(order.totalAmt || order.subTotalAmt || 0)
//   );
//   const previousRevenue = sum(previousOrders, (order) =>
//     safeNumber(order.totalAmt || order.subTotalAmt || 0)
//   );

//   const currentUnits = sum(currentOrders, (order) =>
//     sum(Array.isArray(order.products) ? order.products : [], (item) =>
//       safeNumber(item.quantity || 1)
//     )
//   );
//   const previousUnits = sum(previousOrders, (order) =>
//     sum(Array.isArray(order.products) ? order.products : [], (item) =>
//       safeNumber(item.quantity || 1)
//     )
//   );

//   const currentProfit = Math.round(currentRevenue * 0.35);
//   const previousProfit = Math.round(previousRevenue * 0.35);

//   return {
//     revenueGrowth: percentChange(currentRevenue, previousRevenue),
//     salesGrowth: percentChange(currentUnits, previousUnits),
//     profitGrowth: percentChange(currentProfit, previousProfit),
//   };
// }

// export async function getAdminDashboardController(request, response) {
//   try {
//     const [orders, totalProducts, totalUsers] = await Promise.all([
//       OrderModel.find({}).sort({ createdAt: -1 }).lean(),
//       ProductModel.countDocuments(),
//       UserModel.countDocuments(),
//     ]);

//     const totalOrders = orders.length;
//     const totalRevenue = sum(orders, (order) =>
//       safeNumber(order.totalAmt || order.subTotalAmt || 0)
//     );
//     const totalSalesUnits = sum(orders, (order) =>
//       sum(Array.isArray(order.products) ? order.products : [], (item) =>
//         safeNumber(item.quantity || 1)
//       )
//     );
//     const totalProfit = Math.round(totalRevenue * 0.35);
//     const guestOrders = orders.filter((order) => Boolean(order.is_guest)).length;
//     const deliveredOrders = orders.filter((order) => {
//       const status =
//         order.fulfillment_status || order.fulfillmentStatus || "Processing";
//       return status.toLowerCase() === "delivered";
//     }).length;

//     const growth = computeGrowthMetrics(orders);

//     const totals = {
//       totalProducts,
//       totalUsers,
//       totalRevenue,
//       totalSalesUnits,
//       totalProfit,
//       totalOrders,
//       guestOrders,
//       deliveredOrders,
//     };

//     return response.json({
//       message: "Admin dashboard summary",
//       success: true,
//       error: false,
//       data: {
//         totals,
//         growth,
//       },
//     });
//   } catch (error) {
//     console.error("getAdminDashboardController", error);
//     return response.status(500).json({
//       message: error.message || "Unable to load admin dashboard summary.",
//       success: false,
//       error: true,
//     });
//   }
// }

// export async function getAllOrdersController(request, response) {
//   try {
//     const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();

//     const enriched = await Promise.all(
//       orders.map(async (order) => {
//         const proofed = await ensureIntegrityProof(order);
//         return formatOrderForClient(proofed);
//       })
//     );

//     return response.json({
//       message: "All orders",
//       success: true,
//       error: false,
//       data: enriched,
//     });
//   } catch (error) {
//     console.error("getAllOrdersController", error);
//     return response.status(500).json({
//       message: error.message || "Unable to load orders.",
//       success: false,
//       error: true,
//     });
//   }
// }

// export async function getGuestOrdersController(request, response) {
//   try {
//     const orders = await OrderModel.find({ is_guest: true })
//       .sort({ createdAt: -1 })
//       .lean();

//     const enriched = await Promise.all(
//       orders.map(async (order) => {
//         const proofed = await ensureIntegrityProof(order);
//         return formatOrderForClient(proofed);
//       })
//     );

//     return response.json({
//       message: "Guest orders",
//       success: true,
//       error: false,
//       data: enriched,
//     });
//   } catch (error) {
//     console.error("getGuestOrdersController", error);
//     return response.status(500).json({
//       message: error.message || "Unable to load guest orders.",
//       success: false,
//       error: true,
//     });
//   }
// }

// export async function markOrderDeliveredController(request, response) {
//   try {
//     const { orderId } = request.params;
//     const { note } = request.body;

//     if (!orderId) {
//       return response.status(400).json({
//         message: "orderId parameter is required.",
//         success: false,
//         error: true,
//       });
//     }

//     const query =
//       orderId.startsWith("ORD-") ||
//       orderId.startsWith("GUEST-") ||
//       orderId.startsWith("order")
//         ? { orderId }
//         : mongoose.Types.ObjectId.isValid(orderId)
//         ? { _id: orderId }
//         : { orderId };

//     const existingOrder = await OrderModel.findOne(query);
//     if (!existingOrder) {
//       return response.status(404).json({
//         message: "Order not found.",
//         success: false,
//         error: true,
//       });
//     }

//     if (
//       (existingOrder.fulfillment_status || "")
//         .toLowerCase()
//         .includes("delivered")
//     ) {
//       return response.status(409).json({
//         message: "Order is already marked as delivered.",
//         success: false,
//         error: true,
//       });
//     }

//     const now = new Date();
//     const timelineEntry = {
//       status: "Delivered",
//       note:
//         note?.trim() ||
//         "Delivery confirmed via admin dashboard.",
//       timestamp: now,
//       updatedBy: getTimelineActor(request.userId),
//     };

//     await OrderModel.updateOne(
//       { _id: existingOrder._id },
//       {
//         $set: {
//           fulfillment_status: "Delivered",
//           deliveredAt: now,
//         },
//         $push: {
//           deliveryTimeline: timelineEntry,
//         },
//       }
//     );

//     const updatedOrderDoc = await OrderModel.findById(
//       existingOrder._id
//     ).lean();

//     const proofed = await ensureIntegrityProof(updatedOrderDoc);
//     const formatted = formatOrderForClient(proofed);

//     return response.json({
//       message: "Order updated to delivered.",
//       success: true,
//       error: false,
//       data: formatted,
//     });
//   } catch (error) {
//     console.error("markOrderDeliveredController", error);
//     return response.status(500).json({
//       message: error.message || "Unable to mark order as delivered.",
//       success: false,
//       error: true,
//     });
//   }
// }




// backend/controllers/guestadmin.controller.js
import mongoose from "mongoose";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";
import {
  ensureIntegrityProof,
  formatOrderForClient,
  getTimelineActor,
} from "./order.controller.js";
import {
  sendDeliveryConfirmationNotification,
  sendOrderNotificationToAdmin,
} from "../utils/mail.js";

/**
 * Utility: Ensure a value is a valid finite number
 */
function safeNumber(n) {
  const parsed = Number(n);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Utility: Sum values in an array based on a selector
 */
function sum(list = [], selector = (x) => x) {
  return list.reduce((acc, item) => acc + selector(item), 0);
}

/**
 * Utility: Calculate percentage change between two values
 */
function percentChange(current, previous) {
  if (!Number.isFinite(previous) || previous === 0) {
    return Number.isFinite(current) && current !== 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Logic to calculate revenue and sales growth over the last 30 vs 60 days
 */
function computeGrowthMetrics(orders = []) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * dayMs;
  const sixtyDaysAgo = now - 60 * dayMs;

  const currentOrders = orders.filter(
    (order) => new Date(order.createdAt).getTime() >= thirtyDaysAgo
  );
  const previousOrders = orders.filter((order) => {
    const timestamp = new Date(order.createdAt).getTime();
    return timestamp >= sixtyDaysAgo && timestamp < thirtyDaysAgo;
  });

  const currentRevenue = sum(currentOrders, (order) =>
    safeNumber(order.totalAmt || order.subTotalAmt || 0)
  );
  const previousRevenue = sum(previousOrders, (order) =>
    safeNumber(order.totalAmt || order.subTotalAmt || 0)
  );

  const currentUnits = sum(currentOrders, (order) =>
    sum(Array.isArray(order.products) ? order.products : [], (item) =>
      safeNumber(item.quantity || 1)
    )
  );
  const previousUnits = sum(previousOrders, (order) =>
    sum(Array.isArray(order.products) ? order.products : [], (item) =>
      safeNumber(item.quantity || 1)
    )
  );

  const currentProfit = Math.round(currentRevenue * 0.35);
  const previousProfit = Math.round(previousRevenue * 0.35);

  return {
    revenueGrowth: percentChange(currentRevenue, previousRevenue),
    salesGrowth: percentChange(currentUnits, previousUnits),
    profitGrowth: percentChange(currentProfit, previousProfit),
  };
}

/**
 * GET: Aggregated totals and growth metrics for the Admin Dashboard
 */
export async function getAdminDashboardController(request, response) {
  try {
    const [orders, totalProducts, totalUsers] = await Promise.all([
      OrderModel.find({}).sort({ createdAt: -1 }).lean(),
      ProductModel.countDocuments(),
      UserModel.countDocuments(),
    ]);

    const totalOrders = orders.length;
    const totalRevenue = sum(orders, (order) =>
      safeNumber(order.totalAmt || order.subTotalAmt || 0)
    );
    const totalSalesUnits = sum(orders, (order) =>
      sum(Array.isArray(order.products) ? order.products : [], (item) =>
        safeNumber(item.quantity || 1)
      )
    );
    const totalProfit = Math.round(totalRevenue * 0.35);
    const guestOrders = orders.filter((order) => Boolean(order.is_guest)).length;
    const deliveredOrders = orders.filter((order) => {
      const status =
        order.fulfillment_status || order.fulfillmentStatus || "Processing";
      return status.toLowerCase() === "delivered";
    }).length;

    const growth = computeGrowthMetrics(orders);

    const totals = {
      totalProducts,
      totalUsers,
      totalRevenue,
      totalSalesUnits,
      totalProfit,
      totalOrders,
      guestOrders,
      deliveredOrders,
    };

    return response.json({
      message: "Admin dashboard summary",
      success: true,
      error: false,
      data: {
        totals,
        growth,
      },
    });
  } catch (error) {
    console.error("getAdminDashboardController", error);
    return response.status(500).json({
      message: error.message || "Unable to load admin dashboard summary.",
      success: false,
      error: true,
    });
  }
}

/**
 * GET: Fetch all orders (User + Guest) for Admin Management
 */
export async function getAllOrdersController(request, response) {
  try {
    const orders = await OrderModel.find({}).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const proofed = await ensureIntegrityProof(order);
        return formatOrderForClient(proofed);
      })
    );

    return response.json({
      message: "All orders",
      success: true,
      error: false,
      data: enriched,
    });
  } catch (error) {
    console.error("getAllOrdersController", error);
    return response.status(500).json({
      message: error.message || "Unable to load orders.",
      success: false,
      error: true,
    });
  }
}

/**
 * GET: Fetch only guest orders
 */
export async function getGuestOrdersController(request, response) {
  try {
    const orders = await OrderModel.find({ is_guest: true })
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const proofed = await ensureIntegrityProof(order);
        return formatOrderForClient(proofed);
      })
    );

    return response.json({
      message: "Guest orders",
      success: true,
      error: false,
      data: enriched,
    });
  } catch (error) {
    console.error("getGuestOrdersController", error);
    return response.status(500).json({
      message: error.message || "Unable to load guest orders.",
      success: false,
      error: true,
    });
  }
}

/**
 * POST: Mark an order as delivered and notify the customer
 */
export async function markOrderDeliveredController(request, response) {
  try {
    const { orderId } = request.params;
    const { note } = request.body;

    if (!orderId) {
      return response.status(400).json({
        message: "orderId parameter is required.",
        success: false,
        error: true,
      });
    }

    const query =
      orderId.startsWith("ORD-") ||
      orderId.startsWith("GUEST-") ||
      orderId.startsWith("order")
        ? { orderId }
        : mongoose.Types.ObjectId.isValid(orderId)
        ? { _id: orderId }
        : { orderId };

    const existingOrder = await OrderModel.findOne(query);
    if (!existingOrder) {
      return response.status(404).json({
        message: "Order not found.",
        success: false,
        error: true,
      });
    }

    if (
      (existingOrder.fulfillment_status || "")
        .toLowerCase()
        .includes("delivered")
    ) {
      return response.status(409).json({
        message: "Order is already marked as delivered.",
        success: false,
        error: true,
      });
    }

    const now = new Date();
    const timelineEntry = {
      status: "Delivered",
      note: note?.trim() || "Delivery confirmed via admin dashboard.",
      timestamp: now,
      updatedBy: getTimelineActor(request.userId),
    };

    await OrderModel.updateOne(
      { _id: existingOrder._id },
      {
        $set: {
          fulfillment_status: "Delivered",
          deliveredAt: now,
        },
        $push: {
          deliveryTimeline: timelineEntry,
        },
      }
    );

    const updatedOrderDoc = await OrderModel.findById(existingOrder._id).lean();
    const proofed = await ensureIntegrityProof(updatedOrderDoc);
    const formatted = formatOrderForClient(proofed);

    try {
      await sendDeliveryConfirmationNotification(formatted);
    } catch (notifyError) {
      console.error(
        "markOrderDeliveredController: failed to send delivery confirmation",
        notifyError
      );
    }

    return response.json({
      message: "Order updated to delivered.",
      success: true,
      error: false,
      data: formatted,
    });
  } catch (error) {
    console.error("markOrderDeliveredController", error);
    return response.status(500).json({
      message: error.message || "Unable to mark order as delivered.",
      success: false,
      error: true,
    });
  }
}

/**
 * POST: Resend the internal order notification to the store administrator
 */
export async function resendAdminOrderSummaryController(request, response) {
  try {
    const { orderId } = request.params;
    if (!orderId) {
      return response.status(400).json({
        success: false,
        error: true,
        message: "orderId parameter is required.",
      });
    }

    const orderDoc = await OrderModel.findOne({
      $or: [{ orderId }, { _id: orderId }],
    })
      .populate("delivery_address")
      .lean();

    if (!orderDoc) {
      return response.status(404).json({
        success: false,
        error: true,
        message: "Order not found.",
      });
    }

    const proofed = await ensureIntegrityProof(orderDoc);
    const formatted = formatOrderForClient(proofed);

    await sendOrderNotificationToAdmin([formatted]);

    return response.json({
      success: true,
      error: false,
      message: "Order summary re-sent to admin.",
      data: formatted,
    });
  } catch (error) {
    console.error("resendAdminOrderSummaryController", error);
    return response.status(500).json({
      success: false,
      error: true,
      message: error.message || "Unable to re-send order summary.",
    });
  }
}