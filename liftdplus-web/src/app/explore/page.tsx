"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineCog } from "react-icons/hi";

import { createClient } from "@/utils/supabase/client";

import { ChecklistCard } from "@/components/ChecklistCard";
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
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        userAgent
      )
    );
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    setIsStandalone(
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://")
    );
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

  if (
    (isMobile && (isStandalone || (!isIOS && !deferredPrompt))) ||
    isDismissed
  ) {
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

/* ------------------ PROD-first fetch helper ------------------ */
async function fetchJSONFromProdFirst(paths: string[]) {
  const urls = [
    `https://app.liftdplus.com${paths[0]}`,
    paths[0],
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

/* ------------------------------ Explore Page ------------------------------ */
export default function ExplorePage() {
  const router = useRouter();

  const [feedData, setFeedData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const [interestsData, setInterestsData] = useState<Interest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { name?: string; avatar_url?: string };
  } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [userGoal, setUserGoal] = useState<string>("sleep");

  const [checklistHidden, setChecklistHidden] = useState(false);
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { selectedPost, isModalOpen, openPostModal, closePostModal } =
    usePostModal();

  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user ?? null);
      setAuthReady(true);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

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

  useEffect(() => {
    if (!authReady || user !== null) return;
    router.replace("/");
  }, [authReady, user, router]);

  useEffect(() => {
    if (!user) return;

    const loadPreferencesAndGoal = async () => {
      const supabase = await createClient();
      const { data: prefs } = await supabase
        .from("private.preferences")
        .select("topics")
        .eq("user_id", user.id)
        .single();
      const goal = prefs?.topics?.[0]?.toLowerCase() ?? "sleep";
      setUserGoal(goal);
    };
    loadPreferencesAndGoal();
  }, [user]);

  useEffect(() => {
    setMounted(true);
    const CHECKLIST_HIDDEN_KEY = "checklist_hidden";
    try {
      setChecklistHidden(localStorage.getItem(CHECKLIST_HIDDEN_KEY) === "true");
    } catch {
      setChecklistHidden(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadInterests = async () => {
      try {
        setInterestsLoading(true);
        const data = await fetchJSONFromProdFirst(["/api/v0/preferences"]);
        if (!data) throw new Error("Failed to fetch preferences");

        const preferencesArray = data.preferences || [];
        const interests: Interest[] = [
          { id: "sleep-rest", displayName: "Sleep & Rest", isActive: false },
          { id: "stress-anxiety", displayName: "Stress & Anxiety", isActive: false },
          { id: "intimacy-libido", displayName: "Intimacy & Libido", isActive: false },
          { id: "hormonal-changes", displayName: "Hormonal Changes", isActive: false },
          { id: "pain-relief", displayName: "Pain Relief", isActive: false },
          { id: "focus-creativity", displayName: "Focus & Creativity", isActive: false },
          { id: "not-sure", displayName: "Cannabis 101", isActive: false },
        ].map((interest) => ({
          ...interest,
          isActive: preferencesArray.some(
            (pref: { tag?: { display_name?: string } }) =>
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

  useEffect(() => {
    if (!user) return;

    const loadFeed = async () => {
      try {
        const cacheKey = `feed:${user?.id}`;
        const cached = pageCache.get(cacheKey) as Topic[] | null;
        if (cached) {
          setFeedData(cached);
          setLoading(false);
          return;
        }

        setLoading(true);
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

  if (!authReady || user === null) {
    return null;
  }

  const displayName =
    user.user_metadata?.name || user.email?.split("@")[0] || "there";

  return (
    <div className="min-h-screen bg-[#f5f6f2]">
      <div className="max-w-3xl mx-auto">
        <div className="container mx-auto px-4 md:px-0 py-8">
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
              <Image
                src={user.user_metadata?.avatar_url || "/man.jpg"}
                alt="Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {mounted && checklistHidden && (
          <div
            style={{
              marginBottom: "8px",
              padding: "0",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--subtext)",
              }}
            >
              A few things worth knowing first —{" "}
            </span>
            <button
              type="button"
              onClick={() => {
                const CHECKLIST_HIDDEN_KEY = "checklist_hidden";
                try {
                  localStorage.setItem(CHECKLIST_HIDDEN_KEY, "false");
                } catch {
                  /* no-op */
                }
                setChecklistHidden(false);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-light)",
                fontSize: "0.78rem",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
              }}
            >
              Show
            </button>
          </div>
        )}

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

        {!checklistComplete && !checklistHidden && (
          <div style={{ marginBottom: 8 }}>
            <p style={{
              fontSize: "0.85rem",
              color: "var(--subtext)",
              marginBottom: 4,
            }}>
              Not sure where to start?
            </p>
            <p style={{
              fontSize: "0.78rem",
              color: "var(--subtext)",
              opacity: 0.8,
            }}>
              Work through these five reads first — or explore by topic below.
            </p>
          </div>
        )}

        <ChecklistCard
          userGoal={userGoal}
          hidden={mounted ? checklistHidden : false}
          onHide={() => setChecklistHidden(true)}
          onCompletionChange={setChecklistComplete}
        />

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
                const slug =
                  (content as any).slug ??
                  (typeof (content as any).title === "string"
                    ? (content as any).title
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")
                    : null);

                const enrichedPost = content as any;
                if (slug) {
                  enrichedPost.slug = slug;
                }

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
                    onClick={() => openPostModal(enrichedPost)}
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

        <PostModal isOpen={isModalOpen} onClose={closePostModal}>
          {selectedPost && <PostContent post={selectedPost as any} />}
        </PostModal>

        <InstallPrompt />
        </div>
      </div>
    </div>
  );
}
