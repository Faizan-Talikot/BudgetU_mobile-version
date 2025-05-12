# BudgetU Mobile App

A React Native mobile application for managing personal finances, specifically designed for college students.

## Features

- Smart budget creation and management
- Bank account integration
- Real-time financial guidance
- Transaction tracking
- Push notifications for budget alerts
- Offline support
- Weekly financial reports

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- React Query
- Expo Notifications
- AsyncStorage for offline data
- Custom theming system

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac users) or Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/budgetu-mobile.git
cd budgetu-mobile
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

4. Run on your preferred platform:
```bash
# For iOS
yarn ios

# For Android
yarn android
```

## Environment Setup

1. Create a `.env` file in the root directory:
```env
API_URL=your_api_url
EXPO_PROJECT_ID=your_expo_project_id
```

2. Configure your API endpoints in `src/config/env.ts`

## Project Structure

```
src/
├── api/          # API client and endpoints
├── components/   # Reusable UI components
├── config/       # Configuration files
├── contexts/     # React Context providers
├── hooks/        # Custom React hooks
├── navigation/   # Navigation configuration
├── screens/      # App screens
├── theme/        # Theme configuration
└── utils/        # Utility functions
```

## Available Scripts

- `yarn start`: Start the Expo development server
- `yarn ios`: Run on iOS simulator
- `yarn android`: Run on Android emulator
- `yarn web`: Run in web browser
- `yarn lint`: Run ESLint
- `yarn type-check`: Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors
- Built with [Expo](https://expo.dev/)
- UI/UX inspiration from various financial apps
