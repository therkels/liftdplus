"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

interface PostContentCarouselProps {
  post: PostData & { images: string[] };
}

const PostContentCarousel: React.FC<PostContentCarouselProps> = ({ post }) => {
  const images = Array.isArray(post.images) ? post.images : [];
  const total = images.length;

  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const startX = useRef(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const canSwipe = total > 1;

  // Touch
  const onTouchStart = (e: React.TouchEvent) => {
    if (!canSwipe) return;
    startX.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!canSwipe) return;
    const diff = e.targetTouches[0].clientX - startX.current;
    const w = wrapRef.current?.offsetWidth || 1;
    const max = w * 0.8;
    setDrag(Math.max(-max, Math.min(max, diff)));
  };
  const onTouchEnd = () => {
    if (!canSwipe) return;
    const threshold = 80;
    if (drag < -threshold && index < total - 1) setIndex((i) => i + 1);
    if (drag > threshold && index > 0) setIndex((i) => i - 1);
    setDrag(0);
  };

  // Mouse (desktop)
  const onMouseDown = (e: React.MouseEvent) => {
    if (!canSwipe) return;
    startX.current = e.clientX;
    document.body.style.userSelect = "none";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!canSwipe || startX.current === 0) return;
    const diff = e.clientX - startX.current;
    const w = wrapRef.current?.offsetWidth || 1;
    const max = w * 0.8;
    setDrag(Math.max(-max, Math.min(max, diff)));
  };
  const onMouseUp = () => {
    if (!canSwipe) return;
    onTouchEnd();
    startX.current = 0;
    document.body.style.userSelect = "";
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("Carousel received images:", images.length, images);
  }

  return (
    <div className="w-full">
      <PostMetadata post={post} />

      <div className="relative">
        <div
          ref={wrapRef}
          className="relative w-full overflow-hidden bg-gray-100 select-none"
          style={{ aspectRatio: "4 / 5" }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {total === 0 ? (
            <div className="flex h-[70vh] items-center justify-center text-gray-400">
              No images to display.
            </div>
          ) : (
            <div
              className={`flex h-full ${drag === 0 ? "transition-transform duration-300 ease-out" : ""}`}
              style={{
                transform: `translateX(${(-index * 100) + (drag / (wrapRef.current?.offsetWidth || 1)) * 100}%)`,
                width: `${total * 100}%`,
              }}
            >
              {images.map((src, i) => (
                <div key={`${src}-${i}`} className="relative flex-shrink-0" style={{ width: `${100 / total}%` }}>
                  <Image
                    src={src}
                    alt={`${post.title} - Image ${i + 1}`}
                    fill
                    className="object-contain bg-white pointer-events-none"
                    draggable={false}
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {total > 1 && (
          <div className="flex justify-center space-x-2 py-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-gray-900" : "bg-gray-300"}`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostContentCarousel;
