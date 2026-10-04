# 开发笔记 / Authoring notes

> 给 agent 的**知识库**：环境与取证、建模规范、维护任务、踩坑。**AGENTS.md** 只留硬约束速查（祈使句）；**字段级事实**（某模块有哪些键、必选与否）归类型的 JSDoc 与 `tests/fixtures/`，本文只写**可复用的判断规则**与**踩坑成因**。通用祈使稳定后蒸馏进 AGENTS.md「编写规范」。

**收录边界（写之前先看这里）**

- 只收**跨模块可复用的判断规则**和**踩坑及成因**。字段事实归模块的 JSDoc 与 fixture，不写进本文。
- 不写会话流水：禁止"本批""本次"这类只有当前上下文才能理解的表述；也不维护覆盖清单（以 `src/` 与 README 为准）。发现错处直接改正原文，历史交给 git。
- 一次性操作步骤（容器安装、账号铸造、某模块的状态铺垫）写进对应脚本的注释，本文只留能指导下一次决策的部分。

---

## 1. 环境与取证

### 1.1 本地环境约定

正文只描述能力；容器名、端口、目录**都是作者机器的默认值，均可用环境变量覆盖**（见各脚本头注释），不是全项目契约。以官方 `mediawiki` Docker 镜像（Apache）为例。

| 约定项            | 默认值                                                                      | 覆盖方式                  |
| ----------------- | --------------------------------------------------------------------------- | ------------------------- |
| 基线 1.43 容器    | `mw-fixture`，端点 `localhost:8080`                                         | `MW_CONTAINER` / `MW_API` |
| 逐版本容器        | `mw143`、`mw146` 等                                                         | `MW146_CONTAINER`         |
| MySQL 逐版本舰队  | `mw139g`…`mw143g`（端口 8239+；装 GlobalBlocking，mw143g 另装 CentralAuth） | 自建                      |
| 临时 scratch 目录 | `.mw-scratch/`（已 gitignore）                                              | —                         |
| 本地源码镜像      | `mw-ref/` 下的 core 与扩展全量克隆、逐版本快照                              | 自定                      |

### 1.2 可移植替代（缺环境时怎么取证）

这套环境是**便利手段，不是入模门槛**。取证优先级：**本地可控实例实物 → 公共站实物 → 按 tag 的官方源码 + paraminfo → 手写 `satisfies` 样本**（降到哪一层就如实标证据级别，**不虚构没跑出来的响应**）。

- **取某版本源码**：读官方 `wikimedia/mediawiki`（或扩展仓库）对应 `REL1_xx` tag 的 blob / Gerrit，或 `releases.wikimedia.org` 的 tarball——判据与 `docker cp` 一致。
- **取读接口真实响应**：打公共站（版本通常更高，新键回基线源码复核）；`fetch-fixtures.ts` 的 `MW_API` / `ORG_API` 即走此路。
- **裁定版本边界**：起不了多版本实例时退到「git tag 考古 + 公共站现有 paraminfo」（见 §2.2 下限说明）。
- **只有**需登录 / 需权限的写响应、需造特定状态的读响应，公共站拿不到，才真正依赖可控实例（本地容器只是最省事形态，裸机 / CI / 他人实例皆可）。

### 1.3 agent 操作准则

- **先探测，别假设**：依赖环境的步骤前用一条命令确认就绪（`docker ps`、端点可达、`mw-ref` 拉过没、`.mw-scratch/` 可写），据此走本地或替代路径。
- **读源码前先问"拉过没有"**：需要某版本 PHP 源码定必选性 / 枚举时，先确认本地是否已有；没有就明确问用户拉哪份、能否联网，或改用可移植源。别臆造源码内容当作已读。
- **改动本地状态前先确认**：起 / 删容器、`docker exec` 装扩展、写 `LocalSettings.php`、跑 `update.php` / `install.php` / `createAndPromote.php`、`pnpm fetch:fixtures` 覆盖 `tests/fixtures/`、往 `.mw-scratch/` 写——这些不可逆或环以外的操作先征得同意并说明影响面；纯只读探测（`docker ps`、读文件、打公共站 GET）可直接做。
- **能力优先于具体命令**：把 `docker cp` / 端口 / 容器名先翻译成目标能力（"取 1.43 源码""拿一份需 sysop 的写响应"），再选当前环境够得着的最省事手段；够不着就回退或问用户。

---

## 2. 证据与审查

### 2.1 三重证据交叉

只靠 fixture 与 `ExtraKeys` 检不出两类问题：**声明了却从不返回的键**（臆造 / 改名 / 停于旧文档）与**任何样本都没触发过的条件字段**。成批核查用三重证据：

1. **paraminfo 当分母**：`action=paraminfo&modules=<模块>` 的 `parameters[].type` 给出该模块**全部**合法枚举值，`prefix` 给出参数前缀——"可能产出哪些字段"的权威清单。
2. **最大化探针**：把每个模块所有 `*prop=` 枚举值一次打开（含被标 `deprecated` 的值），逐标题请求，得到实测全集。本地站优先——公共站版本更高，新键要回基线复核。
3. **版本对齐的 PHP 源码**：`docker cp` 出 core `includes/Api/*.php` 与扩展 `Api*/*.php` 直接读（判据是 `$vals['x'] = …` / `addValue(..., 'x', ...)`；值类型看右侧表达式——`(bool)` → 真布尔、`= ''` → 空串、`count()`/`intval()` → 数字）。**这是唯一能裁定"声明了但样本里没有"的凭据。**

