import type { Metadata } from "next";

import ResourcesPageClient from "./ResourcesPageClient";

export const metadata: Metadata = {
  title: "Resources | LIFTD+",
  description:
    "Cannabis education articles and guides for beginners — explore sleep, stress, focus, and more.",
};

export default function ResourcesPage() {
  return <ResourcesPageClient />;
}
