import path from "node:path";
import { defineConfig } from "@rspress/core";
import {
  BASE,
  canonicalHref,
  CLEAN_URLS,
  defaultLocaleHref,
  IS_MIRROR,
  SITE_ORIGIN,
} from "./scripts/site-config.ts";

const root = import.meta.dirname;

/** 镜像站（GitHub Pages 备份）整站退索引：同一内容不必在两个域各占一份索引 */
const MIRROR_ROBOTS_TAG: [string, Record<string, string>] = [
  "meta",
  { name: "robots", content: "noindex, follow" },
];

export default defineConfig({
  root,
  outDir: path.join(root, "build"),
  base: BASE,
  siteOrigin: SITE_ORIGIN,
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
  // 页面级 SEO 标签：canonical 指向唯一正式域（镜像站也指向它，两域内容不作两处竞争），
  // x-default 指向默认语言树上同一页。默认语言的 hreflang 由 rspress 的 alternate 链接给出。
  head: [
    (route) => ["link", { rel: "canonical", href: canonicalHref(route.routePath) }],
    (route) => [
      "link",
      { rel: "alternate", hreflang: "x-default", href: defaultLocaleHref(route.routePath) },
    ],
    ...(IS_MIRROR ? [MIRROR_ROBOTS_TAG] : []),
  ],
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
    // 无后缀 URL 是站点的规范形式：Cloudflare Pages 把 /x.html 308 到 /x，链接直接写成
    // 无后缀就少一跳；GitHub Pages 侧同样把无后缀解析到同名 .html，两侧一致。
    cleanUrls: CLEAN_URLS,
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