参数前缀与合法枚举值一律以 paraminfo 为准，别按字段名或旧文档猜。

**形状可能不在本模块**：`action=parse` 的 `prop=sections`/`prop=tocdata` 的 JSON 由 Parsoid 的 `TOCData` / `SectionMetadata` 产出（`docker cp <容器>:/var/www/html/vendor/wikimedia/parsoid/src/Core/<File>.php`），不在 core。判据同样是「字面量里无条件赋值的键」。

### 2.2 多版本实测（`@since` / `@deprecated` 的裁定手段）

paraminfo 与基线源码只能回答「1.43 有没有」；裁定「从哪个版本起有 / 弃用」要起多版本实例实测：

> **没有多版本实例条件时的下限**：逐版本差异靠「git 考古」（步骤 4：按 `REL1_xx` tag diff 参数定义与赋值点）定版本边界，再用各公共站现有的 paraminfo 抽查佐证——无需本地环境也能落 `@since` / `@deprecated`。

1. **起实例**：官方镜像 `mediawiki:1.39`–`1.46` 各一个（端口按版本映射，如 `-p 8139:80`…`-p 8146:80`）；**1.47 无正式版**，用 mediawiki.org（1.47-wmf）的 paraminfo 覆盖即可。
2. **统一播种**：同一脚本造页面 / 模板 / 分类 / 重定向 / 外链 / 删除的页与文件 / 封禁等，内容一致，字段差异才可归因于版本。
3. **探针与求差**：同一套「最大化参数」请求导出响应键全集、paraminfo 导出参数枚举，逐实例跑一遍后逐版本 diff。**写动作与需登录/需权限的读模块同样逐版本实测**：每个容器建 sysop+bureaucrat 账号、开 `$wgEnableUploads`、逐容器跑认证探针语料。
4. **git 考古补 1.39 之前**：按 tag `git show <tag>:<path>` 对比参数定义（`PARAM_DEPRECATED` / `EnumDef::PARAM_DEPRECATED_VALUES` 等），弃用版本以首个带该标记的 tag 为准。

判读纪律：单版本缺一个键不等于「该版本没有」，先手工复测排除偶发；公共站的枚举差异先查站点配置（mediawiki.org 装了大量扩展），再谈版本差异。

**逐版本的源码必须来自容器本身**：宿主的 `mw-ref/apidump/vNNN` 快照不保证新鲜（曾出现 v141–v145 三个目录里 `defines.php` 都写着 `1.43.9`）。要么 `docker cp` 容器内 `/var/www/html/includes`（**1.46 起 core API 源码从 `includes/api/` 迁至 `includes/Api/`**；宿主文件系统大小写不敏感时二者会冲突，故必须逐版本分开存放），要么用 `mw-ref` 的克隆按 tag 取；两者都要先读 `defines.php` 自验。

**镜像捆绑 ≠ 启用**：目录在 `extensions/` 下躺着但没有 `wfLoadExtension` 的，模块一律未注册。镜像没带的扩展（`mw-ref/ext-git` 的完整克隆里几乎每个扩展都有 REL1_39–REL1_46 八个分支）可 `git archive origin/REL1_xx | docker cp` 离线装进去，追加 `wfLoadExtension` 后**必须跑一次 `php maintenance/update.php`**——**扩展的表要等装载后才建**。真正拿不到的只有两类：上游已删分支的（如 Echo/Thanks 的 REL1_39–REL1_42）与 Wikimedia 内部件（GlobalUserInfo）。

### 2.3 反向审查：找漏标的必选字段

用「逐版本键集比对」的审计脚本换个分母即可：抽取器产出「可选字段清单」（排除合并视图与增广口），逐版本跑源码判定无条件写入，实证比对额外产出可选键的出现/缺席，取交集「**逐版本无条件写入 + 实测从不缺席 + 未被 `*prop` 门控**」。交集只是**候选**，必须逐个回读发射函数。三类假阳性固定出现：

- **同一数组混入别的行生产者**：`action=purge`/`import` 的 invalid 标题行、`action=edit` 的 `result:"Failure"` 分支、`meta=sitematrix` 的 `array_intersect_key`、`action=shortenurl` 的 QR 分支。
- **行级门控启发式过头**：一个 `if` 里连着写好几个键时会被当成「整行条件」而误判无条件（`general` 的 `favicon`/`imagewhitelistenabled`）。
- **配置直传的 map**：`general.galleryoptions` 的成员、SBOM `authors[]`（composer 路径原样透传，不保证 `name`）。
- **字面量自身的键集会随版本漂移**：某发射器在当前版本无条件写 N 个键，**不等于这 N 个键在 1.39–1.47 都有**——要逐版本比**发射函数的那段字面量**，而非只看「该版本有无条件写入点」。

两条必做的反验：**必选化要拿最小参数重跑 + 换一台配置不同的站点**（只靠最大化语料区分不了"core 无条件写"与"请求恰好把这些 prop 全开了"）；自写的逐版本存在性脚本要防**路径前缀不一致**（不同快照目录可能分别以 `v143/`、`v147/` 打头，拿基线路径去其余版本查同一键会造假警报）。

**批量定位手段**：grep `ApiQueryBase::addTitleInfo(` / `setContentValue(`（无条件写某键），命中点即候选，再逐个回读上下文判断是否在分支内。判据对 `prop=` 子项、`action=` 结果对象、扩展包行类型同样适用。

