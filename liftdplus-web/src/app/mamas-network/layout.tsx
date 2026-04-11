import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cannabis, Without the Guesswork · The Mama's Network × LIFTD+",
  description:
    "A casual evening for parents who are curious about cannabis and just want straight answers. Thursday, April 16 · 6pm · Little Break Cowork · Michigan · Free to attend.",
  openGraph: {
    title: "Cannabis, Without the Guesswork",
    description:
      "A casual evening for parents who are curious about cannabis and just want straight answers. Thursday, April 16 · 6pm · Free to attend.",
    url: "https://liftdplus.com/mamas-network",
    siteName: "LIFTD+",
    images: [
      {
        url: "/images/mamas-network-og.png",
        width: 1200,
        height: 630,
        alt: "Cannabis, Without the Guesswork — The Mama's Network × LIFTD+",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cannabis, Without the Guesswork",
    description: "A casual evening for parents curious about cannabis. April 16 · 6pm · Free.",
    images: ["/images/mamas-network-og.png"],
  },
};

export default function MamasNetworkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
