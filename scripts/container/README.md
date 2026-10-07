# 本地抓取容器（capture 脚本的环境）

`scripts/capture-*.ts` 用于抓取**无法匿名从公共站取得**的响应（需登录 / 需权限 / 需造特定状态），产物写入 `tests/fixtures/`。它们都通过 `docker exec` 操作一个一次性 MediaWiki 容器。本文件是这些脚本的**环境手册**；脚本内的注释只保留用途与运行方式。

容器名、端口、账号都可覆盖（见各脚本 header 的 `Env:` 行），下列是作者机器的默认值。

## 前置

- Docker
- 官方镜像 `mediawiki:1.43`（基线）与 `mediawiki:1.46`（仅 `sbom` / `dt-activity` 组用）
- 逐组所需扩展（见下文「脚本与分组」；扩展未装载时对应分组拿不到成功形状）

## 一次性 bring-up（1.43 基线，SQLite，无外部 DB）

```bash
docker run -d --name mw-fixture -p 8080:80 mediawiki:1.43
docker exec -w /var/www/html mw-fixture php maintenance/install.php \
  --dbtype=sqlite --dbname=mw --dbpath=/var/www/html/images \
  --server=http://localhost:8080 --scriptpath= --lang=en \
  --pass='BootStrapPass2026' BootStrap "FixtureWiki" "http://localhost:8080"
docker exec mw-fixture chown -R www-data:www-data /var/www/html/images   # CLI install runs as root
```

1.46 容器同样起一个（名 `mw146`，端口自定），供 `sbom` / `dt-activity` 组使用。

## 账号

| 账号                | 密码                                | 权限                        | 用途                        |
| ------------------- | ----------------------------------- | --------------------------- | --------------------------- |
| `capadmin`          | `CapAdminPass2026`                  | sysop + bureaucrat          | 主抓取账号（1.43）          |
| `edituser`          | `EditUserPass2026`                  | —                           | 第二编辑者（`rollback` 等） |
| `capj`              | `CapJPass2026`                      | 由脚本补授 sysop/bureaucrat | 核心缺口组                  |
| `capx` / `peerx`    | `CapXPass2026` / `PeerXPass2026`    | —                           | 扩展缺口组                  |
| `authchg2`          | `AuthChg2Pass2026`                  | —                           | `authdata` 一次性账号       |
| `cap146` / `dtpeer` | `Cap146Pass2026` / `DtPeerPass2026` | 前者 sysop + bureaucrat     | 1.46 组                     |

```bash
docker exec -w /var/www/html mw-fixture php maintenance/createAndPromote.php \
  capadmin CapAdminPass2026 capadmin@example.invalid --sysop --bureaucrat
```

## LocalSettings 开关

核心缺口组假定以下已配置：

```php
$wgEnableUploads = true;          // upload / filestash 组
$wgEmailAuthentication = false;
$wgPageLanguageUseDB = true;      // setpagelanguage
$wgAutoCreateTempUser = true;     // acquiretempusername
// sysop 具备 import / interwiki-import
```

`mw-gap.php`（本目录，require 在其余 `mw-*.php` 之后）补齐覆盖缺口组所需：

- `$wgAutoCreateTempUser` 的 1.42+ 数组形态（布尔形态不被读取，且 `RealTempUserConfig` 不合并部分配置，所有键都要给）
- `$wgEchoEnableApiEvents`（`action=echocreateevent` 的开关）
- `$wgBlacklistSettings['spam']['files']` 指向本地黑名单文件
- `$wgTitleBlacklistSources` 读站内 `MediaWiki:Titleblacklist`
- 授予 sysop `editsitejs`/`editsitecss`/`editsitejson`（gadget fixture 需要）
- `$wgParsoidSettings['linting'] = true`（Linter 默认不产出）
- 清空 `$wgRemoveCredentialsBlacklist`（仅 throwaway 账号 `authdata` 组用）

追加片段务必**带尾部换行**，否则下一段会与上一行粘连、注释符吃掉后续语句。

## 脚本与分组

