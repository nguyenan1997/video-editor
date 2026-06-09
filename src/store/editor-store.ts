'use client';

import {create} from 'zustand';
import type {Project, Track, Clip, ClipProperties, MediaItem, KeyframeTrack} from '@/types/editor';
import {DEFAULT_PROJECT} from '@/types/editor';
import {generateId} from '@/lib/utils';

const MAX_HISTORY = 50;

interface HistoryEntry {
  project: string;
  selectedClipId: string | null;
}

interface EditorState {
  project: Project;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  currentFrame: number;
  isPlaying: boolean;
  zoom: number;

  history: HistoryEntry[];
  historyIndex: number;

  setProject: (project: Project) => void;
  setCurrentFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;

  addTrack: (track: Omit<Track, 'id'>) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;

  addClip: (trackId: string, clip: Omit<Clip, 'id'>) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  updateClipProperties: (clipId: string, properties: Partial<ClipProperties>) => void;
  moveClip: (clipId: string, newStartFrame: number, newTrackId?: string) => void;
  trimClipStart: (clipId: string, newStartFrame: number) => void;
  trimClipEnd: (clipId: string, newDuration: number) => void;
  splitClip: (clipId: string, splitFrame: number) => void;
  selectClip: (clipId: string | null) => void;
  selectTrack: (trackId: string | null) => void;

  addKeyframe: (clipId: string, property: keyof ClipProperties, frame: number, value: number) => void;
  removeKeyframe: (clipId: string, property: keyof ClipProperties, frame: number) => void;
  updateKeyframes: (clipId: string, property: keyof ClipProperties, keyframes: {frame: number; value: number; easing?: string}[]) => void;

  addMedia: (item: Omit<MediaItem, 'id'>) => void;
  removeMedia: (mediaId: string) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  saveProject: () => string;
  loadProject: (json: string) => boolean;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  project: DEFAULT_PROJECT,
  selectedClipId: null,
  selectedTrackId: null,
  currentFrame: 0,
  isPlaying: false,
  zoom: 1,
  history: [],
  historyIndex: -1,

  setProject: (project) => set({project, selectedClipId: null}),
  setCurrentFrame: (frame) => set({currentFrame: frame}),
  setIsPlaying: (playing) => set({isPlaying: playing}),
  setZoom: (zoom) => set({zoom}),

  pushHistory: () => {
    const state = get();
    const entry: HistoryEntry = {
      project: JSON.stringify(state.project),
      selectedClipId: state.selectedClipId,
    };
    const history = state.history.slice(0, state.historyIndex + 1);
    history.push(entry);
    if (history.length > MAX_HISTORY) history.shift();
    set({history, historyIndex: history.length - 1});
  },

