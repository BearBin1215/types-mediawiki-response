# AGENTS.md

MediaWiki Action API 响应类型库。

本文件是 agent 操作手册：定位、行为准则、目录结构、命令、工作流与硬约束速查。方法论、理由、例子与踩坑在 `dev-docs/authoring.md`；字段级事实在类型的 JSDoc 与 `tests/fixtures/`。

## 定位

- 只覆盖响应类型，不定义 `mw.Api` 请求参数。
- 纯类型包：零运行时依赖，产物只有 `.d.ts`。
- 针对 `formatversion=2` 编写，不覆盖 fv1；类型覆盖 MediaWiki 1.39–1.47** 的字段并集。
- 类型写自真实响应 fixture，不做代码生成。
- 默认只覆盖 MediaWiki 核心，扩展字段拆为可选包，消费方一条 type-only import 激活。

## 行为准则

- **拒绝猜测**：字段、枚举、版本事实只认证据（paraminfo、源码、fixture），拿不到就分层降级并如实标证据级别（见 `dev-docs/authoring.md`「可移植替代」），不虚构没观测到的形状。
- **冲突回源码，拿不准问用户**：docstring / 类型声明 / 旧文档与实测打架时回源码裁定，不死守单一来源；无法自行裁定（缺环境 / 缺权限 / 形状存疑）就提选项让用户定或要求配置对应环境，别默默选一个。
- **先探测环境、改状态先确认**：缺依赖就回退或先问，起删容器 / 装扩展 / 覆盖 fixture 前先征得同意，别假装跑过（操作细节见 `dev-docs/authoring.md`「agent 操作准则」）。
- **回核一片、就地纠错**：改一处顺手重核同模块既有声明；修复错误直接改原文，不写只有当前上下文能懂的会话流水。

## 目录结构

```
├── scripts/fetch-fixtures.ts    # 拉取真实响应样本
├── src/
│   ├── envelope/                # 响应信封：ApiEnvelope / ApiError / ApiResponseWith
│   ├── common/                  # 共享原子类型：Flag、Timestamp、ContentModel……
│   ├── core/                    # MediaWiki 核心模块：单模块 action 一文件，query= 一目录
│   │   └── query/               # 查询框架 + 每个 prop/list/meta 一文件（声明合并）
│   └── extensions/              # 扩展按需启用包（不进默认 barrel，子路径 exports）
├── tests/
│   ├── core/                    # 与 src/core 同构：<action>/ 一 action 一目录，query/ 对应 src/core/query
│   ├── envelope/                # 信封断言：ApiEnvelope / ApiError / ApiResponseWith
│   ├── extensions/              # 与 src/extensions 同构：扩展包断言
│   ├── fixtures/                # 真实响应样本（入库，事实来源；core/ envelope/ extensions/ 分组）
│   └── typeutil.ts              # 断言辅助类型（ExtraKeys）
├── dev-docs/                    # 内部开发笔记（不上文档站）
├── examples/                    # 三个消费场景最小示例（web-ts/web-js/node-bot）
└── docs/                        # 文档站（Rspress，pnpm workspace 子包，部署 GitHub Pages）
    └── en/ | zh/                # 双语内容，en 为默认语言；api/ 由 typedoc 生成（gitignore）
```

## 命令

```bash
pnpm typecheck      # 类型检查；tests 下的类型断言随此步验证
pnpm lint           # oxlint
pnpm format         # oxfmt（--check 仅校验）
pnpm test           # 类型断言（等价 typecheck：本包的“测试”就是 tests/ 下的 .test-d.ts）
pnpm audit:literals # 批量审计：fixture 内联字面量 satisfies 声明类型；新 fixture 须先在脚本 REGISTRY 登记
pnpm check:ext      # 外部消费方 harness：验证扩展按需激活机制（含 emit 擦除）
pnpm check:pack     # 发布安全：build 后用 ATTW 校验各 moduleResolution 下的类型解析
pnpm check:examples # build 后对 examples/ 三个消费场景示例做 typecheck（发布形态的集成校验）
pnpm check          # format:check + lint + test + audit:literals + check:ext + check:pack + check:examples
pnpm build          # 产出 dist
pnpm fetch:fixtures # 刷新 tests/fixtures/（--check 只验不写）
pnpm docs:dev       # 文档站开发服务器（先跑 typedoc 生成 API 参考）
pnpm docs:build     # 文档站构建（产物 docs/build/，CI 部署 GitHub Pages）
```

发布前 `pnpm pack --dry-run` 确认产物仅含 `dist/*.d.ts` 与 README。

