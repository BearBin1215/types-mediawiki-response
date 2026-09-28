import path from "node:path";
import { defineConfig } from "@rspress/core";

const root = import.meta.dirname;

const base = "/types-mediawiki-response/";

export default defineConfig({
  root,
  outDir: path.join(root, "build"),
  base,
  title: "types-mediawiki-response",
  description: "TypeScript types for MediaWiki Action API responses",
  locales: [
    {
      lang: "en",
      label: "English",
      title: "types-mediawiki-response",
      description: "TypeScript types for MediaWiki Action API responses",
    },
    {
      lang: "zh",
      label: "中文",
      title: "types-mediawiki-response",
      description: "MediaWiki Action API 响应的 TypeScript 类型",
    },
  ],
  lang: "en",
  llms: true,
  globalStyles: path.join(root, "styles/global.css"),
  markdown: {
    link: {
      checkDeadLinks: true,
    },
  },
  themeConfig: {
    editLink: {
      docRepoBaseUrl: "https://github.com/BearBin1215/types-mediawiki-response/tree/main/docs",
    },
    lastUpdated: true,
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/BearBin1215/types-mediawiki-response",
      },
      {
        icon: "npm",
        mode: "link",
        content: "https://www.npmjs.com/package/types-mediawiki-response",
      },
    ],
  },
  route: {
    exclude: ["**/rspress.config.ts", "**/scripts/**", "**/build/**", "**/theme/**"],
  },
  builderConfig: {
    performance: {
      buildCache: {
        cacheDirectory: path.join(root, "../node_modules/.cache/rspress-docs"),
      },
    },
  },
});
