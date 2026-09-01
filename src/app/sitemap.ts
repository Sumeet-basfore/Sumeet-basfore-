import type { MetadataRoute } from "next";
import { portfolio } from "@/data/portfolio";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: portfolio.siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
