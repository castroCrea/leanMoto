import * as Speech from 'expo-speech';
import { Ride } from '../types/ride';

export class VoiceService {
  private enabled: boolean = true;
  private lastHighLeanAlert: number = 0;
  private readonly HIGH_LEAN_THROTTLE_MS = 5000;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  speak(text: string): void {
    if (!this.enabled) return;
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 1.1,
    });
  }

  announceRideStart(): void {
    this.speak('Ride started. Stay safe and ride smooth.');
  }

  announceRideEnd(stats: Partial<Ride>): void {
    const distance = stats.distance?.toFixed(1) ?? '0';
    const duration = stats.duration
      ? `${Math.floor(stats.duration / 60)} minutes`
      : '0 minutes';
    const maxLean = stats.maxLeanAngle?.toFixed(0) ?? '0';
    this.speak(
      `Ride complete. ${distance} kilometres in ${duration}. Maximum lean angle ${maxLean} degrees.`,
    );
  }

  announceHighLeanAngle(angle: number): void {
    const now = Date.now();
    if (now - this.lastHighLeanAlert < this.HIGH_LEAN_THROTTLE_MS) return;
    this.lastHighLeanAlert = now;
    this.speak(`High lean angle. ${Math.abs(angle).toFixed(0)} degrees.`);
  }

  announcePersonalRecord(type: string, value: number): void {
    this.speak(`New personal record! ${type}: ${value.toFixed(1)}.`);
  }
}

export const voiceService = new VoiceService();