判定为真必选的就改类型并补断言；已核过属假阳性/刻意宽化的写进 §6，避免后续审查重复踩。

### 2.4 自动化审计门禁

- **`pnpm audit:literals`**：把每份 fixture 内联成 TS 字面量 `satisfies` 登记的声明类型——「三重证据」穷举校验的常驻化。不走 resolveJsonModule（避免拓宽），对象字面量的 excess property check 逐层抓「响应有而声明没有」的键。fixture 必须逐份在脚本 REGISTRY 登记目标类型，漏登记/登记失效即失败——登记表兼作「每份 fixture 证明什么」的索引。产物写 `.mw-scratch/`（gitignore，只校验不提交）。
- **`pnpm audit:paraminfo`**：把每个固定枚举 `*prop` 参数的值与全仓声明键对账；改名值（`ids`→`revid`/`rcid` 一类）在脚本 ALLOWLIST 带理由豁免，paraminfo 标记的弃用值跳过。
- **边界**：最大化探针、逐版本写入点分类器、必选性交叉审计依赖本地容器与逐版本源码，留在本地方法论，别排进 `pnpm check`。

---

## 3. 建模规范

### 3.1 合并模式（往响应哪个层级加）

- `prop=` → 往 `ApiPage` 加字段：标量直接加，集合先定义子项 interface 再加数组。
- `meta=` / `list=` → 往 `ApiQueryResult` 加顶层键。
- **框架级键**直接写核心：`normalized`/`pages` 在 `ApiQueryResult`，`continue`/`limits` 在 `ApiQueryResponse`，分页游标加到 `ApiQueryContinue`。
- **同族模块复用行类型**：判据是"同一个 PHP formatter/基类"，不是名字像。行类型放同源文件，其余文件 `import type` 后只写声明合并。但**同族的 `*prop` 扩展键要逐模块核对各自枚举**（`allredirects` 分支独有 `rd_fragment`/`rd_interwiki`），按"同族同形状"复用会漏列。
- 声明合并写 `declare module './index' { interface ApiPage { … } }`，路径是从当前文件看到的 `./index`；承载增强的文件必须是**模块**（含 `import`/`export`）。若只有增强而无导入，别补 `export {}`（`no-useless-empty-export` 会报错）——导出该模块的子项 interface 即可。
- 扩展点留可声明合并的空 interface，别用 `Record<string, unknown>` 封死。

### 3.2 可选性判据（两层，别混）

1. **合并视图（`ApiPage` / `ApiQueryResult`）的成员一律可选**，且不该改成必选——它按构造就是所有请求形状与页面状态的并集。`ApiPageIdentity` 的 `pageid`/`ns`/`title` 同理。
2. **单模块行类型（`list=`/`meta=` 的行、action 的模块对象）**：必选判据是**基线源码对该行无条件写入**（赋值不在任何 `isset($prop[…])` / `if ($fld_*)` / 数据存在性分支内），再叠加 1.39–1.47 实测恒定。只看「多份样本恒定」不够——每模块一份 fixture，这条规则几乎永不触发，会退化成一律可选。

判读源码的赋值形态：

- 无条件写 → 必选：`$vals = ['pageid' => …, 'ns' => …, 'title' => …]`、`ApiQueryBase::addTitleInfo($vals, $title)`（无条件写 `ns`+`title`）、`ApiResult::setContentValue($arr, 'key', …)`。
- `if ($fld_title) { addTitleInfo(…) }`、`if (isset($prop['size']))` → 保持可选。
- **区分「门控整行/整个字面量」与「门控单个键」**：包裹整行字面量的 `if` 只决定记录是否存在，不否定行内键的必选性（`if ($resultPageSet === null)`、`if (!isset($pageMap[…]))`、`if (isset($prop['thumbnail'])) { $vals['thumbnail'] = [source,width,height] }` → 三键仍必选）；只有 `isset($prop[…])` 直接包住单个键才降为可选。
- **`*prop` 参数门控的字段一律保持可选**（`alllinks` 族 `alprop`、`categorymembers` `cmprop`、`exturlusage` `euprop`、`logevents`、`blocks`、`users`、`watchlist`）——类型不编码请求形状。
- **写入点可能不在 API 模块文件里**：PHP 列表解构赋值（`list($r['added'], $r['removed']) = …`）、动态键（`addValue($path, $tag . 's', …)`）、非 `Api*` 协作者类（`EchoModelFormatter`、`CategoryList`）都是无条件写入，别因在 `Api*.php` 里没找到就判可选。
- **必选性必须用契约断言钉住**（`expectTypeOf<T>().toHaveProperty('x').toEqualTypeOf<…>()`）；`satisfies` 样本对可选字段同样通过，证明不了必选。整块键很多时改钉索引访问（`ApiX["k"]`）与 `expectTypeOf<OptionalKeys<T>>()` 二选一：**前者不受扩展包 `declare module` 注入的键影响**，后者会把它们全拉进来因而脆弱。

**`action=` 结果对象的判据**：结果对象多为「单个 `result`/`status` 哨兵 + 分支字段」。哨兵在 switch 之前无条件写入 → 必选；分支字段留在可选。整份结果由**单个数组字面量**构造的 → 字面量里的键全必选。`paction` 型分支（`action=visualeditor` 的 `parse`/`wikitext`/`metadata` 共用一份字面量载荷，`templatesused` 返回 HTML 字符串，`parsefragment` 返回 `{result, content}`）三者各一个响应类型，别用同一个。

