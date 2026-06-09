'use client';

import React, {useState, useCallback, useRef} from 'react';
import {useEditorStore} from '@/store/editor-store';
import {Button} from '@/components/ui/Button';

export const Toolbar: React.FC = () => {
  const {
    project, setCurrentFrame, setIsPlaying, isPlaying, addClip, currentFrame,
    zoom, setZoom, undo, redo, saveProject, loadProject, splitClip, selectedClipId,
  } = useEditorStore();

  const [projectName, setProjectName] = useState(project.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = () => {
    addClip('track-text-1', {
      type: 'text',
      name: 'Text',
      startFrame: currentFrame,
      duration: 60,
      text: 'Hello World',
      fontSize: 64,
      fontColor: '#ffffff',
      properties: {x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1},
      keyframes: [],
      effects: {brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0},
      audio: {volume: 1, fadeInDuration: 0, fadeOutDuration: 0, speed: 1},
      transitionIn: 'none',
      transitionOut: 'none',
      transitionDuration: 10,
    });
  };

  const handleSave = useCallback(() => {
    const json = saveProject();
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'project'}.remotion.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [saveProject, projectName]);

  const handleLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (loadProject(text)) {
        setProjectName(useEditorStore.getState().project.name);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [loadProject]);

  const handleSplit = useCallback(() => {
    if (selectedClipId) splitClip(selectedClipId, currentFrame);
  }, [selectedClipId, currentFrame, splitClip]);

  return (
    <div style={{height: 48, background: '#12122a', borderBottom: '1px solid #1e1e3a', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8}}>
      <input
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        onBlur={() => {
          const p = useEditorStore.getState().project;
          useEditorStore.getState().setProject({...p, name: projectName});
        }}
        style={{
          background: 'transparent', border: 'none', color: '#f0f0f0',
          fontSize: 15, fontWeight: 600, outline: 'none', width: 200,
        }}
      />

      <div style={{width: 1, height: 24, background: '#2a2a4a'}} />

      <Button size="sm" onClick={() => setIsPlaying(!isPlaying)}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">{isPlaying ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></> : <polygon points="5 3 19 12 5 21 5 3" />}</svg>}>
        {isPlaying ? 'Pause' : 'Play'}
      </Button>
      <Button size="sm" onClick={() => setCurrentFrame(0)}>↺ Reset</Button>

      <div style={{width: 1, height: 24, background: '#2a2a4a'}} />

      <Button size="sm" onClick={undo} title="Undo (Ctrl+Z)">↩ Undo</Button>
      <Button size="sm" onClick={redo} title="Redo (Ctrl+Shift+Z)">↪ Redo</Button>
      <Button size="sm" onClick={handleSplit} disabled={!selectedClipId} title="Split clip at playhead">✂ Split</Button>

      <div style={{width: 1, height: 24, background: '#2a2a4a'}} />

      <Button size="sm" variant="primary" onClick={handleAddText}>+ Text</Button>

      <div style={{flex: 1}} />

      <div style={{display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#666688'}}>
        <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))} style={{background: 'none', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: 16}}>−</button>
        <span style={{minWidth: 32, textAlign: 'center'}}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(Math.min(4, zoom + 0.25))} style={{background: 'none', border: 'none', color: '#a0a0b0', cursor: 'pointer', fontSize: 16}}>+</button>
      </div>

      <div style={{width: 1, height: 24, background: '#2a2a4a'}} />

      <input ref={fileInputRef} type="file" accept=".json" style={{display: 'none'}} onChange={handleLoad} />
      <Button size="sm" onClick={() => fileInputRef.current?.click()}>📂 Open</Button>
      <Button size="sm" variant="primary" onClick={handleSave}>💾 Save</Button>
    </div>
  );
};
