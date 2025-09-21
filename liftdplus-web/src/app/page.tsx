"use client";

import { useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineCog } from "react-icons/hi";
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

    setIsIOS(
      /iPad|iPhone|iPod/.test(userAgent) &&
        !(window as { MSStream?: unknown }).MSStream
    );

    // Detect mobile devices (phones and small tablets)
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        userAgent
      )
    );

    // Check if app is installed (running in standalone mode)
    setIsStandalone(
      (window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches) ||
        (window.navigator as { standalone?: boolean }).standalone ||
        document.referrer.includes("android-app://")
    );

    // Check if banner was dismissed in this session
    const wasDismissed =
      sessionStorage.getItem("installBannerDismissed") === "true";
    setIsDismissed(wasDismissed);

    // Listen for the beforeinstallprompt event
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
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  // Don't show if already installed, not on mobile, or dismissed
  if (!isMobile || isStandalone || (!isIOS && !deferredPrompt) || isDismissed) {
    return null;
  }

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
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
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
          <div className="flex items-center space-x-2">
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
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [feedData, setFeedData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: { name?: string; avatar_url?: string };
  } | null>(null);
  const [interestsData, setInterestsData] = useState<Interest[]>([]);

  const { selectedPost, isModalOpen, openPostModal, closePostModal } =
    usePostModal();

  const handleGoogleSignIn = useCallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api/v0/auth/callback"
            : "https://liftdplus.vercel.app/api/v0/auth/callback",
      },
    });
    if (data?.url) {
      window.location.href = data.url;
    } else if (error) {
      alert("Google sign-in failed: " + error.message);
    }
  }, []);

  // Check authentication status and listen for auth changes
  useEffect(() => {
    let subscription: any;

    const initAuth = async () => {
      const supabase = await createClient();

      // Get initial user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Listen for auth state changes
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event, session?.user);
        setUser(session?.user ?? null);
      });

      subscription = authSubscription;
    };

    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Load user interests from API
  useEffect(() => {
    if (!user) return;

    const loadInterests = async () => {
      try {
        setInterestsLoading(true);
        const response = await fetch("/api/v0/preferences");
        if (!response.ok) {
          throw new Error("Failed to fetch preferences");
        }
        const data = await response.json();

        // Extract preferences array from response (same as profile page)
        const preferencesArray = data.preferences || [];

        const interests: Interest[] = [
          { id: "sleep-rest", displayName: "Sleep & Rest", isActive: false },
          {
            id: "stress-anxiety",
            displayName: "Stress & Anxiety",
            isActive: false,
          },
          {
            id: "intimacy-libido",
            displayName: "Intimacy & Libido",
            isActive: false,
          },
          {
            id: "hormonal-changes",
            displayName: "Hormonal Changes",
            isActive: false,
          },
          { id: "pain-relief", displayName: "Pain Relief", isActive: false },
          {
            id: "focus-creativity",
            displayName: "Focus & Creativity",
            isActive: false,
          },
        ].map((interest) => ({
          ...interest,
          isActive: preferencesArray.some(
            (pref: { tag?: { display_name?: string } }) =>
              pref.tag?.display_name === interest.displayName
          ),
        }));

        setInterestsData(interests);
      } catch (error) {
        console.error("Error loading interests:", error);
        setError("Failed to load user preferences");
      } finally {
        setInterestsLoading(false);
      }
    };

    loadInterests();
  }, [user]);

  // Load personalized feed from API
  useEffect(() => {
    if (!user) return;

    const loadFeed = async () => {
      try {
        // Create cache key based on user
        const cacheKey = `feed:${user?.id}`;

        // Check cache first
        const cachedFeed = pageCache.get(cacheKey) as Topic[] | null;
        if (cachedFeed) {
          setFeedData(cachedFeed);
          setLoading(false);
          return;
        }

        setLoading(true);
        const response = await fetch("/api/v0/feed");
        if (!response.ok) {
          throw new Error("Failed to fetch feed");
        }
        const data = await response.json();

        // FIX: Extract topics array from the response
        const topics = data.topics || data || [];

        // Cache the topics before setting state
        pageCache.set(cacheKey, topics);
        setFeedData(topics);
      } catch (error) {
        console.error("Error loading feed:", error);
        setError("Failed to load personalized feed");
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user]);

  // Show loading state while checking authentication
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

            {/* Sign-in section */}
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Welcome to Liftd+
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Sign in to access personalized cannabis wellness content
                tailored to your interests.
              </p>
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 md:px-0 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-semibold text-gray-800">
              Hello,{" "}
              {user?.user_metadata?.name ||
                user?.email?.split("@")[0] ||
                "there"}
              !
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/search")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
              aria-label="Profile"
            >
              <img
                src={user?.user_metadata?.avatar_url || "/man.jpg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Interests Section */}
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

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-8">
            <CardScrollerSkeleton />
            <CardScrollerSkeleton />
            <CardScrollerSkeleton />
          </div>
        )}

        {/* Render feed data */}
        {feedData.length > 0
          ? feedData.map((topic) => (
              <CardScroller key={topic.topic_id} title={topic.topic_display}>
                {topic.posts.map((post) => (
                  <Card
                    key={post.post_id}
                    post={post}
                    onClick={() => openPostModal(post)}
                    compact={true}
                  />
                ))}
              </CardScroller>
            ))
          : !loading && (
              <div className="container mx-auto px-4 md:px-0 py-8 text-center">
                <p className="text-gray-600">
                  No posts available at the moment.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try updating your interests in your profile to see
                  personalized content.
                </p>
              </div>
            )}

        <PostModal isOpen={isModalOpen} onClose={closePostModal}>
          {selectedPost && <PostContent post={selectedPost} />}
        </PostModal>

        <InstallPrompt />
      </div>
    </div>
  );
}
