import { PostData } from "@/components/site_core/PostContent";

export interface Post {
  post_id: string;
  cover_image_url: string;
  title: string;
  secondary_title: string;
  author_name: string;
  author_photo: string | null;
  like_count: number;
  user_liked: boolean;
  user_archived: boolean;
  topic_tag_ids: string[];
  topic_tags: string;
  format_tags: string;
  audience_tags: string;
  content_type?: "text" | "image";
  content?: string;
  images?: string[];
  read_time_minutes?: number;
  slug?: string;
}

export interface CardProps {
  image: string;
  title: string;
  secondaryTitle: string;
  authorName: string;
  authorPhoto?: string;
  likes: number;
  tags: string[];
  readTime?: string;
}

export const transformPost = (post: Post): CardProps => {
  return {
    image: post.cover_image_url,
    title: post.title,
    secondaryTitle: post.secondary_title,
    authorName: post.author_name,
    authorPhoto: post.author_photo || undefined,
    likes: post.like_count,
    tags: [post.topic_tags, post.format_tags, post.audience_tags].filter(
      Boolean
    ),
    readTime: `${post.read_time_minutes ?? 5} minute read`,
  };
};

// Updated to include user interaction data for modal
export const transformPostForModal = (
  post: Post
): PostData & { user_liked: boolean; user_archived: boolean } => {
  const result = {
    post_id: post.post_id,
    cover_image_url: post.cover_image_url,
    title: post.title,
    secondary_title: post.secondary_title,
    author_name: post.author_name,
    author_photo: post.author_photo || undefined,
    like_count: post.like_count,
    user_liked: post.user_liked,
    user_archived: post.user_archived,
    tags: [post.topic_tags, post.format_tags, post.audience_tags].filter(
      Boolean
    ),
    content_type: post.content_type || "text",
    content: post.content,
    images: post.images || [],
  };

  return result;
};
