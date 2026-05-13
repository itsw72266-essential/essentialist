// client/src/app/orders/page.jsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";

import NoData from "../../components/NoData";
import { DisplayPriceInRupees } from "../../utils/DisplayPriceInRupees";
import SummaryApi, { callSummaryApi } from "../../common/SummaryApi";
import { useOrdersQuery } from "@/hooks/queries/useOrdersQuery";

const loaderStyles = `
  .loader-lg {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    width: 2em;
    height: 2em;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }
  @keyframes spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
  }
`;

function extractOrdersFromResponse(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.orders)) return response.orders;
  if (Array.isArray(response?.payload)) return response.payload;
  return [];
}

function getStatusColor(status) {
  switch (status?.toUpperCase()) {
    case "CASH ON DELIVERY":
      return "bg-orange-100 text-orange-800";
    case "PAID":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "SHIPPED":
      return "bg-indigo-100 text-indigo-800";
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function normalizeSingleOrder(order) {
  if (!order) return null;

  const idKey = String(
    order.orderId ?? order._id ?? order.id ?? crypto.randomUUID?.() ?? Date.now()
  );

  if (Array.isArray(order.products) && order.products.length > 0) {
    return {
      ...order,
      orderId: order.orderId ?? idKey,
      products: order.products.map((product) => ({
        ...product,
        productId:
          product.productId ??
          product.lineId ??
          crypto.randomUUID?.() ??
          `${idKey}-${Date.now()}`,
        product_details:
          product.product_details ??
          product.productDetails ?? {
            name: product.name ?? "Unknown Product",
            image: Array.isArray(product.image)
              ? product.image
              : product.image
              ? [product.image]
              : [],
          },
        quantity: Number(product.quantity ?? 1) || 1,
        price:
          Number(product.price ?? product.total ?? product.totalAmt ?? 0) || 0,
      })),
    };
  }

  const normalizedProduct = {
    productId:
      order.productId ??
      order.lineId ??
      crypto.randomUUID?.() ??
      `${idKey}-${Date.now()}`,
    product_details:
      order.product_details ??
      order.productDetails ?? {
        name: order.name ?? "Unknown Product",
        image: order.image ? [order.image] : [],
      },
    quantity: Number(order.quantity ?? 1) || 1,
    price:
      Number(order.total ?? order.totalAmt ?? order.grandTotal ?? 0) || 0,
  };

  return {
    ...order,
    orderId: order.orderId ?? idKey,
    products: [normalizedProduct],
  };
}

function groupOrders(rawOrders = []) {
  if (!Array.isArray(rawOrders) || rawOrders.length === 0) return [];

  const groups = [];

  rawOrders.forEach((order) => {
    const normalized = normalizeSingleOrder(order);
    if (!normalized) return;

    const idKey = String(normalized.orderId ?? normalized._id ?? "");

    const existingIndex = groups.findIndex(
      (item) => String(item.orderId ?? item._id ?? "") === idKey
    );

    if (existingIndex === -1 || normalized.products?.length !== 1) {
      groups.push({
        ...normalized,
        products: Array.isArray(normalized.products)
          ? [...normalized.products]
          : [],
      });
      return;
    }

    const existing = groups[existingIndex];
    const combinedProducts = [
      ...(Array.isArray(existing.products) ? existing.products : []),
      ...(Array.isArray(normalized.products) ? normalized.products : []),
    ];

    groups[existingIndex] = {
      ...existing,
      products: combinedProducts,
    };
  });

  return groups;
}

function formatDateSafe(dateString) {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
    return format(date, "MMM dd, yyyy · h:mm a");
  } catch (error) {
    return "Invalid date";
  }
}

const MyOrdersPublicPage = () => {
  const authState = useSelector((state) => state.user ?? null);
  const isAuthenticated = Boolean(
    authState?._id || authState?.email || authState?.token
  );

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(
    "Loading your orders..."
  );
  const [fetchError, setFetchError] = useState("");
  const [guestWarning, setGuestWarning] = useState("");
  const [guestHistory, setGuestHistory] = useState([]);
  const [guestOrders, setGuestOrders] = useState([]);
  const [guestLoading, setGuestLoading] = useState(!isAuthenticated);

  const {
    data: ordersData = [],
    isFetching: isOrdersFetching,
    error: ordersError,
  } = useOrdersQuery({
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (ordersError && isAuthenticated) {
      setFetchError(
        ordersError?.message ??
          "We couldn’t load your orders right now. Please try again shortly."
      );
    } else {
      setFetchError("");
    }
  }, [isAuthenticated, ordersError]);

  const readGuestHistory = useCallback(() => {
    if (typeof window === "undefined") return [];
    try {
      const historyRaw = window.localStorage.getItem("guestOrderHistory") ?? "[]";
      const parsed = JSON.parse(historyRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("MyOrdersPublicPage: unable to parse guest order history", error);
      return [];
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const refreshGuestHistory = () => {
      setGuestHistory(readGuestHistory());
    };

    refreshGuestHistory();

    const handleStorage = (event) => {
      if (event.key === "guestOrderHistory") {
        refreshGuestHistory();
      }
    };

    const handleCustomEvent = (event) => {
      if (event?.type !== "guestOrderHistoryUpdated") return;
      if (event instanceof CustomEvent && Array.isArray(event.detail)) {
        setGuestHistory(event.detail);
      } else {
        refreshGuestHistory();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("guestOrderHistoryUpdated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("guestOrderHistoryUpdated", handleCustomEvent);
    };
  }, [readGuestHistory]);

  useEffect(() => {
    if (isAuthenticated) {
      setGuestOrders([]);
      setGuestWarning("");
      setGuestLoading(false);
      setLoadingMessage("Loading your orders...");
      return;
    }

    let active = true;

    const hydrateGuestOrders = async () => {
      const history = Array.isArray(guestHistory) ? guestHistory : [];
      if (!history.length) {
        if (active) {
          setGuestOrders([]);
          setGuestWarning("");
          setGuestLoading(false);
          setLoadingMessage("Loading your orders...");
        }
        return;
      }

      setGuestLoading(true);
      setLoadingMessage("Re-validating your recent guest orders…");
      setGuestWarning("");

      const resolvedOrders = [];
      const warnings = [];

      for (const entry of history) {
        if (!entry || !entry.orderId) continue;

        const integrityToken = entry.integrityToken ?? "";
        const cachedOrder = entry.cachedOrder ?? null;
        let resolvedOrder = null;

        if (integrityToken) {
          try {
            const verifyResponse = await callSummaryApi(
              SummaryApi.verifyReceipt,
              {
                payload: {
                  orderId: entry.orderId,
                  integrityToken,
                },
                credentials: "omit",
                cache: "no-store",
              }
            );

            const payload =
              verifyResponse?.data !== undefined
                ? verifyResponse.data
                : verifyResponse;

            if (payload && typeof payload === "object") {
              resolvedOrder = {
                ...payload,
                integrityToken: payload.integrityToken ?? integrityToken,
              };
            }
          } catch (error) {
            console.warn(
              `MyOrdersPublicPage: guest order ${entry.orderId} could not be revalidated`,
              error
            );
            warnings.push(
              `Some guest orders (${entry.orderId}) could not be revalidated online. Showing cached copies instead.`
            );
          }
        }

        if (!resolvedOrder && cachedOrder) {
          resolvedOrder = {
            ...cachedOrder,
            integrityToken: cachedOrder.integrityToken ?? integrityToken ?? "",
          };
        }

        if (resolvedOrder) {
          resolvedOrders.push(resolvedOrder);
        }
      }

      if (!resolvedOrders.length) {
        warnings.push(
          "We couldn’t find any saved guest orders on this device. Place an order or check back later."
        );
      }

      if (active) {
        setGuestOrders(resolvedOrders);
        setGuestWarning(warnings[0] ?? "");
        setGuestLoading(false);
        setLoadingMessage("Loading your orders...");
      }
    };

    hydrateGuestOrders().catch((error) => {
      console.error("MyOrdersPublicPage: guest hydration failed", error);
      if (active) {
        setGuestOrders([]);
        setGuestWarning(
          "We were unable to fetch your guest orders. Please try again later."
        );
        setGuestLoading(false);
        setLoadingMessage("Loading your orders...");
      }
    });

    return () => {
      active = false;
    };
  }, [guestHistory, isAuthenticated]);

  const effectiveOrders = useMemo(() => {
    if (isAuthenticated) {
      return Array.isArray(ordersData) ? ordersData : [];
    }
    return guestOrders;
  }, [isAuthenticated, ordersData, guestOrders]);

  const groupedOrders = useMemo(
    () => groupOrders(effectiveOrders),
    [effectiveOrders]
  );

  const toggleOrderDetails = useCallback((orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  }, []);

  const isLoading = isAuthenticated ? isOrdersFetching : guestLoading;
  const activeLoadingMessage = isAuthenticated
    ? "Loading your orders..."
    : loadingMessage;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white shadow-md p-8 rounded-lg flex flex-col items-center gap-3">
          <div className="loader-lg" />
          <p className="text-gray-600 text-center">{activeLoadingMessage}</p>
        </div>
        <style>{loaderStyles}</style>
      </div>
    );
  }

  if ((!groupedOrders || groupedOrders.length === 0) && !fetchError) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white shadow-md p-5 font-semibold mb-4 rounded-md">
          <h1 className="text-xl">Orders</h1>
        </div>
        {guestWarning ? (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {guestWarning}
          </div>
        ) : null}
        <NoData
          message={
            isAuthenticated ? "No orders found" : "No guest orders saved on this device yet"
          }
        />
        <style>{loaderStyles}</style>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white shadow-md p-5 font-semibold mb-4 rounded-md flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-xl">Orders</h1>
          {fetchError ? (
            <p className="mt-2 text-sm text-rose-600">
              {fetchError} Showing any cached results instead.
            </p>
          ) : null}
          {!fetchError && guestWarning ? (
            <p className="mt-2 text-sm text-amber-600">{guestWarning}</p>
          ) : null}
        </div>
        <span className="text-sm text-gray-500">
          Showing {groupedOrders.length} order
          {groupedOrders.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="space-y-4">
        {groupedOrders.map((order) => {
          const orderKey = order._id ?? order.orderId ?? order.id;
          const isExpanded = expandedOrderId === orderKey;
          const orderDateSource =
            order.createdAt ??
            order.generatedAt ??
            order.updatedAt ??
            new Date().toISOString();
          const formattedDate = formatDateSafe(orderDateSource);
          const productList = Array.isArray(order.products) ? order.products : [];
          const totalProductCount = productList.reduce(
            (sum, product) => sum + (Number(product.quantity ?? 1) || 1),
            0
          );
          const firstProduct =
            productList?.[0]?.product_details ?? {
              name: "Unknown Product",
              image: ["/placeholder-image.jpg"],
            };
          const statusLabel =
            order.payment_status ?? order.paymentStatus ?? order.status ?? "Processing";
          const totalAmount =
            order.totalAmt ?? order.total ?? order.totalAmount ?? order.grandTotal ?? 0;
          const subTotalAmount =
            order.subTotalAmt ?? order.subTotal ?? order.subTotalAmount ?? null;

          return (
            <div key={orderKey} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-500 text-sm">Order ID:</span>
                    <span className="font-medium">
                      {order.orderId ?? order._id ?? "Unavailable"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{formattedDate}</div>
                  {order.integrityToken ? (
                    <div className="mt-2 text-xs text-gray-400">
                      Integrity token: {order.integrityToken}
                    </div>
                  ) : null}
                </div>

                <div className="mt-2 md:mt-0 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      statusLabel
                    )}`}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-sm font-medium">
                    Total: {DisplayPriceInRupees(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {productList.length > 0 ? (
                      <div className="relative">
                        <img
                          src={firstProduct.image?.[0] || "/placeholder-image.jpg"}
                          alt={firstProduct.name ?? "Product"}
                          className="w-20 h-20 object-cover rounded"
                        />
                        {productList.length > 1 && (
                          <span className="absolute -right-2 -bottom-2 bg-gray-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                            +{productList.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-lg">
                      {productList.length > 1
                        ? `${firstProduct.name ?? "Product"} + ${
                            productList.length - 1
                          } more item${productList.length > 2 ? "s" : ""}`
                        : firstProduct.name ?? "Product"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {totalProductCount} item{totalProductCount !== 1 ? "s" : ""} ·{" "}
                      {DisplayPriceInRupees(totalAmount)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => toggleOrderDetails(orderKey)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={() => {
                          if (typeof window !== "undefined" && order.orderId) {
                            window.open(
                              `/success?orderId=${encodeURIComponent(order.orderId)}`,
                              "_blank"
                            );
                          }
                        }}
                      >
                        Track / Receipt
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-top border-gray-100">
                    {productList.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Order Items
                        </h4>
                        <div className="space-y-3">
                          {productList.map((product, idx) => (
                            <div
                              key={product.productId ?? `${orderKey}-${idx}`}
                              className="flex items-center gap-3 bg-gray-50 p-3 rounded-md"
                            >
                              <div className="w-12 h-12 flex-shrink-0">
                                <img
                                  src={
                                    product.product_details?.image?.[0] ||
                                    "/placeholder-image.jpg"
                                  }
                                  alt={product.product_details?.name ?? "Product"}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {product.product_details?.name ?? "Product"}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
                                  <span>Qty: {product.quantity ?? 1}</span>
                                  <span>{DisplayPriceInRupees(product.price ?? 0)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Payment Information
                        </h4>
                        <div className="text-sm space-y-1">
                          <p>
                            Method:{" "}
                            <span className="font-medium">
                              {order.paymentMethod ??
                                order.payment_method ??
                                order.payment_status ??
                                order.paymentStatus ??
                                "Not specified"}
                            </span>
                          </p>
                          {order.paymentId && (
                            <p>
                              Payment ID:{" "}
                              <span className="font-medium">{order.paymentId}</span>
                            </p>
                          )}
                          {subTotalAmount !== null && (
                            <p>
                              Subtotal:{" "}
                              <span className="font-medium">
                                {DisplayPriceInRupees(subTotalAmount)}
                              </span>
                            </p>
                          )}
                          <p>
                            Total:{" "}
                            <span className="font-medium">
                              {DisplayPriceInRupees(totalAmount)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Delivery Information
                        </h4>
                        <div className="text-sm leading-relaxed text-gray-600">
                          {order.delivery_address ? (
                            <>
                              {typeof order.delivery_address === "object" ? (
                                <>
                                  {order.delivery_address.name && (
                                    <p className="font-medium text-gray-900">
                                      {order.delivery_address.name}
                                    </p>
                                  )}
                                  {order.delivery_address.address_line && (
                                    <p>{order.delivery_address.address_line}</p>
                                  )}
                                  <p>
                                    {[
                                      order.delivery_address.city,
                                      order.delivery_address.state,
                                    ]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                  <p>
                                    {[
                                      order.delivery_address.country,
                                      order.delivery_address.pincode,
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                  </p>
                                  {order.delivery_address.mobile && (
                                    <p className="mt-1">
                                      Contact: {order.delivery_address.mobile}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p>{order.delivery_address}</p>
                              )}
                            </>
                          ) : (
                            <p>No address information available</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            window.open("/contact", "_blank");
                          }
                        }}
                      >
                        Contact Support
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{loaderStyles}</style>
    </div>
  );
};

export default MyOrdersPublicPage;