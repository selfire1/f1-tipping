const siteConfig = {
  title: "My nuxt app",
  description: "",
};

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  css: ["~/assets/css/main.css"],
  devtools: { enabled: false },
  runtimeConfig: {
    turso: {
      databaseUrl: "",
      authToken: "",
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  image: {
    provider: "ipx",
  },
  site: {
    url: "", // TODO: add url
    name: "My new app", // TODO: add name
    description: "", // TODO: description
    defaultLocale: "en-au",
    indexable: false, // TODO: Mark as indexable
  },
  fonts: {
    defaults: {
      weights: ["400", "500", "600"],
    },
  },
  // seo
  ogImage: {
    enabled: false,
  },
  sitemap: {
    enabled: true,
  },
  robots: {
    enabled: true,
  },
  seo: {
    // seo utils
    enabled: true,
  },
  routeRules: {
    "/tipping/*": {
      ssr: false,
    },
    "/auth/*": {
      ssr: false,
    },
  },
  schemaOrg: {
    enabled: false,
  },
  linkChecker: {
    enabled: true,
  },
  app: {
    head: {
      meta: [
        {
          name: "theme-color",
          content: "#FFFFFF",
          media: "(prefers-color-scheme: light)",
        },
        {
          name: "theme-color",
          content: "#0F172A",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      link: [
        // { rel: "manifest", href: "/site.webmanifest" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        {
          rel: "icon",
          href: "/favicon-32x32.png",
          type: "image/png",
          sizes: "32x32",
        },
        {
          rel: "icon",
          href: "/favicon-16x16.png",
          type: "image/png",
          sizes: "16x16",
        },
      ],
    },
  },
  modules: [
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/seo",
    "@nuxt/ui",
    "@nuxt/fonts",
  ],
});