**docstring 与类型互为校验**：JSDoc 里已有的「always present」「returned unconditionally」是作者侧断言；若对应类型还是可选，二者必有一错，回源码裁定。反过来，别用 JSDoc 复述必选性——无 `?` 即事实，只在兄弟字段被 `*prop` 门控时在**类型 docstring** 里点一次。

### 3.3 fv2 线格式补充（速查见 AGENTS「编写规范」）

- **数字可能以字符串返回**（跨站 id、数据库列直传的尺寸字段、游标内的片段），反过来 `list=search` 的 `sroffset`、`list=querypage` 的 `qpoffset` 是真数字 → `ApiQueryContinue` 放宽为 `string | number | undefined`。
- **混合键保留为带数字键的对象**（组集合是 `{"0":{…},"operand":"&"}`，`parse` 的 `limitreportdata` 每行是 `{"0":值,"1":限额,"name":…}`）→ 用带索引签名的 interface 容纳，并在 JSDoc 里说明各位含义。
- **`Flag` 还是 `boolean`** 逐模块判、别推而广之：revisions 的 `minor` 恒为布尔、`bot`/`anon` 是 `Flag`；recentchanges 全为真布尔。

### 3.4 页面状态（`query.pages` 的条目形状）

同一份响应可混入不同状态的条目（1.39–1.46 实测一致，与 `ApiPageSet::addMissingTitles`/`addPageById` 吻合）：

| 状态                | 触发                  | 字段                                                      |
| ------------------- | --------------------- | --------------------------------------------------------- |
| 存在                | 普通查询 / generator  | `pageid`、`ns`、`title` 齐全                              |
| missing（按标题查） | `titles=` 不存在的页  | `ns`、`title`、`missing`；**无 `pageid`**                 |
| missing（按 id 查） | `pageids=` 不存在的页 | `pageid`、`missing`；**无 `ns`/`title`**                  |
| invalid             | 非法标题              | `title`、`invalidreason`、`invalid`；**无 `ns`/`pageid`** |
| special             | 特殊页                | `ns`、`title`、`special`；**无 `pageid`**                 |

- `known` 恒与 `missing` 同现；`special` 也可与 `missing` 并存（未定义的特殊页）。这两点使完整判别联合的判别不干净，故**刻意不做**。
- prop 字段**无法**在所有状态上必选（`prop=info` 的字段在 invalid/special 上没有——源码本身无条件写入，是整条分支不产出）。
- 消费方视角：`ApiPageExisting` / `QueryPageExisting<K>` 收窄到「存在页」状态；`QueryPage<K>` 保持全可选（安全默认）。

### 3.5 响应信封与错误族

- 根级通用字段归 `ApiEnvelope`：`batchcomplete`、`servedby`、`curtimestamp`、`requestid`、`warnings`，及错误响应的 `error`/`errors`/`docref`。`continue`/`limits` 只属于 query/generator，放 `ApiQueryResponse`。`batchcomplete` 可与 `continue` 并存（只表示当前批完成，仍可能有后续）。
- **error/warnings 随 `errorformat` 分两族**：默认 `bc` → `error` 对象 + 模块键 `warnings` 对象；modern（plaintext/wikitext/html/raw/none）→ `errors`/`warnings` **数组** + 顶层 `docref`。`warnings` 建模为 `对象 | 数组` 联合，错误响应为 `ApiBcErrorResponse | ApiModernErrorResponse`。
- **有些失败是 in-band 而非顶层错误**（`createaccount` 回 `{status:"FAIL"}`、`emailuser` 回 `{result:"Failure",errors:[…]}`、`clientlogin` 的 `status` 联合）：纳入 `status`/`result` 联合。这类**消息字段随 `errorformat` 分两族，同一字段要写成 `ApiSpecMessage[] | ApiMessage[]`**：`bc` 走 `ApiErrorFormatter::arrayFromStatus` → `{message,params,code,type}`（`ApiSpecMessage`），modern 走 `formatMessageInternal` → `{code,text|html|key+params}`（`ApiMessage`）。硬失败多走顶层错误。
- in-band 消息的**三个例外**别套用上面的联合：① `prop=info` 的 `intestactionsdetail` 在 `bc` 下被 `ApiQueryInfo` 强制切到 `plaintext`，所以 `bc` 请求也产出 `{code,text}`（单独用 `ApiActionPermission` 建模）；② 走 `formatMessage`（而非 `arrayFromStatus`）的字段在 `bc` 下是 `{code,info}`（即 `ApiError` 的形状），modern 才是 `ApiMessage`，`watch.errors` 甚至把两族混在同一数组里；③ GlobalBlocking 的 `action=globalblock` 失败**与 `errorformat` 无关**，恒写在 root `error.globalblock`（`ApiGlobalBlockLegacyError`），既非 `ApiErrorResponse` 也非上述任一形状。
- `ApiXxxResponse` 只建模**成功**形状；错误归 `ApiErrorResponse`，要表达"可能出错"用 `ApiResponseWith`。

### 3.6 消费方视图

