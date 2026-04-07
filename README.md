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
| Framework | [Expo](https://expo.dev) ~50 / React Native 0.73 |
| Language | TypeScript 5 |
| Navigation | React Navigation 6 (bottom tabs + stack) |
| State | [Zustand](https://github.com/pmndrs/zustand) 4 |
| Persistence | `expo-sqlite` (rides) · `react-native-mmkv` (settings) |
| Sensors | `expo-sensors` (accelerometer / gyroscope) |
| Location | `expo-location` (GPS speed & route) |
| Charts | `react-native-chart-kit` · `react-native-svg` |
| Audio | `expo-av` · `expo-speech` |
| Animations | `react-native-reanimated` 3 |

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

## License

This project is private. All rights reserved.
