"use client";

import React, { useMemo, useRef, useState } from "react";

interface PostContentCarouselProps {
  post: any; // keep wide to avoid stripping fields
}

export default function PostContentCarousel({ post }: PostContentCarouselProps) {
  // Prefer top-level images; fallback to config.images
  const images: string[] = useMemo(() => {
    const top = Array.isArray(post?.images) ? post.images : [];
    const cfg = Array.isArray(post?.config?.images) ? post.config.images : [];
    const out = (top.length ? top : cfg).filter((u: any) => typeof u === "string" && u.trim().length > 0);
    // Debug line (okay to leave in for now)
    // eslint-disable-next-line no-console
    console.log("Carousel received images:", out, `(${out.length})`);
    return out;
  }, [post]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  if (!images.length) {
    return (
      <div className="w-full aspect-[4/3] md:aspect-[16/9] bg-gray-50 rounded-xl border border-gray-200 grid place-items-center text-gray-500">
        No images to display.
      </div>
    );
  }

  const total = images.length;

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    startX.current = e.touches[0].clientX;
    dragging.current = true;
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current || startX.current == null) return;
    // (We don’t animate during drag for simplicity—just track delta)
    const _ = e.touches[0].clientX - startX.current;
    // noop placeholder to keep logic simple; visuals handled by translate below
  };

  const onTouchEnd = () => {
    if (!dragging.current || startX.current == null) return;
    const diff = (window as any)._lastTouchDiff ?? 0; // not used; keeping touch scaffold light
    dragging.current = false;
    startX.current = null;
  };

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    startX.current = e.clientX;
    dragging.current = true;
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!dragging.current || startX.current == null) return;
    // noop; desktop drag scaffold kept simple
  };

  const onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging.current || startX.current == null) return;
    const diff = e.clientX - startX.current;
    dragging.current = false;
    startX.current = null;

    const threshold = 80;
    if (diff > threshold && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (diff < -threshold && currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  return (
    <div className="w-full">
      {/* Carousel viewport */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-white select-none touch-pan-y"
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
          className="flex transition-transform duration-300 ease-out"
          style={{
            width: `${100 * total}%`,
            transform: `translateX(-${(100 / total) * currentIndex}%)`,
          }}
        >
          {images.map((src: string, idx: number) => (
            <div key={`${src}-${idx}`} className="shrink-0" style={{ width: `${100 / total}%` }}>
              {/* Image fills width; height auto so your tall images show fully */}
              <img
                src={src}
                alt={`Slide ${idx + 1}`}
                className="block w-full h-auto pointer-events-none select-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrentIndex(i)}
            className={`h-2 rounded-full transition-all ${i === currentIndex ? "w-6 bg-gray-900" : "w-2 bg-gray-300"}`}
          />
        ))}
      </div>
    </div>
  );
}