- `QueryPage<K>` 基于 `ApiPageIdentity` + `Pick`（纯新增、不影响模块合并），只收窄到**顶层 prop 键**这一层——`slots.main.content` 等子字段仍随子参数可选。
- `QueryPageExisting` / `InfoPageExisting` 把选中的恒有键收紧为必选；恒有性只在存在页投影上成立（invalid/special 条目不产出 prop 字段）。
- 续传游标集中在 `ApiQueryContinue`（单一登记表 + `string | number` 索引签名）：集中登记便于查阅，索引签名对未列出的模块前向兼容。

### 3.7 模块结构上的可复用判断

- **不要假设 `list=` 的结果一定在 `query` 下**：`list=watchlistraw` 写在根级，只请求它时响应**根本没有 `query` 键**。做法：为该模块单列一个不含 `query` 的响应类型，同时把该键并进 `ApiQueryResponse` 供混用请求。
- **区分"prop 值"与"伴生键"**：有的输出键不属于任何 prop 枚举而是自动产出（`prop=modules` 附带 `modulescripts`/`modulestyles`；`prop=tocdata` 附带 `showtoc`）。把它们写进 `prop=` 会报 Unrecognized value。
- **参数互斥要写进 JSDoc**，只能从 `invalidparammix` 错误里学到：`*unique` 与 `*prop=ids`（alllinks 族）、`adrprefix` 与 `adruser`（alldeletedrevisions）、`inprop=preloadcontent|editintro` 要求查询只含单个页面 / 修订。
- **同一数据的两个 prop 可能有两套键名**，不能共享行类型：`prop=sections` 用小写 `toclevel`/`fromtitle`，`prop=tocdata` 用驼峰 `tocLevel`/`hLevel`/`fromTitle`。
- **`generator=` 不新增列表结果键**，只用 `prop=` 填充 `pages`；续传游标另起前缀（`generator=categorymembers` 用 `gcmcontinue`），与 list/prop 形态并排登记在 `ApiQueryContinue`。能否作 generator 的判据是源码 `extends ApiQueryGeneratorBase`（`list=allusers`、`list=logevents`、`prop=extlinks`/`iwlinks`/`langlinks` 不能，别臆造）。**generator 形态的参数默认值与注入时机不同于 list 形态**，别照搬 list 形态的静态默认值去推 generator 的输出。

### 3.8 弃用项

**建模 + `@deprecated` JSDoc，而不是略过。** 尾部 `//` 注释只对源文件读者可见；`@deprecated`（带"自哪个版本 + 用什么替代"）会直接变成删除线与悬浮提示。对类型包来说"该键不存在"比"该键存在但标了弃用"错得多——客户端仍在调这些接口。

弃用事实的三个来源（按优先级，别凭旧文档印象写版本号）：paraminfo 的 `deprecated` 字段 → 运行时 `warnings`（版本与替代项直接写进 JSDoc）→ 源码里的 `// Deprecated since …` 注释。"某值为弃用"不能推到整族。

- **弃用可能在输入值层而非输出字段层**：参数被新版拒绝但字段照常返回时，改 spec 的参数、不改类型；反之 paraminfo 没标弃用的也别自己标上。
- **别因"抓不到样本"就不建模，先想能不能铺垫**。
- 后版本才有的字段标 `@since MediaWiki X.Y`；版本事实走标签，叙述句不重复。

---

## 4. 维护任务（How-to）

### 4.1 新增 / 扩展一个 query 子模块

1. 在 `scripts/fetch-fixtures.ts` 的 `SPECS` 加一条，`pnpm fetch:fixtures` 抓真实响应。选参数尽量把该模块字段一次抓全（如 `clprop=sortkey|timestamp|hidden`）；只想重抓某几条时传位置参数（`pnpm exec tsx scripts/fetch-fixtures.ts query/random`），避免全量刷新把别的 fixture 抖成噪音 diff。
2. 在 `src/core/query/<module>.ts` 手写类型，用声明合并并入共享结构（§3.1）；字段完备性按「三重证据交叉」（§2.1）核对。
3. 在 `src/core/query/index.ts` 加 `export * from './<module>'`——增强只有在文件进入编译图时才生效。
4. 在 `tests/core/query/<module>.test-d.ts` 写断言（见下），`pnpm check` 验证。

形状范例按需到 `src/core/query/` 找同形状的文件（`prop=` 加集合字段看 `categories.ts`、嵌套 slot 看 `revisions.ts`、`list=` 平铺看 `allpages.ts`、`meta=` 顶层键看 `tokens.ts`、响应在根级看 `watchlistraw.ts`、写动作看 `move.ts`）。

**断言四段**：

1. `export const sample = { … } satisfies ApiXxxResponse`（导出以避未用告警）：精确一致性，保留字面量、并查多余字段。
2. `expectTypeOf<T>().toHaveProperty('x').toEqualTypeOf<…>()`：钉住声明类型的关键字段（含必选性）。
3. `expectTypeOf(fixture.query.xxx).toExtend<unknown[]>()`：对导入的真 fixture 做拓宽容忍的结构校验（守 fv2 形状）。
4. `expectTypeOf<ExtraKeys<typeof fixture.query.x, keyof T>>().toEqualTypeOf<never>()`：防遗漏。开放形状（带索引签名）不必查。

