// Tag mapping utility for converting between display names and database IDs

// Based on the tag_rows.csv data
const TAG_MAPPING = {
  // Topic tags
  "Sleep & Rest": "sleep_rest",
  "Stress & Anxiety": "stress_anx",
  "Intimacy & Libido": "intimacy",
  "Hormonal Changes": "hormonal-changes",
  "Pain Relief": "pain-relief",
  "Focus & Creativity": "focus-creativity",
  "I'm Not Sure Yet": "not-sure",
  "Cannabis 101": "not-sure",

  // Format tags
  "Blog Post": "blog",
  "Image Carousel": "carousel",
  "Micro Story": "micro_story",
  Moodboard: "moodboard",

  // Audience tags - updated to match new database structure
  "New to Cannabis": "new_to_cannabis",
  "For Women": "for_women",
  "By and For BIPOC Voices": "bipoc_voices",
  "For Parents": "for_parents",
  "For Ages 50+": "ages_50_plus",
  "Smoke-Free Friendly": "smoke_free",
} as const;

// Sort options mapping
const SORT_MAPPING = {
  popular: "Most Popular",
  recent: "Most Recent",
  oldest: "Oldest",
} as const;

// Reverse mapping for sort options
const SORT_ID_TO_DISPLAY = Object.fromEntries(
  Object.entries(SORT_MAPPING).map(([id, display]) => [id, display])
);

// Reverse mapping for ID to display name
const ID_TO_DISPLAY_MAPPING = Object.fromEntries(
  Object.entries(TAG_MAPPING).map(([display, id]) => [id, display])
);

/**
 * Convert display names to tag IDs for API calls
 */
export function mapDisplayNamesToIds(displayNames: string[]): string[] {
  return displayNames
    .map((name) => TAG_MAPPING[name as keyof typeof TAG_MAPPING])
    .filter(Boolean); // Remove undefined values
}

/**
 * Convert tag IDs to display names for UI display
 */
export function mapIdsToDisplayNames(ids: string[]): string[] {
  return ids.map((id) => ID_TO_DISPLAY_MAPPING[id]).filter(Boolean); // Remove undefined values
}

/**
 * Get tag ID for a single display name
 */
export function getTagId(displayName: string): string | undefined {
  return TAG_MAPPING[displayName as keyof typeof TAG_MAPPING];
}

/**
 * Get display name for a single tag ID
 */
export function getDisplayName(tagId: string): string | undefined {
  return ID_TO_DISPLAY_MAPPING[tagId];
}

/**
 * Build query parameters for posts API with proper tag ID mapping
 */
export function buildPostsQueryParams(filters: {
  sortBy?: string;
  category?: string[];
  audience?: string[];
}): URLSearchParams {
  const params = new URLSearchParams();

  const sortMap: Record<string, string> = {
    "Most Popular": "popular",
    "Most Recent": "recent",
    "Oldest": "oldest",
  };
  const sortValue = sortMap[filters.sortBy || "Most Popular"] ?? "popular";
  params.append("sort_by", sortValue);

  // Map display names to tag IDs for each filter type
  if (filters.category && filters.category.length > 0) {
    const categoryIds = mapDisplayNamesToIds(filters.category);
    categoryIds.forEach((id) => params.append("category", id));
  }

  if (filters.audience && filters.audience.length > 0) {
    const audienceIds = mapDisplayNamesToIds(filters.audience);
    audienceIds.forEach((id) => params.append("audience", id));
  }

  return params;
}

/**
 * Get all available display names by category for UI components
 */
export const AVAILABLE_TAGS = {
  topic: [
    "Sleep & Rest",
    "Stress & Anxiety",
    "Intimacy & Libido",
    "Hormonal Changes",
    "Pain Relief",
    "Focus & Creativity",
    "I'm Not Sure Yet",
    "Cannabis 101",
  ],
  audience: [
    "New to Cannabis",
    "For Women",
    "By and For BIPOC Voices",
    "For Parents",
    "For Ages 50+",
    "Smoke-Free Friendly",
  ],
} as const;

/**
 * Get display name for sort option
 */
export function getSortDisplayName(sortId: string): string {
  return (
    SORT_ID_TO_DISPLAY[sortId] ||
    sortId.charAt(0).toUpperCase() + sortId.slice(1)
  );
}

/**
 * Get sort ID from display name
 */
export function getSortId(displayName: string): string {
  const entry = Object.entries(SORT_MAPPING).find(
    ([, display]) => display === displayName
  );
  return entry ? entry[0] : displayName.toLowerCase();
}
