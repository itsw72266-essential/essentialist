"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import toast from "react-hot-toast";
import RatingStars from "./RatingStars";
import {
  useCreateReviewComment,
  useDeleteReviewComment,
  useReviewComments,
} from "@/hooks/queries/reviews";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const SUBJECT_LABELS = {
  product: "Product",
  customer_service: "Customer Service",
  shipping: "Shipping",
  environment: "In-store Experience",
  website: "Website",
  other: "Other",
};

const COMMENT_PROFILE_STORAGE = "guestReviewCommentProfile";
const COMMENT_TOKEN_STORAGE = "guestReviewCommentTokens";

export default function ReviewCard({ review }) {
  const [openComments, setOpenComments] = useState(false);
  const [guestTokens, setGuestTokens] = useState({});
  const [guestProfile, setGuestProfile] = useState({ name: "", email: "" });
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user && (user._id || user.email));

  const { data: comments = [], isFetching } = useReviewComments(
    review?._id,
    openComments
  );

  const { mutateAsync: removeComment } = useDeleteReviewComment();

  useEffect(() => {
    if (!openComments || typeof window === "undefined") return;

    try {
      const storedTokens = JSON.parse(
        window.localStorage.getItem(COMMENT_TOKEN_STORAGE) ?? "{}"
      );
      setGuestTokens(storedTokens);
    } catch {
      setGuestTokens({});
    }

    try {
      const storedProfile = JSON.parse(
        window.localStorage.getItem(COMMENT_PROFILE_STORAGE) ?? "{}"
      );
      setGuestProfile({
        name: storedProfile?.name ?? "",
        email: storedProfile?.email ?? "",
      });
    } catch {
      setGuestProfile({ name: "", email: "" });
    }
  }, [openComments]);

  const commentCountDisplay = useMemo(() => {
    if (openComments) {
      return comments.length;
    }
    return review?.commentsCount ?? comments.length ?? 0;
  }, [comments.length, openComments, review?.commentsCount]);

  const handleStoreGuestToken = (commentId, token) => {
    if (!commentId || !token) return;
    setGuestTokens((prev) => {
      const next = { ...prev, [commentId]: token };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          COMMENT_TOKEN_STORAGE,
          JSON.stringify(next)
        );
      }
      return next;
    });
  };

  const handleProfileSave = ({ name, email }) => {
    setGuestProfile({ name, email });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        COMMENT_PROFILE_STORAGE,
        JSON.stringify({ name, email })
      );
    }
  };

  const handleDeleteComment = async (comment) => {
    if (!comment?._id) return;
    const confirmDelete = window.confirm(
      "Delete this comment? This action cannot be undone."
    );
    if (!confirmDelete) return;

    setDeletingCommentId(comment._id);
    try {
      await removeComment({
        commentId: comment._id,
        guestToken: guestTokens[comment._id],
        reviewId: review?._id,
      });

      setGuestTokens((prev) => {
        if (!prev[comment._id]) return prev;
        const next = { ...prev };
        delete next[comment._id];
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            COMMENT_TOKEN_STORAGE,
            JSON.stringify(next)
          );
        }
        return next;
      });
    } catch {
      // handled in mutation hook
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <header className="flex flex-wrap items-start gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-800">
              {review?.title || "Untitled review"}
            </h3>
            {review?.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100/10 px-2.5 py-1 text-xs font-semibold text-secondary-100">
                <ShieldCheck size={14} strokeWidth={1.8} />
                Verified purchase
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <UserRound size={14} />
              {review?.authorName ?? "Anonymous"}
            </span>
            {review?.createdAt && (
              <>
                <span>•</span>
                <span>{dayjs(review.createdAt).fromNow()}</span>
              </>
            )}
            {review?.locationContext && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-secondary-100">
                  <MapPin size={14} />
                  {review.locationContext}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <RatingStars value={review?.rating ?? 0} />
          <span className="text-sm font-semibold text-slate-700">
            {(review?.rating ?? 0).toFixed(1)}
          </span>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary-100/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-200">
          {SUBJECT_LABELS[review?.subjectType] ??
            review?.subjectType ??
            "Review"}
        </span>

        {Array.isArray(review?.experienceTags) &&
          review.experienceTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-200"
            >
              #{tag}
            </span>
          ))}
      </div>

      {review?.comment && (
        <p className="mt-4 text-sm text-slate-700">{review.comment}</p>
      )}

      {review?.contentHtml && (
        <div
          className="quill-html-content mt-4 text-sm text-slate-700"
          dangerouslySetInnerHTML={{ __html: review.contentHtml }}
        />
      )}

      <footer className="mt-6">
        <button
          type="button"
          onClick={() => setOpenComments((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-secondary-200 hover:text-secondary-200"
        >
          <MessageSquare size={16} />
          {openComments ? "Hide comments" : "View comments"}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {commentCountDisplay}
          </span>
          {openComments ? (
            <ChevronUp size={16} className="text-secondary-100" />
          ) : (
            <ChevronDown size={16} className="text-secondary-100" />
          )}
        </button>
      </footer>

      {openComments && (
        <section className="mt-6 space-y-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
          {isFetching ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" />
              Loading comments…
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-500">
              Be the first to comment on this review.
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => {
                const canDelete =
                  comment?.viewerCanDelete ||
                  Boolean(guestTokens?.[comment._id]);
                return (
                  <div
                    key={comment._id}
                    className="rounded-xl border border-white/60 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        {comment.authorName}
                      </span>
                      {comment.createdAt && (
                        <>
                          <span>•</span>
                          <span>
                            {dayjs(comment.createdAt).format("MMM D, YYYY")}
                          </span>
                        </>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment)}
                          className="ml-auto inline-flex items-center gap-1 rounded-full border border-red-200 px-2 py-0.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
                          disabled={deletingCommentId === comment._id}
                        >
                          {deletingCommentId === comment._id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      {comment.body}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <CommentForm
            reviewId={review?._id}
            onGuestToken={handleStoreGuestToken}
            onProfileSave={handleProfileSave}
            initialProfile={guestProfile}
            isGuest={!isLoggedIn}
          />
        </section>
      )}
    </article>
  );
}

function CommentForm({
  reviewId,
  onGuestToken,
  onProfileSave,
  initialProfile,
  isGuest,
}) {
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState(initialProfile?.name ?? "");
  const [authorEmail, setAuthorEmail] = useState(initialProfile?.email ?? "");

  useEffect(() => {
    setAuthorName(initialProfile?.name ?? "");
    setAuthorEmail(initialProfile?.email ?? "");
  }, [initialProfile?.name, initialProfile?.email]);

  const {
    mutateAsync: submitComment,
    isPending,
    isLoading,
  } = useCreateReviewComment();

  const isSaving =
    typeof isPending === "boolean" ? isPending : Boolean(isLoading);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!body.trim()) {
      toast.error("Write a comment before posting.");
      return;
    }

    const payload = {
      body: body.trim(),
    };

    if (isGuest) {
      if (!authorName.trim() || !authorEmail.trim()) {
        toast.error("Name and email are required to post as a guest.");
        return;
      }
      payload.authorName = authorName.trim();
      payload.authorEmail = authorEmail.trim();
    }

    try {
      const response = await submitComment({
        reviewId,
        payload,
      });

      setBody("");

      if (isGuest && authorName && authorEmail) {
        onProfileSave?.({ name: authorName, email: authorEmail });
      }

      if (response?.guestToken && response?.data?._id) {
        onGuestToken?.(response.data._id, response.guestToken);
      }
    } catch {
      // handled in hook
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      <label
        htmlFor={`comment-${reviewId}`}
        className="text-sm font-semibold text-slate-700"
      >
        Add a comment
      </label>
      <textarea
        id={`comment-${reviewId}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        placeholder="Add your thoughts…"
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
        maxLength={2000}
      />

      {isGuest && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label
              htmlFor={`comment-name-${reviewId}`}
              className="text-xs font-medium text-slate-600"
            >
              Name
            </label>
            <input
              id={`comment-name-${reviewId}`}
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
              placeholder="John D."
              maxLength={140}
              required
            />
          </div>
          <div>
            <label
              htmlFor={`comment-email-${reviewId}`}
              className="text-xs font-medium text-slate-600"
            >
              Email
            </label>
            <input
              id={`comment-email-${reviewId}`}
              value={authorEmail}
              onChange={(event) => setAuthorEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
              placeholder="you@example.com"
              type="email"
              maxLength={140}
              required
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>{2000 - body.length} characters remaining</span>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-full bg-secondary-200 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving && <Loader2 size={16} className="animate-spin" />}
          {isSaving ? "Posting…" : "Post comment"}
        </button>
      </div>
    </form>
  );
}