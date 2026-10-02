import type { MetadataRoute } from "next";

const baseUrl = "https://justbabyluv.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/timeline",
        "/reminders",
        "/baby-steps",
        "/settings",
        "/onboarding",
        "/login",
        "/signup",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
