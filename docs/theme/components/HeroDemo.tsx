import { useLayoutEffect, useRef } from "react";
import { useI18n } from "@rspress/core/runtime";
import { HERO_ERROR_HTML, HERO_ERROR_TERM_HTML, HERO_HOVER_HTML } from "./hero-demo.generated";
// oxlint-disable-next-line no-unassigned-import
import "./HeroDemo.css";

// 仿 IDE 编辑器窗口：chrome + generate-hero.ts 的静态高亮产物
// （签名/文档/报错均取自真实编译器，非手写）。传入 term 时终端作为
// 同一窗口的底部面板停靠（VS Code 集成终端的形态）。
// 卡片按 CSS 锚在 token 一侧且宽度固定，分栏布局下编辑器变窄时会被顶出
// 边界——挂载与尺寸变化时做一次水平 clamp：左右都不越出编辑器内缘，
// 放不下时贴边并收窄。报错卡默认隐藏（悬停触发），跳过。
function Editor({ html, term }: { html: string; term?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const sync = () => {
      const pre = root.querySelector<HTMLElement>("pre");
      const anchor = root.querySelector<HTMLElement>(".hero-anchor");
      const card = root.querySelector<HTMLElement>(".hero-hover");
      if (!pre || !anchor || !card || card.offsetParent === null) return;
      card.style.right = "";
      card.style.left = "";
      card.style.width = "";
      const preBox = pre.getBoundingClientRect();
      const innerLeft = 20;
      const innerRight = pre.clientWidth - 20;
      const cardBox = card.getBoundingClientRect();
      let left = cardBox.left - preBox.left;
      const width = cardBox.width;
      if (width >= innerRight - innerLeft) {
        left = innerLeft;
        card.style.width = `${innerRight - innerLeft}px`;
      } else {
        left = Math.max(innerLeft, Math.min(left, innerRight - width));
      }
      card.style.right = "auto";
      card.style.left = `${left - (anchor.getBoundingClientRect().left - preBox.left)}px`;
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(root);
    document.fonts?.ready.then(sync).catch(() => {});
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={term ? "hero-demo-editor hero-demo-editor--term" : "hero-demo-editor"}
      ref={ref}
    >
      <div className="hero-demo-chrome" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="hero-demo-file">api.ts</span>
      </div>
      <div className="hero-demo-code" dangerouslySetInnerHTML={{ __html: html }} />
      {term ? (
        <div
          className="hero-term-window"
          // generate-hero.ts 的产物：tsc --pretty 排版取自真实诊断
          dangerouslySetInnerHTML={{ __html: term }}
        />
      ) : null}
    </div>
  );
}

export function HeroDemo() {
  const t = useI18n<Record<string, string>>();
  const sections: Array<{
    html: string;
    term?: string;
    flip: boolean;
    title: string;
    desc: string;
  }> = [
    {
      html: HERO_HOVER_HTML,
      flip: false,
      title: t("heroTypesTitle"),
      desc: t("heroTypesDesc"),
    },
    {
      html: HERO_ERROR_HTML,
      term: HERO_ERROR_TERM_HTML,
      flip: true,
      title: t("heroErrorsTitle"),
      desc: t("heroErrorsDesc"),
    },
  ];

  return (
    <div className="hero-showcase">
      {sections.map((s) => (
        <section
          key={s.title}
          className={s.flip ? "hero-showcase-item hero-showcase-item--flip" : "hero-showcase-item"}
        >
          <div className="hero-showcase-text">
            <h3 className="hero-showcase-title">{s.title}</h3>
            <p className="hero-showcase-desc">{s.desc}</p>
          </div>
          <div className="hero-showcase-media">
            <Editor html={s.html} term={s.term} />
          </div>
        </section>
      ))}
    </div>
  );
}
