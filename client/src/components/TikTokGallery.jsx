"use client";
import { useState, useEffect, useRef } from "react";

const tiktokVideos = [
  "/Download (2).mp4",
  "/Download (1).mp4",
  "/Download.mp4",
  "/Download (3).mp4",
  "/Download (4).mp4",
  "/essentialist-video.mp4",
];

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

function LazyVideo({ url, index, isMobile }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col items-center border border-gray-100 transition-transform hover:scale-[1.025] hover:shadow-2xl aspect-[9/16]"
      style={{
        minHeight: "350px",
        background: "linear-gradient(130deg,#f8fafc 0%, #fff 100%)",
        width: "100%",
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <video
        autoPlay={visible}
        muted
        loop
        playsInline
        controls={isMobile}
        className="w-full h-full object-cover bg-gray-100"
        style={{
          aspectRatio: "9 / 16",
          maxHeight: "100%",
          width: "100%",
          display: "block",
        }}
        aria-label={`Makeup video demo ${index + 1}`}
        poster="/assets/logo.jpg"
      >
        {visible && <source src={url} type="video/mp4" />}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default function TikTokGallery({ videos = tiktokVideos }) {
  const isMobile = useIsMobile();
  return (
    <section className="my-16">
      <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">
        Watch Some Of Our Makeup Samples
      </h2>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto px-2">
        {videos.map((url, i) => (
          <LazyVideo key={url} url={url} index={i} isMobile={isMobile} />
        ))}
      </div>
    </section>
  );
}
