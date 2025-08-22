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
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
 
  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )
 
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])
 
  if (isStandalone) {
    return null // Don't show install button if already installed
  }
 
  return (
    <div>
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then "Add to Home Screen"
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>
          .
        </p>
      )}
    </div>
  )
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
  const handleGoogleSignIn = useCallback(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: 'https://liftdplus-git-feat-addpwasupport-liftdplus.vercel.app/api/v0/auth/callback',
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
    // const fetchFeedData = async () => {
    //   try {
    //     const response = await fetch("http://localhost:3000/api/v0/feed");
    //     const data = await response.json();
    //     setFeedData(data);
    //   } catch (error) {
    //     console.error("Error fetching feed data:", error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchFeedData();

    // Mock data for testing different post types
    const mockData: Topic[] = [
      {
        topic_id: "1",
        topic_display: "Trending Posts",
        posts: [
          {
            post_id: "1",
            cover_image_url: "/dandelion.jpg",
            title: "3 Reasons You Should Slow Down Today",
            secondary_title: "A simple post with markdown content",
            author_name: "Maya Johnson",
            author_photo: null,
            like_count: 42,
            topic_tag_ids: ["fitness"],
            topic_tags: "Fitness",
            format_tags: "Tutorial",
            audience_tags: "Beginner",
            content_type: "text",
            content: `# Welcome to this Base Post

This is a **base post** with markdown content. Here are some features:

- Bold and *italic* text
- Lists and bullet points
- Code snippets like \`const example = true\`

## Subheading

You can include multiple paragraphs and even images within the markdown content.

> This is a blockquote for emphasis

The base post type is perfect for simple content with text and formatting.`,
          },
          {
            post_id: "2",
            cover_image_url: "/dandelion.jpg",
            title: "Long Form Article",
            secondary_title: "Extended content with embedded images",
            author_name: "Alex Chen",
            author_photo: null,
            like_count: 89,
            topic_tag_ids: ["nutrition"],
            topic_tags: "Nutrition",
            format_tags: "Article",
            audience_tags: "Intermediate",
            content_type: "text",
            content: `# The Complete Guide to Nutrition

This is a **long-form post** that can include extensive markdown content with embedded images.

## Introduction

Long-form posts are perfect for detailed articles, tutorials, and comprehensive guides.

### Key Benefits
1. **Detailed explanations** with multiple sections
2. **Rich formatting** including headers, lists, and emphasis
3. **Embedded images** from external URLs
4. **Code examples** and blockquotes

## Advanced Content

Here's an example of how you might include an image in your content:

![Example Image](/dino.jpg)

> Long-form content allows for more comprehensive coverage of topics

### Technical Details

You can include code blocks:

\`\`\`javascript
const nutrition = {
  protein: 25,
  carbs: 45,
  fats: 30
};
\`\`\`

And much more detailed information that wouldn't fit in a simple post format.

## Conclusion

Long-form posts provide the flexibility to create comprehensive, educational content.`,
          },
          {
            post_id: "3",
            cover_image_url: "/dandelion.jpg",
            title: "Image Carousel",
            secondary_title: "Multiple images in a slideshow",
            author_name: "Sarah Wilson",
            author_photo: null,
            like_count: 156,
            topic_tag_ids: ["workout"],
            topic_tags: "Workout",
            format_tags: "Gallery",
            audience_tags: "All Levels",
            content_type: "image",
            images: ["/dino.jpg", "/dino.jpg", "/dino.jpg", "/dino.jpg"],
          },
          {
            post_id: "4",
            cover_image_url: "/dandelion.jpg",
            title: "Single Image Focus",
            secondary_title: "Showcase one main image",
            author_name: "David Martinez",
            author_photo: null,
            like_count: 73,
            topic_tag_ids: ["motivation"],
            topic_tags: "Motivation",
            format_tags: "Photo",
            audience_tags: "Everyone",
            content_type: "image",
            images: [], // Single image uses just the cover image
          },
        ],
      },
      {
        topic_id: "2",
        topic_display: "Recently Added",
        posts: [
          {
            post_id: "5",
            cover_image_url: "/dandelion.jpg",
            title: "Another Base Post",
            secondary_title: "More markdown content examples",
            author_name: "Emma Thompson",
            author_photo: null,
            like_count: 28,
            topic_tag_ids: ["wellness"],
            topic_tags: "Wellness",
            format_tags: "Tips",
            audience_tags: "Beginner",
            content_type: "text",
            content: `# Quick Wellness Tips

Here are some **quick tips** for better wellness:

## Daily Habits
- Drink more water 💧
- Take short walks
- Practice deep breathing

### Remember
> Small changes lead to big improvements over time!

Stay consistent and be patient with yourself.`,
          },
          {
            post_id: "6",
            cover_image_url: "/dandelion.jpg",
            title: "Multi-Image Tutorial",
            secondary_title: "Step by step with images",
            author_name: "Michael Brown",
            author_photo: null,
            like_count: 94,
            topic_tag_ids: ["technique"],
            topic_tags: "Technique",
            format_tags: "Tutorial",
            audience_tags: "Advanced",
            content_type: "image",
            images: ["/dino.jpg", "/dino.jpg", "/dino.jpg"],
          },
        ],
      },
    ];

    // Simulate loading delay for both feed and interests
    setTimeout(() => {
      setFeedData(mockData);
      setLoading(false);
    }, 1000);

    // Simulate interests loading (could be a separate API call)
    setTimeout(() => {
      setInterestsData(mockInterestsData);
      setInterestsLoading(false);
    }, 1500);
  }, []);

  const handleCardClick = (post: Post) => {
    setSelectedPost(transformPostForModal(post));
    setIsModalOpen(true);
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
      </PostModal>
    </div>
  );
}
