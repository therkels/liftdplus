"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineCog } from "react-icons/hi";

import { createClient } from "@/utils/supabase/client";

import Card from "@/components/site_core/Card";
import InterestTags from "@/components/site_core/InterestTags";
import InterestTagsSkeleton from "@/components/site_core/InterestTagsSkeleton";
import PostModal from "@/components/site_core/PostModal";
import CardScroller from "@/components/site_core/CardScroller";
import CardScrollerSkeleton from "@/components/site_core/CardScrollerSkeleton";

import { Post } from "@/utils/postTransformers";
import { usePostModal } from "@/utils/postHelpers";
import { pageCache } from "@/utils/cache/PageCache";

// ---------------------------------------------
// Types
// ---------------------------------------------
interface Topic {
  topic_id: string;
  topic_display: string;
  posts: Post[];
}

interface Interest {
  id: string;
  label: string;
}

// ---------------------------------------------
// Helpers (avatar + images)
// ---------------------------------------------
const isHttpUrl = (url?: string | null) => !!url && /^https?:\/\//i.test(url);

function initialsFromName(name?: string | null) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

// Lightweight avatar with fallback to initials if image is missing/broken
function AuthorAvatar({ name, photoUrl, size = 28 }: { name?: string | null; photoUrl?: string | null; size?: number }) {
  const [broken, setBroken] = useState(false);
  const showImage = isHttpUrl(photoUrl) && !broken;

  if (showImage) {
    return (
      <Image
        src={photoUrl as string}
        alt={name ?? "Author"}
        width={size}
        height={size}
        className="rounded-full object-cover"
        onError={() => setBroken(true)}
        priority={false}
        unoptimized
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
      style={{ width: size, height: size }}
      aria-label={name ?? "Author"}
      title={name ?? undefined}
    >
      <span className="text-xs font-semibold">{initialsFromName(name)}</span>
    </div>
  );
}

// Ensure images array exists for carousels; some posts may have cover_image_url only
function normalizePostImages(p: Post): Post {
  const images = Array.isArray((p as any).images) ? (p as any).images : [];
  const cover = (p as any).cover_image_url ? [(p as any).cover_image_url] : [];
  const merged = images.length > 0 ? images : cover;
  return { ...(p as any), images: merged } as Post;
}

// ---------------------------------------------
// Data loading
// ---------------------------------------------
async function fetchHomeData() {
  // Try existing cache provider first if available
  const cached = await pageCache.get?.("home-page-v1");
  if (cached) return cached;

  const supabase = createClient();

  // Fallback strategy: try a compact home API, then assemble manually
  try {
    const res = await fetch("/api/v0/home", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      return json;
    }
  } catch (e) {
    // swallow and fall through to manual fetch
  }

  // Manual assembly: load interests (tags) and topical carousels
  // Adjust table / column names to your schema as needed; this is defensive
  const [topicsRes, postsRes, tagsRes] = await Promise.all([
    supabase.from("topic").select("topic_id, topic_display").order("topic_display", { ascending: true }),
    supabase
      .from("post")
      .select(
        `post_id, slug, title, secondary_title, cover_image_url, author_name, author_photo,
         like_count, topic_tags, format_tags, audience_tags, user_liked, user_archived,
         content_type, content, images, read_time_minutes, created_at`
      )
      .order("created_at", { ascending: false })
      .limit(100),
    supabase.from("tag").select("id, label").limit(50),
  ]);

  const allPosts: Post[] = (postsRes.data ?? []).map(normalizePostImages);
  const interests: Interest[] = (tagsRes.data ?? []).map((t: any) => ({ id: String(t.id), label: t.label }));

  // Group a few recent posts under each topic by matching topic_tags
  const topics: Topic[] = (topicsRes.data ?? []).map((t: any) => {
    const posts = allPosts.filter((p: any) => Array.isArray(p.topic_tags) && p.topic_tags.includes(t.topic_display)).slice(0, 12);
    return { topic_id: String(t.topic_id), topic_display: t.topic_display, posts } as Topic;
  });

  const payload = { interests, topics };
  await pageCache.set?.("home-page-v1", payload, 60 * 5); // 5 minutes
  return payload;
}

// ---------------------------------------------
// Component
// ---------------------------------------------
export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const { openWithPost, isOpen, close } = usePostModal();

  const handleOpenPost = useCallback(
    (post: Post) => {
      // Maintain unique URLs by navigating to /post/[slug] when opening the modal.
      const slug: string | undefined = (post as any)?.slug ?? undefined;
      if (slug) {
        // Shallow navigation keeps the app snappy while preserving the unique URL
        router.push(`/post/${slug}`);
      }
      // Also open the modal locally for SSR/CSR parity
      openWithPost(post);
    },
    [openWithPost, router]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchHomeData();
        if (!mounted) return;
        const normTopics: Topic[] = (data?.topics ?? []).map((t: Topic) => ({
          ...t,
          posts: (t.posts ?? []).map(normalizePostImages),
        }));
        setInterests(data?.interests ?? []);
        setTopics(normTopics);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to load home data", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          LIFTD+
        </Link>
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <HiOutlineCog className="h-5 w-5" />
          Settings
        </Link>
      </div>

      {/* Interests / Tags */}
      <section className="mb-6">
        {loading ? (
          <InterestTagsSkeleton />
        ) : interests && interests.length > 0 ? (
          <InterestTags tags={interests} />
        ) : (
          <div className="text-sm text-gray-500">No interests yet.</div>
        )}
      </section>

      {/* Topic Carousels */}
      <section className="space-y-10">
        {loading ? (
          <>
            <CardScrollerSkeleton />
            <CardScrollerSkeleton />
          </>
        ) : topics && topics.length > 0 ? (
          topics.map((topic) => {
            const posts = (topic.posts ?? []).map(normalizePostImages);
            if (!posts || posts.length === 0) return null;
            return (
              <div key={topic.topic_id}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold tracking-tight">{topic.topic_display}</h2>
                  <Link href={`/topic/${encodeURIComponent(topic.topic_display)}`} className="text-sm text-gray-600 hover:text-gray-900">
                    View all
                  </Link>
                </div>
                <CardScroller
                  posts={posts}
                  onCardClick={(p: Post) => handleOpenPost(p)}
                  renderAuthor={(p: Post) => (
                    <div className="flex items-center gap-2">
                      <AuthorAvatar name={(p as any).author_name} photoUrl={(p as any).author_photo} />
                      <span className="text-xs text-gray-700">{(p as any).author_name ?? "Unknown"}</span>
                    </div>
                  )}
                />
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-500">No topics yet.</div>
        )}
      </section>

      {/* Modal lives at the page level so it can open from any card */}
      <PostModal isOpen={isOpen} onClose={close} />
    </div>
  );
}
