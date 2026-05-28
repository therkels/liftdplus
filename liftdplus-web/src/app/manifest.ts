import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Liftd+",
    short_name: "Liftd+",
    description: "Cannabis education for cautious adults",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#6b938c",
  };
}
