"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

interface PostContentCarouselProps {
  post: PostData & { images: string[] };
}

const PostContentCarousel: React.FC<PostContentCarouselProps> = ({ post }) => {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const images = Array.isArray(post.images) ? post.images : [];
  const total = images.length;

  // Keep an accurate container width (for px-based translation)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.offsetWidth || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Helpers
  const beginDrag = (x: number) => {
    if (total <= 1) return;
    startX.current = x;
    setIsDragging(true);
  };

  const continueDrag = (x: number) => {
    if (!isDragging || total <= 1) return;
    let diff = x - startX.current;

    // prevent dragging past the ends
    if (current === 0 && diff > 0) diff = Math.min(diff, 0);
    if (current === total - 1 && diff < 0) diff = Math.max(diff, 0);

    // clamp to 80% of the container width to keep it sensible
    const max = containerWidth * 0.8;
    setDragOffset(Math.max(-max, Math.min(max, diff)));
  };

  const endDrag = () => {
    if (!isDragging || total <= 1) return;
    const threshold = Math.max(60, containerWidth * 0.15);

    if (dragOffset <= -threshold && current < total - 1) {
      setCurrent((i) => i + 1);
    } else if (dragOffset >= threshold && current > 0) {
      setCurrent((i) => i - 1);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  // Mouse & touch handlers
  const onTouchStart = (e: React.TouchEvent) => beginDrag(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => continueDrag(e.touches[0].clientX);
  const onTouchEnd = () => endDrag();

  const onMouseDown = (e: React.MouseEvent) => beginDrag(e.clientX);
  const onMouseMove = (e: React.MouseEvent) => continueDrag(e.clientX);
  const onMouseUp = () => endDrag();
  const onMouseLeave = () => endDrag();

  const jumpTo = (idx: number) => {
    setCurrent(idx);
    setDragOffset(0);
  };

  // Translate the track in **px**
  const translatePx = -(current * containerWidth) + dragOffset;

  return (
    <div className="w-full">
      <PostMetadata post={post} />

      <div className="relative">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100"
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
            className={`flex h-full ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
            style={{
              transform: `translateX(${translatePx}px)`,
              width: total > 0 ? `${total * 100}%` : "100%",
            }}
          >
            {images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative bg-white"
                style={{ flex: "0 0 100%", height: "100%" }}
              >
                <Image
                  src={src}
                  alt={`${post.title} – Slide ${i + 1}`}
                  fill
                  className="object-contain pointer-events-none"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="flex justify-center space-x-2 p-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i === current ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
                }`}
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
