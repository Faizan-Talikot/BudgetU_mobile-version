export default {
  name: 'BudgetU',
  slug: 'budgetu',
  version: '1.0.0',
  orientation: 'portrait',
  icon: 'src/assets/images/budgetu_launcher_icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: 'src/assets/images/app_logo_budgetU.png',
    resizeMode: 'contain',
    backgroundColor: '#1B3A4B'
  },
  updates: {
    url: "https://u.expo.dev/37667c0a-f44d-4ce7-b15c-7c40319c6f32"
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.budgetu.app',
    runtimeVersion: "1.0.0"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: 'src/assets/images/budgetu_launcher_icon.png',
      backgroundColor: '#1B3A4B'
    },
    package: 'com.budgetu.app',
    runtimeVersion: "1.0.0"
  },
  extra: {
    NODE_ENV: process.env.NODE_ENV || 'production',
    API_URL: process.env.API_URL || 'https://budget-u-mobile-version.vercel.app',
    eas: {
      projectId: "37667c0a-f44d-4ce7-b15c-7c40319c6f32"
    }
  }
}; 