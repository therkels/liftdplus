"use client";

//JAKOBS BAD IMPORTS
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
import { InterestsSchema, mockInterestsData } from "@/types/interests";

interface Topic {
  topic_id: string;
  topic_display: string;
  posts: Post[];
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
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interestsData, setInterestsData] = useState<InterestsSchema>({
    interests: [],
  });
  const [loadingPost, setLoadingPost] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        const response = await fetch("/api/v0/feed");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Check if the response contains an error
        if (data.error) {
          throw new Error(data.error);
        }

        // Transform the API response to match our expected Topic[] structure
        if (Array.isArray(data)) {
          const transformedData: Topic[] = data.map((item: any) => ({
            topic_id: item.topic_id,
            topic_display: item.topic_display,
            posts: Array.isArray(item.posts) ? item.posts : [],
          }));
          setFeedData(transformedData);
        } else {
          // If data is not an array, set empty array
          console.warn("API response is not an array:", data);
          setFeedData([]);
        }
      } catch (error) {
        console.error("Error fetching feed data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load feed"
        );
        // Fallback to empty array on error
        setFeedData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();

    // Simulate interests loading (could be a separate API call)
    setTimeout(() => {
      setInterestsData(mockInterestsData);
      setInterestsLoading(false);
    }, 1500);
  }, []);

  const handleCardClick = async (post: Post) => {
    try {
      setLoadingPost(true);
      setIsModalOpen(true);

      const loadingPostData: Post = {
        ...post,
        author_name: "Loading...",
        content: "Loading content...",
      };

      setSelectedPost(transformPostForModal(loadingPostData));

      // Fetch the full post data
      const response = await fetch(`/api/v0/posts/${post.post_id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch post: ${response.status}`);
      }

      const fullPostData = await response.json();

      if (fullPostData.error) {
        throw new Error(fullPostData.error);
      }

      // Transform the database response to Post format
      const fullPost: Post = {
        post_id: fullPostData.id?.toString() || post.post_id,
        cover_image_url: fullPostData.cover_image_url || post.cover_image_url,
        title: fullPostData.title || post.title,
        secondary_title: fullPostData.secondary_title || post.secondary_title,
        author_name: fullPostData.author_name || "Unknown Author",
        author_photo: fullPostData.author_photo,
        like_count: fullPostData.like_count || 0,
        topic_tag_ids: fullPostData.topic_tags || [],
        topic_tags: Array.isArray(fullPostData.topic_tags)
          ? fullPostData.topic_tags.join(", ")
          : "",
        format_tags: Array.isArray(fullPostData.format_tags)
          ? fullPostData.format_tags.join(", ")
          : "",
        audience_tags: Array.isArray(fullPostData.audience_tags)
          ? fullPostData.audience_tags.join(", ")
          : "",
        content_type: "text",
        content: fullPostData.markdown || "No content available",
      };

      setSelectedPost(transformPostForModal(fullPost));
    } catch (error) {
      console.error("Error fetching post:", error);

      const errorPost: Post = {
        ...post,
        author_name: "Error",
        content: `# Error Loading Post\n\nSorry, we couldn't load this post content. Please try again later.\n\n**Error:** ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };

      setSelectedPost(transformPostForModal(errorPost));
    } finally {
      setLoadingPost(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div>
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-foreground">Hello, Jay</h1>
            <div
              className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2"
              style={{ borderColor: "var(--accent-light)" }}
            >
              <Image
                src="/man.jpg"
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
            <InterestTags
              interests={interestsData.interests}
              className="mb-2"
            />
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
        <CardScrollerSkeleton title="Trending Posts" cardCount={4} />
        <CardScrollerSkeleton title="Recently Added" cardCount={3} />
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-foreground">Hello, Jay</h1>
          <div
            className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-2"
            style={{ borderColor: "var(--accent-light)" }}
          >
            <Image
              src="/man.jpg"
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
          <InterestTags interests={interestsData.interests} className="mb-2" />
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
            <button
        style={{ padding: "12px 24px", fontSize: "1.2rem", cursor: "pointer", marginTop: 24 }}
        onClick={handleGoogleSignIn}
      >
        Sign in with Google
      </button>
      {feedData.map((topic) => (
        <CardScroller key={topic.topic_id} title={topic.topic_display}>
          {topic.posts.map((post) => (
            <Card
              key={post.post_id}
              {...transformPost(post)}
              onClick={() => handleCardClick(post)}
              compact={true}
            />
          ))}
        </CardScroller>
      ))}

      <PostModal isOpen={isModalOpen} onClose={handleCloseModal}>
        {selectedPost && <PostContent post={selectedPost} />}
        {loadingPost && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading post content...</span>
          </div>
        )}
      </PostModal>
    </div>
  );
}
