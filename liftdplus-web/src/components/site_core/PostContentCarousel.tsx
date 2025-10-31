"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

interface PostContentCarouselProps {
  post: PostData & { images: string[] };
}

const PostContentCarousel: React.FC<PostContentCarouselProps> = ({ post }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use exactly what page.tsx provided: [cover, ...config.images]
  const allImages = Array.isArray(post.images) ? post.images : [];
  const totalImages = allImages.length;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (totalImages <= 1) return;
    touchStartX.current = e.targetTouches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || totalImages <= 1) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX.current;

    if (currentImageIndex === 0 && diff > 0) return;
    if (currentImageIndex === totalImages - 1 && diff < 0) return;

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const maxDrag = containerWidth * 0.8;
    const clampedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff));
    setDragOffset(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || totalImages <= 1) return;
    const threshold = 100;

    if (dragOffset < -threshold && currentImageIndex < totalImages - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    } else if (dragOffset > threshold && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (totalImages <= 1) return;
    touchStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || totalImages <= 1) return;
    const currentX = e.clientX;
    const diff = currentX - touchStartX.current;

    if (currentImageIndex === 0 && diff > 0) return;
    if (currentImageIndex === totalImages - 1 && diff < 0) return;

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const maxDrag = containerWidth * 0.8;
    const clampedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff));
    setDragOffset(clampedDiff);
  };

  const handleMouseUp = () => {
    if (!isDragging || totalImages <= 1) return;
    const threshold = 100;

    if (dragOffset < -threshold && currentImageIndex < totalImages - 1) {
      setCurrentImageIndex((prev) => prev + 1);
    } else if (dragOffset > threshold && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
    setDragOffset(0);
  };

  return (
    <div className="w-full">
      <PostMetadata post={post} />

      <div className="relative">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100"
          style={{ aspectRatio: "4 / 5" }} // IG portrait
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Track */}
          <div
            className={`flex h-full ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
            style={{
              width: `${totalImages * 100}%`,
              transform: `translateX(${
                -currentImageIndex * 100 +
                (dragOffset / (containerRef.current?.offsetWidth || 1)) * 100
              }%)`,
            }}
          >
            {allImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative flex-shrink-0"
                style={{ width: "100%", height: "100%" }} // each slide = full viewport width
              >
                <Image
                  src={image}
                  alt={`${post.title} - Image ${index + 1}`}
                  fill
                  className="object-contain pointer-events-none bg-white"
                  draggable={false}
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {totalImages > 1 && (
          <div className="flex justify-center space-x-2 p-4">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {totalImages === 0 && (
          <div className="w-full py-16 text-center text-gray-500">No images to display.</div>
        )}
      </div>
    </div>
  );
};

export default PostContentCarousel;
