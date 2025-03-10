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
    name: "GridTip – F1 Tipping",
    description:
      "Guess the outcome of the Formula One season with your friends. Predict the outcome of the Grand Prix weekends, and the championships. Have fun and find out who claims the tipping podium!",
    defaultLocale: "en-au",
    indexable: true,
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
      link: [
        { rel: "manifest", href: "/site.webmanifest" },
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
