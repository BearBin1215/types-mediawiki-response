import path from "node:path";
import { defineConfig } from "@rspress/core";

const root = import.meta.dirname;

// 同一份配置供两个部署目标使用：GitHub Pages 把站点挂在仓库子路径下（保留作备份），
// Cloudflare Pages 以根域提供服务（正式站）。GitHub 侧取默认值，Cloudflare 项目侧
// 设 DOCS_BASE=/ 与 DOCS_SITE_ORIGIN=https://types-mediawiki-response.pages.dev。
const base = process.env.DOCS_BASE ?? "/types-mediawiki-response/";
const siteOrigin = process.env.DOCS_SITE_ORIGIN ?? "https://bearbin1215.github.io";

export default defineConfig({
  root,
  outDir: path.join(root, "build"),
  base,
  siteOrigin,
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
