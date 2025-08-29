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
import PostContent, { PostData } from "@/components/site_core/PostContent";
import {
  Post,
  transformPost,
  transformPostForModal,
} from "@/utils/postTransformers";
import { usePostModal } from "@/utils/postHelpers";

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

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div>
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {" "}
            ⎋{" "}
          </span>
          and then "Add to Home Screen"
          <span role="img" aria-label="plus icon">
            {" "}
            ➕{" "}
          </span>
          .
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [feedData, setFeedData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const { selectedPost, isModalOpen, openPostModal, closePostModal } =
    usePostModal();
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [interestsData, setInterestsData] = useState<Interest[]>([]);

  const handleGoogleSignIn = useCallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://liftdplus.vercel.app/api/v0/auth/callback",
        //redirectTo: 'http://localhost:3000/api/v0/auth/callback',
      },
    });
    if (data?.url) {
      window.location.href = data.url;
    } else if (error) {
      alert("Google sign-in failed: " + error.message);
    }
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    checkAuth();
  }, []);

  // Load user interests from API
  useEffect(() => {
    const loadInterests = async () => {
      if (!user) {
        setInterestsData([]);
        setInterestsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/v0/preferences");
        if (response.ok) {
          const { preferences } = await response.json();
          const interests: Interest[] = preferences
            .filter((p: any) => p.tag?.category === "topic")
            .map((p: any) => ({
              id: p.tag_id,
              displayName: p.tag?.display_name || "",
              isActive: true,
            }));
          setInterestsData(interests);
        } else {
          setInterestsData([]);
        }
      } catch (error) {
        console.error("Error loading interests:", error);
        setInterestsData([]);
      } finally {
        setInterestsLoading(false);
      }
    };

    loadInterests();
  }, [user]);

  // Load feed data from API
  useEffect(() => {
    const fetchFeedData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch personalized feed
        const response = await fetch("/api/v0/feed", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please sign in to view personalized content");
          }
          throw new Error(`Failed to fetch feed: ${response.statusText}`);
        }

        const result = await response.json();

        // Transform API response to match expected format
        let feedTopics: Topic[] = [];

        if (result.topics && Array.isArray(result.topics)) {
          feedTopics = result.topics.map((topic: any) => ({
            topic_id: topic.topic_id,
            topic_display: topic.topic_display,
            posts: Array.isArray(topic.posts) ? topic.posts : [],
          }));
        }

        // If no personalized feed, fetch general posts
        if (feedTopics.length === 0) {
          const postsResponse = await fetch("/api/v0/posts?sort_by=popular", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (postsResponse.ok) {
            const postsResult = await postsResponse.json();
            const posts = postsResult.posts || [];

            feedTopics = [
              {
                topic_id: "general",
                topic_display: "Discover Posts",
                posts: Array.isArray(posts) ? posts : [],
              },
            ];
          }
        }

        setFeedData(feedTopics);
      } catch (error) {
        console.error("Error fetching feed data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load content"
        );
        setFeedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, [user]);

  // Show loading state
  if (loading && user) {
    return (
      <div>
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-foreground">
              Hello, {user?.user_metadata?.name || "User"}
            </h1>
            <div
              className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2"
              style={{ borderColor: "var(--accent-light)" }}
            >
              <Image
                src={user?.user_metadata?.avatar_url || "/man.jpg"}
                alt="User"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            </div>
          </div>

          {interestsLoading ? (
            <InterestTagsSkeleton className="mb-2" />
          ) : (
            <InterestTags interests={interestsData} className="mb-2" />
          )}

          <button
            onClick={() => router.push("/profile")}
            className="flex items-center text-xs text-subtext mb-6 hover:text-gray-600 transition-colors"
          >
            <HiOutlineCog className="w-3 h-3 mr-1" />
            Edit Interests
          </button>
        </div>

        {/* Loading skeletons for feed */}
        <CardScrollerSkeleton title="Loading..." cardCount={4} />
        <CardScrollerSkeleton title="Loading..." cardCount={3} />
      </div>
    );
  }

  // Show sign in prompt for unauthenticated users
  if (!user) {
    return (
      <div>
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome to Liftd+
            </h1>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Sign in to see personalized content based on your interests.
            </p>
            <button
              style={{
                padding: "12px 24px",
                fontSize: "1.2rem",
                cursor: "pointer",
                marginTop: 24,
              }}
              onClick={handleGoogleSignIn}
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">
            Hello, {user?.user_metadata?.name || "User"}
          </h1>
          <div
            className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2"
            style={{ borderColor: "var(--accent-light)" }}
          >
            <Image
              src={user?.user_metadata?.avatar_url || "/man.jpg"}
              alt="User"
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          </div>
        </div>

        {interestsLoading ? (
          <InterestTagsSkeleton className="mb-2" />
        ) : (
          <InterestTags interests={interestsData} className="mb-2" />
        )}

        {/* Edit Interests Button */}
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center text-xs text-subtext mb-6 hover:text-gray-600 transition-colors"
        >
          <HiOutlineCog className="w-3 h-3 mr-1" />
          Edit Interests
        </button>
      </div>

      <InstallPrompt />

      {/* Show error message if there's an error with feed data */}
      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Render feed data */}
      {feedData.length > 0
        ? feedData.map((topic) => (
            <CardScroller key={topic.topic_id} title={topic.topic_display}>
              {topic.posts.map((post) => (
                <Card
                  key={post.post_id}
                  {...transformPost(post)}
                  onClick={() => openPostModal(post)}
                  compact={true}
                />
              ))}
            </CardScroller>
          ))
        : !loading && (
            <div className="container mx-auto px-4 py-8 text-center">
              <p className="text-gray-600">No posts available at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">
                Try updating your interests in your profile to see personalized
                content.
              </p>
            </div>
          )}

      <PostModal isOpen={isModalOpen} onClose={closePostModal}>
        {selectedPost && <PostContent post={selectedPost} />}
      </PostModal>
    </div>
  );
}
