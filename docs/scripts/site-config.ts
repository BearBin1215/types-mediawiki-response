// 文档站的两个部署目标共享的取值：Cloudflare Pages 是正式站，GitHub Pages 是备份镜像。
// Rspress 配置与构建后的 sitemap/robots 生成脚本都从这里取值，避免同一条事实写两遍
// （地址形态一旦不同，sitemap 就会与站点自身对不上）。
// 正式站由 Cloudflare 项目环境变量给出 DOCS_BASE=/ 与 DOCS_SITE_ORIGIN=<pages.dev 域>，
// GitHub Pages 侧取下面各默认值。

/** 部署位置的根路径：GitHub Pages 挂在仓库子路径下，Cloudflare Pages 是根域 */
export const BASE: string = process.env.DOCS_BASE ?? "/types-mediawiki-response/";

/** 当前部署自身的站点源 */
export const SITE_ORIGIN: string = process.env.DOCS_SITE_ORIGIN ?? "https://bearbin1215.github.io";

/** 唯一对外正式域：canonical 与 sitemap 一律指向它 */
export const CANONICAL_ORIGIN: string =
  process.env.DOCS_CANONICAL_ORIGIN ?? "https://types-mediawiki-response.pages.dev";

/** 备份镜像构建：GitHub Pages 工作流设 DOCS_MIRROR=1，产物带 noindex */
export const IS_MIRROR: boolean = process.env.DOCS_MIRROR === "1";

/** 站点以无后缀 URL（cleanUrls）为规范形式 */
export const CLEAN_URLS = true;

/** 默认语言（en）之外的语言树挂在 /zh 下 */
export const ZH_PREFIX = "/zh";

/** 折掉路由的 index.html / .html 尾缀：目录首页保留目录形态的尾斜杠 */
function stripHtmlSuffix(routePath: string): string {
  return routePath.replace(/index\.html$/, "").replace(/\.html$/, "");
}

function removeTrailingSlash(p: string): string {
  return p.endsWith("/") ? p.slice(0, -1) : p;
}

/** 路由的规范地址（canonical 与 sitemap 的 loc 都用它） */
export function canonicalHref(routePath: string): string {
  return `${CANONICAL_ORIGIN}${stripHtmlSuffix(routePath)}`;
}

/** 默认语言树上同一页的规范地址，用作 hreflang 的 x-default */
export function defaultLocaleHref(routePath: string): string {
  const stripped = routePath.replace(/^\/zh(?=\/|$)/, "");
  return canonicalHref(stripped === "" ? "/" : stripped);
}

/** 当前部署自身的绝对地址（robots.txt 里的 Sitemap 指向它自己） */
export function siteHref(routePath: string): string {
  const p = stripHtmlSuffix(routePath);
  return `${SITE_ORIGIN}${removeTrailingSlash(BASE)}${p.startsWith("/") ? p : `/${p}`}`;
}
