const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Android Vector Drawable icons for @expo/ui Jetpack Compose Icon
config.resolver.assetExts.push('xml');

module.exports = withNativewind(config);
