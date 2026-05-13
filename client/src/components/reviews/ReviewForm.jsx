// "use client";

// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import RatingStars from "./RatingStars";
// import RichTextEditor from "./RichTextEditor";
// import { useUpsertReview } from "@/hooks/queries/reviews";

// const SUBJECT_OPTIONS = [
//   { value: "product", label: "Product" },
//   { value: "customer_service", label: "Customer Service" },
//   { value: "shipping", label: "Shipping" },
//   { value: "environment", label: "In-store Experience" },
//   { value: "website", label: "Website" },
//   { value: "other", label: "Other" },
// ];

// const MAX_TAGS = 5;

// const STORAGE_REVIEW_TOKEN = "guestReviewToken";
// const STORAGE_REVIEW_PROFILE = "guestReviewProfile";

// export default function ReviewForm({ defaultSubject = "product" }) {
//   const [rating, setRating] = useState(4.5);
//   const [subjectType, setSubjectType] = useState(defaultSubject);
//   const [title, setTitle] = useState("");
//   const [comment, setComment] = useState("");
//   const [contentHtml, setContentHtml] = useState("");
//   const [experienceTags, setExperienceTags] = useState("");
//   const [locationContext, setLocationContext] = useState("");
//   const [authorName, setAuthorName] = useState("");
//   const [authorEmail, setAuthorEmail] = useState("");
//   const [guestToken, setGuestToken] = useState("");

//   const {
//     mutateAsync: saveReview,
//     isPending,
//     isLoading,
//   } = useUpsertReview();

//   const isSaving =
//     typeof isPending === "boolean" ? isPending : Boolean(isLoading);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const storedToken = window.localStorage.getItem(STORAGE_REVIEW_TOKEN);
//     if (storedToken) {
//       setGuestToken(storedToken);
//     }

//     const storedProfile = window.localStorage.getItem(STORAGE_REVIEW_PROFILE);
//     if (storedProfile) {
//       try {
//         const parsed = JSON.parse(storedProfile);
//         if (parsed?.name) setAuthorName(parsed.name);
//         if (parsed?.email) setAuthorEmail(parsed.email);
//       } catch {
//         // ignore parse errors
//       }
//     }
//   }, []);

//   useEffect(() => {
//     setSubjectType(defaultSubject);
//   }, [defaultSubject]);

//   const tagHelper = useMemo(() => {
//     const tags = experienceTags
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter(Boolean);
//     return `${tags.length}/${MAX_TAGS} tags`;
//   }, [experienceTags]);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!comment.trim() && !contentHtml.trim()) {
//       toast.error("Please add a quick comment or a detailed story.");
//       return;
//     }

//     const tagList = experienceTags
//       .split(",")
//       .map((tag) => tag.trim())
//       .filter(Boolean)
//       .slice(0, MAX_TAGS);

//     const payload = {
//       rating,
//       subjectType,
//       title: title.trim(),
//       comment: comment.trim(),
//       contentHtml,
//       experienceTags: tagList,
//       locationContext: locationContext.trim(),
//       authorName: authorName.trim(),
//       authorEmail: authorEmail.trim(),
//       guestToken: guestToken || undefined,
//     };

//     try {
//       const response = await saveReview(payload);
//       if (response?.guestToken) {
//         setGuestToken(response.guestToken);
//         if (typeof window !== "undefined") {
//           window.localStorage.setItem(
//             STORAGE_REVIEW_TOKEN,
//             response.guestToken
//           );
//         }
//       }

//       if (
//         !guestToken &&
//         authorName &&
//         authorEmail &&
//         typeof window !== "undefined"
//       ) {
//         window.localStorage.setItem(
//           STORAGE_REVIEW_PROFILE,
//           JSON.stringify({ name: authorName, email: authorEmail })
//         );
//       }

//       setTitle("");
//       setComment("");
//       setContentHtml("");
//       setExperienceTags("");
//       setLocationContext("");
//     } catch {
//       // errors handled inside the mutation hook
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40 backdrop-blur-sm"
//     >
//       <header className="space-y-2">
//         <p className="text-xs uppercase tracking-[0.25em] text-secondary-100">
//           Share your experience
//         </p>
//         <h2 className="text-2xl font-semibold text-slate-800">
//           Publish a trusted review
//         </h2>
//         <p className="text-sm text-slate-500">
//           Your insights help other shoppers. Reviews go live after moderation.
//         </p>
//       </header>

//       <div className="mt-5 grid gap-5">
//         <div className="flex flex-wrap items-center gap-4">
//           <div>
//             <label className="text-sm font-medium text-slate-700">
//               Your rating
//             </label>
//             <div className="mt-2">
//               <RatingStars
//                 editable
//                 value={rating}
//                 onChange={setRating}
//                 size={24}
//               />
//             </div>
//           </div>

