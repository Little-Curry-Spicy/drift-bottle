const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push("lottie");

module.exports = withNativewind(config);
