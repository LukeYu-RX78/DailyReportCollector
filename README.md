The project is a prototype React Native app called **DailyReportCollector** for showcase, designed for both iOS and Android platforms. 
It collects daily reports from users and syncs data using SQLite for local storage and .NET Core for backend services.

# 1. Prerequisites
To run and develop this project, ensure that the following software and tools are installed:

## 1.1 System Requirements

- **Node.js**: Version 20.x
- **Python**: Version 3.11.x
- **npm**: Version 10.x
- **expo**: Version 6.3.1x
- **expo-cli**: Version 6.3.1x
  
# 2. Project Setup

## 2.1 Clone the Repository

Clone the project from the GitHub repository:

Bash:

    git clone https://github.com/your-username/DailyReportCollector.git
    cd DailyReportCollector

## 2.2 Install Dependencies

Install the project dependencies:
- **Node.js**: [Install Node.js](https://nodejs.org/)
- **Expo CLI**: [Expo CLI Documentation](https://docs.expo.dev/workflow/expo-cli/)

Bash:

    npm uninstall -g expo-cli
    npm install
    npm install -g expo-cli


# 3. Running the Project

## 3.1 Running in Development Mode

To start the development server, run:

Bash:

    npx expo start

This will launch Expo DevTools in the browser and provide a QR code for testing the app on a physical device using the Expo Go app.
Install the Expo Go app on your Android or iOS device.
Use the QR code provided in Expo DevTools to launch the app on your device.

## 3.2 Running on iOS

Ensure Xcode and iOS Simulator are installed.
To run the app in the iOS Simulator, open the simulator and run:

Bash:

   npx expo prebuild
   npx expo run:ios

## 3.3 Running on Android

Ensure Android Studio is installed and the Android Emulator is set up.
To run the app on an Android emulator, open the emulator and run:

Bash:

   npx expo prebuild
   npx expo run:android

# 4. Building for Production
## 4.1 iOS Build

iOS builds require the eas-cli and an Apple Developer Account.

    Install the EAS CLI globally:

Bash:

    npm install -g eas-cli

Run the following command to create a build:

Bash:

    eas build -p ios

Follow the instructions to sign up with your Apple Developer credentials.

## 4.2 Android Build

Android builds can be created using EAS CLI as well.

Run the following command to build an APK or AAB for Android:

bash

    eas build -p android

The APK or AAB file will be downloaded once the build is complete.

# 5. Additional Resources

Expo Documentation: https://docs.expo.dev/
React Native Documentation: https://reactnative.dev/docs/getting-started
EAS Build Documentation: https://docs.expo.dev/build/introduction/
