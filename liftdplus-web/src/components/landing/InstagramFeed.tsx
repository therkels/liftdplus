"use client";

import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
import {
  INSTAGRAM_PROFILE_EMBED_URL,
  INSTAGRAM_PROFILE_URL,
  INSTAGRAM_USERNAME,
} from "@/config/instagram";
import styles from "@/app/page.module.css";

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

type InstagramFeedProps = {
  showLabel?: boolean;
};

export default function InstagramFeed({ showLabel = true }: InstagramFeedProps) {
  const [embeds, setEmbeds] = useState<string[]>([]);
  const [fetching, setFetching] = useState(true);
  const usePostGrid = embeds.length > 0;

  const processEmbeds = useCallback(() => {
    window.instgrm?.Embeds.process();
  }, []);

  useEffect(() => {
    fetch("/api/instagram/embeds")
      .then((res) => res.json())
      .then((data: { embeds?: string[] }) => {
        setEmbeds(Array.isArray(data.embeds) ? data.embeds : []);
      })
      .catch(() => setEmbeds([]))
      .finally(() => setFetching(false));
  }, []);

  useEffect(() => {
    if (!fetching && usePostGrid) {
      processEmbeds();
    }
  }, [fetching, usePostGrid, embeds, processEmbeds]);

  return (
    <section className={styles.instagramFeed} aria-label="LIFTD+ on Instagram">
      {showLabel && (
        <p className={styles.instagramFeedLabel}>
          Follow{" "}
          <a href={INSTAGRAM_PROFILE_URL} target="_blank" rel="noopener noreferrer">
            @{INSTAGRAM_USERNAME}
          </a>
        </p>
      )}

      {fetching && (
        <p className={styles.instagramFeedLoading} aria-live="polite">
          Loading Instagram…
        </p>
      )}

      {!fetching && usePostGrid && (
        <div className={styles.instagramGrid}>
          {embeds.map((html, index) => (
            <div
              key={`ig-embed-${index}`}
              className={styles.instagramGridItem}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </div>
      )}

      {!fetching && !usePostGrid && (
        <iframe
          src={INSTAGRAM_PROFILE_EMBED_URL}
          title={`LIFTD+ (@${INSTAGRAM_USERNAME}) on Instagram`}
          className={styles.instagramProfileFrame}
          loading="lazy"
          allow="encrypted-media; fullscreen"
        />
      )}

      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={processEmbeds}
      />
    </section>
  );
}
