export interface ClipProperties {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
}

export interface Keyframe {
  frame: number;
  value: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface KeyframeTrack {
  property: keyof ClipProperties;
  keyframes: Keyframe[];
}

export interface ClipEffects {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
}

export interface AudioSettings {
  volume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
  speed: number;
}

export type ClipType = 'video' | 'image' | 'text' | 'audio';

export interface Clip {
  id: string;
  type: ClipType;
  name: string;
  startFrame: number;
  duration: number;
  src?: string;
  text?: string;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  properties: ClipProperties;
  keyframes: KeyframeTrack[];
  effects: ClipEffects;
  audio: AudioSettings;
  transitionIn: 'none' | 'fade' | 'slideLeft' | 'slideRight';
  transitionOut: 'none' | 'fade' | 'slideLeft' | 'slideRight';
  transitionDuration: number;
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'overlay';
  clips: Clip[];
  isMuted: boolean;
  isVisible: boolean;
  isLocked: boolean;
}

export interface MediaItem {
  id: string;
  type: 'video' | 'image' | 'audio';
  name: string;
  src: string;
  thumbnail?: string;
  duration?: number;
}

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  fps: number;
  duration: number;
  tracks: Track[];
  media: MediaItem[];
}

export const DEFAULT_CLIP_PROPERTIES: ClipProperties = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
};

export const DEFAULT_CLIP_EFFECTS: ClipEffects = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  hue: 0,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  volume: 1,
  fadeInDuration: 0,
  fadeOutDuration: 0,
  speed: 1,
};

export function createDefaultClip(overrides: Partial<Clip>): Clip {
  return {
    id: '',
    type: 'video',
    name: 'Clip',
    startFrame: 0,
    duration: 150,
    properties: {...DEFAULT_CLIP_PROPERTIES},
    keyframes: [],
    effects: {...DEFAULT_CLIP_EFFECTS},
    audio: {...DEFAULT_AUDIO_SETTINGS},
    transitionIn: 'none',
    transitionOut: 'none',
    transitionDuration: 10,
    ...overrides,
  };
}

export const DEFAULT_PROJECT: Project = {
  id: 'project-1',
  name: 'Untitled Project',
  width: 1920,
  height: 1080,
  fps: 30,
  duration: 300,
  tracks: [
    {
      id: 'track-video-1',
      name: 'Video 1',
      type: 'video',
      clips: [],
      isMuted: false,
      isVisible: true,
      isLocked: false,
    },
    {
      id: 'track-audio-1',
      name: 'Audio 1',
      type: 'audio',
      clips: [],
      isMuted: false,
      isVisible: true,
      isLocked: false,
    },
    {
      id: 'track-overlay-1',
      name: 'Overlay',
      type: 'overlay',
      clips: [],
      isMuted: false,
      isVisible: true,
      isLocked: false,
    },
    {
      id: 'track-text-1',
      name: 'Text',
      type: 'text',
      clips: [],
      isMuted: false,
      isVisible: true,
      isLocked: false,
    },
  ],
  media: [],
};
