
# App setup

# Install Expo
npm install -g expo-cli

# Create app command
expo init thoughts_app

# Expo Build
npx expo prebuild
npm install -g eas-cli
eas build:configure(ios)
eas build --platform ios
npm install --global @expo/ngrok@4.1.0

# Install Node Modules
npm install

# Run Expo
npx expo start(press i)
npx expo start --dev-client

# Node Modules Install
npx expo install @react-native-voice/voice expo-speech @react-native-async-storage/async-storage date-fns react-native-paper

# Commands to not creating .DS_Store automatically
defaults write com.apple.desktopservices DSDontWriteNetworkStores true
defaults write com.apple.desktopservices DSDontWriteUSBStores true

# Command to Delete all the .DS_Store files
find . -name "._*" -type f -delete

# Git commit and push command
git add . && git commit -a -m "commit" && git push

# Pre Bulid
cd ios && pod install
npx expo run:ios

# Specify the Xcode project path
project 'thoughtsapp.xcodeproj'