- **为何不直接 `fixture satisfies Type`**：`resolveJsonModule` 会把字面量拓宽（`true`→`boolean`、`"x"`→`string`），精确一致性只能交给手写 `satisfies` 样本。
- **断言默认查不出遗漏**：`satisfies` 允许来源多字段，样本又照类型写。两道兜底：① **paraminfo 当清单**，逐一对照该模块可能产生的字段；② **`ExtraKeys` 断言**对导入 fixture 断言「键 ⊆ 声明类型的键」。`ExtraKeys` 只覆盖 fixture 实际出现的键，且 `keyof (A | B)` 只得**公共键**，联合类型要按具体成员分别断言。

**抓取样本的取舍**：需要状态就造状态，铺垫全部写进抓取脚本保证可复现；每次必变的值（会话 token、CPU 时间）不入库；一份 fixture 覆盖多种形状；用前缀 / 过滤器锁定到脚本自建对象（防历史数据混入，注意过滤器可能与其它参数互斥）；端点各自声明（默认本地 1.43，依赖公共站内容的显式钉 `ORG_API`/`WIKIPEDIA_API` 并把字段形状回 1.43 源码复核）；**旧类型也要回核**，拿到新 fixture 顺手重核该模块既有声明。

**写接口 / 需权限响应**用本地 1.43 容器（无本地容器时任意可自控的同版本实例均可）。容器 bring-up、账号与 LocalSettings 开关集中在 `scripts/container/README.md`；脚本分工：`fetch-fixtures.ts`（匿名读）、`capture-write-fixtures.ts`（写动作与需登录/权限的读模块）、`capture-core-gaps.ts` / `capture-coverage-gaps.ts` / `capture-ext-gaps.ts`（补缺口，先写 `.mw-scratch/` 检视后提升），共用传输层 `scripts/capture-client.ts`。需登录/需权限的模块**没有跑不了这一说**，只有参数没喂对的失败。

### 4.2 加一个按需启用的扩展包（`src/extensions/`）

- ext 文件导出字段组 / 子项类型（如 `ApiPageFlagged`），并在文件尾部**自带 `declare module 'types-mediawiki-response'` 增广**（键名与落点收进包）；不进默认 barrel，经 `exports["./ext/*"]` 子路径发布，消费方一条 type-only import 激活。
- **两类形状**：`prop=`/`list=`/`meta=` 贡献**字段组**（并入 `ApiPage`/`ApiQueryResult`）；扩展的 **action** 返回**独立响应类型**（`ApiXxxResponse extends ApiEnvelope`），消费方直接 `import type` 使用、无需合并。
- 测试放 `tests/extensions/`，只断言字段组 / 响应 vs fixture（`satisfies` + `ExtraKeys`）；核心合并由 `scripts/check-ext-consumer.ts` 验证。扩展的 continue 游标不进核心 `ApiQueryContinue`（其索引签名已兜底）。
- **选型**：优先覆盖消费方真正用到的扩展。要知道"某扩展贡献了哪些 API 模块"别按名字猜：装载后 `action=paraminfo&modules=query+<名>` 的 `source` 字段是权威答案。

### 4.3 版本升级（接入新的 MediaWiki 版本）

1. **起新版本实例**，跑同一套最大化探针语料，与基线 diff 响应键全集（方法见 §2.2）。
2. **paraminfo 对账**：`pnpm fetch:paraminfo` 刷新 `tests/paraminfo/baseline.json`（模块清单从 src 树推导，扩展走脚本内精选表），再 `pnpm audit:paraminfo` 看有无新增 / 改名枚举。
3. **源码核对**：对 diff 出的新键，读新版本 `includes/Api/` 源码确认写入条件，按 §3.2 定必选性。
4. **落地**：新增键标 `@since MediaWiki X.Y`；弃用项标 `@deprecated`；改完跑 `pnpm check`。
5. **版本守卫**：默认端点的 spec 强制 `1.43` 前缀，远程 spec 用 `expectVersion` 显式 pin——防止静默抓到比基线新的 wiki。`fetch:fixtures --check` 只拉不写，拒绝意外 `error`/`warnings`/空载荷。

### 4.4 修复 BUG / 重核既有声明

- **冲突回源码，拿不准问用户**：docstring / 类型声明 / 旧文档与实测打架时回源码裁定（§3.2 的 docstring-类型互为校验）；无法自行裁定（缺环境 / 缺权限 / 形状存疑）就提选项让用户定，别默默选一个。
- **回核一片、就地纠错**：改一处顺手重核同模块既有声明；修复错误直接改原文，不写只有当前上下文能懂的会话流水。
- 已核过属假阳性或刻意宽化的结论写进 §6，避免重复踩。

---

## 5. 踩坑清单

**JSDoc 与文档站**（通用禁令见 AGENTS「编写规范」）