//           <div className="flex-1 min-w-[200px]">
//             <label
//               htmlFor="subject-type"
//               className="text-sm font-medium text-slate-700"
//             >
//               Subject
//             </label>
//             <select
//               id="subject-type"
//               value={subjectType}
//               onChange={(event) => setSubjectType(event.target.value)}
//               className="mt-2 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
//             >
//               {SUBJECT_OPTIONS.map((option) => (
//                 <option key={option.value} value={option.value}>
//                   {option.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div>
//           <label
//             htmlFor="review-title"
//             className="text-sm font-medium text-slate-700"
//           >
//             Headline
//           </label>
//           <input
//             id="review-title"
//             value={title}
//             onChange={(event) => setTitle(event.target.value)}
//             placeholder="What stood out for you?"
//             className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
//             maxLength={140}
//           />
//         </div>

//         <div className="grid gap-5 md:grid-cols-2">
//           <div>
//             <label
//               htmlFor="review-tags"
//               className="text-sm font-medium text-slate-700"
//             >
//               Experience tags
//             </label>
//             <input
//               id="review-tags"
//               value={experienceTags}
//               onChange={(event) => setExperienceTags(event.target.value)}
//               placeholder="fast shipping, great packaging..."
//               className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
//             />
//             <p className="mt-1 text-xs text-slate-500">
//               Separate tags with commas. {tagHelper}
//             </p>
//           </div>
//           <div>
//             <label
//               htmlFor="review-location"
//               className="text-sm font-medium text-slate-700"
//             >
//               Location context
//             </label>
//             <input
//               id="review-location"
//               value={locationContext}
//               onChange={(event) => setLocationContext(event.target.value)}
//               placeholder="e.g. Online order, Lagos boutique"
//               className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
//               maxLength={140}
//             />
//           </div>
//         </div>

//         <div>
//           <label
//             htmlFor="review-comment"
//             className="text-sm font-medium text-slate-700"
//           >
//             Quick summary
//           </label>
//           <textarea
//             id="review-comment"
//             value={comment}
//             onChange={(event) => setComment(event.target.value)}
//             placeholder="Summarise your experience in two sentences."
//             className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
//             rows={3}
//             maxLength={500}
//           />
//         </div>

//         <div>
//           <label className="text-sm font-medium text-slate-700">
//             Full story
//           </label>
//           <RichTextEditor
//             value={contentHtml}
//             onChange={setContentHtml}
//             minHeight={320}
//             placeholder="Tell other shoppers exactly what happened, the highlights, and any tips."
//           />
//         </div>

//         {!guestToken && (
//           <div className="grid gap-5 md:grid-cols-2">
//             <div>
//               <label
//                 htmlFor="review-name"
//                 className="text-sm font-medium text-slate-700"
//               >
//                 Your name
//               </label>
//               <input
//                 id="review-name"
//                 value={authorName}
//                 onChange={(event) => setAuthorName(event.target.value)}
//                 placeholder="Jane D."
//                 className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
//                 maxLength={140}
//                 required
//               />
//             </div>
//             <div>
//               <label
//                 htmlFor="review-email"
//                 className="text-sm font-medium text-slate-700"
//               >
//                 Email (not shown publicly)
//               </label>
//               <input
//                 id="review-email"
//                 value={authorEmail}
//                 onChange={(event) => setAuthorEmail(event.target.value)}
//                 placeholder="you@example.com"
//                 type="email"
//                 className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
//                 maxLength={140}
//                 required
//               />
//             </div>
//           </div>
//         )}

//         {guestToken && (
//           <div className="rounded-xl border border-secondary-100/30 bg-secondary-100/5 px-4 py-3 text-xs text-secondary-100">
//             You&apos;re recognised as a returning reviewer. Your name &amp; email
//             are securely stored from your first submission. Keep this browser to edit
//             or delete your review later.
//           </div>
//         )}
//       </div>

//       <button
//         type="submit"
//         disabled={isSaving}
//         className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-secondary-200 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-60"
//       >
//         {isSaving ? "Publishing…" : "Publish review"}
//       </button>
//     </form>
//   );
// }



"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import RatingStars from "./RatingStars";
import RichTextEditor from "./RichTextEditor";
import { useUpsertReview } from "@/hooks/queries/reviews";
import Axios from "@/utils/Axios";
import SummaryApi from "@/common/SummaryApi";

