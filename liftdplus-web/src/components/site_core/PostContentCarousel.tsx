"use client";

import React, { useRef, useState } from "react";
import type { PostData } from "./PostContent";

interface PostContentCarouselProps {
  post: PostData & { images: string[] };
}

/**
 * Minimal, predictable 4:5 carousel:
 * - each slide is 100% width of the container
 * - translateX(-index * 100%)
 * - touch + mouse drag
 * - images use object-contain so your designed art isn’t cropped
 */
const PostContentCarousel: React.FC<PostContentCarouselProps> = ({ post }) => {
  const images = Array.isArray(post.images) ? post.images : [];
  const total = images.length;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const deltaX = useRef(0);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const onTouchStart = (e: React.TouchEvent) => {
    if (total <= 1) return;
    setDragging(true);
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || total <= 1) return;
    deltaX.current = e.touches[0].clientX - startX.current;
    // We only use delta at end; visual “rubber band” is optional
  };

  const onTouchEnd = () => {
    if (!dragging || total <= 1) return;
    setDragging(false);
    const threshold = 60; // px
    if (deltaX.current <= -threshold && index < total - 1) setIndex((i) => i + 1);
    else if (deltaX.current >= threshold && index > 0) setIndex((i) => i - 1);
    deltaX.current = 0;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (total <= 1) return;
    setDragging(true);
    startX.current = e.clientX;
    deltaX.current = 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || total <= 1) return;
    deltaX.current = e.clientX - startX.current;
  };
  const onMouseUp = () => onTouchEnd();
  const onMouseLeave = () => {
    if (dragging) onTouchEnd();
  };

  if (total === 0) {
    return (
      <div
        className="w-full bg-gray-50 flex items-center justify-center rounded-md"
        style={{ aspectRatio: "4 / 5" }}
      >
        <p className="text-gray-400">No images to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Aspect-ratio wrapper */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-md bg-white select-none"
        style={{ aspectRatio: "4 / 5" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        {/* Track */}
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            width: `${100 * total}%`,
            transform: `translateX(-${(clamp(index, 0, total - 1) * 100) / total}%)`,
          }}
        >
          {images.map((src, i) => (
            <div key={i} className="h-full shrink-0" style={{ width: `${100 / total}%` }}>
              <img
                src={src}
                alt={`${post.title ?? "Image"} — slide ${i + 1}`}
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-gray-900" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostContentCarousel;
