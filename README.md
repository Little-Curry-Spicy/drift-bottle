# 漂流瓶（Monorepo）

本仓库为 **pnpm workspace** 单体仓库：移动端为 **Expo + React Native**，服务端为 **NestJS**，共享类型放在 **packages/shared**。

## 仓库结构

| 路径 | 说明 |
|------|------|
| `apps/mobile` | 漂流瓶 Expo 应用（expo-router、NativeWind、Clerk） |
| `apps/api` | NestJS HTTP API（默认端口 3000） |
| `packages/shared` | 前后端共享的 TypeScript 类型与常量（API 契约可逐步迁入） |

根目录 `package.json` 仅提供聚合脚本；各应用的依赖与脚本在各自目录的 `package.json` 中。

## 环境要求

- Node.js（与 Expo 54 / Nest 11 兼容的版本）
- pnpm（推荐与 lockfile 一致的较新版本）

## 安装依赖

在**仓库根目录**执行：

```bash
pnpm install
```

> 若遇 pnpm 提示需允许依赖执行安装脚本（如 `@nestjs/core`），可在仓库根目录执行 `pnpm approve-builds` 按需放行。

## 运行移动端

```bash
pnpm mobile
```

等价于 `pnpm --filter mobile start`。也可使用：

- `pnpm mobile:android` / `pnpm mobile:ios` / `pnpm mobile:web`

首次请在 `apps/mobile` 下配置环境变量（见下文 Clerk）。

## 运行后端 API

```bash
pnpm api
```

等价于 `pnpm --filter api start:dev`。生产构建：

```bash
pnpm api:build
```

构建产物位于 `apps/api/dist`。

## 共享包 `@drift-bottle/shared`

- 在 `apps/mobile` 与 `apps/api` 中已通过 `workspace:*` 引用。
- 在 `packages/shared/src/index.ts` 中导出类型与常量；修改后两端同时生效，无需发包。

## Clerk 鉴权（移动端）

1. 在 Clerk 创建 Expo 应用，获取 Publishable Key  
2. 在 **`apps/mobile`** 目录创建 `.env`（或在根目录创建并由你同步到 mobile，推荐直接放在 `apps/mobile/.env`）  
3. 写入：

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

配置后将启用：`/` 落地页、`/sign-in`、`/sign-up`、`/bottles` 等路由（见 `apps/mobile/app`）。

## Monorepo 说明（Expo / Metro）

- `apps/mobile/metro.config.js` 已配置 `watchFolders` 与 `nodeModulesPaths`，指向仓库根，便于解析根目录 `node_modules` 与 workspace 包（与 [Expo Monorepos](https://docs.expo.dev/guides/monorepos/) 一致）。
- 根目录 `.npmrc` 中 `node-linker=hoisted` 有利于 Metro 解析依赖。

## 移动端功能概览

- 扔瓶、罗盘抛投、蓄力与陀螺仪微动、捞瓶、回复、收藏、我的瓶子、数据看板  
- 当前业务数据仍以本地状态为主；接入 `apps/api` 后可逐步替换为真实 API。

## 移动端主要目录

- `apps/mobile/app/`：路由与页面  
- `apps/mobile/src/features/drift-bottle/`：漂流瓶功能模块  
- `apps/mobile/global.css`：主题变量与全局样式  

## 全仓库 Lint

```bash
pnpm lint
```

## 后续可改进

- 在 `apps/api` 实现瓶子、回复、收藏等模块，并与 Clerk JWT 或自建鉴权对接  
- 将 API 请求层集中在 `apps/mobile`，环境变量中配置 `EXPO_PUBLIC_API_URL`  
- CI 中按变更路径分别执行 `mobile` / `api` 的 lint 与 build（可选引入 Turborepo）

## UI 迭代记录（欧美审美适配）

- 漂流瓶主流程文案已统一为英文语境，避免中英混杂  
- 页面间距与卡片圆角统一，强化轻量、松弛的阅读节奏  
- 主题色从高饱和绿色调整为更中性的自然绿，降低视觉疲劳  
- 底部导航和内容卡采用一致的弱边框与柔和背景，接近欧美产品常见的克制风格  
