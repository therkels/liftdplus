"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineCog } from "react-icons/hi";

import { createClient } from "@/utils/supabase/client";

import Card from "@/components/site_core/Card";
import InterestTags from "@/components/site_core/InterestTags";
import InterestTagsSkeleton from "@/components/site_core/InterestTagsSkeleton";
import PostModal from "@/components/site_core/PostModal";
import CardScroller from "@/components/site_core/CardScroller";
import CardScrollerSkeleton from "@/components/site_core/CardScrollerSkeleton";
import PostContent from "@/components/site_core/PostContent";

import { Post } from "@/utils/postTransformers";
import { usePostModal } from "@/utils/postHelpers";
import { pageCache } from "@/utils/cache/PageCache";

export const dynamic = "force-dynamic";

/* ----------------------------- Types ----------------------------- */
interface Topic {
  topic_id: string;
  topic_display: string;
  posts: Post[];
}

interface Interest {
  id: string;
  displayName: string;
  isActive: boolean;
}

/* ------------------------- Install Prompt ------------------------ */
/** Small helper to show the “Install to Home Screen” banner on mobile. */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;

    // crude mobile check
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        userAgent
      )
    );

    // iOS check
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));

    // standalone check
    setIsStandalone(
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
        // Safari iOS
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://")
    );

    // remember dismissal during this session
    const wasDismissed =
      sessionStorage.getItem("installBannerDismissed") === "true";
    setIsDismissed(wasDismissed);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => {});
      setDeferredPrompt(null);
    }
  };

  // Only show on mobile, not installed, not dismissed
  if ((isMobile && (isStandalone || (!isIOS && !deferredPrompt))) || isDismissed) {
    return null;
  }

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V7l-6-4-6 4v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Install Liftd+</h3>
            <p className="text-sm text-gray-600">
              {isIOS
                ? "Tap the share button and 'Add to Home Screen'"
                : "Get quick access from your home screen"}
            </p>
          </div>
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Install
            </button>
          )}
          <button
            onClick={() => {
              setIsDismissed(true);
              sessionStorage.setItem("installBannerDismissed", "true");
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------ PROD-first fetch helper (key fix) ------------------ */
async function fetchJSONFromProdFirst(paths: string[]) {
  // paths[0] is the primary endpoint (e.g., "/api/v0/preferences")
  const urls = [
    `https://app.liftdplus.com${paths[0]}`, // PROD first
    paths[0], // same-origin (preview or prod)
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      /* try next */
    }
  }
  // Optional secondary path support
  if (paths[1]) {
    const fallbacks = [
      `https://app.liftdplus.com${paths[1]}`,
      paths[1],
    ];
    for (const url of fallbacks) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        return await res.json();
      } catch {}
    }
  }
  return null;
}

