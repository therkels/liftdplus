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
  "Cannabis 101": "cannabis_101",

  // Format tags
  "Blog Post": "blog",
  "Image Carousel": "carousel", 
  "Micro Story": "micro_story",
  "Moodboard": "moodboard",

  // Audience tags
  "BIPOC": "bipoc",
  "50+": "fifty_plus",
  "First-Time": "first_time",
  "Parents": "parents",
  "Women": "women"
} as const;

// Reverse mapping for ID to display name
const ID_TO_DISPLAY_MAPPING = Object.fromEntries(
  Object.entries(TAG_MAPPING).map(([display, id]) => [id, display])
);

/**
 * Convert display names to tag IDs for API calls
 */
export function mapDisplayNamesToIds(displayNames: string[]): string[] {
  return displayNames
    .map(name => TAG_MAPPING[name as keyof typeof TAG_MAPPING])
    .filter(Boolean); // Remove undefined values
}

/**
 * Convert tag IDs to display names for UI display
 */
export function mapIdsToDisplayNames(ids: string[]): string[] {
  return ids
    .map(id => ID_TO_DISPLAY_MAPPING[id])
    .filter(Boolean); // Remove undefined values
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
  format?: string[];
}): URLSearchParams {
  const params = new URLSearchParams();
  
  // Always add sort_by
  params.append("sort_by", filters.sortBy || "popular");
  
  // Map display names to tag IDs for each filter type
  if (filters.category && filters.category.length > 0) {
    const categoryIds = mapDisplayNamesToIds(filters.category);
    categoryIds.forEach(id => params.append("category", id));
  }
  
  if (filters.audience && filters.audience.length > 0) {
    const audienceIds = mapDisplayNamesToIds(filters.audience);
    audienceIds.forEach(id => params.append("audience", id));
  }
  
  if (filters.format && filters.format.length > 0) {
    const formatIds = mapDisplayNamesToIds(filters.format);
    formatIds.forEach(id => params.append("format", id));
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
    "Cannabis 101"
  ],
  format: [
    "Blog Post",
    "Image Carousel", 
    "Micro Story",
    "Moodboard"
  ],
  audience: [
    "BIPOC",
    "50+",
    "First-Time",
    "Parents",
    "Women"
  ]
} as const;
