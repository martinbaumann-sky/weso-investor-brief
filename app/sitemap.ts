import type { MetadataRoute } from "next";

const site = "https://www.weso.click";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${site}/pitch`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
