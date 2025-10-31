// /src/components/site_core/PostContentCarousel.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import PostMetadata from "./PostMetadata";
import { PostData } from "./PostContent";

interface Props {
  post: PostData & { images?: string[] };
}

export default function PostContentCarousel({ post }: Props) {
  const images = Array.isArray(post.images) ? post.images : [];
  const total = images.length;

  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);

  const begin = (x: number) => {
    if (total <= 1) return;
    startX.current = x;
    setDragging(true);
  };
  const move = (x: number) => {
    if (!dragging || total <= 1) return;
    const delta = x - startX.current;

    // clamp so you can't pull past first/last
    if ((idx === 0 && delta > 0) || (idx === total - 1 && delta < 0)) {
      const w = boxRef.current?.offsetWidth || 1;
      setDrag(Math.max(-w * 0.2, Math.min(w * 0.2, delta * 0.3)));
      return;
    }
    setDrag(delta);
  };
  const end = () => {
    if (!dragging || total <= 1) return;
    const w = boxRef.current?.offsetWidth || 1;
    const threshold = Math.min(100, w * 0.15); // 100px or 15% width
    if (drag < -threshold && idx < total - 1) setIdx((v) => v + 1);
    else if (drag > threshold && idx > 0) setIdx((v) => v - 1);
    setDrag(0);
    setDragging(false);
  };

  return (
    <div className="w-full">
      <PostMetadata post={post} />

      <div className="relative">
        <div
          ref={boxRef}
          className="relative w-full overflow-hidden cursor-grab active:cursor-grabbing bg-gray-100"
          style={{ aspectRatio: "4 / 5" }}
          onTouchStart={(e) => begin(e.targetTouches[0].clientX)}
          onTouchMove={(e) => move(e.targetTouches[0].clientX)}
          onTouchEnd={end}
          onMouseDown={(e) => begin(e.clientX)}
          onMouseMove={(e) => move(e.clientX)}
          onMouseUp={end}
          onMouseLeave={end}
        >
          {/* Track: translate by -idx*100% plus the drag delta as a percentage of width */}
          <div
            className={`flex h-full ${dragging ? "" : "transition-transform duration-300 ease-out"}`}
            style={{
              transform: `translateX(calc(${-idx * 100}% + ${
                (drag / (boxRef.current?.offsetWidth || 1)) * 100
              }%))`,
            }}
          >
            {images.map((src, i) => (
              <div key={`${src}-${i}`} className="min-w-full h-full flex-shrink-0 bg-black">
                <Image
                  src={src}
                  alt={`${post.title} – slide ${i + 1}`}
                  fill
                  className="object-contain pointer-events-none bg-white"
                  sizes="(max-width: 768px) 100vw, 800px"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {total > 1 && (
          <div className="flex justify-center gap-2 p-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === idx ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {total === 0 && (
          <div className="p-6 text-center text-gray-500">No images to display.</div>
        )}
      </div>
    </div>
  );
}
