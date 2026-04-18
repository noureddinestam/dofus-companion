import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dofus Companion",
    short_name: "Dofus Companion",
    description: "L'overlay qui tient dans Alt+D.",
    icons: [
      { src: "/brand/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    theme_color: "#0C0E12",
    background_color: "#0C0E12",
    display: "standalone",
  };
}
