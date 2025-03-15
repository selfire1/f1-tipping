const siteConfig = {
  name: "GridTip – F1 Tipping",
  description:
    "Guess the outcome of the Formula One season with your friends. Predict the outcome of the Grand Prix weekends, and the championships. Have fun and find out who claims the tipping podium!",
};

export default defineNuxtConfig({
  compatibilityDate: "2025-03-10",
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
  fonts: {
    defaults: {
      weights: ["400", "500", "600", "700"],
    },
  },
  routeRules: {
    "/tipping/**": {
      ssr: false,
    },
    "/auth/**": {
      ssr: false,
    },
    "/join/**": {
      ssr: false,
    },
  },
  app: {
    head: {
      titleTemplate: `%s | ${siteConfig.name}`,
      title: siteConfig.name,
      meta: [
        {
          name: "description",
          content: siteConfig.description,
        },
        {
          content: siteConfig.name,
          property: "og:title",
        },
        {
          content: siteConfig.description,
          property: "og:description",
        },
      ],
      link: [
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
  modules: ["@nuxt/icon", "@nuxt/image", "@nuxt/ui", "@nuxt/fonts"],
});
