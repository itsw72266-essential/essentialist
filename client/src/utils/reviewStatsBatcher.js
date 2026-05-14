/**
 * Coalesces many product-card review-stat lookups into a single POST per ~80ms window,
 * cutting Fluid CPU / serverless invocations on listing pages.
 */

import SummaryApi from '@/backend/contracts/summaryApi'

export const REVIEW_STATS_UPDATED_EVENT = 'essentialist:review-stats-updated'

/** Call after a review is created/deleted so product cards refetch aggregated stats. */
export function emitReviewStatsUpdated(productId) {
  if (typeof window === 'undefined' || !productId) return
  window.dispatchEvent(
    new CustomEvent(REVIEW_STATS_UPDATED_EVENT, {
      detail: { productId: String(productId) },
    }),
  )
}

const subscribers = new Map(); // productId -> Set<(stats) => void>
const pending = new Set();
let flushTimer = null;

const FLUSH_MS = 80;
const MAX_BATCH = 50;

function broadcast(productId, stats) {
  const set = subscribers.get(productId);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(stats);
    } catch {
      /* ignore subscriber errors */
    }
  }
}

async function flush() {
  flushTimer = null;
  if (!pending.size) return;

  const batch = [...pending].slice(0, MAX_BATCH);
  batch.forEach((id) => pending.delete(id));

  const origin = (
    process.env.NEXT_PUBLIC_API_URL || ""
  )
    .trim()
    .replace(/\/+$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");

  if (!origin) {
    for (const id of batch) broadcast(id, { average: 0, count: 0 });
    if (pending.size) flushTimer = window.setTimeout(flush, FLUSH_MS);
    return;
  }

  try {
    const batchUrl = `${origin}${SummaryApi.reviews.batchProductStats.url}`;
    const res = await fetch(batchUrl, {
      method: SummaryApi.reviews.batchProductStats.method.toUpperCase(),
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ productIds: batch }),
      cache: "default",
    });
    if (!res.ok) throw new Error(`batch-stats ${res.status}`);
    const json = await res.json();
    const map = json?.data && typeof json.data === "object" ? json.data : {};
    for (const id of batch) {
      const row = map[id] ?? map[String(id)] ?? { average: 0, count: 0 };
      broadcast(id, {
        average: Number(row.average) || 0,
        count: Number(row.count) || 0,
      });
    }
  } catch {
    for (const id of batch) broadcast(id, { average: 0, count: 0 });
  }

  if (pending.size && typeof window !== "undefined") {
    flushTimer = window.setTimeout(flush, FLUSH_MS);
  }
}

export function scheduleReviewStatsFetch(productId) {
  if (!productId || typeof window === "undefined") return;
  pending.add(String(productId));
  if (flushTimer === null) {
    flushTimer = window.setTimeout(flush, FLUSH_MS);
  }
}

/** Register before scheduling; returns unsubscribe. */
export function subscribeReviewStats(productId, onStats) {
  const id = String(productId);
  if (!subscribers.has(id)) subscribers.set(id, new Set());
  subscribers.get(id).add(onStats);
  return () => {
    subscribers.get(id)?.delete(onStats);
    if (subscribers.get(id)?.size === 0) subscribers.delete(id);
  };
}
