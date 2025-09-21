export enum AppState {
  IDLE,
  FILE_SELECTED,
  PROCESSING,
  DONE,
  ERROR,
}

export interface CompressionSettings {
  quality: 'high_quality' | 'balanced' | 'smallest_size';
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  fileName: string;
  downloadUrl?: string;
}