| 脚本                        | 产物                   | 分组                                                                                                                      |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `capture-write-fixtures.ts` | `tests/fixtures/core/` | 无分组，写动作与需登录读模块                                                                                              |
| `capture-core-gaps.ts`      | `.mw-scratch/gaps/`    | 无分组，核心 action/meta 缺口                                                                                             |
| `capture-coverage-gaps.ts`  | `.mw-scratch/gaps/`    | `tempuser` `import` `stashinfo` `dt-activity` `sbom` `echo` `blacklist` `edit-captcha` `ext` `authdata` `exif` `exif-gps` |
| `capture-ext-gaps.ts`       | `.mw-scratch/ext/`     | `legacy` `more`                                                                                                           |

`*-gaps` 是探索性生成器：先把原始响应落到 `.mw-scratch/`（已 gitignore）检视，判定可用后再提升进 `tests/fixtures/` 并据其手写类型。

运行：

```bash
pnpm exec tsx scripts/capture-write-fixtures.ts
pnpm exec tsx scripts/capture-core-gaps.ts
pnpm exec tsx scripts/capture-coverage-gaps.ts [group...]
pnpm exec tsx scripts/capture-ext-gaps.ts [group...]
```

## 本目录文件

- `mw-gap.php` — 覆盖缺口组的 LocalSettings 片段（见上）。
- `mw-lint-gap.php` — 触发 Parsoid lint 的 maintenance 脚本。核心解析器的编辑不 lint，Linter 的 `list=linterrors` 需要重渲染当前修订才能产出记录；由 `capture-coverage-gaps.ts` 的 `ext` 组 `docker cp` 进容器后调用。
- `gap-template.jpg` — 带 EXIF 的样张，`exif-gps` 组用它产出 GPS/Exif 元数据（手工构造的 APP1 段过不了 php-ext-exif 的校验）。

## 扩展包抓取容器（capture-ext-packs.ts）

`capture-ext-packs.ts` 的 CentralAuth / ttmserver 组跑在 MySQL 双站容器 `mw143g`（端口 8243，中央库 `mariadb-gb` 的 `wiki143`）：

- 已装载：CentralAuth、GlobalBlocking、AntiSpoof、Translate、UniversalLanguageSelector、BetaFeatures（BetaFeatures 仅 mw-fixture）。
- 抓取账号：`Capg` / `CapGPass2026`（sysop + bureaucrat，已迁为全局账号，具 centralauth-lock/unmerge/suppress、globalgroup*、translate、pagetranslation 权限）。
- 全局账号：`Gblink`（本地绑定，供 lock/unlock 与 globaluserrights 往返）、`Gdel2`（供 `deleteglobalaccount` 消耗，用后需重迁）、`Gfresh3` / `Gfresh`（无本地行的全局账号，供 `createlocalaccount`，用一次换一个名字）。
- 种子内容：可翻译页 `Fixture translatable page` 与 `Fixture second page`（含 de/fr/es 翻译），TM 全文表已手工补齐至可命中（MyISAM 50% 阈值，见 dev-docs §5）。
- 已配 `$wgMainCacheType = CACHE_DB`（APCu 子进程隔离会吞掉缓存失效，见 dev-docs §5）与本地数据库 TM 服务。

```bash
MW_CONTAINER=mw-fixture CA_CONTAINER=mw143g pnpm exec tsx scripts/capture-ext-packs.ts [group...]
```

### translate-write / translate-write2 组的额外开关（mw-fixture）

```php
$wgTranslateWorkflowStates = [ "new" => [...], "needs_proofreading" => [...], "ready" => [...] ];
$wgTranslateUseSandbox = true;
$wgTranslateEnableMessageGroupSubscription = true;
$wgGroupPermissions["user"]["translate"] = true;    // Translations 命名空间保护
$wgGroupPermissions["user"]["skipcaptcha"] = true;  // ConfirmEdit 会拦 peerx 的翻译编辑
```

- `searchtranslations` 的 fixture 来自容器内手工放入的
  `extensions/Translate/src/TtmServer/FixtureSearchTtmServer.php`（stub 实现
  `SearchableTtmServer`，注册为公共服务 `fixture-search` 并设为默认）；重装容器后按
  git 历史恢复该文件。stub 不是 `ReadableTtmServer`，故 `action=ttmserver` 的
  默认服务改指向它——`ttmserver` 组的抓取固定走 mw143g。
