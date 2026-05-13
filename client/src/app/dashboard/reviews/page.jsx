"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { useQuery } from "@tanstack/react-query";
import {
  Edit3,
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import RatingStars from "@/components/reviews/RatingStars";
import RichTextEditor from "@/components/reviews/RichTextEditor";
import {
  useAdminCreateReview,
  useAdminDeleteReview,
  useAdminReviews,
  useAdminUpdateReview,
} from "@/hooks/queries/reviews";
import { callSummaryApi, SummaryApi } from "@/common/SummaryApi";

dayjs.extend(localizedFormat);

const SUBJECT_OPTIONS = [
  { label: "Product", value: "product" },
  { label: "Customer Service", value: "customer_service" },
  { label: "Shipping", value: "shipping" },
  { label: "In-store Experience", value: "environment" },
  { label: "Website", value: "website" },
  { label: "Other", value: "other" },
];

const STATUS_FILTERS = [
  { label: "All statuses", value: "all" },
  { label: "Published", value: "published" },
  { label: "Pending", value: "pending" },
  { label: "Hidden", value: "hidden" },
];

const STATUS_BADGES = {
  published: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  hidden: "bg-slate-200 text-slate-600",
};

const DEFAULT_FORM_STATE = {
  rating: 4,
  title: "",
  authorName: "",
  authorEmail: "",
  subjectType: "product",
  status: "published",
  isVerifiedPurchase: false,
  experienceTags: "",
  locationContext: "",
  comment: "",
  contentHtml: "",
  productId: "",
};

function getDefaultFormState() {
  return { ...DEFAULT_FORM_STATE };
}

function extractProductArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.docs)) return value.docs;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.rows)) return value.rows;
  if (value?.data) return extractProductArray(value.data);
  if (value?.payload) return extractProductArray(value.payload);
  return [];
}

function productToOption(product) {
  if (!product) return null;
  const id =
    product._id ??
    product.id ??
    product.productId ??
    product.slug ??
    product.uuid ??
    product.handle;
  if (!id) return null;

  const label =
    product.name ??
    product.productName ??
    product.title ??
    product.slug ??
    `Product ${String(id).slice(-6)}`;
  const sku = product.sku ?? product.productSku ?? product.skuCode ?? "";

  return {
    value: String(id),
    label,
    sku,
  };
}

