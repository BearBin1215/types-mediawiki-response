// 首页的仿 IDE 代码演示（quickinfo 悬浮卡、报错悬浮卡与终端面板），
// 挂在 afterFeatures 插槽。其余主题组件原样透传默认主题。
import { Layout as DefaultLayout } from "@rspress/core/theme-original";
import { HeroDemo } from "./components/HeroDemo";

export * from "@rspress/core/theme-original";

export function Layout(props: Parameters<typeof DefaultLayout>[0]) {
  return <DefaultLayout {...props} afterFeatures={<HeroDemo />} />;
}
