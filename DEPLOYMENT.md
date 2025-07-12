# BudgetU Deployment Guide

This guide will help you deploy your BudgetU app using EAS (Expo Application Services) for sharing with friends.

## Prerequisites

1. Install EAS CLI:
```bash
npm install -g @expo/eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

## Backend Deployment (Vercel)

Your backend is already configured for Vercel deployment. The API URL is set to:
`https://budgetu-backend.vercel.app`

## Frontend Deployment (EAS)

### 1. Build for Android (APK)

```bash
# Build production APK
npm run build:android

# Or build preview APK (faster, for testing)
npm run build:android-preview
```

### 2. Build for iOS (if needed)

```bash
npm run build:ios
```

### 3. Monitor Build Progress

EAS will provide a URL to monitor your build progress. You can also check in the Expo dashboard.

### 4. Download APK

Once the build is complete, you can:
- Download the APK directly from the build URL
- Share the build URL with friends
- Upload to Google Drive/Dropbox for easy sharing

## Environment Configuration

The app is configured to use production settings by default:
- API URL: `https://budgetu-backend.vercel.app`
- Environment: `production`

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are properly installed
2. **API connection issues**: Verify the backend is deployed and accessible
3. **Authentication issues**: Ensure JWT tokens are properly configured

### Build Logs

If you encounter issues, check the build logs in the Expo dashboard or use:
```bash
eas build:list
```

## Sharing with Friends

1. Build the APK using the commands above
2. Share the APK file or download link
3. Friends can install directly on their Android devices
4. Make sure they have "Install from unknown sources" enabled

## Security Notes

- The app uses HTTPS for all API communications
- JWT tokens are stored securely in AsyncStorage
- No sensitive data is logged in production builds

## Support

If you encounter any issues:
1. Check the build logs
2. Verify your Expo account has the necessary permissions
3. Ensure your backend is running and accessible 