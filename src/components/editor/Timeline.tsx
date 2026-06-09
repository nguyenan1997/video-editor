'use client';

import React, {useRef, useCallback, useMemo, useState} from 'react';
import {useEditorStore} from '@/store/editor-store';
import {framesToTime} from '@/lib/utils';
import type {Clip, Track} from '@/types/editor';

const TRACK_HEIGHT = 52;
const PIXELS_PER_FRAME = 4;
const TIMELINE_HEADER_HEIGHT = 28;
const LABEL_WIDTH = 140;

const typeColors: Record<string, string> = {
  video: '#4a9eff',
  audio: '#44cc88',
  text: '#ff6b9d',
  overlay: '#ffaa44',
};

const AudioWaveform: React.FC<{color: string; duration: number; pixelsPerFrame: number}> = ({color, duration, pixelsPerFrame}) => {
  const w = Math.max(duration * pixelsPerFrame, 20);
  const bars = Math.min(Math.floor(w / 3), 120);
  const heights = useMemo(() => {
    const h: number[] = [];
    for (let i = 0; i < bars; i++) {
      h.push(0.15 + Math.random() * 0.85);
    }
    return h;
  }, [bars]);

  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 1, padding: '4px 0', opacity: 0.3}}>
      {heights.map((h, i) => (
        <div key={i} style={{width: 2, height: `${h * 100}%`, background: color, borderRadius: 1}} />
      ))}
    </div>
  );
};

