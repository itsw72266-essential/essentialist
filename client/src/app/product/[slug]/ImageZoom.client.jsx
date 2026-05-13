"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function ImageZoom({
  src,
  alt,
  width = 800,
  height = 800,
  className = "",
  zoom = 2.4,
  hoverScale = 1.05,
  priority = false,
  loading,
  fetchPriority = "auto",
  sizes = "100vw",
  quality = 80,
  placeholder = "empty",
  blurDataURL,
  decoding = "async",
}) {
  const containerRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [bgPos, setBgPos] = useState("center");
  const [imgNatural, setImgNatural] = useState({ w: width, h: height });

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImgNatural({
        w: img.naturalWidth || width,
        h: img.naturalHeight || height,
      });
    };
  }, [src, width, height]);

  const handleMove = useCallback(
    (e) => {
      if (!containerRef.current || !isActive) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      const clamp = (v) => Math.max(0, Math.min(100, v));
      setBgPos(`${clamp(x)}% ${clamp(y)}%`);
    },
    [isActive]
  );

  const onEnter = () => setIsActive(true);
  const onLeave = () => setIsActive(false);

  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsActive((s) => !s);
    }
  };

  const bgSize = `${(
    (imgNatural.w / (width || 1)) *
    zoom *
    100
  ).toFixed(2)}% auto`;

  const resolvedLoading = loading ?? (priority ? "eager" : "lazy");

  return (
    <div
      ref={containerRef}
      className={`relative group select-none rounded-lg border border-gray-100 bg-white ${className}`}
      style={{
        transition: "transform 160ms ease",
        overflow: "hidden",
      }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseMove={handleMove}
      onTouchStart={() => setIsActive(true)}
      onTouchMove={handleMove}
      onTouchEnd={() => setIsActive(false)}
      onKeyDown={onKeyDown}
      role="img"
      aria-label={alt}
      tabIndex={0}
    >
      <div
        className="h-full w-full"
        style={{
          transform: isActive ? `scale(${hoverScale})` : "scale(1)",
          transition: "transform 160ms ease",
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="h-full w-full object-contain"
          priority={priority}
          loading={resolvedLoading}
          fetchPriority={fetchPriority}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          decoding={decoding}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
          overflow: "visible",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            opacity: isActive ? 1 : 0,
            transition: "opacity 140ms ease",
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: bgPos,
            backgroundSize: bgSize,
            filter: isActive
              ? "drop-shadow(0 6px 16px rgba(0,0,0,0.18))"
              : "none",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute bottom-2 right-2 hidden rounded-md bg-black/55 px-2 py-1 text-[11px] leading-4 text-white md:block"
        style={{ opacity: isActive ? 0 : 1, transition: "opacity 200ms ease" }}
      >
        Hover or press Enter to zoom
      </div>
    </div>
  );
}