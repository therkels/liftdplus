/** @liftdplus on Instagram */
export const INSTAGRAM_USERNAME = "liftdplus";
export const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/liftdplus/";
export const INSTAGRAM_PROFILE_EMBED_URL = "https://www.instagram.com/liftdplus/embed";

/**
 * Optional post URLs for oEmbed grid (official embed.js).
 * Set INSTAGRAM_POST_URLS in .env.local as comma-separated URLs.
 * When unset, the profile iframe embed shows the full @liftdplus feed grid.
 */
export function getInstagramPostUrls(): string[] {
  return (
    process.env.INSTAGRAM_POST_URLS?.split(",").map((u) => u.trim()).filter(Boolean) ?? []
  );
}
