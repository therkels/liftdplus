import { Post } from "./postTransformers";

export interface ArchiveCategory {
  category: string;
  cover_image_url: string;
  cat_count: number;
}

export interface PostInteractionState {
  isLiked: boolean;
  isArchived: boolean;
  likeCount: number;
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/v0/posts/${postId}/like`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Like post failed:", response.status, errorText);
      throw new Error(
        `Failed to like post: ${response.statusText} - ${errorText}`
      );
    }
    return true;
  } catch (error) {
    console.error("Error liking post:", error);
    return false;
  }
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/v0/posts/${postId}/like`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Unlike post failed:", response.status, errorText);
      throw new Error(
        `Failed to unlike post: ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log("Unlike post success:", responseData);
    return true;
  } catch (error) {
    console.error("Error unliking post:", error);
    return false;
  }
}

/**
 * Archive a post automatically to the correct category based on user preferences
 */
export async function archivePost(postId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/v0/posts/${postId}/archive`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to archive post: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error archiving post:", error);
    return false;
  }
}

/**
 * Remove a post from archives
 */
export async function unarchivePost(postId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/v0/posts/${postId}/archive`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to unarchive post: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error unarchiving post:", error);
    return false;
  }
}

/**
 * Get all liked posts for the current user
 */
export async function getLikedPosts(): Promise<Post[]> {
  try {
    const response = await fetch("/api/v0/posts/liked", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liked posts: ${response.statusText}`);
    }

    const result = await response.json();

    // Handle the array response format from Supabase RPC
    const posts = Array.isArray(result) ? result : [];
    return posts.map((post: Record<string, unknown>) => ({
      ...post,
      post_id: post.id?.toString() || post.post_id,
      user_liked: Boolean(post.user_liked),
      user_archived: Boolean(post.user_archived),
      // Map markdown field to content for modal compatibility
      content: post.markdown || post.content || "",
      // Handle array format for tags
      topic_tags: Array.isArray(post.topic_tags)
        ? post.topic_tags.join(", ")
        : post.topic_tags,
      format_tags: Array.isArray(post.format_tags)
        ? post.format_tags.join(", ")
        : post.format_tags,
      audience_tags: Array.isArray(post.audience_tags)
        ? post.audience_tags.join(", ")
        : post.audience_tags,
    })) as Post[];
  } catch (error) {
    console.error("Error fetching liked posts:", error);
    return [];
  }
}

/**
 * Get archived posts, optionally filtered by category
 */
export async function getArchivedPosts(category?: string): Promise<Post[]> {
  try {
    const url = category
      ? `/api/v0/posts/archives/${encodeURIComponent(category)}`
      : "/api/v0/posts/archives";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch archived posts: ${response.statusText}`);
    }

    const result = await response.json();

    // Handle the array response format from Supabase RPC
    // Transform the posts to match the Post interface
    const posts = Array.isArray(result) ? result : [];
    return posts.map((post: Record<string, unknown>) => ({
      ...post,
      post_id: post.id?.toString() || post.post_id,
      user_liked: Boolean(post.user_liked),
      user_archived: Boolean(post.user_archived),
      // Map markdown field to content for modal compatibility
      content: post.markdown || post.content || "",
      // Handle array format for tags
      topic_tags: Array.isArray(post.topic_tags)
        ? post.topic_tags.join(", ")
        : post.topic_tags,
      format_tags: Array.isArray(post.format_tags)
        ? post.format_tags.join(", ")
        : post.format_tags,
      audience_tags: Array.isArray(post.audience_tags)
        ? post.audience_tags.join(", ")
        : post.audience_tags,
    })) as Post[];
  } catch (error) {
    console.error("Error fetching archived posts:", error);
    return [];
  }
}

/**
 * Get all archive categories with post counts
 */
export async function getArchiveCategories(): Promise<ArchiveCategory[]> {
  try {
    const response = await fetch("/api/v0/posts/archives", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch archive categories: ${response.statusText}`
      );
    }

    const result = await response.json();
    // Handle the array response format from Supabase RPC
    const categories = Array.isArray(result) ? result : [];
    return categories.map((cat: Record<string, unknown>) => ({
      category: cat.category,
      cover_image_url: cat.cover_image_url || "/dandelion.jpg", // Default image
      cat_count: cat.cat_count || 0,
    })) as ArchiveCategory[];
  } catch (error) {
    console.error("Error fetching archive categories:", error);
    return [];
  }
}

/**
 * Get unique saved posts count (avoids double counting liked + archived posts)
 */
export async function getUniqueSavedPostsCount(): Promise<number> {
  try {
    const response = await fetch("/api/v0/posts/saved-count", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch saved posts count: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result.count || 0;
  } catch (error) {
    console.error("Error fetching saved posts count:", error);
    return 0;
  }
}
