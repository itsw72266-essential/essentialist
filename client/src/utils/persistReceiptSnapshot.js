// frontend/utils/persistReceiptSnapshot.js
const GUEST_HISTORY_KEY = "guestOrderHistory";
const MAX_HISTORY_ENTRIES = 20;

export function persistReceiptSnapshot(orderPayload, meta = {}) {
  if (typeof window === "undefined" || !orderPayload) return;

  try {
    const serialized = JSON.parse(JSON.stringify(orderPayload));
    const orderId =
      meta.orderId ??
      serialized.orderId ??
      serialized._id ??
      serialized?.raw?.orderId ??
      null;

    if (orderId) {
      serialized.orderId = orderId;
    }

    const integrityToken =
      meta.integrityToken ??
      serialized.integrityToken ??
      serialized.receiptToken ??
      serialized?.proof?.integrityToken ??
      "";

    if (integrityToken) {
      serialized.integrityToken = integrityToken;
    }

    window.localStorage.setItem("lastOrderReceipt", JSON.stringify(serialized));

    if (orderId) {
      window.localStorage.setItem("guestOrderId", orderId);
    }

    if (orderId && integrityToken) {
      try {
        window.sessionStorage.setItem(
          `receipt.integrity.${orderId}`,
          integrityToken
        );
      } catch (error) {
        console.warn(
          "persistReceiptSnapshot: unable to cache integrity token in sessionStorage",
          error
        );
      }
    }

    if (serialized.is_guest && orderId && integrityToken) {
      let history = [];
      try {
        const raw = window.localStorage.getItem(GUEST_HISTORY_KEY) || "[]";
        history = JSON.parse(raw);
        if (!Array.isArray(history)) history = [];
      } catch (error) {
        console.warn(
          "persistReceiptSnapshot: unable to read guest order history",
          error
        );
        history = [];
      }

      const entry = {
        orderId,
        integrityToken,
        cachedOrder: serialized,
        savedAt: new Date().toISOString(),
      };

      const nextHistory = [
        entry,
        ...history.filter((item) => item?.orderId !== orderId),
      ].slice(0, MAX_HISTORY_ENTRIES);

      window.localStorage.setItem(
        GUEST_HISTORY_KEY,
        JSON.stringify(nextHistory)
      );

      try {
        window.dispatchEvent(
          new CustomEvent("guestOrderHistoryUpdated", { detail: nextHistory })
        );
      } catch (error) {
        window.dispatchEvent(new Event("guestOrderHistoryUpdated"));
      }
    }
  } catch (error) {
    console.warn(
      "persistReceiptSnapshot: unable to stage receipt snapshot",
      error
    );
  }
}

export function clearStagedReceiptSnapshot() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("lastOrderReceipt");
    window.localStorage.removeItem("guestOrderId");
  } catch (error) {
    console.warn("clearStagedReceiptSnapshot: failed to clear storage", error);
  }
}