const SUBJECT_OPTIONS = [
  { value: "product", label: "Product" },
  { value: "customer_service", label: "Customer Service" },
  { value: "shipping", label: "Shipping" },
  { value: "environment", label: "In-store Experience" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const MAX_TAGS = 5;

export default function ReviewForm({ defaultSubject = "product" }) {
  const router = useRouter();
  const [rating, setRating] = useState(4.5);
  const [subjectType, setSubjectType] = useState(defaultSubject);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [experienceTags, setExperienceTags] = useState("");
  const [locationContext, setLocationContext] = useState("");
  const [redirectPath, setRedirectPath] = useState("/reviews");

  useEffect(() => {
    setSubjectType(defaultSubject);
  }, [defaultSubject]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextRedirect =
      window.location.pathname + (window.location.search || "");
    setRedirectPath(nextRedirect || "/reviews");
  }, []);

  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError: isUserError,
    refetch: refetchUser,
    error: userError,
  } = useQuery({
    queryKey: ["review-current-user"],
    queryFn: async () => {
      try {
        const { data } = await Axios({
          ...SummaryApi.userDetails,
        });
        return data?.data ?? null;
      } catch (error) {
        if (error?.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 60_000,
  });

  const {
    mutateAsync: saveReview,
    isPending,
    isLoading,
  } = useUpsertReview();

  const isSaving =
    typeof isPending === "boolean" ? isPending : Boolean(isLoading);

  const tagHelper = useMemo(() => {
    const tags = experienceTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    return `${tags.length}/${MAX_TAGS} tags`;
  }, [experienceTags]);

  const handleLoginRedirect = () => {
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      handleLoginRedirect();
      return;
    }

    if (!comment.trim() && !contentHtml.trim()) {
      toast.error("Please add a quick comment or a detailed story.");
      return;
    }

    const tagList = experienceTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, MAX_TAGS);

    const payload = {
      rating,
      subjectType,
      title: title.trim(),
      comment: comment.trim(),
      contentHtml,
      experienceTags: tagList,
      locationContext: locationContext.trim(),
    };

    try {
      await saveReview(payload);
      setTitle("");
      setComment("");
      setContentHtml("");
      setExperienceTags("");
      setLocationContext("");
    } catch {
      // Errors handled inside the mutation hook
    }
  };

  if (isUserLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
        <p className="text-sm text-slate-500">Loading your profile…</p>
      </div>
    );
  }

  if (isUserError) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-rose-50/70 p-6 text-center shadow-md shadow-rose-100/40">
        <p className="text-base font-semibold text-rose-600">
          We couldn&apos;t verify your account.
        </p>
        <p className="mt-2 text-sm text-rose-500">
          {userError?.message || "Please try again in a moment."}
        </p>
        <button
          type="button"
          onClick={() => refetchUser()}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="rounded-3xl border border-secondary-100/40 bg-white p-6 text-center shadow-md shadow-secondary-100/20">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary-100">
          Members only
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Sign in to share your review
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          Reviews and comments are limited to registered customers. Please log
          in to continue.
        </p>
        <button
          type="button"
          onClick={handleLoginRedirect}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-secondary-200 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary-100"
        >
          Go to login
        </button>
      </div>
    );
  }

  const displayName =
    currentUser.name ||
    currentUser.fullName ||
    currentUser.username ||
    "Essentialist shopper";
  const displayEmail = currentUser.email || "no-email@essentialist";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40 backdrop-blur-sm"
    >
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-secondary-100">
          Share your experience
        </p>
        <h2 className="text-2xl font-semibold text-slate-800">
          Publish a trusted review
        </h2>
        <p className="text-sm text-slate-500">
          Your insights help other shoppers. Reviews go live after moderation.
        </p>
      </header>

      <div className="mt-5 rounded-2xl border border-secondary-100/30 bg-secondary-100/5 px-4 py-3 text-sm text-slate-600">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary-100">
          Posting as
        </p>
        <div className="mt-1 font-semibold text-slate-900">{displayName}</div>
        <div className="text-xs text-slate-500">{displayEmail}</div>
        <p className="mt-2 text-xs text-slate-500">
          Need to update your public details? Visit your account profile and
          refresh this page.
        </p>
      </div>

      <div className="mt-5 grid gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Your rating
            </label>
            <div className="mt-2">
              <RatingStars
                editable
                value={rating}
                onChange={setRating}
                size={24}
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="subject-type"
              className="text-sm font-medium text-slate-700"
            >
              Subject
            </label>
            <select
              id="subject-type"
              value={subjectType}
              onChange={(event) => setSubjectType(event.target.value)}
              className="mt-2 w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
            >
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="review-title"
            className="text-sm font-medium text-slate-700"
          >
            Headline
          </label>
          <input
            id="review-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What stood out for you?"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm também shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
            maxLength={140}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="review-tags"
              className="text-sm font-medium text-slate-700"
            >
              Experience tags
            </label>
            <input
              id="review-tags"
              value={experienceTags}
              onChange={(event) => setExperienceTags(event.target.value)}
              placeholder="fast shipping, great packaging..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate tags with commas. {tagHelper}
            </p>
          </div>
          <div>
            <label
              htmlFor="review-location"
              className="text-sm font-medium text-slate-700"
            >
              Location context
            </label>
            <input
              id="review-location"
              value={locationContext}
              onChange={(event) => setLocationContext(event.target.value)}
              placeholder="e.g. Online order, Lagos boutique"
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
              maxLength={140}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="text-sm font-medium text-slate-700"
          >
            Quick summary
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Summarise your experience in two sentences."
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-secondary-200 focus:outline-none focus:ring-2 focus:ring-secondary-100/40"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Full story
          </label>
          <RichTextEditor
            value={contentHtml}
            onChange={setContentHtml}
            minHeight={320}
            placeholder="Tell other shoppers exactly what happened, the highlights, and any tips."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-secondary-200 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Publishing…" : "Publish review"}
      </button>
    </form>
  );
}