- **内联对象类型里别写 `{@link}`**：`X & { … }` 匿名类型的兄弟字段无法被 TSDoc 寻址，TypeDoc 报 "link cannot be resolved"。要么提成具名 interface 再链接，要么改成代码字体。（typedoc 0.28.20 实测：加 `validation: { invalidLink: true }` 对断链**不报警**，别指望它当门禁；断链目前只能靠人工核对产物。）
- **`{@link}` 按全项目符号名解析，不要求本文件 import**：未导入的跨文件引用（`options.ts` 声明注释里引 `ApiErrorResponse`/`ApiPage`）、跨扩展包（discussiontools 引 thanks 的 `ApiThankResult`）、同接口裸成员（`{@link cancreate}`）与成员路径（`{@link ApiMessage.params}`）实测都出链接。断链不报警也不留痕：未解析的 `{@link}` 渲染成裸名，与普通文本无法区分，`validation: { invalidLink: true }` 同样不报警（均 typedoc 0.28.20 实测）；核对链接只能看产物里目标名是否成了 `[名](路径)`。不可寻址的只有内联对象类型/匿名交集的兄弟字段（见上条）。另注意核心 barrel 各文件的文件头注释不进产物（typedoc 只把入口文件的注释当 module comment；扩展文件是独立入口，其文件头才渲染），核心文件模块 docstring 里的跨包名用代码字体是源码与消费方 IDE 悬浮的观感选择，与 TypeDoc 无关。
- 示例里的日期 / 时间戳用固定中性值（如 `2024-01-15` 一族），不用采集当周的日期。
- **首页悬浮演示的内容不是手写的**：`docs/scripts/generate-hero.ts` 构建时对展示代码跑真实编译器 quickinfo，从 `src/` 取签名与 JSDoc 注入入库的生成文件；改 `src/` 类型后 docs 构建会重算，snippet 与类型失配时构建直接失败，CI 用 `git diff --exit-code` 校验产物未过期。
- **push 自动部署暂缓**：仓库未公开，`docs.yml` 仅 `workflow_dispatch`。

**发布与产物解析**

- **ESM 声明 + 无扩展名相对 re-export = 静默丢导出**：包带 `"type": "module"` 时，`dist/*.d.ts` 在 `node16`/`nodenext` 下被当 ESM，而 emit 出的 `.d.ts` 都用无扩展名相对路径引用邻居，相对链静默失效（消费方开着 `skipLibCheck` 时连报错都没有）。**修法是去掉 `"type": "module"`**——纯类型包没有运行时 JS。
- **别改成往 `dist/` 塞 `{"type":"commonjs"}`**：会让仓库内 `check:ext` 全组失败。要改就改包身份，别往产物里加文件。
- `pnpm check:pack`（`build` + ATTW）兜底各 moduleResolution；注意 **`npm pack` / `pnpm pack` 只触发 `prepack` + `prepare`，门禁里必须显式先 build**。
- **TS 版本不是约束**（`src/` 未用新语法），要担心的是解析模式。

**消费方工具链**（examples/ 建成时实证；改示例或升级依赖前先核对这些前提）

- **pnpm 下 `@types/jquery` 必须显式声明**：types-mediawiki 的 `mw.Api` 声明引用全局 `JQuery` 命名空间，npm 平铺布局自动加载全部 `@types/*` 所以能过；pnpm 严格隔离不加载传递 `@types/*`，`JQuery.PromiseBase` 解析失败后 `skipLibCheck` 藏起 `.d.ts` 报错，消费方只看到丢光成员的 `AbortablePromise`（连 `.then` 都没有），极具迷惑性。
- **TS ≥ 7（tsgo）下扩展包的模块增广只对同文件引用到的类型可见**：`{} as ApiPage` 直访合并字段正常，但从 `ApiQueryResponse.query.pages` 属性链流出的 `ApiPage`、以及 `QueryPage<"globalusage">` 的 `keyof` 约束都看不到增广；经典 tsc 全项目生效。`check:ext` harness 只覆盖直接引用路径，链式路径未测——示例（web-ts）用本地 `const pages: ApiPage[]` 注解绕开。
- **types-mediawiki@2.1.0 的 Promise 类型是坏的**：其自带 jQuery 插件声明与现行 `@types/jquery` 泛型参数数冲突（TS2428），基类损坏连带 `AbortablePromise` 丢成员；示例钉 `^1.10.1`，上游修复后可重评升级。

**探针与完备性**

- **手工探针必须带模块前缀**：`prop=info` 的测试参数是 `intestactions`，写成 `testactions` 会被判 Unrecognized 并**静默返回一份没有该字段的响应**。逐模块看 paraminfo 的 `prefix`，参数名也别跨模块套（videoinfo 用 `viprop`）。
- **`*show` 不能全开**：`rcshow=minor|!minor` 会同时打开肯定值与否定值直接报错；**不设才是"不过滤"**。
- **带 `limit` 的不一定是分页量**：`ususerids`/`pageids` 这类多值参数也有 `limit`，按分页量填会 `invalidparammix`。只对名字以 `limit` 结尾的设值。
- **多值参数的分隔符是 `|`，不是逗号**。
- **本地探针必须显式 `formatversion=2`**：默认 fv1 会把真布尔序列化成 `""`。

**扩展装载与本地容器**（下条以官方 Docker/Apache 镜像为例；裸机 / nginx 环境把「`apache2ctl -k graceful`」换成对应的重载 Web server / 清 OPCache + APCu 动作）

