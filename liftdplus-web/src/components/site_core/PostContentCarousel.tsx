"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

interface PostContentCarouselProps {
  post: PostData & {
    images?: string[] | string | null;
  };
}

/** Normalize images into a clean string[] */
function normalizeImages(input: PostContentCarouselProps["post"]["images"]): string[] {
  try {
    if (!input) return [];
    if (Array.isArray(input)) return input.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
    if (typeof input === "string") {
      const maybeJson = input.trim();
      if (maybeJson.startsWith("[") && maybeJson.endsWith("]")) {
        const arr = JSON.parse(maybeJson);
        if (Array.isArray(arr)) {
          return arr.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
        }
      }
      return [maybeJson].filter((s) => s.length > 0);
    }
    return [];
  } catch {
    return [];
  }
}

const PostContentCarousel: React.FC<PostContentCarouselProps> = ({ post }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const extraImages = normalizeImages(post.images);
  const allImages = [
    typeof post.cover_image_url === "string" ? post.cover_image_url : null,
    ...extraImages,
  ].filter((s): s is string => typeof s === "string" && s.trim().length > 0);

  const totalImages = allImages.length;

  if (totalImages === 0) {
    return (
      <div className="w-full">
        <PostMetadata post={post} />
        <div className="mt-4 text-sm text-gray-500">No images available.</div>
      </div>
    );
  }

  const beginDrag = (x: number) => {
    if (totalImages <= 1) return;
    startXRef.current = x;
    setIsDragging(true);
  };

  const moveDrag = (x: number) => {
    if (!isDragging || totalImages <= 1) return;
    const diff = x - startXRef.current;
    if (currentImageIndex === 0 && diff > 0) return;
    if (currentImageIndex === totalImages - 1 && diff < 0) return;
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const maxDrag = containerWidth * 0.8;
    const clamped = Math.max(-maxDrag, Math.min(maxDrag, diff));
    setDragOffset(clamped);
  };

  const endDrag = () => {
    if (!isDragging || totalImages <= 1) return;
    const threshold = 80;
    if (dragOffset < -threshold && currentImageIndex < totalImages - 1) {
      setCurrentImageIndex((i) => i + 1);
    } else if (dragOffset > threshold && currentImageIndex > 0) {
      setCurrentImageIndex((i) => i - 1);
    }
    setDragOffset(0);
    setIsDragging(false);
  };

  useEffect(() => {
    const onUp = () => endDrag();
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [isDragging, dragOffset, currentImageIndex, totalImages]);

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (totalImages <= 1) return;
    beginDrag(e.targetTouches[0].clientX);
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    moveDrag(e.targetTouches[0].clientX);
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => endDrag();
  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => beginDrag(e.clientX);
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;
    moveDrag(e.clientX);
  };
  const onMouseUp: React.MouseEventHandler<HTMLDivElement> = () => endDrag();
  const onMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => endDrag();

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setDragOffset(0);
  };

  return (
    <div className="w-full">
      <PostMetadata post={post} />

      {/* Image Carousel */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing bg-black"
          style={{
            aspectRatio: "4 / 5",
            touchAction: "pan-y",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <div
            className={`flex h-full ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
            style={{
              transform: `translateX(${
                -currentImageIndex * (100 / totalImages) +
                (dragOffset / (containerRef.current?.offsetWidth || 1)) * (100 / totalImages)
              }%)`,
              width: `${totalImages * 100}%`,
            }}
          >
            {allImages.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative flex-shrink-0 bg-black"
                style={{ width: `${100 / totalImages}%`, height: "100%" }}
              >
                <Image
                  src={src}
                  alt={`${post.title ?? "Post"} - Image ${i + 1}`}
                  fill
                  className="object-contain pointer-events-none"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 700px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dot navigation */}
        {totalImages > 1 && (
          <div className="flex justify-center space-x-2 p-4">
            {allImages.map((_, i) => (
              <button
                key={i}
                onClick={() => goToImage(i)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  i === currentImageIndex ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
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
