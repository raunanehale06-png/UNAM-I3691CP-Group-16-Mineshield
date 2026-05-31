# Installation Guide – MineShield

## Supported Devices
- Android 13 , 15 and 16
- Expo Go compatible devices

## Method 1: Install via APK (Recommended for Testing)

### Step 1: Download the APK
- Get the latest APK from the Expo build link (provided by Lead Developer)
- Or download from GitHub Releases: `v3.0.0-final.apk`

### Step 2: Enable Unknown Sources
- Go to **Settings** → **Security** → **Install from unknown sources**
- Enable for your file manager or browser

### Step 3: Install
- Open the APK file
- Tap **Install**
- After installation, tap **Open**

### Step 4: Grant Permissions
The app will request:
- ✅ Location (Allow all the time for background tracking)
- ✅ Camera (For hazard photos)
- ✅ Notifications (For alerts)

## Method 2: Development via Expo Go

### Prerequisites
- Install Expo Go from Google Play Store
- Have Node.js and npm on your computer

### Steps
```bash
git clone https://github.com/Group16/MineShield-App.git
cd MineShield-App
npm install
npx expo start