  undo: () => {
    const state = get();
    if (state.historyIndex < 0) return;
    const entry = state.history[state.historyIndex];
    set({
      project: JSON.parse(entry.project),
      selectedClipId: entry.selectedClipId,
      historyIndex: state.historyIndex - 1,
    });
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 2) return;
    const entry = state.history[state.historyIndex + 2];
    if (!entry) return;
    set({
      project: JSON.parse(entry.project),
      selectedClipId: entry.selectedClipId,
      historyIndex: state.historyIndex + 1,
    });
  },

  addTrack: (track) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: [...state.project.tracks, {...track, id: generateId('track')}],
      },
    }));
  },

  removeTrack: (trackId) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.filter((t) => t.id !== trackId),
      },
      selectedTrackId: state.selectedTrackId === trackId ? null : state.selectedTrackId,
    }));
  },

  updateTrack: (trackId, updates) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === trackId ? {...t, ...updates} : t
        ),
      },
    }));
  },

  reorderTracks: (fromIndex, toIndex) => {
    get().pushHistory();
    set((state) => {
      const tracks = [...state.project.tracks];
      const [moved] = tracks.splice(fromIndex, 1);
      tracks.splice(toIndex, 0, moved);
      return {project: {...state.project, tracks}};
    });
  },

  addClip: (trackId, clip) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === trackId
            ? {...t, clips: [...t.clips, {...clip, id: generateId('clip')}]}
            : t
        ),
      },
    }));
  },

  removeClip: (clipId) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.filter((c) => c.id !== clipId),
        })),
      },
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    }));
  },

  updateClip: (clipId, updates) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === clipId ? {...c, ...updates} : c
          ),
        })),
      },
    }));
  },

  updateClipProperties: (clipId, properties) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === clipId
              ? {...c, properties: {...c.properties, ...properties}}
              : c
          ),
        })),
      },
    }));
  },

  moveClip: (clipId, newStartFrame, newTrackId) => {
    get().pushHistory();
    set((state) => {
      const oldTrack = state.project.tracks.find((t) =>
        t.clips.some((c) => c.id === clipId)
      );
      if (!oldTrack) return state;

      const clip = oldTrack.clips.find((c) => c.id === clipId);
      if (!clip) return state;

      let tracks = state.project.tracks.map((t) => ({
        ...t,
        clips: t.clips.filter((c) => c.id !== clipId),
      }));

      const targetId = newTrackId ?? oldTrack.id;
      tracks = tracks.map((t) =>
        t.id === targetId
          ? {...t, clips: [...t.clips, {...clip, startFrame: newStartFrame}]}
          : t
      );

      return {project: {...state.project, tracks}};
    });
  },

  trimClipStart: (clipId, newStartFrame) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === clipId ? {...c, startFrame: newStartFrame, duration: Math.max(1, c.duration + c.startFrame - newStartFrame)} : c
          ),
        })),
      },
    }));
  },

  trimClipEnd: (clipId, newDuration) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === clipId ? {...c, duration: Math.max(1, newDuration)} : c
          ),
        })),
      },
    }));
  },

  splitClip: (clipId, splitFrame) => {
    get().pushHistory();
    set((state) => {
      for (const track of state.project.tracks) {
        const idx = track.clips.findIndex((c) => c.id === clipId);
        if (idx === -1) continue;
        const clip = track.clips[idx];
        const localSplit = splitFrame - clip.startFrame;
        if (localSplit <= 0 || localSplit >= clip.duration) return state;

        const newId = generateId('clip');
        const rightPart: Clip = {
          ...clip,
          id: newId,
          startFrame: splitFrame,
          duration: clip.duration - localSplit,
        };
        const leftPart: Clip = {
          ...clip,
          duration: localSplit,
        };

        const clips = [...track.clips];
        clips.splice(idx, 1, leftPart, rightPart);
        return {
          project: {
            ...state.project,
            tracks: state.project.tracks.map((t) =>
              t.id === track.id ? {...t, clips} : t
            ),
          },
        };
      }
      return state;
    });
  },

  selectClip: (clipId) => set({selectedClipId: clipId}),
  selectTrack: (trackId) => set({selectedTrackId: trackId}),

  addKeyframe: (clipId, property, frame, value) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) => {
            if (c.id !== clipId) return c;
            const existing = c.keyframes.find((k) => k.property === property);
            const kf = {frame, value, easing: 'linear' as const};
            if (existing) {
              const exists = existing.keyframes.some((k) => k.frame === frame);
              return {
                ...c,
                keyframes: c.keyframes.map((kt) =>
                  kt.property === property
                    ? {
                        ...kt,
                        keyframes: exists
                          ? kt.keyframes.filter((k) => k.frame !== frame)
                          : [...kt.keyframes, kf].sort((a, b) => a.frame - b.frame),
                      }
                    : kt
                ),
              };
            }
            return {
              ...c,
              keyframes: [...c.keyframes, {property, keyframes: [kf]}],
            };
          }),
        })),
      },
    }));
  },

  removeKeyframe: (clipId, property, frame) => {
    get().pushHistory();
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === clipId
              ? {
                  ...c,
                  keyframes: c.keyframes
                    .map((kt) =>
                      kt.property === property
                        ? {...kt, keyframes: kt.keyframes.filter((k) => k.frame !== frame)}
                        : kt
                    )
                    .filter((kt) => kt.keyframes.length > 0),
                }
              : c
          ),
        })),
      },
    }));
  },

  updateKeyframes: (clipId, property, keyframes) => {
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === clipId
              ? {
                  ...c,
                  keyframes: [
                    ...c.keyframes.filter((k) => k.property !== property),
                    {property, keyframes: keyframes as KeyframeTrack['keyframes']},
                  ],
                }
              : c
          ),
        })),
      },
    }));
  },

  addMedia: (item) =>
    set((state) => ({
      project: {
        ...state.project,
        media: [...state.project.media, {...item, id: generateId('media')}],
      },
    })),

  removeMedia: (mediaId) =>
    set((state) => ({
      project: {
        ...state.project,
        media: state.project.media.filter((m) => m.id !== mediaId),
      },
    })),

  saveProject: () => {
    const state = get();
    return JSON.stringify({
      version: 1,
      project: state.project,
    });
  },

  loadProject: (json) => {
    try {
      const data = JSON.parse(json);
      if (!data.project) return false;
      set({
        project: data.project,
        selectedClipId: null,
        selectedTrackId: null,
        currentFrame: 0,
        history: [],
        historyIndex: -1,
      });
      return true;
    } catch {
      return false;
    }
  },
}));
