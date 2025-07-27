"use client";

import { useEffect, useState } from "react";
import Card from "@/components/site_core/Card";
import CardScroller from "@/components/site_core/CardScroller";
import FilterTabs from "@/components/site_core/FilterTabs";
import { HiOutlineUser } from "react-icons/hi";

interface Post {
  post_id: string;
  cover_image_url: string;
  title: string;
  secondary_title: string;
  author_name: string;
  author_photo: string | null;
  like_count: number;
  topic_tag_ids: string[];
  topic_tags: string;
  format_tags: string;
  audience_tags: string;
}

interface Topic {
  topic_id: string;
  topic_display: string;
  posts: Post[];
}

export default function Home() {
  const [feedData, setFeedData] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/v0/feed");
        const data = await response.json();
        setFeedData(data);
      } catch (error) {
        console.error("Error fetching feed data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, []);

  // Transform API post data to match Card component props
  const transformPost = (post: Post) => {
    return {
      image: post.cover_image_url,
      title: post.title,
      secondaryTitle: post.secondary_title,
      authorName: post.author_name,
      likes: post.like_count,
      tags: [post.topic_tags, post.format_tags, post.audience_tags].filter(
        Boolean
      ),
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Hello, Jay</h1>
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
            <HiOutlineUser className="w-6 h-6 text-gray-600" />
          </div>
        </div>

        <FilterTabs className="mb-6" />
        <div className="text-center">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Hello, Jay</h1>
        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
          <HiOutlineUser className="w-6 h-6 text-gray-600" />
        </div>
      </div>

      <FilterTabs className="mb-6" />
      {feedData.map((topic) => (
        <CardScroller key={topic.topic_id} title={topic.topic_display}>
          {topic.posts.map((post) => (
            <Card key={post.post_id} {...transformPost(post)} />
          ))}
        </CardScroller>
      ))}
    </div>
  );
}