/* ------------------------------ Page ------------------------------ */
export default function Home() {
  const router = useRouter();

  // feed + interests
  const [feedData, setFeedData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const [interestsLoading, setInterestsLoading] = useState(true);
  const [interestsData, setInterestsData] = useState<Interest[]>([]);

  // auth + ui
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { name?: string; avatar_url?: string };
  } | null>(null);

  const { selectedPost, isModalOpen, openPostModal, closePostModal } =
    usePostModal();

  /* -------------------------- Sign in with Google -------------------------- */
  const handleGoogleSignIn = useCallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://app.liftdplus.com/api/v0/auth/callback",
      },
    });
    if (data?.url) {
      window.location.href = data.url;
    } else if (error) {
      alert("Google sign-in failed: " + error.message);
    }
  }, []);

  /* --------------------- Auth bootstrap & listener (fixed) --------------------- */
  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      const supabase = await createClient();

      // initial user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);

      // subscribe to auth changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      // Supabase v2 returns { data: { subscription } } — normalize safely
      // @ts-ignore tolerate older typings
      const maybeSub = data?.subscription ?? data;
      if (maybeSub && typeof maybeSub.unsubscribe === "function") {
        sub = maybeSub;
      }
    };

    initAuth();

    return () => {
      try {
        if (sub && typeof sub.unsubscribe === "function") sub.unsubscribe();
      } catch {
        /* no-op */
      }
    };
  }, []);

  /* --------------------------- Load user interests --------------------------- */
  useEffect(() => {
    if (!user) return;

    const loadInterests = async () => {
      try {
        setInterestsLoading(true);

        // *** PROD-first fix ***
        const data = await fetchJSONFromProdFirst(["/api/v0/preferences"]);
        if (!data) throw new Error("Failed to fetch preferences");

        const preferencesArray = data.preferences || [];

        // Canonical order for the chips on Explore
        const interests: Interest[] = [
          { id: "sleep-rest",      displayName: "Sleep & Rest",       isActive: false },
          { id: "stress-anxiety",  displayName: "Stress & Anxiety",   isActive: false },
          { id: "intimacy-libido", displayName: "Intimacy & Libido",  isActive: false },
          { id: "hormonal-changes",displayName: "Hormonal Changes",   isActive: false },
          { id: "pain-relief",     displayName: "Pain Relief",        isActive: false },
          { id: "focus-creativity",displayName: "Focus & Creativity", isActive: false },
          { id: "not-sure",        displayName: "Cannabis 101",       isActive: false },
        ].map((interest) => ({
          ...interest,
          isActive: preferencesArray.some(
            (pref: { tag?: { display_name?: string } }) =>
              // Special case: DB stores "I'm Not Sure Yet", our chip shows "Cannabis 101"
              interest.id === "not-sure"
                ? pref.tag?.display_name === "I'm Not Sure Yet"
                : pref.tag?.display_name === interest.displayName
          ),
        }));

        setInterestsData(interests);
      } catch (err) {
        console.error("Error loading interests:", err);
        setError("Failed to load user preferences");
      } finally {
        setInterestsLoading(false);
      }
    };

    loadInterests();
  }, [user]);

  /* ------------------------------ Load feed ------------------------------ */
  useEffect(() => {
    if (!user) return;

    const loadFeed = async () => {
      try {
        const cacheKey = `feed:${user?.id}`;

        // cache hit?
        const cached = pageCache.get(cacheKey) as Topic[] | null;
        if (cached) {
          setFeedData(cached);
          setLoading(false);
          return;
        }

        setLoading(true);

        // *** PROD-first fix ***
        const data = await fetchJSONFromProdFirst(["/api/v0/feed"]);
        if (!data) throw new Error("Failed to fetch feed");

        const topics: Topic[] = data.topics || data || [];
        pageCache.set(cacheKey, topics);
        setFeedData(topics);
      } catch (err) {
        console.error("Error loading feed:", err);
        setError("Failed to load personalized feed");
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user]);

  /* ----------------------------- Not signed in ----------------------------- */
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 md:px-0 py-8">
          {/* Header with logo */}
          <div className="flex flex-col items-center justify-center mb-12">
            <div className="mb-8">
              <Image
                src="/liftd-text.svg"
                alt="Liftd+ Logo"
                width={200}
                height={60}
                className="h-12 w-auto"
              />
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-full md:w-1/2">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Welcome to Liftd
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Sign in to access personalized cannabis wellness content
                tailored to your interests.
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                {/* Google G icon */}
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.21-2.25H12v4.26h5.92c-.26 1.16-.99 2.15-2.08 2.83v2.35h3.36c1.96-1.81 3.1-4.47 3.1-7.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.7 0 4.97-.9 6.63-2.43l-3.36-2.35c-.93.62-2.12.99-3.27.99-2.52 0-4.67-1.7-5.43-3.98H3.13v2.5C4.79 20.98 8.17 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6.57 15.23A6.99 6.99 0 015.99 12c0-1.12.27-2.17.58-3.23V6.27H3.13A10.006 10.006 0 002 12c0 1.61.38 3.13 1.13 4.48l3.44-1.25z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.74c1.47 0 2.79.5 3.83 1.48l2.87-2.87C16.97 1.14 14.7 0 12 0 8.17 0 4.79 2.02 3.13 5.27l3.44 2.5C7.33 6.44 9.48 4.74 12 4.74z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Signed-in UI ------------------------------ */
  const displayName =
    user.user_metadata?.name || user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Hello, {displayName}
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push("/search")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </button>
            <button
              onClick={() => router.push("/favorites")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Favorites"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 21l7-5 7 5V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16z"
                />
              </svg>
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
              aria-label="Profile"
            >
              <img
                src={user.user_metadata?.avatar_url || "/man.jpg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Interests */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Interests
            </h2>
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <HiOutlineCog className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>

          {interestsLoading ? (
            <InterestTagsSkeleton />
          ) : (
            <InterestTags interests={interestsData} />
          )}
        </div>

        {/* Errors */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

               {/* Feed */}
        {loading ? (
          <div className="space-y-8">
            <CardScrollerSkeleton />
            <CardScrollerSkeleton />
          </div>
        ) : feedData.length ? (
          feedData.map((topic) => (
            <CardScroller
              key={topic.topic_id}
              title={topic.topic_display}
            >
              {topic.posts.map((content, index) => {
                const key = `feed-post-${(content as any).post_id || index}`;

                // Generate / normalize slug, same pattern as Search page
                const slug =
                  (content as any).slug ??
                  (typeof (content as any).title === "string"
                    ? (content as any).title
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")
                    : null);

                // Reuse the same object instance
                const enrichedPost = content as any;
                if (slug) {
                  enrichedPost.slug = slug;
                }

                // Decide what to use in the URL
                const postKey =
                  enrichedPost.slug ||
                  enrichedPost.display_id?.toString?.() ||
                  enrichedPost.id?.toString?.() ||
                  key;

                return (
                  <Card
                    key={postKey}
                    post={enrichedPost}
                    compact
                    onClick={() => {
                      // 👉 Navigate to the unique URL instead of only opening a modal
                      router.push(`/post/${postKey}`);
                    }}
                  />
                );
              })}
            </CardScroller>
          ))
        ) : (
          <div className="container mx-auto px-4 md:px-0 py-8 text-center">
            <p className="text-gray-600">No posts available at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">
              Try updating your interests in your profile to see personalized
              content.
            </p>
          </div>
        )}


        {/* Post modal */}
        <PostModal isOpen={isModalOpen} onClose={closePostModal}>
          {selectedPost && <PostContent post={selectedPost as any} />}
        </PostModal>

        <InstallPrompt />
      </div>
    </div>
  );
}
