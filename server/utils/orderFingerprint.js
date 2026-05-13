// utils/orderFingerprint.js
import crypto from "crypto";

function normalizeItem(item = {}) {
  const productReference =
    item?.productId?._id ??
    item?.productId ??
    item?.product_details?._id ??
    item?.product_details?.sku ??
    item?._id ??
    item?.sku ??
    item?.id ??
    "";
  const quantity = Number(item.quantity ?? item.qty ?? 1) || 0;
  const unitPrice =
    Number(
      item.unitPrice ??
        item.price ??
        item?.product_details?.price ??
        item.total ??
        0
    ) || 0;

  return `${productReference}:${quantity}:${unitPrice.toFixed(2)}`;
}

export function buildOrderFingerprint({
  userId,
  customerEmail,
  customerPhone,
  listItems = [],
  products = [],
  totalAmt = 0,
  currency = "XAF",
} = {}) {
  const party =
    userId?.toString() ||
    customerEmail?.toLowerCase?.() ||
    customerPhone ||
    "guest";
  const sourceItems = Array.isArray(products) && products.length
    ? products
    : Array.isArray(listItems)
    ? listItems
    : [];

  if (!sourceItems.length) {
    return null;
  }

  const normalizedItems = sourceItems
    .map(normalizeItem)
    .filter(Boolean)
    .sort()
    .join("|");

  const payload = `${party}|${currency}|${Number(totalAmt).toFixed(
    2
  )}|${normalizedItems}`;

  return crypto.createHash("sha256").update(payload).digest("hex");
}