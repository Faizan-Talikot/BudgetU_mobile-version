const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add png and other image formats to assetExts
config.resolver.assetExts.push('png');

module.exports = config; 