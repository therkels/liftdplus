"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

interface PostContentCarouselProps {
  post: PostData & {
    images?: string[]; // from config.images
    cover_image_url?: string | null;
  };
}

const PostContentCarousel: React.FC<PostContentCarouselProps> = ({ post }) => {
  // ---- state/refs -----------------------------------------------------------
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0); // px
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ---- images (cover first, then config.images) -----------------------------
  // You said you’re fine keeping cover as slide 1 manually — this matches that.
  const allImages = [
    post.cover_image_url ?? undefined,
    ...(Array.isArray(post.images) ? post.images : []),
  ].filter(Boolean) as string[];

  const total = allImages.length;

  // ---- helpers --------------------------------------------------------------
  const endDrag = () => {
    if (!isDragging || total <= 1) return;
    const w = containerRef.current?.offsetWidth || 1;
    const threshold = Math.max(60, w * 0.15); // 15% of width (min 60px)

    if (dragOffset <= -threshold && currentImageIndex < total - 1) {
      setCurrentImageIndex((i) => i + 1);
    } else if (dragOffset >= threshold && currentImageIndex > 0) {
      setCurrentImageIndex((i) => i - 1);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  // ---- touch events ---------------------------------------------------------
  const handleTouchStart = (e: React.TouchEvent) => {
    if (total <= 1) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || total <= 1) return;
    const diff = e.touches[0].clientX - startXRef.current;

    // block dragging beyond first/last
    if ((currentImageIndex === 0 && diff > 0) || (currentImageIndex === total - 1 && diff < 0)) return;

    // clamp to 80% of container
    const w = containerRef.current?.offsetWidth || 1;
    const max = w * 0.8;
    setDragOffset(Math.max(-max, Math.min(max, diff)));
  };

  const handleTouchEnd = () => endDrag();

  // ---- mouse events (desktop drag) -----------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (total <= 1) return;
    startXRef.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || total <= 1) return;
    const diff = e.clientX - startXRef.current;

    if ((currentImageIndex === 0 && diff > 0) || (currentImageIndex === total - 1 && diff < 0)) return;

    const w = containerRef.current?.offsetWidth || 1;
    const max = w * 0.8;
    setDragOffset(Math.max(-max, Math.min(max, diff)));
  };

  const handleMouseUp = () => endDrag();
  const handleMouseLeave = () => endDrag();

  // ---- nav helpers ----------------------------------------------------------
  const goTo = (i: number) => {
    setCurrentImageIndex(i);
    setDragOffset(0);
  };

  // % offset for CSS transform
  const dragPercent =
    (dragOffset / (containerRef.current?.offsetWidth || 1)) * 100;

  return (
    <div className="w-full">
      <PostMetadata post={post} />

      {/* Carousel */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100"
          style={{ aspectRatio: "4 / 5" }} // IG-style portrait frame
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Track */}
          <div
            className={`flex h-full ${
              isDragging ? "" : "transition-transform duration-300 ease-out"
            }`}
            style={{
              width: `${total * 100}%`,
              transform: `translateX(calc(${-currentImageIndex * 100}% + ${dragPercent}%))`,
            }}
          >
            {allImages.map((src, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 bg-white"
                style={{ width: "100%", height: "100%" }}
              >
                <Image
                  src={src}
                  alt={`${post.title ?? "Post"} — Image ${i + 1}`}
                  fill
                  className="object-contain pointer-events-none"
                  draggable={false}
                  // priority only on first slide for perf
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="flex justify-center gap-2 p-4">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === currentImageIndex ? "w-6 bg-gray-900" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostContentCarousel;
