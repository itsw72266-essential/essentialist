import mongoose from "mongoose";

import AddressModel from "../models/address.model.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";

function ensureObjectId(id) {
  return mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null;
}

export async function mergeGuestCart(userId, guestCart = []) {
  if (!Array.isArray(guestCart) || !guestCart.length) return;

  const bulk = [];
  for (const item of guestCart) {
    const productId = ensureObjectId(item.productId);
    if (!productId) continue;

    const quantity = Math.min(Math.max(item.quantity || 1, 1), 99);

    bulk.push({
      updateOne: {
        filter: { userId, productId },
        update: {
          $setOnInsert: {
            userId,
            productId,
            quantity,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulk.length) {
    await CartProductModel.bulkWrite(bulk, { ordered: false });
    await UserModel.updateOne(
      { _id: userId },
      {
        $addToSet: {
          shopping_cart: { $each: bulk.map((b) => b.updateOne.filter.productId) },
        },
      }
    );
  }
}

export async function mergeGuestAddresses(userId, guestAddresses = []) {
  if (!Array.isArray(guestAddresses) || !guestAddresses.length) return;

  for (const addr of guestAddresses) {
    const shaped = {
      ...addr,
      userId,
    };

    const exists = await AddressModel.findOne({
      userId,
      city: addr.city,
      address_line: addr.address_line,
    }).lean();

    if (exists) continue;

    const created = await AddressModel.create(shaped);
    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { address_details: created._id } }
    );
  }
}

export async function mergeGuestOrders(userDoc, guestOrders = []) {
  if (!Array.isArray(guestOrders) || !guestOrders.length) return [];

  const orderTokenMap = guestOrders.reduce((map, entry) => {
    if (!entry?.orderId || !entry?.integrityToken) return map;
    map.set(entry.orderId, entry.integrityToken);
    return map;
  }, new Map());

  if (!orderTokenMap.size) return [];

  const candidateOrders = await OrderModel.find({
    orderId: { $in: Array.from(orderTokenMap.keys()) },
    is_guest: true,
  }).select("_id orderId integrityToken userId is_guest contact_info");

  if (!candidateOrders.length) return [];

  const syncedOrderIds = new Set();
  const attachableOrders = [];

  for (const order of candidateOrders) {
    const expectedToken = orderTokenMap.get(order.orderId);
    if (!expectedToken) continue;
    if (!order.integrityToken || expectedToken !== order.integrityToken) continue;

    if (order.userId && order.userId.toString() !== userDoc._id.toString()) {
      continue;
    }

    syncedOrderIds.add(order.orderId);

    if (!order.userId || order.is_guest) {
      attachableOrders.push(order);
    }
  }

  if (attachableOrders.length) {
    const bulkOps = attachableOrders.map((order) => ({
      updateOne: {
        filter: { _id: order._id },
        update: {
          $set: {
            userId: userDoc._id,
            is_guest: false,
            "contact_info.name": userDoc.name || order.contact_info?.name || "",
            "contact_info.customer_email":
              userDoc.email || order.contact_info?.customer_email || "",
            "contact_info.mobile":
              userDoc.mobile || order.contact_info?.mobile || "",
          },
        },
      },
    }));

    await OrderModel.bulkWrite(bulkOps, { ordered: false });
    await UserModel.updateOne(
      { _id: userDoc._id },
      {
        $addToSet: {
          orderHistory: { $each: attachableOrders.map((order) => order._id) },
        },
      }
    );
  }

  return Array.from(syncedOrderIds);
}
