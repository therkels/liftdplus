"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

interface PostContentCarouselProps {
  post: PostData & { images: string[]; author_name?: string; author_photo?: string };
}

const PostContentCarousel: React.FC<PostContentCarouselProps> = ({ post }) => {
  const allImages = Array.isArray(post.images) ? post.images : [];
  const total = allImages.length;

  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const begin = (x: number) => {
    if (total <= 1) return;
    startX.current = x;
    setDragging(true);
  };
  const move = (x: number) => {
    if (!dragging || total <= 1) return;
    const diff = x - startX.current;

    if (idx === 0 && diff > 0) return;
    if (idx === total - 1 && diff < 0) return;

    const w = containerRef.current?.offsetWidth || 1;
    const max = w * 0.8;
    const clamped = Math.max(-max, Math.min(max, diff));
    setDrag(clamped);
  };
  const end = () => {
    if (!dragging || total <= 1) return;
    const threshold = 100;
    if (drag < -threshold && idx < total - 1) setIdx((i) => i + 1);
    else if (drag > threshold && idx > 0) setIdx((i) => i - 1);
    setDrag(0);
    setDragging(false);
  };

  if (total === 0) {
    return (
      <div className="w-full">
        <PostMetadata post={post} />
        <div className="w-full bg-gray-100 rounded-xl aspect-[4/5] flex items-center justify-center text-gray-400">
          No images to display.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <PostMetadata post={post} />

      <div className="relative">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100 rounded-xl"
          style={{ aspectRatio: "4 / 5" }}
          onTouchStart={(e) => begin(e.targetTouches[0].clientX)}
          onTouchMove={(e) => move(e.targetTouches[0].clientX)}
          onTouchEnd={end}
          onMouseDown={(e) => begin(e.clientX)}
          onMouseMove={(e) => move(e.clientX)}
          onMouseUp={end}
          onMouseLeave={end}
        >
          <div
            className={`flex h-full ${dragging ? "" : "transition-transform duration-300 ease-out"}`}
            style={{
              transform: `translateX(${
                -idx * 100 + (drag / (containerRef.current?.offsetWidth || 1)) * 100
              }%)`,
              width: `${total * 100}%`,
            }}
          >
            {allImages.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative flex-shrink-0 bg-white"
                style={{ width: `${100 / total}%`, height: "100%" }}
              >
                <Image
                  src={src}
                  alt={`${post.title} - Slide ${i + 1}`}
                  fill
                  className="object-contain pointer-events-none"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            ))}
          </div>
        </div>

        {total > 1 && (
          <div className="flex justify-center space-x-2 p-4">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i === idx ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostContentCarousel;
