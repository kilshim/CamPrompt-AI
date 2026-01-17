export interface CameraState {
  azimuth: number; // Horizontal angle in degrees (0-360)
  polar: number; // Vertical angle in degrees (0-180)
  distance: number; // Distance from target
}

export interface PromptData {
  horizontal: string;
  vertical: string;
  distance: string;
  fullPrompt: string;
}

export type PresetType = 'horizontal' | 'vertical' | 'distance';

export interface Preset {
  label: string;
  value: number;
  type: PresetType;
}
