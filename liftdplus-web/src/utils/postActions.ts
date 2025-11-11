import { Post } from "./postTransformers";

/* ----------------------------- Types & Interfaces ---------------------------- */

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

/* --------------------------------- Helpers --------------------------------- */

function toNumber(id: string | number): number {
  const n = Number(id);
  if (Number.isNaN(n)) {
    throw new Error(`Invalid post id: ${id}`);
  }
  return n;
}

function normalizePostsArray(payload: any): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.posts)) return payload.posts;
  return [];
}

function mapToPost(arr: Record<string, unknown>[]): Post[] {
  return arr.map((post, i) => ({
    ...(post as any),
    post_id:
      (post as any).id?.toString?.() ||
      (post as any).post_id ||
      String(i),
    user_liked: Boolean((post as any).user_liked),
    user_archived: Boolean((post as any).user_archived),
    // Modal/content compatibility
    content: (post as any).markdown || (post as any).content || "",
    // Tag fields may come back as arrays; join to strings for UI
    topic_tags: Array.isArray((post as any).topic_tags)
      ? (post as any).topic_tags.join(", ")
      : (post as any).topic_tags,
    format_tags: Array.isArray((post as any).format_tags)
      ? (post as any).format_tags.join(", ")
      : (post as any).format_tags,
    audience_tags: Array.isArray((post as any).audience_tags)
      ? (post as any).audience_tags.join(", ")
      : (post as any).audience_tags,
  })) as Post[];
}

/* ---------------------------------- Likes ---------------------------------- */

/** Like a post */
export async function likePost(postId: string | number): Promise<boolean> {
  try {
    const res = await fetch("/api/v0/posts/like", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: toNumber(postId), like: true }),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  } catch (e) {
    console.error("Error liking post:", e);
    return false;
  }
}

/** Unlike a post */
export async function unlikePost(postId: string | number): Promise<boolean> {
  try {
    const res = await fetch("/api/v0/posts/like", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: toNumber(postId) }),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  } catch (e) {
    console.error("Error unliking post:", e);
    return false;
  }
}

/* -------------------------------- Archives --------------------------------- */

/** Archive a post (optional category override) */
export async function archivePost(
  postId: string | number,
  category?: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/v0/posts/archive", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: toNumber(postId),
        archived: true,
        category,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  } catch (e) {
    console.error("Error archiving post:", e);
    return false;
  }
}

/** Remove a post from archives */
export async function unarchivePost(postId: string | number): Promise<boolean> {
  try {
    const res = await fetch("/api/v0/posts/archive", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: toNumber(postId) }),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  } catch (e) {
    console.error("Error unarchiving post:", e);
    return false;
  }
}

/* ------------------------------ Fetch Helpers ------------------------------ */

/** Get all liked posts for the current user */
export async function getLikedPosts(): Promise<Post[]> {
  try {
    const res = await fetch("/api/v0/posts/liked", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to fetch liked posts: ${res.status} ${res.statusText}`);

    const payload = await res.json();
    return mapToPost(normalizePostsArray(payload));
  } catch (e) {
    console.error("Error fetching liked posts:", e);
    return [];
  }
}

/** Get archived posts, optionally filtered by category */
export async function getArchivedPosts(category?: string): Promise<Post[]> {
  try {
    const url = category
      ? `/api/v0/posts/archives/${encodeURIComponent(category)}`
      : "/api/v0/posts/archives";

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to fetch archived posts: ${res.status} ${res.statusText}`);

    const payload = await res.json();
    return mapToPost(normalizePostsArray(payload));
  } catch (e) {
    console.error("Error fetching archived posts:", e);
    return [];
  }
}

/** Get all archive categories with post counts */
export async function getArchiveCategories(): Promise<ArchiveCategory[]> {
  try {
    const res = await fetch("/api/v0/posts/archives", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to fetch archive categories: ${res.status} ${res.statusText}`);

    const payload = await res.json();
    const arr = Array.isArray(payload) ? payload : [];
    return arr.map((cat: Record<string, any>) => ({
      category: cat.category,
      cover_image_url: cat.cover_image_url || "/dandelion.jpg",
      cat_count: cat.cat_count || 0,
    })) as ArchiveCategory[];
  } catch (e) {
    console.error("Error fetching archive categories:", e);
    return [];
  }
}

/** Get unique saved posts count (liked ∪ archived) */
export async function getUniqueSavedPostsCount(): Promise<number> {
  try {
    const res = await fetch("/api/v0/posts/saved-count", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to fetch saved posts count: ${res.status} ${res.statusText}`);

    const payload = await res.json();
    return Number(payload?.count ?? 0);
  } catch (e) {
    console.error("Error fetching saved posts count:", e);
    return 0;
  }
}
