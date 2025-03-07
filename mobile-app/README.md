# Captionator Mobile App

A cross-platform mobile app for generating AI-powered captions for your images and videos.

## Features

- **AI-Powered Caption Generation**: Leverages OpenAI to create contextually relevant captions based on your images
- **Multiple Tone Options**: Choose from casual, professional, funny, inspirational, or storytelling tones
- **Customizable Options**: Toggle hashtags on/off as needed
- **User Authentication**: Secure user accounts with Firebase Authentication
- **Cross-Platform**: Works on both iOS and Android devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- OpenAI API key
- Firebase project

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Use the Expo Go app on your mobile device to scan the QR code and run the app.

## Building for App Stores

### Setup EAS Build

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```

3. Configure your project:
   ```bash
   eas build:configure
   ```

### Build for iOS

1. Create a build:
   ```bash
   eas build --platform ios
   ```

2. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

### Build for Android

1. Create a build:
   ```bash
   eas build --platform android
   ```

2. Submit to Play Store:
   ```bash
   eas submit --platform android
   ```

## Project Structure

- `/assets` - Images and other static assets
- `/components` - Reusable UI components
- `/screens` - App screens
- `/firebase` - Firebase configuration and services
- `/hooks` - Custom React hooks
- `/utils` - Utility functions

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# App Configuration
APP_NAME=Captionator
APP_VERSION=1.0.0
```

## License

This project is licensed under the MIT License. 