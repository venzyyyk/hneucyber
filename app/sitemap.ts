import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/register", "/gallery"].map((path) => ({ url: `${siteUrl}${path}` }));
}
