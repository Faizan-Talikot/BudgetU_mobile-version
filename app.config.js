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
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_URL: process.env.API_URL || 'http://localhost:5000/api'
  }
}; 