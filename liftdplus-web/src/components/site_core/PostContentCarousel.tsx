"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

type Props = {
  post: PostData & { images?: string[] };
};

// ✅ Rule: 
// - cover_image_url = always slide 1 (title slide)
// - images[] (from JSON) starts at slide 2
// - prevent showing the cover twice if it’s already the first image in images[]
function getSlides(post: Props["post"]): string[] {
  const imgs = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
  const cover = post.cover_image_url;
  if (!cover) return imgs;
  if (imgs.length === 0) return [cover];
  if (imgs[0] === cover) return imgs;
  return [cover, ...imgs];
}

export default function PostContentCarousel({ post }: Props) {
  const slides = getSlides(post);
  const total = slides.length;

  const [index, setIndex] = useState(0);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const begin = (x: number) => {
    if (total <= 1) return;
    startX.current = x;
    setDragging(true);
  };

  const move = (x: number) => {
    if (!dragging || total <= 1) return;
    const vw = viewportRef.current?.offsetWidth || 1;
    const delta = x - startX.current;
    const max = vw * 0.8;
    const clamped = Math.max(-max, Math.min(max, delta));
    if (index === 0 && clamped > 0) return;
    if (index === total - 1 && clamped < 0) return;
    setDragPx(clamped);
  };

  const end = () => {
    if (!dragging || total <= 1) return;
    const threshold = 80;
    if (dragPx < -threshold && index < total - 1) setIndex((i) => i + 1);
    else if (dragPx > threshold && index > 0) setIndex((i) => i - 1);
    setDragPx(0);
    setDragging(false);
  };

  const vw = viewportRef.current?.offsetWidth || 1;
  const dragPct = (dragPx / vw) * 100;

  return (
    <div className="w-full">
      <PostMetadata post={post} />

      {/* VIEWPORT */}
      <div
        ref={viewportRef}
        className="relative w-full overflow-hidden bg-black cursor-grab active:cursor-grabbing"
        style={{ aspectRatio: "4 / 5", touchAction: "pan-y" as any }}
        onMouseDown={(e) => begin(e.clientX)}
        onMouseMove={(e) => move(e.clientX)}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={(e) => begin(e.touches[0].clientX)}
        onTouchMove={(e) => move(e.touches[0].clientX)}
        onTouchEnd={end}
      >
        {/* TRACK */}
        <div
          className={`flex h-full ${dragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{
            width: `${total * 100}%`,
            transform: `translateX(calc(${-index * 100}% + ${dragPct}%))`,
          }}
        >
          {slides.map((src, i) => (
            <div key={i} className="relative h-full min-w-full shrink-0 bg-black">
              <Image
                src={src}
                alt={`${post.title ?? "Slide"} ${i + 1}`}
                fill
                className="object-contain pointer-events-none"
                draggable={false}
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* DOTS */}
      {total > 1 && (
        <div className="flex justify-center gap-2 p-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i);
                setDragPx(0);
              }}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                i === index ? "bg-white" : "bg-zinc-500 hover:bg-zinc-400"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