开发本仓库需 Node >=22（`bumpp` 12 的工具链要求），包的 `engines` 对消费方保持 `>=20`，两者无关。

## 工作流

动手前先按「行为准则」探测环境 / 回退 / 问用户，改本地或不可逆状态前征得同意（环境细节见 `dev-docs/authoring.md`「环境与取证」）。

新增或扩展一个模块（详细配方见 `dev-docs/authoring.md` 的「How-to」）：

1. `pnpm fetch:fixtures <路径片段>` 取该模块的真实响应（只抽改动的几条，避免抖全量 diff）。
2. 以 fixture 为准在 `src/core/` 手写类型，单模块 action 一文件，如 query 此类内容较多的设目录，`prop=`/`list=` 字段用声明合并并入共享的 `ApiPage` / `ApiQueryResult`。
3. 在 `tests/` 写类型断言，`pnpm typecheck` 验证。

## 文档分工

- **本文件（AGENTS.md）= 操作手册**：硬约束速查 + 命令 + 结构，每条只写“该怎么做”。
- **`dev-docs/authoring.md` = 知识库**：环境与取证、证据与审查、建模规范、维护任务、踩坑清单、已知结论与开放问题。
- **消费方文档**：文档站的 API 参考由 typedoc 从 `.d.ts` 生成，JSDoc 全英文、两语言共享同一份产物，唯一手写例外是 API 总览页（双语，源在 `docs/scripts/api-overview/`，由 `generate-api.ts` 按语言注入）；指南页手写。

## 编写规范

### JSDoc

- **面向消费方**：src/ 内只写 API 事实，不写源码依据、不提作者侧项目、不写论证过程、不写开发日记。
- **一体成型**：修改时不残留修改痕迹，保持整体看上去是一次完工。
- **英文JSDoc**：src/ 内的 JSDoc 用英文，开发用脚本内注释可用中文。
- **通用举例**：举例只用 mediawiki.org 一族，如链接类字段只用 `www.mediawiki.org`、interwiki 前缀用 `mw`。

### 建模与断言

- 字段默认可选（`?`）；仅当基线源码对该形状无条件写入、且各版本实测恒定才必选。合并视图（`ApiPage`/`ApiQueryResult`）成员一律可选。
- 扩展点留可声明合并的空 interface，别用 `Record<string, unknown>` 之类封死。
- 字符串枚举用开放联合 `'known' | … | (string & {})`。
- 断言用手写 `satisfies` 样本保字面量精度；导入的 JSON fixture 已被拓宽，只做结构校验。
- 必选性用契约断言钉住（`expectTypeOf<T>().toHaveProperty('x').toEqualTypeOf<…>()`）：`satisfies` 样本对可选字段一样通过，证明不了必选。
- 别用 JSDoc 复述必选性（不写“always present”）：无 `?` 即事实；仅当兄弟字段被 `*prop` 门控时，在类型 docstring 里点一次。
- `ApiXxxResponse` 只建模**成功**形状；错误归 `ApiErrorResponse`，要表达“可能出错”用 `ApiResponseWith`。
- 扩展字段写在自己的包文件里，用 `declare module` 增广进核心接口（键名与落点都收进包，别靠消费方手写）。
- 弃用字段照常建模并标 `@deprecated`（起始版本 + 替代项），不要略过；后版本才有的字段标 `@since MediaWiki X.Y`。版本事实一律走标签，不写进叙述句。

### 取证来源

- 参数前缀与合法枚举值以 `action=paraminfo` 为准，别按字段名或旧文档猜。
- 完备性与值类型按 paraminfo + 探针 + 同版本 PHP 源码三重交叉，只看 fixture 会漏也会臆造。
- `list=` 结果不一定挂在 `query` 下；参数互斥等约束只能从 `invalidparammix` 学到，写进 JSDoc。

### fv2 线格式

- 布尔标记出现即 `true`、否则整键缺省 → `Flag`；会明确回 `false` 的配置类真布尔 → `boolean`。判据看源码右侧表达式：`= ''`/`= true` → `Flag`，`(bool)`/比较 → `boolean`。
- 无值可能返回空串而非省略整键 → 建模为 `T | ''`，不是单纯可选。
- 数字偶尔以字符串返回、列表默认是数组 → 一律以 fixture 为准，不臆测。
- 连字符键名逐字建模，不要改写成驼峰。
- PHP 空 map 序列化成 `[]`，与空数组无法区分 → 值联合需带 `unknown[]`。
- 遗留 XML 的 `*` 内容键 → `'*'?: string`。
