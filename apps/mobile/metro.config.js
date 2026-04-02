const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);
config.watchFolders = [monorepoRoot];
// pnpm + node-linker=hoisted：依赖在仓库根 node_modules，mobile 下几乎只有 workspace 包。
// 根目录放前面，避免 Metro 在空的 apps/mobile/node_modules 上解析失败。
config.resolver.nodeModulesPaths = [
  path.resolve(monorepoRoot, "node_modules"),
  path.resolve(projectRoot, "node_modules"),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.assetExts.push("lottie");

module.exports = withNativewind(config);
