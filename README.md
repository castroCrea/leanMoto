# LeanRide AI 🏍️

A React Native (Expo) app for motorcyclists that delivers real-time lean angle tracking, telemetry, and AI-powered ride insights — right from the sensors built into your phone.

---

## Features

- **Live Lean Angle Gauge** – Visualises left/right lean in real time using the phone's accelerometer and gyroscope, with per-session max tracking.
- **Speed & G-Force Meters** – GPS-based speed and combined G-force displayed as animated gauges.
- **Heads-Up Display (HUD)** – Minimal fullscreen overlay optimised for mounting on a handlebar.
- **Voice Alerts** – Spoken start/stop announcements and configurable high-lean-angle warnings via `expo-speech`.
- **Ride Recording** – Every ride is saved to an on-device SQLite database (`expo-sqlite`) including raw data points for post-ride analysis.
- **Ride History** – Browse, search, and delete past rides.
- **Analytics** – Charts and AI-generated insights powered by `insightsService`.
- **Sensor Calibration** – Dedicated calibration screen to account for phone mounting angle.
- **Configurable Settings** – Metric / Imperial units, voice alert threshold, keep-screen-on, HUD mode toggle, and full data wipe.
- **Dark-first UI** – Deep-space dark theme (`#0A0A0F`) throughout.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 55 / React Native 0.83 |
| Language | TypeScript 5 |
| Navigation | React Navigation 6 (bottom tabs + stack) |
| State | [Zustand](https://github.com/pmndrs/zustand) 4 |
| Persistence | `expo-sqlite` (rides) · `@react-native-async-storage/async-storage` (settings) |
| Sensors | `expo-sensors` (accelerometer / gyroscope) |
| Location | `expo-location` (GPS speed & route) |
| Charts | `react-native-chart-kit` · `react-native-svg` |
| Audio | `expo-av` · `expo-speech` |
| Animations | `react-native-reanimated` 4 |

---

## Project Structure

```
src/
├── components/
│   ├── charts/        # Chart components for analytics
│   ├── common/        # Shared UI (MetricCard, …)
│   ├── gauges/        # LeanAngleGauge, SpeedGauge, GForceGauge
│   └── hud/           # HUDOverlay
├── database/          # SQLite schema & query helpers
├── hooks/             # useRideTracking, useSensors, useRideHistory
├── navigation/        # AppNavigator (tabs + stack)
├── screens/           # DashboardScreen, HUDScreen, RideHistoryScreen,
│                      # RideDetailScreen, AnalyticsScreen,
│                      # SettingsScreen, CalibrationScreen
├── services/          # leanAngleService, sensorService,
│                      # voiceService, insightsService
├── store/             # rideStore, settingsStore (Zustand)
├── types/             # Shared TypeScript types
└── utils/             # calculations (distance, duration, …)
App.tsx                # Entry point – DB init + navigator mount
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- A physical iOS or Android device (sensors are required; simulators show a "simulation mode" warning)

### Install

```bash
git clone https://github.com/castroCrea/leanMoto.git
cd leanMoto
npm install
```

### Run

```bash
# Start the Expo dev server
npm start

# Open directly on a platform
npm run ios
npm run android
npm run web
```

Scan the QR code with the **Expo Go** app on your phone, or press `i` / `a` in the terminal to open on a connected simulator/emulator.

---

## Permissions

| Permission | Purpose |
|---|---|
| Location (when in use) | GPS speed and route tracking |
| Motion / Body Sensors | Lean angle and G-force calculation |
| Wake Lock (Android) | Keep screen on during rides |

---

## iOS App Store Release

This project is configured for Expo Application Services (EAS).

### One-time setup

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Log in:

```bash
eas login
```

3. Create the app in App Store Connect with:
- Name: `LeanRide AI`
- Bundle ID: `com.leanrideai.app`
- SKU: `com.leanrideai.app`

4. Update [eas.json](./eas.json):
- replace `appleId` with your Apple Developer account email
- replace `ascAppId` with the App Store Connect app ID once the app exists

### Build for iOS App Store

```bash
npm run eas:build:ios
```

This uses the `production` EAS profile and builds an App Store binary with auto-incremented iOS build numbers.

### Submit to App Store Connect

```bash
npm run eas:submit:ios
```

Or build and submit in one step:

```bash
npm run eas:build-submit:ios
```

### Before submitting

- Verify `ios.bundleIdentifier` in [app.json](./app.json) is still `com.leanrideai.app`
- Verify the app icon and splash are final
- Verify `expo.version` is correct
- Test the build on a real iPhone
- Check location and motion permission copy in `ios.infoPlist`

### After upload

- Wait for Apple processing in App Store Connect / TestFlight
- Assign the build to a version
- Fill in screenshots, privacy, review notes, pricing, and distribution
- Submit for review

---

## License

This project is private. All rights reserved.
