import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "docsmith", short_name: "docsmith", start_url: "/", display: "standalone", background_color: "#ebe8e1", theme_color: "#ebe8e1", icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }] };
}
