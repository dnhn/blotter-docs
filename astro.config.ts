import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://blotter.nhan.dev",
  compressHTML: true,
  integrations: [
    sitemap({
      changefreq: "monthly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.endsWith("/404"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Fraunces",
      cssVariable: "--font-fraunces",
      weights: [400, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Figtree",
      cssVariable: "--font-figtree",
      weights: [400, 800],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "EB Garamond",
      cssVariable: "--font-garamond",
      weights: [400, 500],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: ["Georgia", "serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Ubuntu Mono",
      cssVariable: "--font-ubuntu-mono",
      weights: [400, 700],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["Menlo", "Consolas", "monospace"],
    },
  ],
});
