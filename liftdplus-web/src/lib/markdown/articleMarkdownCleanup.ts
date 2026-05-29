export type ParsedRelatedArticle = {
  title: string;
  slug: string;
};

/** Simple cleanup: remove "### More to Explore" section from markdown */
export function removeMoreToExploreSection(markdown: string): string {
  return markdown
    .replace(/#{2,3}\s*More to Explore\s*\n+([\s\S]*?)(?=\n#{1,3}\s|\n---\n|Ready for more|$)/i, '')
    .replace(/#{2,3}\s*Ready for more[\s\S]*$/i, '')
    .trim();
}

export function prepareArticleMarkdown(markdown: string) {
  const cleanContent = removeMoreToExploreSection(markdown);
  return { cleanContent };
}
