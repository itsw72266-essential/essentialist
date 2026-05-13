// //client\src\app\product\[slug]\ProductGallery.client.jsx
// "use client";

// import { useMemo, useRef, useState, useEffect, useCallback } from "react";
// import Image from "next/image";
// import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
// import ImageZoomWrapper from "./ImageZoomWrapper.client";

// const BLUR_DATA_URL =
//   "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23f1f5f9'/%3E%3C/svg%3E";

// export default function ProductGallery({ images = [], productName = "" }) {
//   const safeImages = useMemo(
//     () => (Array.isArray(images) ? images.filter(Boolean) : []).map(String),
//     [images]
//   );

//   const [current, setCurrent] = useState(0);
//   const listRef = useRef(null);

//   useEffect(() => {
//     if (current >= safeImages.length) setCurrent(0);
//   }, [safeImages.length, current]);

//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     if (safeImages.length <= 1) return;

//     const preloadSources = [
//       safeImages[current + 1],
//       safeImages[current - 1],
//     ].filter(Boolean);

//     preloadSources.forEach((src) => {
//       const img = new window.Image();
//       img.src = src;
//       img.decoding = "async";
//     });
//   }, [current, safeImages]);

//   const scrollByAmount = useCallback((direction) => {
//     const el = listRef.current;
//     if (!el) return;

//     const delta = direction === "left" ? -240 : 240;
//     el.scrollBy({ left: delta, behavior: "smooth" });
//   }, []);

//   const handleSelect = useCallback((index) => {
//     setCurrent(index);
//   }, []);

//   const currentSrc = safeImages[current] ?? "/default-image.jpg";
//   const prioritize = current === 0;

//   return (
//     <div className="w-full">
//       <div className="zoomable relative overflow-hidden rounded-lg bg-white shadow-sm">
//         <ImageZoomWrapper
//           src={currentSrc}
//           alt={productName || `Product image ${current + 1}`}
//           width={1000}
//           height={1000}
//           zoom={2.8}
//           hoverScale={1.09}
//           className="h-full w-full object-contain"
//           priority={prioritize}
//           fetchPriority={prioritize ? "high" : "auto"}
//           loading={prioritize ? "eager" : "lazy"}
//           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 720px"
//           quality={85}
//           placeholder="blur"
//           blurDataURL={BLUR_DATA_URL}
//           decoding="async"
//         />
//       </div>

//       <div className="my-3 flex items-center justify-center gap-2 sm:gap-3">
//         {safeImages.map((_, index) => (
//           <span
//             key={`point-${index}`}
//             className={`h-2.5 w-2.5 rounded-full border border-slate-300 transition ${
//               current === index ? "bg-emerald-400" : "bg-slate-200"
//             } sm:h-3 sm:w-3 lg:h-4 lg:w-4`}
//             aria-hidden
//           />
//         ))}
//       </div>

//       <div className="relative">
//         <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 md:hidden">
//           {safeImages.map((img, index) => (
//             <ThumbButton
//               key={`thumb-mobile-${index}`}
//               img={img}
//               index={index}
//               productName={productName}
//               isActive={current === index}
//               onSelect={handleSelect}
//             />
//           ))}
//         </div>

//         <div className="relative hidden md:block">
//           <div
//             ref={listRef}
//             className="scrollbar-none relative z-10 flex gap-3 overflow-x-auto py-1"
//             role="listbox"
//             aria-label="Product gallery thumbnails"
//           >
//             {safeImages.map((img, index) => (
//               <ThumbButton
//                 key={`thumb-${index}`}
//                 img={img}
//                 index={index}
//                 productName={productName}
//                 isActive={current === index}
//                 onSelect={handleSelect}
//                 size={80}
//               />
//             ))}
//           </div>

//           {safeImages.length > 4 && (
//             <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between">
//               <ControlButton
//                 direction="left"
//                 onClick={() => scrollByAmount("left")}
//               />
//               <ControlButton
//                 direction="right"
//                 onClick={() => scrollByAmount("right")}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function ThumbButton({
//   img,
//   index,
//   productName,
//   isActive,
//   onSelect,
//   size = 96,
// }) {
//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(index)}
//       className={`thumb-item h-16 w-16 overflow-hidden rounded border bg-white shadow transition hover:border-emerald-400 focus:outline-none focus-visible:border-emerald-500 xs:h-20 xs:w-20 sm:h-20 sm:w-20 lg:h-22 lg:w-22 ${
//         isActive ? "border-emerald-500" : "border-slate-200"
//       }`}
//       title={`Product image ${index + 1}`}
//       aria-label={`Show image ${index + 1}`}
//       aria-selected={isActive}
//       role="option"
//     >
//       <Image
//         src={img}
//         alt={`Product image ${index + 1} of ${productName}`}
//         width={size}
//         height={size}
//         loading="lazy"
//         decoding="async"
//         className="h-full w-full object-contain"
//         sizes="96px"
//         quality={70}
//         placeholder="blur"
//         blurDataURL={BLUR_DATA_URL}
//       />
//     </button>
//   );
// }