const TrackRow: React.FC<{
  track: Track;
  trackIndex: number;
  pixelsPerFrame: number;
  totalFrames: number;
  selectedClipId: string | null;
  currentFrame: number;
  onSelectClip: (id: string | null) => void;
  onDrop: (trackId: string, frame: number, mediaSrc: string, mediaType: string, mediaName: string) => void;
  onTrimStart: (clipId: string, newStart: number) => void;
  onTrimEnd: (clipId: string, newDuration: number) => void;
  onMoveClip: (clipId: string, newStart: number) => void;
  onDblClick: (clipId: string) => void;
}> = ({
  track, trackIndex, pixelsPerFrame, totalFrames, selectedClipId, currentFrame,
  onSelectClip, onDrop, onTrimStart, onTrimEnd, onMoveClip, onDblClick,
}) => {
  const trackColor = typeColors[track.type] ?? '#666688';
  const [draggingClip, setDraggingClip] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [trimSide, setTrimSide] = useState<'start' | 'end' | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/remotion-media');
    if (!data) return;
    const {src, type, name} = JSON.parse(data);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.max(0, Math.round(x / pixelsPerFrame));
    onDrop(track.id, frame, src, type, name);
  }, [track.id, pixelsPerFrame, onDrop]);

  const handleMouseDown = useCallback((e: React.MouseEvent, clipId: string, side: 'start' | 'end' | 'move') => {
    e.stopPropagation();
    onSelectClip(clipId);

    if (side === 'move') {
      setDraggingClip(clipId);
      setDragOffset(e.clientX);
    } else {
      setTrimSide(side);
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (side === 'start' || side === 'end') {
        const rect = (e.currentTarget as HTMLElement).closest('[data-timeline-area]')?.getBoundingClientRect();
        if (!rect) return;
        const x = ev.clientX - rect.left;
        const frame = Math.max(0, Math.round(x / pixelsPerFrame));
        if (side === 'start') {
          onTrimStart(clipId, frame);
        } else {
          const clip = track.clips.find((c) => c.id === clipId);
          if (clip) onTrimEnd(clipId, frame - clip.startFrame);
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingClip(null);
      setTrimSide(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onSelectClip, pixelsPerFrame, track.clips, onTrimStart, onTrimEnd]);

  return (
    <div
      style={{
        display: 'flex',
        height: TRACK_HEIGHT,
        borderBottom: '1px solid #1e1e3a',
      }}
    >
      <div
        style={{
          width: LABEL_WIDTH,
          minWidth: LABEL_WIDTH,
          padding: '4px 10px',
          background: '#12122a',
          borderRight: '1px solid #1e1e3a',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: '#a0a0b0',
          overflow: 'hidden',
        }}
      >
        <div style={{width: 8, height: 8, borderRadius: '50%', background: trackColor, flexShrink: 0}} />
        <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1}}>
          {track.name}
        </span>
        {track.type === 'audio' && (
          <span style={{fontSize: 10, color: trackColor}}>♪</span>
        )}
      </div>

      <div
        data-timeline-area
        style={{flex: 1, position: 'relative', background: '#0d0d1a', overflow: 'hidden'}}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {track.clips.map((clip) => {
          const left = clip.startFrame * pixelsPerFrame;
          const width = clip.duration * pixelsPerFrame;

          return (
            <div
              key={clip.id}
              onClick={() => onSelectClip(clip.id)}
              onDoubleClick={() => onDblClick(clip.id)}
              onMouseDown={(e) => handleMouseDown(e, clip.id, 'move')}
              style={{
                position: 'absolute',
                left,
                top: 4,
                width: Math.max(width, 20),
                height: TRACK_HEIGHT - 8,
                background: trackColor,
                borderRadius: 6,
                opacity: track.isVisible ? 0.85 : 0.4,
                cursor: draggingClip === clip.id ? 'grabbing' : 'grab',
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                fontSize: 11,
                fontWeight: 500,
                color: '#fff',
                overflow: 'hidden',
                border: selectedClipId === clip.id ? '2px solid #ffffff' : '2px solid transparent',
                boxShadow: selectedClipId === clip.id ? '0 0 10px rgba(255,255,255,0.2)' : 'none',
                zIndex: selectedClipId === clip.id ? 10 : 1,
                transition: 'box-shadow 0.15s',
                userSelect: 'none',
              }}
            >
              {/* Audio waveform */}
              {clip.type === 'audio' && (
                <AudioWaveform color={trackColor} duration={clip.duration} pixelsPerFrame={pixelsPerFrame} />
              )}

              {/* Trim handles */}
              <div
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, clip.id, 'start'); }}
                style={{
                  position: 'absolute', left: -3, top: 0, width: 8, height: '100%',
                  cursor: 'ew-resize', zIndex: 5, background: trimSide === 'start' ? 'rgba(255,255,255,0.3)' : 'transparent',
                  borderRadius: '6px 0 0 6px',
                }}
              />
              <div
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, clip.id, 'end'); }}
                style={{
                  position: 'absolute', right: -3, top: 0, width: 8, height: '100%',
                  cursor: 'ew-resize', zIndex: 5, background: trimSide === 'end' ? 'rgba(255,255,255,0.3)' : 'transparent',
                  borderRadius: '0 6px 6px 0',
                }}
              />

              {/* Clip label */}
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', position: 'relative', zIndex: 2}}>
                {clip.name || clip.type}
              </span>

              {/* Duration badge */}
              <span style={{
                position: 'absolute', right: 6, fontSize: 9, opacity: 0.7, zIndex: 2,
              }}>
                {clip.duration}f
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Timeline: React.FC = () => {
  const {
    project, currentFrame, setCurrentFrame, selectedClipId, selectClip,
    zoom, addClip, splitClip, moveClip, trimClipStart, trimClipEnd,
    updateClip,
  } = useEditorStore();

  const pixelsPerFrame = PIXELS_PER_FRAME * zoom;
  const totalWidth = project.duration * pixelsPerFrame;

  const frames = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i <= project.duration; i += project.fps) {
      arr.push(i);
    }
    return arr;
  }, [project.duration, project.fps]);

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const frame = Math.round(x / pixelsPerFrame);
    setCurrentFrame(Math.max(0, Math.min(frame, project.duration - 1)));
  }, [pixelsPerFrame, project.duration, setCurrentFrame]);

  const handleDrop = useCallback((trackId: string, frame: number, mediaSrc: string, mediaType: string, mediaName: string) => {
    const clipType = mediaType === 'audio' ? 'audio' : mediaType === 'video' ? 'video' : 'image';
    addClip(trackId, {
      type: clipType as Clip['type'],
      name: mediaName,
      startFrame: frame,
      duration: 150,
      src: mediaSrc,
      properties: {x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1},
      keyframes: [],
      effects: {brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0},
      audio: {volume: 1, fadeInDuration: 0, fadeOutDuration: 0, speed: 1},
      transitionIn: 'none',
      transitionOut: 'none',
      transitionDuration: 10,
    });
  }, [addClip]);

  const handleDblClick = useCallback((clipId: string) => {
    const frame = currentFrame;
    splitClip(clipId, frame);
  }, [currentFrame, splitClip]);

  return (
    <div
      style={{
        height: 240,
        background: '#0d0d1a',
        borderTop: '2px solid #1e1e3a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{height: TIMELINE_HEADER_HEIGHT, background: '#12122a', display: 'flex', borderBottom: '1px solid #1e1e3a'}}>
        <div style={{width: LABEL_WIDTH, minWidth: LABEL_WIDTH, borderRight: '1px solid #1e1e3a'}} />
        <div style={{flex: 1, position: 'relative', overflow: 'hidden'}}>
          {frames.map((f) => (
            <div
              key={f}
              style={{
                position: 'absolute',
                left: f * pixelsPerFrame,
                top: 0, height: '100%',
                borderLeft: f % (project.fps * 5) === 0 ? '1px solid #3a3a5a' : '1px solid #1a1a3a',
              }}
            >
              {f % (project.fps * 5) === 0 && (
                <span style={{position: 'absolute', left: 4, top: 4, fontSize: 10, color: '#666688', whiteSpace: 'nowrap'}}>
                  {framesToTime(f, project.fps)}
                </span>
              )}
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              left: currentFrame * pixelsPerFrame,
              top: 0, width: 2, height: '100%',
              background: '#e94560',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            <div style={{width: 10, height: 10, background: '#e94560', borderRadius: '0 0 4px 4px', marginLeft: -4}} />
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div style={{flex: 1, overflow: 'auto'}} onClick={handleTimelineClick}>
        <div style={{width: Math.max(totalWidth + LABEL_WIDTH, 800)}}>
          {project.tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              trackIndex={i}
              pixelsPerFrame={pixelsPerFrame}
              totalFrames={project.duration}
              selectedClipId={selectedClipId}
              currentFrame={currentFrame}
              onSelectClip={selectClip}
              onDrop={handleDrop}
              onTrimStart={(clipId, start) => trimClipStart(clipId, start)}
              onTrimEnd={(clipId, dur) => trimClipEnd(clipId, dur)}
              onMoveClip={(clipId, start) => moveClip(clipId, start)}
              onDblClick={handleDblClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
