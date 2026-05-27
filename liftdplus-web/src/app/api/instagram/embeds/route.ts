import { NextResponse } from "next/server";
import { getInstagramPostUrls } from "@/config/instagram";

type OEmbedResponse = {
  html?: string;
};

async function fetchPostEmbed(postUrl: string): Promise<string | null> {
  try {
    const oembedUrl = new URL("https://graph.facebook.com/v21.0/instagram_oembed");
    oembedUrl.searchParams.set("url", postUrl);
    oembedUrl.searchParams.set("omitscript", "true");
    oembedUrl.searchParams.set("hidecaption", "false");
    oembedUrl.searchParams.set("maxwidth", "540");

    const res = await fetch(oembedUrl.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as OEmbedResponse;
    return typeof data.html === "string" ? data.html : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const urls = getInstagramPostUrls();
  const embeds = (await Promise.all(urls.map(fetchPostEmbed))).filter(
    (html): html is string => Boolean(html)
  );

  return NextResponse.json({ embeds });
}