export default function AdminReviewsPage() {
  const [filters, setFilters] = useState({
    status: "all",
    subjectType: "",
    search: "",
  });
  const [createForm, setCreateForm] = useState(() => getDefaultFormState());
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState(() => getDefaultFormState());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { data: reviews = [], isFetching, refetch } = useAdminReviews(filters);
  const createReview = useAdminCreateReview();
  const updateReview = useAdminUpdateReview();
  const deleteReview = useAdminDeleteReview();

  const subjectOptions = useMemo(() => SUBJECT_OPTIONS, []);
  const statusFilters = useMemo(() => STATUS_FILTERS, []);

  const {
    data: productList = [],
    isLoading: isProductsLoading,
    isError: isProductsError,
    refetch: refetchProductList,
  } = useQuery({
    queryKey: ["admin-review-products"],
    queryFn: async () => {
      const response = await callSummaryApi(SummaryApi.getProduct, {
        payload: { page: 1, limit: 1000 },
      });

      if (response?.success === false) {
        throw new Error(response?.message || "Failed to fetch products");
      }

      return extractProductArray(response?.data ?? response);
    },
  });

  const productOptionsBase = useMemo(() => {
    const seen = new Set();
    return (productList || [])
      .map(productToOption)
      .filter(Boolean)
      .filter((option) => {
        if (seen.has(option.value)) return false;
        seen.add(option.value);
        return true;
      });
  }, [productList]);

  const productOptionsWithCurrent = useMemo(() => {
    if (!editingReview) return productOptionsBase;
    const currentId =
      editingReview.product?._id ??
      editingReview.product ??
      editingReview.productId ??
      "";
    if (!currentId) return productOptionsBase;

    if (
      productOptionsBase.some(
        (option) => String(option.value) === String(currentId)
      )
    ) {
      return productOptionsBase;
    }

    const currentOption = productToOption({
      _id: currentId,
      name:
        editingReview.product?.name ||
        editingReview.productName ||
        editingReview.productTitle,
      sku: editingReview.product?.sku || editingReview.productSku,
    });

    if (!currentOption) return productOptionsBase;

    return [currentOption, ...productOptionsBase];
  }, [editingReview, productOptionsBase]);

  const productLabelLookup = useMemo(() => {
    const map = new Map();
    [...productOptionsBase, ...productOptionsWithCurrent].forEach((option) => {
      map.set(String(option.value), option.label);
    });
    return map;
  }, [productOptionsBase, productOptionsWithCurrent]);

  const isCreateSubmitting =
    typeof createReview.isPending === "boolean"
      ? createReview.isPending
      : Boolean(createReview.isLoading);
  const isUpdateSubmitting =
    typeof updateReview.isPending === "boolean"
      ? updateReview.isPending
      : Boolean(updateReview.isLoading);
  const isDeleteSubmitting =
    typeof deleteReview.isPending === "boolean"
      ? deleteReview.isPending
      : Boolean(deleteReview.isLoading);

  useEffect(() => {
    if (createForm.subjectType !== "product") return;
    if (createForm.productId) return;
    if (!productOptionsBase.length) return;

    setCreateForm((prev) => {
      if (prev.subjectType !== "product" || prev.productId) return prev;
      return { ...prev, productId: productOptionsBase[0].value };
    });
  }, [createForm.subjectType, createForm.productId, productOptionsBase]);

  useEffect(() => {
    if (createForm.subjectType === "product") return;
    if (!createForm.productId) return;

    setCreateForm((prev) => ({ ...prev, productId: "" }));
  }, [createForm.subjectType]);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingReview(null);
    setEditForm(getDefaultFormState());
  }, []);

  useEffect(() => {
    if (!isEditModalOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeEditModal();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditModalOpen, closeEditModal]);

  useEffect(() => {
    if (!isEditModalOpen) return;
    if (editForm.subjectType !== "product") return;
    if (editForm.productId) return;
    if (!productOptionsWithCurrent.length) return;

    setEditForm((prev) => {
      if (prev.subjectType !== "product" || prev.productId) return prev;
      return { ...prev, productId: productOptionsWithCurrent[0].value };
    });
  }, [
    isEditModalOpen,
    editForm.subjectType,
    editForm.productId,
    productOptionsWithCurrent,
  ]);

  useEffect(() => {
    if (!isEditModalOpen) return;
    if (editForm.subjectType === "product") return;
    if (!editForm.productId) return;

    setEditForm((prev) => ({ ...prev, productId: "" }));
  }, [isEditModalOpen, editForm.subjectType, editForm.productId]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "all",
      subjectType: "",
      search: "",
    });
  };

  const handleEdit = (review) => {
    const resolvedProductId =
      review.product?._id ?? review.product ?? review.productId ?? "";

    setEditingReview(review);
    setEditForm({
      rating: review.rating ?? 4,
      title: review.title ?? "",
      authorName: review.authorName ?? "",
      authorEmail: review.authorEmail ?? "",
      subjectType: review.subjectType ?? "product",
      status: review.status ?? "published",
      isVerifiedPurchase: Boolean(review.isVerifiedPurchase),
      experienceTags: Array.isArray(review.experienceTags)
        ? review.experienceTags.join(", ")
        : "",
      locationContext: review.locationContext ?? "",
      comment: review.comment ?? "",
      contentHtml: review.contentHtml ?? "",
      productId: resolvedProductId ? String(resolvedProductId) : "",
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (review) => {
    const confirmed = window.confirm(
      `Delete review from ${review.authorName}?`
    );
    if (!confirmed) return;

    setDeletingId(review._id);
    try {
      await deleteReview.mutateAsync(review._id);
    } catch {
      // errors handled in hook
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const ratingValue = Number(createForm.rating);
    if (!ratingValue || ratingValue < 0.5 || ratingValue > 5) {
      toast.error("Rating must be between 0.5 and 5.");
      return;
    }

    const tags = createForm.experienceTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      rating: ratingValue,
      title: createForm.title.trim(),
      authorName: createForm.authorName.trim(),
      authorEmail: createForm.authorEmail.trim(),
      subjectType: createForm.subjectType,
      status: createForm.status,
      isVerifiedPurchase: Boolean(createForm.isVerifiedPurchase),
      experienceTags: tags,
      locationContext: createForm.locationContext.trim(),
      comment: createForm.comment.trim(),
      contentHtml: createForm.contentHtml,
    };

    if (createForm.subjectType === "product") {
      if (!createForm.productId) {
        toast.error("Select a product before saving this review.");
        return;
      }
      payload.productId = createForm.productId;
    }

    try {
      await createReview.mutateAsync(payload);
      setCreateForm((prev) => {
        const next = getDefaultFormState();
        next.subjectType = prev.subjectType;
        next.status = prev.status;
        next.isVerifiedPurchase = prev.isVerifiedPurchase;
        return next;
      });
    } catch {
      // errors handled in hook
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingReview?._id) return;

    const ratingValue = Number(editForm.rating);
    if (!ratingValue || ratingValue < 0.5 || ratingValue > 5) {
      toast.error("Rating must be between 0.5 and 5.");
      return;
    }

    if (editForm.subjectType === "product" && !editForm.productId) {
      toast.error("Select a product before saving changes.");
      return;
    }

    const tags = editForm.experienceTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      rating: ratingValue,
      title: editForm.title.trim(),
      authorName: editForm.authorName.trim(),
      authorEmail: editForm.authorEmail.trim(),
      subjectType: editForm.subjectType,
      status: editForm.status,
      isVerifiedPurchase: Boolean(editForm.isVerifiedPurchase),
      experienceTags: tags,
      locationContext: editForm.locationContext.trim(),
      comment: editForm.comment.trim(),
      contentHtml: editForm.contentHtml,
      product: editForm.subjectType === "product" ? editForm.productId : null,
    };

    try {
      await updateReview.mutateAsync({
        reviewId: editingReview._id,
        payload,
      });
      closeEditModal();
    } catch {
      // errors handled in hook
    }
  };

  const resolveProductDetails = (review) => {
    if (!review || review.subjectType !== "product") {
      return { name: "", sku: "" };
    }
    const rawId =
      review.product?._id ?? review.product ?? review.productId ?? "";
    const id = rawId ? String(rawId) : "";
    const name =
      review.product?.name ||
      review.productName ||
      productLabelLookup.get(id) ||
      (id ? `#${id.slice(-6)}` : "");
    const sku = review.product?.sku || review.productSku || "";
    return { name, sku };
  };

  const isCreateDisabled =
    isCreateSubmitting ||
    (createForm.subjectType === "product" && !createForm.productId);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary-100">
            Review moderation
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Reviews dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Manage public feedback, highlight verified experiences, and keep the
            conversation constructive.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-full border border-secondary-200 px-4 py-2 text-sm font-semibold text-secondary-200 transition hover:bg-secondary-200 hover:text-white"
        >
          <RefreshCcw size={16} />
          Refresh list
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-6 p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="w-full lg:max-w-sm">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm">
                    <input
                      type="search"
                      value={filters.search}
                      onChange={(event) =>
                        handleFilterChange("search", event.target.value)
                      }
                      placeholder="Search author, title, comment..."
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      handleFilterChange("status", event.target.value)
                    }
                    className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30 sm:w-40"
                  >
                    {statusFilters.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <select
                      value={filters.subjectType}
                      onChange={(event) =>
                        handleFilterChange("subjectType", event.target.value)
                      }
                      className="w-full rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30 sm:w-48"
                    >
                      <option value="">All subjects</option>
                      {subjectOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-secondary-200 hover:text-secondary-200"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1100px] table-auto text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2">Author</th>
                      <th className="px-3 py-2">Title &amp; summary</th>
                      <th className="px-3 py-2">Rating</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Comments</th>
                      <th className="px-3 py-2">Created</th>
                      <th className="px-3 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isFetching && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                          <div className="inline-flex items-center gap-2">
                            <Loader2 size={18} className="animate-spin" />
                            Loading review data…
                          </div>
                        </td>
                      </tr>
                    )}

                    {!isFetching && reviews.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-4 py-6 text-center text-sm text-slate-500"
                        >
                          No reviews found for these filters.
                        </td>
                      </tr>
                    )}

                    {reviews.map((review) => {
                      const productDetails = resolveProductDetails(review);
                      return (
                        <tr
                          key={review._id}
                          className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50/60"
                        >
                          <td className="px-3 py-3 align-top">
                            <div className="font-semibold text-slate-800">
                              {review.authorName}
                            </div>
                            <div className="text-xs text-slate-500">
                              {review.authorEmail}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="font-semibold text-slate-800">
                              {review.title || "Untitled"}
                            </div>
                            <div className="mt-1 max-w-[280px] truncate text-xs text-slate-500">
                              {review.comment}
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <div className="flex items-center gap-2">
                              <RatingStars value={review.rating ?? 0} />
                              <span className="text-xs font-semibold text-slate-500">
                                {(review.rating ?? 0).toFixed(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 align-top">
                            <span className="rounded-full bg-primary-100/30 px-3 py-1 text-xs font-semibold text-primary-200">
                              {SUBJECT_OPTIONS.find(
                                (option) =>
                                  option.value === review.subjectType
                              )?.label || review.subjectType}
                            </span>
                          </td>
                          <td className="px-3 py-3 align-top">
                            {review.subjectType === "product" ? (
                              <div className="space-y-1">
                                <div className="font-semibold text-slate-700">
                                  {productDetails.name || "Unknown product"}
                                </div>
                                {productDetails.sku ? (
                                  <div className="text-xs text-slate-500">
                                    SKU: {productDetails.sku}
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 align-top">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                STATUS_BADGES[review.status] ||
                                "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {review.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 align-top text-center text-xs text-slate-500">
                            {review.commentsCount ?? 0}
                          </td>
                          <td className="px-3 py-3 align-top text-xs text-slate-500">
                            {review.createdAt
                              ? dayjs(review.createdAt).format("DD MMM YYYY")
                              : "—"}
                          </td>
                          <td className="px-3 py-3 align-top text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(review)}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-secondary-200 hover:text-secondary-200"
                              >
                                <Edit3 size={14} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(review)}
                                className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={
                                  isDeleteSubmitting && deletingId === review._id
                                }
                              >
                                {isDeleteSubmitting &&
                                deletingId === review._id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="rounded-3xl border border-secondary-100/20 bg-white p-5 shadow-lg shadow-secondary-100/10">
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary-100">
                  Create review
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  Compose a review
                </h2>
              </div>
              <span className="rounded-full bg-secondary-200/10 p-2 text-secondary-200">
                <Plus size={18} />
              </span>
            </header>

            <form onSubmit={handleCreateSubmit} className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Rating
                </label>
                <div className="mt-2">
                  <RatingStars
                    editable
                    value={createForm.rating}
                    onChange={(value) =>
                      setCreateForm((prev) => ({ ...prev, rating: value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Author name
                  </label>
                  <input
                    value={createForm.authorName}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        authorName: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Author email
                  </label>
                  <input
                    type="email"
                    value={createForm.authorEmail}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        authorEmail: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Subject type
                  </label>
                  <select
                    value={createForm.subjectType}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        subjectType: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  >
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              {createForm.subjectType === "product" && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Product
                  </label>
                  <select
                    value={createForm.productId}
                    onChange={(event) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        productId: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                    disabled={isProductsLoading}
                  >
                    <option value="">
                      {isProductsLoading
                        ? "Loading products…"
                        : productOptionsBase.length === 0
                        ? "No products available"
                        : "Select product"}
                    </option>
                    {productOptionsBase.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.sku ? ` — ${option.sku}` : ""}
                      </option>
                    ))}
                  </select>
                  {isProductsError ? (
                    <p className="mt-1 text-xs text-rose-600">
                      Unable to load products.{" "}
                      <button
                        type="button"
                        className="font-semibold underline"
                        onClick={() => refetchProductList()}
                      >
                        Retry
                      </button>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">
                      Choose the product this review references.
                    </p>
                  )}
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={createForm.isVerifiedPurchase}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      isVerifiedPurchase: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border border-slate-300 text-secondary-200 focus:ring-secondary-200"
                />
                Verified purchase
              </label>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Headline
                </label>
                <input
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  maxLength={140}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Quick comment
                </label>
                <textarea
                  value={createForm.comment}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      comment: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Experience tags
                </label>
                <input
                  value={createForm.experienceTags}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      experienceTags: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  placeholder="Sustainable, premium quality…"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Location context
                </label>
                <input
                  value={createForm.locationContext}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      locationContext: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  placeholder="Online order, Lagos store…"
                  maxLength={140}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Full review body
                </label>
                <RichTextEditor
                  value={createForm.contentHtml}
                  onChange={(value) =>
                    setCreateForm((prev) => ({ ...prev, contentHtml: value }))
                  }
                  minHeight={280}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isCreateDisabled}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary-200 px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreateSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Create review
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeEditModal}
            aria-hidden="true"
          />
          <div
            className="relative z-10 w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-review-modal-title"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-secondary-100">
                  Edit review
                </p>
                <h2
                  id="edit-review-modal-title"
                  className="text-xl font-semibold text-slate-900"
                >
                  Editing {editingReview?.authorName || "review"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close edit review modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-6 grid gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Rating
                </label>
                <div className="mt-2">
                  <RatingStars
                    editable
                    value={editForm.rating}
                    onChange={(value) =>
                      setEditForm((prev) => ({ ...prev, rating: value }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Author name
                  </label>
                  <input
                    value={editForm.authorName}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        authorName: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Author email
                  </label>
                  <input
                    type="email"
                    value={editForm.authorEmail}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        authorEmail: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Subject type
                  </label>
                  <select
                    value={editForm.subjectType}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        subjectType: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  >
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
              </div>

              {editForm.subjectType === "product" && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Product
                  </label>
                  <select
                    value={editForm.productId}
                    onChange={(event) =>
                      setEditForm((prev) => ({
                        ...prev,
                        productId: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                    disabled={isProductsLoading}
                  >
                    <option value="">
                      {isProductsLoading
                        ? "Loading products…"
                        : productOptionsWithCurrent.length === 0
                        ? "No products available"
                        : "Select product"}
                    </option>
                    {productOptionsWithCurrent.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.sku ? ` — ${option.sku}` : ""}
                      </option>
                    ))}
                  </select>
                  {isProductsError ? (
                    <p className="mt-1 text-xs text-rose-600">
                      Unable to load products.{" "}
                      <button
                        type="button"
                        className="font-semibold underline"
                        onClick={() => refetchProductList()}
                      >
                        Retry
                      </button>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">
                      Update the product associated with this review.
                    </p>
                  )}
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={editForm.isVerifiedPurchase}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      isVerifiedPurchase: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border border-slate-300 text-secondary-200 focus:ring-secondary-200"
                />
                Verified purchase
              </label>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Headline
                </label>
                <input
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  maxLength={140}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Quick comment
                </label>
                <textarea
                  value={editForm.comment}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      comment: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  rows={2}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Experience tags
                </label>
                <input
                  value={editForm.experienceTags}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      experienceTags: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  placeholder="Sustainable, premium quality…"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Location context
                </label>
                <input
                  value={editForm.locationContext}
                  onChange={(event) =>
                    setEditForm((prev) => ({
                      ...prev,
                      locationContext: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/30"
                  placeholder="Online order, Lagos store…"
                  maxLength={140}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Full review body
                </label>
                <RichTextEditor
                  value={editForm.contentHtml}
                  onChange={(value) =>
                    setEditForm((prev) => ({ ...prev, contentHtml: value }))
                  }
                  minHeight={280}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isUpdateSubmitting}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary-200 px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdateSubmitting && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-secondary-200 hover:text-secondary-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}