// function ControlButton({ direction, onClick }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className="pointer-events-auto rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-lg transition hover:bg-emerald-100"
//       aria-label={`Scroll ${direction}`}
//     >
//       {direction === "left" ? <FaAngleLeft /> : <FaAngleRight />}
//     </button>
//   );
// }












//client\src\app\product\[slug]\ProductGallery.client.jsx
"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import ImageZoomWrapper from "./ImageZoomWrapper.client";

const BLUR_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Crect width='32' height='32' fill='%23f1f5f9'/%3E%3C/svg%3E";

export default function ProductGallery({ images = [], productName = "" }) {
  const safeImages = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []).map(String),
    [images]
  );

  const [current, setCurrent] = useState(0);
  const listRef = useRef(null);

  useEffect(() => {
    if (current >= safeImages.length) setCurrent(0);
  }, [safeImages.length, current]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (safeImages.length <= 1) return;

    const preloadSources = [
      safeImages[current + 1],
      safeImages[current - 1],
    ].filter(Boolean);

    preloadSources.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.decoding = "async";
    });
  }, [current, safeImages]);

  const scrollByAmount = useCallback((direction) => {
    const el = listRef.current;
    if (!el) return;

    const delta = direction === "left" ? -240 : 240;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  const handleSelect = useCallback((index) => {
    setCurrent(index);
  }, []);

  const currentSrc = safeImages[current] ?? "/default-image.jpg";
  const prioritize = current === 0;

  // SEO Fix: Creating a strong, descriptive alt text for Google Image Search
  const mainImageAlt = productName 
    ? `${productName} - View ${current + 1} | Essentialist Makeup Store`
    : `Product image ${current + 1}`;

  return (
    <div className="w-full">
      <div className="zoomable relative overflow-hidden rounded-lg bg-white shadow-sm border border-slate-100">
        <ImageZoomWrapper
          src={currentSrc}
          alt={mainImageAlt}
          width={1000}
          height={1000}
          zoom={2.8}
          hoverScale={1.09}
          className="h-full w-full object-contain"
          priority={prioritize}
          fetchPriority={prioritize ? "high" : "auto"}
          loading={prioritize ? "eager" : "lazy"}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 720px"
          quality={85}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          decoding="async"
        />
      </div>

      <div className="my-3 flex items-center justify-center gap-2 sm:gap-3">
        {safeImages.map((_, index) => (
          <span
            key={`point-${index}`}
            // UI Fix: Changed from emerald-400 to pink-500 to match brand theme
            className={`h-2.5 w-2.5 rounded-full border transition ${
              current === index ? "bg-pink-500 border-pink-500" : "bg-slate-200 border-slate-300"
            } sm:h-3 sm:w-3 lg:h-4 lg:w-4`}
            aria-hidden
          />
        ))}
      </div>

      <div className="relative">
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 md:hidden">
          {safeImages.map((img, index) => (
            <ThumbButton
              key={`thumb-mobile-${index}`}
              img={img}
              index={index}
              productName={productName}
              isActive={current === index}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="relative hidden md:block">
          <div
            ref={listRef}
            className="scrollbar-none relative z-10 flex gap-3 overflow-x-auto py-1"
            role="listbox"
            aria-label={`${productName} gallery thumbnails`}
          >
            {safeImages.map((img, index) => (
              <ThumbButton
                key={`thumb-${index}`}
                img={img}
                index={index}
                productName={productName}
                isActive={current === index}
                onSelect={handleSelect}
                size={80}
              />
            ))}
          </div>

          {safeImages.length > 4 && (
            <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between">
              <ControlButton
                direction="left"
                onClick={() => scrollByAmount("left")}
              />
              <ControlButton
                direction="right"
                onClick={() => scrollByAmount("right")}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThumbButton({
  img,
  index,
  productName,
  isActive,
  onSelect,
  size = 96,
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      // UI Fix: Changed focus and border colors from emerald to pink
      className={`thumb-item h-16 w-16 overflow-hidden rounded border bg-white shadow-sm transition hover:border-pink-400 focus:outline-none focus-visible:border-pink-500 xs:h-20 xs:w-20 sm:h-20 sm:w-20 lg:h-22 lg:w-22 ${
        isActive ? "border-pink-500 ring-1 ring-pink-500" : "border-slate-200"
      }`}
      title={`View ${productName} image ${index + 1}`}
      aria-label={`Show image ${index + 1}`}
      aria-selected={isActive}
      role="option"
    >
      <Image
        src={img}
        alt={productName ? `${productName} thumbnail ${index + 1}` : `Thumbnail ${index + 1}`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain"
        sizes={`${size}px`}
        quality={70}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />
    </button>
  );
}

function ControlButton({ direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      // UI Fix: Changed hover background from emerald-100 to pink-50
      className="pointer-events-auto rounded-full border border-slate-200 bg-white/90 backdrop-blur-sm p-2 text-slate-700 shadow-md transition hover:bg-pink-50 hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
      aria-label={`Scroll ${direction}`}
    >
      {direction === "left" ? <FaAngleLeft /> : <FaAngleRight />}
    </button>
  );
}