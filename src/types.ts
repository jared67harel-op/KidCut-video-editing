export type MediaType = 'video' | 'image' | 'text' | 'audio';

export interface MediaAsset {
  id: string;
  type: MediaType;
  url: string;
  name: string;
  duration?: number; // in seconds
}

export interface TimelineClip {
  id: string;
  assetId: string;
  startTime: number; // position on timeline in seconds
  duration: number; // length of the clip on timeline
  offset: number; // offset into the original asset
  layer: number; // 0 is background, higher is foreground
  type: MediaType;
  properties: {
    scale?: number;
    rotation?: number;
    x?: number;
    y?: number;
    opacity?: number;
    text?: string;
    fontSize?: number;
    color?: string;
  };
}

export interface EditorState {
  clips: TimelineClip[];
  currentTime: number;
  totalDuration: number;
  selectedClipId: string | null;
  isPlaying: boolean;
}
