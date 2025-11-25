export enum ToolMode {
  NONE = 'NONE',
  CIRCLE = 'CIRCLE',
}

export interface GeneratedImage {
  url: string; // Base64 data URL
  prompt: string;
}

export interface ProcessingState {
  isLoading: boolean;
  statusMessage: string;
}

export interface CanvasEditorHandle {
  getImageData: () => string;
  getMarkedImageData: () => string;
}
