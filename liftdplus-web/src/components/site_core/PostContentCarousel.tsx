"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

type PostData = {
  title?: string | null;
  images?: string[];
};

interface Props {
  post: PostData;
}

export default function PostContentCarousel({ post }: Props) {
  // Normalize and trim again at the edge (defensive)
  const allImages = Array.isArray(post.images)
    ? post.images
        .filter(Boolean)
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
    : [];

  console.log("Carousel received images:", allImages);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const total = allImages.length;

  // Early empty state (this is what you’re seeing now)
  if (!total) {
    return (
      <div className="w-full bg-gray-50 border rounded-2xl aspect-[4/3] flex items-center justify-center text-gray-400">
        No images to display.
      </div>
    );
  }

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (!total) return;
    touchStartX.current = e.touches[0].clientX;
    setDragging(true);
    setDragOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || touchStartX.current == null) return;
    const current = e.touches[0].clientX;
    setDragOffset(current - touchStartX.current);
  };

  const onTouchEnd = () => {
    if (!dragging) return;
    const threshold = 60;
    if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (dragOffset < -threshold && currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
    setDragging(false);
    setDragOffset(0);
  };

  // Mouse (desktop) drag
  const onMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
    setDragging(true);
    setDragOffset(0);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || touchStartX.current == null) return;
    setDragOffset(e.clientX - touchStartX.current);
  };

  const onMouseUp = () => {
    if (!dragging) return;
    const threshold = 80;
    if (dragOffset > threshold && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (dragOffset < -threshold && currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
    setDragging(false);
    setDragOffset(0);
  };

  // Keyboard arrows
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex((i) => i - 1);
      if (e.key === "ArrowRight" && currentIndex < total - 1) setCurrentIndex((i) => i + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, total]);

  const translatePct =
    (-100 * currentIndex) + (dragging && containerRef.current ? (dragOffset / containerRef.current.clientWidth) * 100 : 0);

  return (
    <div className="w-full">
      {/* Carousel viewport */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl bg-gray-100 select-none"
        style={{ aspectRatio: "4 / 3" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Track */}
        <div
          className="flex h-full"
          style={{
            width: `${100 * total}%`,
            transform: `translateX(${translatePct}%)`,
            transition: dragging ? "none" : "transform 300ms ease",
          }}
        >
          {allImages.map((src, idx) => (
            <div key={`${src}-${idx}`} className="flex-shrink-0 w-full h-full" style={{ width: `${100 / total}%` }}>
              {/* Use next/image for better perf; object-contain avoids cropping your designed slides */}
              <Image
                src={src}
                alt={`${post.title ?? "Image"} — ${idx + 1}`}
                fill
                className="object-contain pointer-events-none"
                sizes="(max-width: 768px) 100vw, 800px"
                priority={idx === 0}
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-6 bg-gray-800" : "w-2 bg-gray-300"}`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
