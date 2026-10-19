// 构建后生成 sitemap.xml 与 robots.txt（`rspress build` 之后的收尾步骤）。
// 条目扫 build/ 下实际产出的 .html 清单得出：API 参考由 typedoc 生成，路由数随手写随时变，
// 扫描产物比维护一张路由表可靠。地址一律取无后缀的规范形式，与 canonical 保持一致。
// 只在正式站生成——镜像站靠页内 noindex 退索引，若同时发布一份自指的 sitemap，等于让它
// 自荐进索引，与 noindex 自相矛盾。
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalHref, IS_MIRROR, siteHref, ZH_PREFIX } from "./site-config.ts";

const docsRoot: string = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildDir: string = path.join(docsRoot, "build");

/** 语言树：默认语言无前缀，其余语言挂在各自前缀下；顺序决定 alternate 的排列 */
const LOCALES: readonly { lang: string; prefix: string }[] = [
  { lang: "en", prefix: "" },
  { lang: "zh", prefix: ZH_PREFIX },
];
const DEFAULT_LANG = "en";

const isLocalized = (route: string, prefix: string): boolean =>
  prefix !== "" && (route === prefix || route.startsWith(`${prefix}/`));

/** 路由属于哪棵语言树（非默认语言看前缀，其余归默认语言） */
const langOf = (route: string): string =>
  LOCALES.find(({ prefix }) => isLocalized(route, prefix))?.lang ?? DEFAULT_LANG;

/** 折掉语言前缀后的路由，作为同页各语言版本的配对键 */
const pairingKey = (route: string): string => {
  const prefix = LOCALES.find((l) => isLocalized(route, l.prefix))?.prefix;
  if (!prefix) return route;
  return route.slice(prefix.length) || "/index.html";
};

/** build/ 下的页面路由（posix，以 / 开头）；404 页不进 sitemap */
function collectRoutes(dir: string): string[] {
  const routes: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html") && entry.name !== "404.html") {
        routes.push(`/${path.relative(buildDir, full).split(path.sep).join("/")}`);
      }
    }
  };
  walk(dir);
  return routes.sort();
}

function writeSeoFiles(): void {
  if (IS_MIRROR) {
    console.log("[seo] mirror build: no sitemap/robots (see the noindex meta)");
    return;
  }
  // 同页各语言版本归入一组：sitemap 的每条 <url> 都带上整组的 alternate，供各语言互相指向
  const groups = new Map<string, Map<string, string>>();
  for (const route of collectRoutes(buildDir)) {
    const key = pairingKey(route);
    const group = groups.get(key) ?? new Map<string, string>();
    group.set(langOf(route), route);
    groups.set(key, group);
  }
  const urls: string[] = [];
  for (const group of groups.values()) {
    const alternates = LOCALES.filter(({ lang }) => group.has(lang)).map(({ lang }) => ({
      lang,
      href: canonicalHref(group.get(lang) as string),
    }));
    const xDefault = alternates.find(({ lang }) => lang === DEFAULT_LANG)?.href;
    const alternateTags = alternates
      .map(
        ({ lang, href }) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`,
      )
      .concat(
        xDefault
          ? [`    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefault}"/>`]
          : [],
      )
      .join("\n");
    for (const { href } of alternates) {
      urls.push(["  <url>", `    <loc>${href}</loc>`, alternateTags, "  </url>"].join("\n"));
    }
  }
  writeFileSync(
    path.join(buildDir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`,
  );
  const sitemapUrl = siteHref("/sitemap.xml");
  writeFileSync(
    path.join(buildDir, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`,
  );
  console.log(`[seo] sitemap: ${urls.length} urls; robots.txt: Sitemap ${sitemapUrl}`);
}

writeSeoFiles();
