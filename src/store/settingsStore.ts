import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

const storage = new MMKV({ id: 'settings-store' });

const mmkvStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};

interface SettingsStore {
  unitSystem: 'metric' | 'imperial';
  voiceAlertsEnabled: boolean;
  highLeanAngleThreshold: number;
  autoStartRecording: boolean;
  keepScreenOn: boolean;
  hudMode: boolean;
  mountAngle: number;
  calibrationOffsets: { x: number; y: number; z: number };
  theme: 'dark';

  setUnitSystem: (unit: 'metric' | 'imperial') => void;
  setVoiceAlertsEnabled: (enabled: boolean) => void;
  setHighLeanAngleThreshold: (threshold: number) => void;
  setAutoStartRecording: (auto: boolean) => void;
  setKeepScreenOn: (keep: boolean) => void;
  setHudMode: (hud: boolean) => void;
  setMountAngle: (angle: number) => void;
  setCalibrationOffsets: (offsets: { x: number; y: number; z: number }) => void;
  resetCalibration: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      unitSystem: 'metric',
      voiceAlertsEnabled: true,
      highLeanAngleThreshold: 45,
      autoStartRecording: false,
      keepScreenOn: true,
      hudMode: false,
      mountAngle: 0,
      calibrationOffsets: { x: 0, y: 0, z: 0 },
      theme: 'dark',

      setUnitSystem: (unit) => set({ unitSystem: unit }),
      setVoiceAlertsEnabled: (enabled) => set({ voiceAlertsEnabled: enabled }),
      setHighLeanAngleThreshold: (threshold) => set({ highLeanAngleThreshold: threshold }),
      setAutoStartRecording: (auto) => set({ autoStartRecording: auto }),
      setKeepScreenOn: (keep) => set({ keepScreenOn: keep }),
      setHudMode: (hud) => set({ hudMode: hud }),
      setMountAngle: (angle) => set({ mountAngle: angle }),
      setCalibrationOffsets: (offsets) => set({ calibrationOffsets: offsets }),
      resetCalibration: () => set({ calibrationOffsets: { x: 0, y: 0, z: 0 }, mountAngle: 0 }),
    }),
    {
      name: 'leanride-settings',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
