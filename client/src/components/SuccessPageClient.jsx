// frontend/app/success/page.jsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Home,
  Loader2,
  Printer,
  RefreshCw,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

// import { useGlobalContext } from "../providers/GlobalProvider";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { handleClearCart } from "../store/cartProduct";
import SummaryApi, { callSummaryApi } from "../common/SummaryApi";
import { useGlobalContext } from "@/providers/ReactQueryProvider";

const RECEIPT_PUBLIC_KEY_RAW =
  process.env.NEXT_PUBLIC_RECEIPT_PUBLIC_KEY ?? "";

const RECEIPT_PUBLIC_KEY = RECEIPT_PUBLIC_KEY_RAW.replace(/\\n/g, "\n").trim();

const VERIFICATION_THEMES = {
  verified: {
    label: "Receipt verified",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: ShieldCheck,
  },
  pending: {
    label: "Verifying…",
    tone: "border-sky-200 bg-sky-50 text-sky-700",
    icon: Loader2,
  },
  unverified: {
    label: "Awaiting verification",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    icon: AlertTriangle,
  },
  failed: {
    label: "Verification failed",
    tone: "border-rose-200 bg-rose-50 text-rose-700",
    icon: AlertTriangle,
  },
};

function sanitizeBase64(input = "") {
  const hydrated = input.replace(/\\n/g, "\n");
  return hydrated.replace(
    /-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\r?\n|\s+/g,
    ""
  );
}

function base64ToUint8Array(input = "") {
  const normalized = sanitizeBase64(input);
  if (!normalized) {
    return new Uint8Array();
  }

  try {
    if (typeof window === "undefined") return new Uint8Array();

    if (typeof window.atob === "function") {
      const binaryString = window.atob(normalized);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    if (typeof Buffer !== "undefined") {
      const buffer = Buffer.from(normalized, "base64");
      return new Uint8Array(buffer);
    }
  } catch (error) {
    console.error(
      "base64ToUint8Array: invalid base64 data for public key",
      error
    );
    return new Uint8Array();
  }

  throw new Error("Base64 decoding is not supported in this environment.");
}

function canonicalStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  const entries = keys.map(
    (key) => `"${key}":${canonicalStringify(value[key])}`
  );
  return `{${entries.join(",")}}`;
}

async function importSpkiPublicKey(base64Key) {
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    throw new Error("Web Crypto API unavailable");
  }
  const keyData = base64ToUint8Array(base64Key);
  if (!keyData.length) {
    throw new Error("Public key data is empty after normalization.");
  }
  return window.crypto.subtle.importKey(
    "spki",
    keyData.buffer,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );
}