- **改完配置要 `apache2ctl -k graceful`**：APCu 缓存了扩展的类映射，只改 `LocalSettings.php` 会让请求拿到旧映射而 500（`Class ... not found`，而 CLI 下一切正常，极具迷惑性）。改 PHP 配置务必先 `php -l` 校验。
- **配置键先在扩展源码里核实再写**（判据是 `$this->getConfig()->get('…')`），凭印象会写出不存在的键并静默无效；`$wgCaptchaClass` 之类的配置要写 FQCN。
- **有的模块默认关闭**：`action=echocreateevent` 需 `$wgEchoEnableApiEvents`；`list=checkuser` 自 1.45 起默认被 `$wgCheckUserDisableCheckUserAPI` 关掉；Linter 需授 `linter` 权限 + `$wgParsoidSettings['linting'] = true`。
- **写操作会改状态，探针顺序要讲究**：`echomarkread`/`echomarkseen`/`echomute` 必须排在读列表之后；有的探针必须匿名（titleblacklist——sysop 有 `tboverride`，一律回 `ok`）。
- **追加 LocalSettings 片段的工具必须带尾部换行**，否则下一个片段与上一行粘连，注释符吃掉后续语句、症状漂移到别处（表现为「扩展装了但模块未注册」）。判重靠标记注释，删除块时按「本标记 → 下一个标记」区间删。
- **git clone 来的扩展要自己装 composer 依赖**，装进扩展内 vendor 后看 extension.json 是否声明 `loadComposerAutoloader`——没有就手工 `require_once` 扩展内 `vendor/autoload.php`。
- **Windows 机器上 `git archive` 出的扩展 shell 脚本带 CRLF**，容器内执行报 `set: Illegal option -`——装载后对 `scripts/*.sh` 跑 `sed -i 's/\r$//'`。

**登录与写接口**（涉及容器 IP 分桶 / `docker exec` / `/tmp` 路径的按自己环境对应调整）

- **LoginThrottle 会伪装成"密码错误"**：尝试超阈值后，`action=login` 对**正确密码**也回 `Failed`。别改密码或等冷却——直接 `createAndPromote.php` 铸新 sysop（走 maintenance，不计入 API 节流）换用。它按**源 IP** 分桶：容器内反复调试失败会把容器 IP 的桶打满，绕法是从宿主机直连映射端口（不同源 IP，独立桶）。也别拿 `$wgMainCacheType = CACHE_NONE` 去关节流——它会破坏会话持久化。
- **令牌类型别想当然**：`userrights` 要 `type=userrights` 令牌（用 csrf 得 `badtoken`）；AuthManager 类 action 的请求参数带模块前缀（`createtoken`/`linktoken`…），但 `createaccount` 的字段却不带前缀 + 必需的 `createreturnurl`。
- **curl 的 `-d` 与 `-F` 不能混用**（exit 2）：multipart 上传里 `format`/`formatversion` 也要走 `-F`；csrf token 尾部带 `+\`，不能直接写进 `-F "name=value"`，要用 `-F "token=</tmp/ct.txt"` 从文件取值。
- **`action=delete` 的参数是单数 `title`**（`action=query` 系才是复数 `titles`）；文件元数据（EXIF/尺寸）在**上传时提取一次**，重抓要先删文件再传，`ignorewarnings=1` 免撞同名警告。

---

## 6. 已知结论与开放问题

### 勿再当缺陷重查（均为多版本实测 / 源码核对过的结论）

- 合并视图成员、`*prop` 门控字段、以及 `action=import`/`imagerotate`/`purge`/`setnotificationtimestamp` 混入的 invalid/missing 条目——保持可选是有意为之。
- 刻意保持宽化的两处：`globaluserinfo` 的 `unattached[].editcount` 保持 `number`（emitter 未 `intval()`，见到实物再收窄）；`parse` 的 `extensionData` 按 ParserCache 测试数据近似为 `Record<string, unknown> | unknown[]`。
- 版本边界结论已在类型里标 `@since`，不要改回必选：`prop=tocdata` 仅 1.43+、`parse.sections[].linkAnchor` 1.40+、`action=userrights` 的 `watchuser` 1.41 起才回显、`action=visualeditor` 的 `wouldautocreate` 1.41+。

### 未建模 / 不打算做

- **开放输出**：`parse` 的 `parseroutput`（整份序列化 ParserOutput，无界且随版本变）。
- **不打算做**：XML/feed 类（`opensearch`/`rsd`/`feed*`）与自描述类（`help`/`paraminfo`）——不返回可建模的数据形状；TMH 的 `action=timedtext` 走 `ApiFormatRaw` 直出 srt/vtt 文本。
- Wikibase 只建**客户端**读模块，仓库端实体读写 action 面太大另说；`Kartographer`（`prop=mapdata` 载荷为不透明 GeoJSON 串）等仍无包。
- `linkaccount`/`unlinkaccount`：成功需一个链接型认证提供方（CentralAuth 的 primary provider 不实现 account-link），本地环境不可达，勿再按「装 CentralAuth 即可」重查。
- `meta=siteinfo` 的 `general` 只列核心写入的键；站点 / 运维注入的键按扩展字段接缝处理，消费方自己 `declare module` 补。

### 真实环境限制（非可偷懒的入模门）

- Echo@1.39 与依赖它的 Thanks@1.39（上游分支已删，装不上）；GlobalUserInfo（Wikimedia 内部件，源码与实例都取不到）——这些模块的结论仍只靠逐版本源码与基线 fixture。
- `list=search` 的 `searchinfo.approximate_totalhits`（1.44+，值恒为 `true`，是标记不是计数）：本地复现需 CirrusSearch + Elasticsearch，不值得，见到实物再补 fixture。

### 参考来源

- 第三方 fv1 类型（MoegirlPedia）只用于决定**先覆盖哪些模块**，不作形状参考；凡形状 / fv2 语义一律以本仓库 fixture 为准，并用 paraminfo 清单与文档 / 源码交叉查缺。
- **参数名与枚举值会随版本漂移**（旧文档、参考站与基线可能都不同），选参数后务必看 fixture 是否带 `warnings`，有则改到干净。
