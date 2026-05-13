// // utils/useRating.js
// "use client";
// import { useCallback, useEffect, useState } from "react";

// export default function useRating(productId) {
//   const [average, setAverage] = useState(0);
//   const [count, setCount] = useState(0);
//   const [myRating, setMyRating] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const apiBase = process.env.NEXT_PUBLIC_API_URL;

//   const fetchData = useCallback(async () => {
//     if (!apiBase || !productId) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${apiBase}/api/ratings/${productId}`, { credentials: "include" });
//       if (res.ok) {
//         const json = await res.json();
//         const d = json?.data || {};
//         setAverage(Number(d.average || 0));
//         setCount(Number(d.count || 0));
//         setMyRating(d.myRating ?? null);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [apiBase, productId]);

//   useEffect(() => { fetchData(); }, [fetchData]);

//   const rate = useCallback(
//     async (value) => {
//       if (!apiBase) return;
//       // optimistic
//       const prev = { average, count, myRating };
//       try {
//         setMyRating(value);
//         const res = await fetch(`${apiBase}/api/ratings`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({ productId, value }),
//         });
//         if (!res.ok) throw new Error("Rating failed");
//         const json = await res.json();
//         const d = json?.data || {};
//         setAverage(Number(d.average || 0));
//         setCount(Number(d.count || 0));
//         setMyRating(d.myRating ?? value);
//       } catch (e) {
//         // revert
//         setAverage(prev.average); setCount(prev.count); setMyRating(prev.myRating);
//         throw e;
//       }
//     },
//     [apiBase, productId, average, count, myRating]
//   );

//   const removeMyRating = useCallback(async () => {
//     if (!apiBase) return;
//     const prev = { average, count, myRating };
//     try {
//       setMyRating(null);
//       const res = await fetch(`${apiBase}/api/ratings/${productId}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Remove failed");
//       const json = await res.json();
//       const d = json?.data || {};
//       setAverage(Number(d.average || 0));
//       setCount(Number(d.count || 0));
//       setMyRating(null);
//     } catch (e) {
//       // revert
//       setAverage(prev.average); setCount(prev.count); setMyRating(prev.myRating);
//       throw e;
//     }
//   }, [apiBase, productId, average, count, myRating]);

//   return { average, count, myRating, rate, removeMyRating, loading, refresh: fetchData };
// }


"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

function getOrCreateAnonId() {
  try {
    if (typeof window === "undefined") return null;
    const key = "anon_id_v1";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return null;
  }
}

export default function useRating(productId) {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [myRating, setMyRating] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const anonId = useMemo(() => getOrCreateAnonId(), []);

  const fetchData = useCallback(async () => {
    if (!apiBase || !productId) return;
    setLoading(true);
    try {
      const url = new URL(`${apiBase}/api/ratings/${productId}`);
      if (anonId) url.searchParams.set("anonId", anonId);
      const res = await fetch(url.toString(), { credentials: "include" });
      const text = await res.text();
      if (!res.ok) {
        console.error("GET ratings failed", res.status, text);
        return;
      }
      const json = JSON.parse(text || "{}");
      const d = json?.data || {};
      setAverage(Number(d.average || 0));
      setCount(Number(d.count || 0));
      setMyRating(d.myRating ?? null);
    } catch (e) {
      console.error("GET ratings error", e);
    } finally {
      setLoading(false);
    }
  }, [apiBase, productId, anonId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const rate = useCallback(
    async (value) => {
      if (!apiBase || !productId) return;
      const prev = { average, count, myRating };
      try {
        setMyRating(value);
        const url = new URL(`${apiBase}/api/ratings`);
        if (anonId) url.searchParams.set("anonId", anonId);
        const res = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId, value, anonId }),
        });
        const text = await res.text();
        if (!res.ok) {
          console.error("POST rating failed", res.status, text);
          throw new Error(`Rating failed: ${res.status}`);
        }
        const json = JSON.parse(text || "{}");
        const d = json?.data || {};
        setAverage(Number(d.average || 0));
        setCount(Number(d.count || 0));
        setMyRating(d.myRating ?? value);
      } catch (e) {
        setAverage(prev.average); setCount(prev.count); setMyRating(prev.myRating);
        throw e;
      }
    },
    [apiBase, productId, anonId, average, count, myRating]
  );

  const removeMyRating = useCallback(async () => {
    if (!apiBase || !productId) return;
    const prev = { average, count, myRating };
    try {
      setMyRating(null);
      const url = new URL(`${apiBase}/api/ratings/${productId}`);
      if (anonId) url.searchParams.set("anonId", anonId);
      const res = await fetch(url.toString(), {
        method: "DELETE",
        credentials: "include",
      });
      const text = await res.text();
      if (!res.ok) {
        console.error("DELETE rating failed", res.status, text);
        throw new Error(`Remove failed: ${res.status}`);
      }
      const json = JSON.parse(text || "{}");
      const d = json?.data || {};
      setAverage(Number(d.average || 0));
      setCount(Number(d.count || 0));
      setMyRating(null);
    } catch (e) {
      setAverage(prev.average); setCount(prev.count); setMyRating(prev.myRating);
      throw e;
    }
  }, [apiBase, productId, anonId, average, count, myRating]);

  return { average, count, myRating, rate, removeMyRating, loading, refresh: fetchData };
}