export default function SuccessPageClient({ searchParams: initialParams }) {
  const searchParamsHook = useSearchParams();
  const dispatch = useDispatch();
  const { fetchCartItem, fetchOrder } = useGlobalContext();

  const [issuedAt, setIssuedAt] = useState(() => new Date());
  const [receipt, setReceipt] = useState(null);
  const [receiptLoaded, setReceiptLoaded] = useState(false);
  const [guestOrderId, setGuestOrderId] = useState("");
  const [serverReceipt, setServerReceipt] = useState(null);
  const [isServerLoading, setIsServerLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isServerFetchAttempted, setIsServerFetchAttempted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [verificationMessage, setVerificationMessage] = useState(
    "We are verifying your receipt."
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [guestFetchError, setGuestFetchError] = useState("");
  const [isGuestFetchLoading, setIsGuestFetchLoading] = useState(false);
  const [guestVerificationAttempt, setGuestVerificationAttempt] = useState(0);
  const [downloadError, setDownloadError] = useState("");
  const [urlIntegrityToken, setUrlIntegrityToken] = useState("");
  const hasClearedRef = useRef(false);
  const publicKeyRef = useRef(null);
  const savedGuestOrderIdRef = useRef(null);

  const searchParams = searchParamsHook ?? initialParams ?? {};

  const textParam =
    typeof searchParams.get === "function"
      ? searchParams.get("text")
      : searchParams.text;
  const orderIdParam =
    typeof searchParams.get === "function"
      ? searchParams.get("orderId")
      : searchParams.orderId;
  const tokenParam =
    typeof searchParams.get === "function"
      ? searchParams.get("token")
      : searchParams.token;

  const integrityTokenQuery = tokenParam ? tokenParam.trim() : "";
  const text = textParam && textParam.trim() ? textParam.trim() : "Payment";

  useEffect(() => {
    if (integrityTokenQuery) {
      setUrlIntegrityToken(integrityTokenQuery);
    }
  }, [integrityTokenQuery]);

  useEffect(() => {
    setIssuedAt(new Date());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedReceipt = window.localStorage.getItem("lastOrderReceipt");
      if (storedReceipt) {
        const parsed = JSON.parse(storedReceipt);
        if (integrityTokenQuery && !parsed.integrityToken) {
          parsed.integrityToken = integrityTokenQuery;
        }
        setReceipt(parsed);
        if (
          (parsed?.integrityToken || integrityTokenQuery) &&
          parsed?.orderId
        ) {
          const tokenToPersist = parsed.integrityToken || integrityTokenQuery;
          window.sessionStorage.setItem(
            `receipt.integrity.${parsed.orderId}`,
            tokenToPersist
          );
        }
        window.localStorage.removeItem("lastOrderReceipt");
      }
    } catch (error) {
      console.error("SuccessPage: failed to load receipt data", error);
    } finally {
      setReceiptLoaded(true);
    }
  }, [integrityTokenQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedGuestOrderId = window.localStorage.getItem("guestOrderId");
      if (storedGuestOrderId) {
        setGuestOrderId(storedGuestOrderId);
        window.localStorage.removeItem("guestOrderId");
      }
    } catch (error) {
      console.warn("SuccessPage: unable to access guest order id", error);
    }
  }, []);

  useEffect(() => {
    if (hasClearedRef.current) return;
    hasClearedRef.current = true;

    dispatch(handleClearCart());

    const refreshData = async () => {
      const tasks = [];
      if (typeof fetchCartItem === "function") tasks.push(fetchCartItem());
      if (typeof fetchOrder === "function") tasks.push(fetchOrder());
      if (tasks.length) {
        await Promise.allSettled(tasks);
      }
    };

    refreshData().catch((error) =>
      console.error("SuccessPage: unable to refresh data", error)
    );

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("guest_cart");
        window.localStorage.removeItem("guestCart");
      } catch (error) {
        console.warn("SuccessPage: unable to clear guest cart storage", error);
      }
    }
  }, [dispatch, fetchCartItem, fetchOrder]);

  const orderIdentifier = useMemo(
    () =>
      orderIdParam ||
      (receipt && (receipt.orderId || receipt._id)) ||
      (serverReceipt && (serverReceipt.orderId || serverReceipt._id)) ||
      guestOrderId ||
      "",
    [orderIdParam, receipt, serverReceipt, guestOrderId]
  );

  const isLikelyGuestOrder = useMemo(() => {
    if (!orderIdentifier) return false;
    if (String(orderIdentifier).startsWith("GUEST-")) return true;
    return Boolean(
      receipt?.is_guest ??
        receipt?.raw?.is_guest ??
        receipt?.isGuest ??
        serverReceipt?.is_guest ??
        serverReceipt?.isGuest ??
        urlIntegrityToken
    );
  }, [orderIdentifier, receipt, serverReceipt, urlIntegrityToken]);

  const getNormalizedReceipt = useCallback(
    (source, fallbackIntegrityToken = "") => {
      if (!source) return null;

      const fallbackOrderId =
        source.orderId ??
        source._id ??
        orderIdParam ??
        guestOrderId ??
        "Not available";
      const createdAt =
        source.generatedAt ??
        source.createdAt ??
        source.updatedAt ??
        issuedAt;
      const issuedOnDate =
        createdAt instanceof Date
          ? createdAt
          : createdAt
          ? new Date(createdAt)
          : issuedAt instanceof Date
          ? issuedAt
          : new Date();
      const currency =
        source.currency ?? source.currencyCode ?? "INR";

      const rawItems = Array.isArray(source.products)
        ? source.products
        : Array.isArray(source.items)
        ? source.items
        : [];

      const items = rawItems.map((item, index) => {
        const quantity = Number(item.quantity ?? item.qty ?? 1) || 0;
        const unitPrice =
          Number(
            item.unitPrice ??
              item.price ??
              item.product_details?.price ??
              0
          ) || 0;
        const total =
          Number(
            item.total ??
              item.lineTotal ??
              unitPrice * quantity
          ) || 0;
        return {
          lineId:
            item.lineId ??
            item.sku ??
            item.productId ??
            `LINE-${index + 1}`,
          name:
            item.product_details?.name ??
            item.name ??
            `Item ${index + 1}`,
          quantity,
          unitPrice,
          total,
          sku:
            item.sku ??
            item.product_details?.sku ??
            item.product_details?.productCode ??
            null,
        };
      });

      const totalQuantity =
        source.totalQuantity ??
        items.reduce((sum, item) => sum + (item.quantity || 0), 0);

      const deliveryAddress =
        typeof source.delivery_address === "object" &&
        source.delivery_address !== null
          ? source.delivery_address
          : source.address ??
            source.deliveryAddress ??
            null;

      return {
        raw: source,
        orderId: fallbackOrderId,
        paymentStatus:
          source.payment_status ??
          source.paymentStatus ??
          source.status ??
          text,
        paymentMethod:
          source.paymentMethod ??
          source.payment_method ??
          (source.payment_status === "CASH ON DELIVERY"
            ? "Cash on Delivery"
            : `${text} Payment`),
        totalAmount:
          Number(
            source.totalAmt ??
              source.totalAmount ??
              source.total ??
              0
          ) || 0,
        subTotal:
          Number(
            source.subTotalAmt ??
              source.subTotal ??
              0
          ) || null,
        currency,
        totalQuantity,
        items,
        issuedOn: issuedOnDate,
        issuedOnFormatted: issuedOnDate.toLocaleString(),
        customer: {
          name:
            source.contact_info?.name ??
            source.customer?.name ??
            deliveryAddress?.name ??
            "",
          email:
            source.contact_info?.customer_email ??
            source.contact_info?.email ??
            source.customer?.email ??
            "",
          phone:
            source.contact_info?.mobile ??
            source.customer?.phone ??
            deliveryAddress?.mobile ??
            "",
        },
        address: deliveryAddress
          ? {
              name: deliveryAddress.name ?? "",
              addressLine:
                deliveryAddress.address_line ??
                deliveryAddress.addressLine ??
                "",
              city: deliveryAddress.city ?? "",
              state: deliveryAddress.state ?? "",
              country: deliveryAddress.country ?? "",
              postalCode:
                deliveryAddress.pincode ??
                deliveryAddress.postalCode ??
                "",
              mobile: deliveryAddress.mobile ?? "",
            }
          : null,
        paymentReference:
          source.paymentId ??
          source.transactionId ??
          source.paymentReference ??
          null,
        signature:
          source.signature ??
          source.receiptSignature ??
          source.proof?.signature ??
          null,
        integrityToken:
          source.integrityToken ??
          source.receiptToken ??
          source.proof?.integrityToken ??
          fallbackIntegrityToken ??
          null,
        discountAmount:
          Number(source.discountAmount ?? source.discount ?? 0) ||
          null,
        taxAmount:
          Number(source.taxAmount ?? source.tax ?? 0) || null,
        metadata: source.metadata ?? source.extra ?? null,
        isGuest: Boolean(source.is_guest ?? source.isGuest),
      };
    },
    [guestOrderId, issuedAt, orderIdParam, text]
  );

  const offlineNormalizedReceipt = useMemo(
    () =>
      getNormalizedReceipt(
        receipt,
        urlIntegrityToken || integrityTokenQuery || ""
      ),
    [getNormalizedReceipt, receipt, urlIntegrityToken, integrityTokenQuery]
  );

  const derivedIntegrityToken = useMemo(() => {
    const candidates = [
      offlineNormalizedReceipt?.integrityToken,
      serverReceipt?.integrityToken,
      urlIntegrityToken,
      integrityTokenQuery,
    ];

    if (typeof window !== "undefined" && orderIdentifier) {
      try {
        const sessionToken =
          window.sessionStorage.getItem(
            `receipt.integrity.${orderIdentifier}`
          ) || "";
        candidates.push(sessionToken);
      } catch (error) {
        console.warn("SuccessPage: unable to read session token", error);
      }
    }

    for (const value of candidates) {
      if (value && value.trim()) {
        return value.trim();
      }
    }
    return "";
  }, [
    offlineNormalizedReceipt?.integrityToken,
    serverReceipt?.integrityToken,
    urlIntegrityToken,
    integrityTokenQuery,
    orderIdentifier,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!orderIdentifier) return;
    if (!derivedIntegrityToken) return;

    try {
      window.sessionStorage.setItem(
        `receipt.integrity.${orderIdentifier}`,
        derivedIntegrityToken
      );
    } catch (error) {
      console.warn("SuccessPage: unable to cache integrity token", error);
    }
  }, [orderIdentifier, derivedIntegrityToken]);

  const normalizedReceipt = useMemo(() => {
    const source = serverReceipt ?? receipt;
    if (!source) return null;

    const fallbackToken =
      derivedIntegrityToken ||
      urlIntegrityToken ||
      integrityTokenQuery ||
      "";
    return getNormalizedReceipt(source, fallbackToken);
  }, [
    getNormalizedReceipt,
    serverReceipt,
    receipt,
    derivedIntegrityToken,
    urlIntegrityToken,
    integrityTokenQuery,
  ]);

  useEffect(() => {
    if (
      !orderIdentifier ||
      isServerFetchAttempted ||
      !SummaryApi?.getOrderItems ||
      isLikelyGuestOrder
    ) {
      if (isLikelyGuestOrder && !isServerFetchAttempted) {
        setIsServerFetchAttempted(true);
      }
      return;
    }
    let active = true;

    const fetchServerReceipt = async () => {
      setIsServerLoading(true);
      setServerError("");
      try {
        const response = await callSummaryApi(SummaryApi.getOrderItems, {
          credentials: "include",
        });
        const serverOrders = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : response?.orders ?? [];
        const matched = serverOrders.find(
          (order) =>
            String(order.orderId ?? order._id) === String(orderIdentifier)
        );
        if (active) {
          if (matched) {
            const enriched = {
              ...matched,
              integrityToken:
                matched.integrityToken ?? derivedIntegrityToken ?? "",
            };
            setServerReceipt(enriched);
            setVerificationStatus("verified");
            setVerificationMessage("Verified against your account history.");
          } else if (serverOrders.length) {
            setVerificationMessage(
              "No matching order found yet. We will keep the signature check active."
            );
          }
        }
      } catch (error) {
        if (active) {
          setServerError(
            error?.message ?? "Unable to reach the server for verification."
          );
          console.error("SuccessPage: order fetch failed", error);
        }
      } finally {
        if (active) {
          setIsServerLoading(false);
          setIsServerFetchAttempted(true);
        }
      }
    };

    fetchServerReceipt();

    return () => {
      active = false;
    };
  }, [
    orderIdentifier,
    isServerFetchAttempted,
    isLikelyGuestOrder,
    derivedIntegrityToken,
  ]);

  useEffect(() => {
    if (!orderIdentifier) return;
    if (serverReceipt) return;
    if (verificationStatus === "verified") return;
    if (!SummaryApi?.verifyReceipt) return;
    if (!isLikelyGuestOrder && !urlIntegrityToken) return;

    const tokenToUse = derivedIntegrityToken;
    if (!tokenToUse) {
      if (!receiptLoaded) return;
      return;
    }

    let cancelled = false;

    const fetchGuestReceipt = async () => {
      setIsGuestFetchLoading(true);
      setGuestFetchError("");
      if (verificationStatus !== "verified") {
        setVerificationStatus("pending");
        setVerificationMessage("Validating your receipt token...");
      }

      try {
        const response = await callSummaryApi(SummaryApi.verifyReceipt, {
          payload: {
            orderId: orderIdentifier,
            integrityToken: tokenToUse,
          },
          credentials: "omit",
        });

        if (cancelled) return;

        if (response?.data) {
          const serverData = {
            ...response.data,
            integrityToken: response.data.integrityToken ?? tokenToUse,
          };
          setServerReceipt(serverData);
          setVerificationStatus("verified");
          setVerificationMessage("Verified using secure guest token.");
        } else {
          setGuestFetchError("Verification endpoint returned no data.");
        }
      } catch (error) {
        if (cancelled) return;
        const message =
          error?.message ?? "Guest verification request failed.";
        setGuestFetchError(message);
        if (!message.toLowerCase().includes("integrity token")) {
          setVerificationStatus("failed");
          setVerificationMessage(
            "Guest verification failed. Please contact support."
          );
        }
      } finally {
        if (!cancelled) {
          setIsGuestFetchLoading(false);
          setIsServerFetchAttempted(true);
        }
      }
    };

    fetchGuestReceipt();

    return () => {
      cancelled = true;
    };
  }, [
    orderIdentifier,
    derivedIntegrityToken,
    serverReceipt,
    isLikelyGuestOrder,
    urlIntegrityToken,
    verificationStatus,
    receiptLoaded,
    guestVerificationAttempt,
  ]);

  const verifyReceiptSignature = useCallback(
    async (normalizedSource) => {
      if (!normalizedSource?.signature || !RECEIPT_PUBLIC_KEY) return false;
      if (typeof window !== "undefined" && !window.crypto?.subtle) {
        console.warn("Web Crypto API unavailable for signature verification.");
        return false;
      }

      try {
        if (!publicKeyRef.current) {
          publicKeyRef.current = await importSpkiPublicKey(RECEIPT_PUBLIC_KEY);
        }
        const payload = canonicalStringify({
          orderId: normalizedSource.orderId,
          totalAmount: normalizedSource.totalAmount,
          currency: normalizedSource.currency,
          totalQuantity: normalizedSource.totalQuantity,
          issuedOn:
            normalizedSource.issuedOn instanceof Date
              ? normalizedSource.issuedOn.toISOString()
              : normalizedSource.issuedOn,
          paymentStatus: normalizedSource.paymentStatus,
          paymentMethod: normalizedSource.paymentMethod,
          integrityToken: normalizedSource.integrityToken ?? "",
          items: normalizedSource.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            sku: item.sku ?? "",
          })),
          customer: {
            email: normalizedSource.customer?.email ?? "",
            phone: normalizedSource.customer?.phone ?? "",
          },
        });

        const signatureBytes = base64ToUint8Array(
          normalizedSource.signature
        );
        if (!signatureBytes.length) {
          return false;
        }

        const isValid = await window.crypto.subtle.verify(
          { name: "RSA-PSS", saltLength: 32 },
          publicKeyRef.current,
          signatureBytes,
          new TextEncoder().encode(payload)
        );

        return Boolean(isValid);
      } catch (error) {
        console.error("SuccessPage: signature verification threw", error);
        return false;
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    const runVerification = async () => {
      if (serverReceipt) {
        if (!cancelled) {
          setVerificationStatus("verified");
          setVerificationMessage("Verified against your account history.");
        }
        return;
      }

      if (!receiptLoaded) {
        return;
      }

      if (!normalizedReceipt) {
        if (
          !isServerFetchAttempted ||
          isServerLoading ||
          isGuestFetchLoading
        ) {
          return;
        }
        if (!cancelled) {
          setVerificationStatus("failed");
          setVerificationMessage("Receipt data could not be located.");
        }
        return;
      }

      const effectiveIntegrityToken =
        normalizedReceipt.integrityToken || derivedIntegrityToken;

      if (!normalizedReceipt.signature || !RECEIPT_PUBLIC_KEY) {
        if (
          !isServerFetchAttempted ||
          isServerLoading ||
          isGuestFetchLoading
        ) {
          if (!cancelled) {
            setVerificationStatus("pending");
            setVerificationMessage("Awaiting secure verification...");
          }
          return;
        }
        if (!cancelled) {
          setVerificationStatus("unverified");
          setVerificationMessage(
            "Signature unavailable. Please retry while signed in to refresh from the server."
          );
        }
        return;
      }

      if (typeof window !== "undefined") {
        const storedToken = effectiveIntegrityToken
          ? window.sessionStorage.getItem(
              `receipt.integrity.${normalizedReceipt.orderId}`
            )
          : null;
        if (
          effectiveIntegrityToken &&
          storedToken &&
          effectiveIntegrityToken !== storedToken
        ) {
          if (!cancelled) {
            setVerificationStatus("failed");
            setVerificationMessage(
              "Integrity token mismatch. This receipt cannot be trusted."
            );
          }
          return;
        }
      }

      try {
        if (!cancelled) {
          setIsVerifying(true);
          setVerificationStatus("pending");
          setVerificationMessage("Validating your receipt signature...");
        }
        const verified = await verifyReceiptSignature(normalizedReceipt);
        if (!cancelled) {
          if (verified) {
            setVerificationStatus("verified");
            setVerificationMessage(
              "Cryptographic signature validated successfully."
            );
          } else {
            setVerificationStatus("failed");
            setVerificationMessage(
              "Receipt signature validation failed. Please contact support."
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setVerificationStatus("failed");
          setVerificationMessage(
            "An unexpected error occurred during verification."
          );
        }
      } finally {
        if (!cancelled) setIsVerifying(false);
      }
    };

    runVerification();

    return () => {
      cancelled = true;
    };
  }, [
    serverReceipt,
    normalizedReceipt,
    verifyReceiptSignature,
    receiptLoaded,
    isServerFetchAttempted,
    isServerLoading,
    isGuestFetchLoading,
    derivedIntegrityToken,
  ]);

  useEffect(() => {
    if ((serverError || guestFetchError) && verificationStatus !== "verified") {
      setVerificationMessage(
        "Server verification is currently unavailable. You can retry or rely on the digital signature."
      );
    }
  }, [serverError, guestFetchError, verificationStatus]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!normalizedReceipt) return;
    if (verificationStatus !== "verified") return;

    const orderId = normalizedReceipt.orderId;
    if (!orderId) return;

    const isGuestReceipt =
      normalizedReceipt.isGuest ||
      normalizedReceipt.is_guest ||
      String(orderId).startsWith("GUEST-");
    if (!isGuestReceipt) return;

    const tokenToPersist =
      normalizedReceipt.integrityToken || derivedIntegrityToken;
    if (!tokenToPersist) return;
    if (savedGuestOrderIdRef.current === orderId) return;

    const candidates = [
      serverReceipt,
      receipt,
      normalizedReceipt.raw,
      normalizedReceipt,
    ];

    let cachedOrder = null;
    for (const candidate of candidates) {
      if (!candidate) continue;
      try {
        cachedOrder = JSON.parse(JSON.stringify(candidate));
        break;
      } catch (error) {
        console.warn(
          "SuccessPage: unable to serialize candidate for guest order cache",
          error
        );
      }
    }

    if (cachedOrder) {
      cachedOrder.orderId = cachedOrder.orderId ?? orderId;
      if (
        !Array.isArray(cachedOrder.products) &&
        Array.isArray(normalizedReceipt.items)
      ) {
        cachedOrder.products = normalizedReceipt.items.map((item) => ({
          productId: item.lineId,
          product_details: {
            name: item.name,
            sku: item.sku,
            price: item.unitPrice,
            image: [],
          },
          quantity: item.quantity,
          price: item.total,
        }));
      }
      if (!cachedOrder.integrityToken) {
        cachedOrder.integrityToken = tokenToPersist;
      }
    }

    const entry = {
      orderId,
      integrityToken: tokenToPersist,
      cachedOrder,
      savedAt: new Date().toISOString(),
    };

    try {
      const historyRaw =
        window.localStorage.getItem("guestOrderHistory") || "[]";
      const historyParsed = JSON.parse(historyRaw);
      const history = Array.isArray(historyParsed) ? historyParsed : [];
      const nextHistory = [
        entry,
        ...history.filter((item) => item?.orderId !== orderId),
      ].slice(0, 20);

      window.localStorage.setItem(
        "guestOrderHistory",
        JSON.stringify(nextHistory)
      );

      try {
        window.dispatchEvent(
          new CustomEvent("guestOrderHistoryUpdated", { detail: nextHistory })
        );
      } catch (error) {
        window.dispatchEvent(new Event("guestOrderHistoryUpdated"));
      }

      savedGuestOrderIdRef.current = orderId;
    } catch (error) {
      console.warn(
        "SuccessPage: unable to persist guest order history snapshot",
        error
      );
    }
  }, [
    normalizedReceipt,
    verificationStatus,
    serverReceipt,
    receipt,
    derivedIntegrityToken,
  ]);

  const summaryRows = useMemo(() => {
    if (!normalizedReceipt) return [];
    const rows = [];
    if (
      normalizedReceipt.subTotal !== null &&
      normalizedReceipt.subTotal !== normalizedReceipt.totalAmount
    ) {
      rows.push({
        label: "Subtotal",
        value: DisplayPriceInRupees(normalizedReceipt.subTotal),
      });
    }
    if (normalizedReceipt.discountAmount) {
      rows.push({
        label: "Discount",
        value: `- ${DisplayPriceInRupees(
          Math.abs(normalizedReceipt.discountAmount)
        )}`,
      });
    }
    if (normalizedReceipt.taxAmount) {
      rows.push({
        label: "Tax",
        value: DisplayPriceInRupees(normalizedReceipt.taxAmount),
      });
    }
    rows.push({
      label: "Total",
      value: DisplayPriceInRupees(normalizedReceipt.totalAmount),
      emphasize: true,
    });
    return rows;
  }, [normalizedReceipt]);

  const hasItems = useMemo(
    () => Boolean(normalizedReceipt?.items?.length),
    [normalizedReceipt]
  );
  const hasAddress = useMemo(() => {
    if (!normalizedReceipt?.address) return false;
    return Object.values(normalizedReceipt.address).some((value) =>
      Boolean(value)
    );
  }, [normalizedReceipt]);
  const hasCustomer = useMemo(() => {
    if (!normalizedReceipt?.customer) return false;
    return Object.values(normalizedReceipt.customer).some((value) =>
      Boolean(value)
    );
  }, [normalizedReceipt]);

  const verificationTheme =
    VERIFICATION_THEMES[verificationStatus] ?? VERIFICATION_THEMES.pending;
  const VerificationIcon = verificationTheme.icon;

  const totalAmountDisplay = normalizedReceipt
    ? DisplayPriceInRupees(normalizedReceipt.totalAmount)
    : "—";

  const isProcessing =
    isServerLoading ||
    isGuestFetchLoading ||
    isVerifying ||
    verificationStatus === "pending";
  const showProgressBar = isProcessing;

  const guestHasIntegrityToken = Boolean(
    normalizedReceipt?.integrityToken || derivedIntegrityToken
  );

  const canDownload =
    Boolean(normalizedReceipt) &&
    verificationStatus === "verified" &&
    (!isLikelyGuestOrder || guestHasIntegrityToken) &&
    !isDownloading;
  const disablePrint = verificationStatus === "failed";

  const handlePrintReceipt = useCallback(() => {
    if (disablePrint) return;
    window.print();
  }, [disablePrint]);

  const handleDownloadReceipt = useCallback(async () => {
    if (!normalizedReceipt || isDownloading) return;

    const effectiveIntegrityToken =
      normalizedReceipt.integrityToken || derivedIntegrityToken;

    const isGuest = Boolean(
      normalizedReceipt.isGuest ?? normalizedReceipt.is_guest
    );
    if (isGuest && !effectiveIntegrityToken) {
      setDownloadError(
        "Guest orders require a valid integrity token before download."
      );
      return;
    }

    setIsDownloading(true);
    setDownloadError("");
    try {
      const params =
        isGuest && effectiveIntegrityToken
          ? { token: effectiveIntegrityToken }
          : undefined;
      const headers =
        isGuest && effectiveIntegrityToken
          ? { "x-receipt-token": effectiveIntegrityToken }
          : undefined;

      const downloadResponse = await callSummaryApi(
        SummaryApi.downloadReceipt(normalizedReceipt.orderId),
        {
          params,
          headers,
          credentials: isGuest ? "omit" : "include",
          cache: "no-store",
        }
      );

      const payload =
        downloadResponse?.data !== undefined
          ? downloadResponse.data
          : downloadResponse;

      if (!payload) {
        throw new Error("Receipt payload missing from response.");
      }

      const safeOrderId = String(
        normalizedReceipt.orderId || "order_receipt"
      ).replace(/[^\w.-]+/g, "_");

      const filename =
        downloadResponse?.suggestedFilename ||
        `${safeOrderId}_receipt.json`;

      const fileContents = JSON.stringify(payload, null, 2);
      const blob = new Blob([fileContents], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setDownloadError("");
    } catch (error) {
      const message =
        error?.message ??
        "Unable to download receipt. Please try again later.";
      setDownloadError(message);
      console.error("SuccessPage: download receipt failed", error);
    } finally {
      setIsDownloading(false);
    }
  }, [normalizedReceipt, isDownloading, derivedIntegrityToken]);

  const handleRetryVerification = useCallback(() => {
    setIsServerFetchAttempted(false);
    setServerReceipt(null);
    setServerError("");
    setGuestFetchError("");
    setVerificationStatus("pending");
    setVerificationMessage("Rechecking your receipt now...");
    setGuestVerificationAttempt((count) => count + 1);
    publicKeyRef.current = null;
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-emerald-50 py-14">
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            {text} Successful
          </span>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 sm:text-4xl">
            Thank you for your purchase!
          </h1>
          <p className="mt-3 text-base text-gray-600">
            Your order has been processed. We&apos;re verifying the official receipt below.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {serverError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Server verification delayed</p>
                  <p className="mt-1 leading-relaxed">
                    {serverError} You can retry secure verification or rely on the cryptographic signature if available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {guestFetchError && !serverReceipt && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Guest verification notice</p>
                  <p className="mt-1 leading-relaxed">{guestFetchError}</p>
                </div>
              </div>
            </div>
          )}

          {!normalizedReceipt ? (
            <div className="rounded-3xl border border-gray-200/70 bg-white/70 p-10 shadow-2xl backdrop-blur">
              <div className="flex flex-col items-center gap-4 text-center text-gray-600">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                    <p className="text-base font-medium">Preparing your secure receipt...</p>
                    <p className="text-sm text-gray-500">{verificationMessage}</p>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-10 w-10 text-rose-500" />
                    <p className="text-base font-semibold text-gray-900">Receipt unavailable</p>
                    <p className="text-sm text-gray-500">
                      We couldn&apos;t locate a matching receipt. Please revisit this page from your order history or contact support.
                    </p>
                  </>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/orders"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-400 hover:text-emerald-600"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    View my orders
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Home className="h-4 w-4" />
                    Back to home
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/80 shadow-2xl backdrop-blur-sm">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-400 to-rose-400" />
                {showProgressBar && (
                  <div className="absolute inset-x-0 top-0 h-1 animate-[pulse_2s_ease-in-out_infinite] bg-gradient-to-r from-sky-400 via-emerald-400 to-blue-400" />
                )}
                <div className="px-6 pb-6 pt-10 sm:px-10 sm:pt-12">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        <ReceiptText className="h-4 w-4" />
                        Secure Receipt
                      </div>
                      <h2 className="mt-4 text-2xl font-bold text-gray-900">
                        Order {normalizedReceipt.orderId}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Issued on {normalizedReceipt.issuedOnFormatted}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold text-gray-600">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        {normalizedReceipt.paymentStatus}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${verificationTheme.tone}`}
                      >
                        {verificationStatus === "pending" || isVerifying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <VerificationIcon className="h-4 w-4" />
                        )}
                        <span>{verificationTheme.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Amount Paid</p>
                        <p className="mt-1 text-3xl font-bold text-gray-900">
                          {totalAmountDisplay}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                          {normalizedReceipt.paymentMethod}
                        </p>
                        {normalizedReceipt.paymentReference && (
                          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-1 text-[10px] font-semibold tracking-widest text-gray-50">
                            Ref: {normalizedReceipt.paymentReference}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
                    <div>
                      <div className="rounded-2xl border border-gray-200 bg-white/60 shadow-sm">
                        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                            <ShoppingBag className="h-4 w-4 text-emerald-500" />
                            Items Purchased
                          </div>
                          <span className="rounded-full bg-gray-900/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-50">
                            {normalizedReceipt.totalQuantity} item
                            {normalizedReceipt.totalQuantity === 1 ? "" : "s"}
                          </span>
                        </header>
                        {hasItems ? (
                          <div className="divide-y divide-gray-100">
                            {normalizedReceipt.items.map((item) => (
                              <div
                                key={item.lineId}
                                className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-[3fr_1fr_1fr]"
                              >
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {item.name}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {item.sku ? `SKU: ${item.sku}` : "No SKU"}
                                  </p>
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                  Qty: {item.quantity}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">
                                    {DisplayPriceInRupees(item.total)}
                                  </p>
                                  <p className="mt-0.5 text-xs text-gray-500">
                                    {DisplayPriceInRupees(item.unitPrice)} each
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-5 py-6 text-sm text-gray-500">
                            No line items were recorded for this order.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      <div className="rounded-2xl border border-gray-200 bg-white/60 p-5 shadow-sm">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                          Payment Summary
                        </h3>
                        <dl className="mt-4 space-y-3 text-sm text-gray-600">
                          {summaryRows.map((row) => (
                            <div key={row.label} className="flex items-center justify-between">
                              <dt
                                className={
                                  row.emphasize ? "font-semibold text-gray-900" : undefined
                                }
                              >
                                {row.label}
                              </dt>
                              <dd
                                className={`font-medium ${
                                  row.emphasize ? "text-gray-900 text-lg" : ""
                                }`}
                              >
                                {row.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      {(hasCustomer || hasAddress) && (
                        <div className="rounded-2xl border border-gray-200 bg-white/60 p-5 shadow-sm">
                          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Customer
                          </h3>
                          <div className="mt-4 space-y-3 text-sm text-gray-600">
                            {normalizedReceipt.customer.name && (
                              <p className="font-semibold text-gray-900">
                                {normalizedReceipt.customer.name}
                              </p>
                            )}
                            {normalizedReceipt.customer.email && (
                              <p className="flex items-center gap-2 break-all">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {normalizedReceipt.customer.email}
                              </p>
                            )}
                            {normalizedReceipt.customer.phone && (
                              <p className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {normalizedReceipt.customer.phone}
                              </p>
                            )}
                            {hasAddress && (
                              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                                  Delivery Address
                                </p>
                                <p className="mt-2 text-sm text-gray-600">
                                  {[
                                    normalizedReceipt.address?.addressLine,
                                    normalizedReceipt.address?.city,
                                    normalizedReceipt.address?.state,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {[
                                    normalizedReceipt.address?.country,
                                    normalizedReceipt.address?.postalCode,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white/60 p-5 shadow-sm">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                        Authenticity
                      </h3>
                      <p className="mt-3 text-sm text-gray-600">
                        Verification method:{" "}
                        <span className="font-semibold text-gray-900">
                          {serverReceipt
                            ? "Server ledger match"
                            : RECEIPT_PUBLIC_KEY
                            ? "Cryptographic signature"
                            : "Not available"}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {verificationMessage}
                      </p>
                      <button
                        type="button"
                        onClick={handleRetryVerification}
                        disabled={isProcessing}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
                        Re-run verification
                      </button>
                      {normalizedReceipt.integrityToken && (
                        <div className="mt-5">
                          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Integrity token
                          </p>
                          <code className="mt-2 inline-flex max-w-full break-all rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-mono text-gray-50 shadow-inner">
                            {normalizedReceipt.integrityToken}
                          </code>
                        </div>
                      )}
                    </div>

                    {normalizedReceipt.metadata &&
                      typeof normalizedReceipt.metadata === "object" && (
                        <div className="rounded-2xl border border-gray-200 bg-white/60 p-5 shadow-sm">
                          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                            Order metadata
                          </h3>
                          <dl className="mt-3 space-y-2 text-sm text-gray-600">
                            {Object.entries(normalizedReceipt.metadata).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <dt className="text-gray-500 capitalize">
                                    {key.replace(/[_-]/g, " ")}
                                  </dt>
                                  <dd className="text-gray-900">
                                    {String(value)}
                                  </dd>
                                </div>
                              )
                            )}
                          </dl>
                        </div>
                      )}
                  </div>

                  <footer className="mt-10 border-t border-gray-100 pt-6">
                    <p className="text-xs leading-relaxed text-gray-500">
                      This receipt is only valid when verified via our secure ledger or with a valid digital signature. Do not share your integrity token publicly. For assistance, contact support with your order ID and payment reference.
                    </p>
                  </footer>
                </div>
              </div>

              <div className="flex flex-col  rounded-xl border border-gray-200/80 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Receipt controls</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Downloads are enabled only after successful authentication to prevent tampering.
                  </p>
                  {downloadError && (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      {downloadError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDownloadReceipt}
                    disabled={!canDownload}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    <FileDown className="h-4 w-4" />
                    {isDownloading ? "Preparing…" : "Download secure receipt"}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    disabled={disablePrint}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-emerald-400 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Printer className="h-4 w-4" />
                    Print receipt
                  </button>
                  <Link
                    href="/orders"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-gray-900 px-5 py-2.5 text-sm font-semibold text-gray-100 transition hover:bg-gray-800"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    View my orders
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
                  >
                    <Home className="h-4 w-4" />
                    Back home
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}