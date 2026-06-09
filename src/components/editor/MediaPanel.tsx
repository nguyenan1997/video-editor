'use client';

import React, {useRef, useCallback} from 'react';
import {useEditorStore} from '@/store/editor-store';
import type {ClipType} from '@/types/editor';

export const MediaPanel: React.FC = () => {
  const {project, currentFrame, addMedia, removeMedia, addClip} = useEditorStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);
      let type: 'video' | 'image' | 'audio' = 'image';
      if (file.type.startsWith('video')) type = 'video';
      else if (file.type.startsWith('audio')) type = 'audio';
      addMedia({type, name: file.name, src: url});
    }
    e.target.value = '';
  };

  const addMediaToTimeline = useCallback((item: {id: string; type: string; name: string; src: string}) => {
    const trackType = item.type === 'audio' ? 'audio' : item.type === 'video' ? 'video' : 'overlay';
    const targetTrackId = project.tracks.find((t) => t.type === trackType)?.id;
    if (!targetTrackId) return;

    addClip(targetTrackId, {
      type: (item.type === 'audio' ? 'audio' : item.type === 'video' ? 'video' : 'image') as ClipType,
      name: item.name,
      startFrame: currentFrame,
      duration: 150,
      src: item.src,
      properties: {x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1},
      keyframes: [],
      effects: {brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0},
      audio: {volume: 1, fadeInDuration: 0, fadeOutDuration: 0, speed: 1},
      transitionIn: 'none',
      transitionOut: 'none',
      transitionDuration: 10,
    });
  }, [project.tracks, currentFrame, addClip]);

  const handleDragStart = useCallback((e: React.DragEvent, item: {id: string; type: string; name: string; src: string}) => {
    e.dataTransfer.setData('application/remotion-media', JSON.stringify({
      src: item.src,
      type: item.type,
      name: item.name,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  return (
    <div
      style={{
        width: 240, minWidth: 240, background: '#12122a',
        borderRight: '1px solid #1e1e3a',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{padding: '12px 14px', borderBottom: '1px solid #1e1e3a', fontSize: 13, fontWeight: 600, color: '#f0f0f0'}}>
        Media
      </div>

      <div style={{padding: '10px 14px'}}>
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: '100%', padding: '20px 10px',
            border: '2px dashed #2a2a4a', borderRadius: 8,
            background: 'transparent', color: '#a0a0b0',
            cursor: 'pointer', fontSize: 12,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e94560'; e.currentTarget.style.color = '#e94560'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.color = '#a0a0b0'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import media
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*" style={{display: 'none'}} onChange={handleFileSelect} />
      </div>

      <div style={{padding: '0 14px 8px', fontSize: 11, color: '#666688', fontStyle: 'italic'}}>
        Click to add at frame {currentFrame} · Drag to timeline
      </div>

      <div style={{flex: 1, overflow: 'auto', padding: '0 14px 14px'}}>
        {project.media.length === 0 && (
          <div style={{textAlign: 'center', color: '#555', fontSize: 12, padding: 20}}>No media imported yet</div>
        )}
        <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
          {project.media.map((item) => (
            <div
              key={item.id}
              draggable
              onClick={() => addMediaToTimeline(item)}
              onDragStart={(e) => handleDragStart(e, item)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: 8,
                background: '#1a1a2e', borderRadius: 6, cursor: 'grab',
                transition: 'all 0.15s', border: '1px solid transparent',
                userSelect: 'none',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#222244'; e.currentTarget.style.borderColor = '#3a3a5a'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.borderColor = 'transparent'; }}
            >
              <div style={{width: 40, height: 40, borderRadius: 4, background: '#2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                {item.type === 'video' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                ) : item.type === 'audio' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <div style={{flex: 1, overflow: 'hidden'}}>
                <div style={{fontSize: 12, color: '#f0f0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{item.name}</div>
                <div style={{fontSize: 10, color: '#666688'}}>{item.type}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeMedia(item.id); }}
                style={{background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 2, fontSize: 14, lineHeight: 1}}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
