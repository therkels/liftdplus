// src/utils/postActions.ts
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

// Helper to normalize IDs
function toNumber(id: string | number): number {
  const n = Number(id);
  if (Number.isNaN(n)) {
    throw new Error(`Invalid post id: ${id}`);
  }
  return n;
}

/* ---------------------------------- Likes ---------------------------------- */

export async function likePost(postId: string | number): Promise<boolean> {
  const id = toNumber(postId);
  console.log("[likePost] sending id =", id);

  try {
    const res = await fetch("/api/v0/posts/like", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: id, like: true }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("likePost failed:", res.status, text);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Error liking post:", e);
    return false;
  }
}

export async function unlikePost(postId: string | number): Promise<boolean> {
  const id = toNumber(postId);
  console.log("[unlikePost] sending id =", id);

  try {
    const res = await fetch("/api/v0/posts/like", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: id }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("unlikePost failed:", res.status, text);
      return false;
    }

    return true;
  } catch (e) {
    console.error("Error unliking post:", e);
    return false;
  }
}

/* ------------------------------- Archives ---------------------------------- */

export async function archivePost(
  postId: string | number,
  category?: string,
  coverImageUrl?: string
): Promise<boolean> {
  const id = toNumber(postId);

  try {
    const body = {
      post_id: id,
      // we include these so the backend *can* use them.
      // if the API ignores them, no harm done.
      category,             // e.g. "Hormonal Changes"
      cover_image_url: coverImageUrl ?? null,
    };

    const response = await fetch("/api/v0/posts/archive", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("archivePost failed:", response.status, text);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error archiving post:", error);
    return false;
  }
}


/* --------------------------- Fetch helpers --------------------------------- */

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
    const posts = Array.isArray(result) ? result : [];

    return posts.map((post: any) => ({
      ...post,
      post_id: post.id?.toString?.() || post.post_id,
      user_liked: Boolean(post.user_liked),
      user_archived: Boolean(post.user_archived),
      content: post.markdown || post.content || "",
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
    const posts = Array.isArray(result) ? result : [];

    return posts.map((post: any) => ({
      ...post,
      post_id: post.id?.toString?.() || post.post_id,
      user_liked: Boolean(post.user_liked),
      user_archived: Boolean(post.user_archived),
      content: post.markdown || post.content || "",
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
    const categories = Array.isArray(result) ? result : [];

    return categories.map((cat: any) => ({
      category: cat.category,
      cover_image_url: cat.cover_image_url || "/dandelion.jpg",
      cat_count: cat.cat_count || 0,
    })) as ArchiveCategory[];
  } catch (error) {
    console.error("Error fetching archive categories:", error);
    return [];
  }
}

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
