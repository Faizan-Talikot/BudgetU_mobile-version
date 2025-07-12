export default {
  name: 'BudgetU',
  slug: 'budgetu',
  version: '1.0.0',
  orientation: 'portrait',
  icon: 'src/assets/images/app_logo_budgetU.png',
  userInterfaceStyle: 'light',
  splash: {
    image: 'src/assets/images/app_logo_budgetU.png',
    resizeMode: 'contain',
    backgroundColor: '#1B3A4B'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.budgetu.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: 'src/assets/images/app_logo_budgetU.png',
      backgroundColor: '#1B3A4B'
    },
    package: 'com.budgetu.app'
  },
  extra: {
    NODE_ENV: process.env.NODE_ENV || 'production',
    API_URL: process.env.API_URL || 'https://budgetu-backend.vercel.app',
    eas: {
      projectId: "37667c0a-f44d-4ce7-b15c-7c40319c6f32"
    }
  }
}; 