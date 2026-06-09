'use client';

import React, {useMemo} from 'react';
import {useEditorStore} from '@/store/editor-store';
import {Slider} from '@/components/ui/Slider';
import {Input} from '@/components/ui/Input';
import {Button} from '@/components/ui/Button';
import {DEFAULT_CLIP_PROPERTIES, DEFAULT_CLIP_EFFECTS, DEFAULT_AUDIO_SETTINGS} from '@/types/editor';
import type {ClipProperties, Clip} from '@/types/editor';

const KF_BTN = (on: boolean) => ({
  width: 20,
  height: 20,
  border: 'none',
  borderRadius: '50%',
  background: on ? '#e94560' : '#2a2a4a',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 0.15s',
} as React.CSSProperties);

const PropRow: React.FC<{
  label: string;
  clip: Clip;
  prop: keyof ClipProperties;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}> = ({label, clip, prop, value, min, max, step, onChange}) => {
  const {currentFrame, addKeyframe, selectedClipId} = useEditorStore();
  const localFrame = currentFrame - clip.startFrame;
  const hasKf = clip.keyframes.some((k) => k.property === prop && k.keyframes.some((kf) => kf.frame === localFrame));
  const isActive = localFrame >= 0 && localFrame < clip.duration;

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
      <button
        title={hasKf ? 'Remove keyframe' : 'Add keyframe'}
        onClick={() => selectedClipId && addKeyframe(selectedClipId, prop, localFrame, value)}
        style={{
          ...KF_BTN(hasKf),
          opacity: isActive ? 1 : 0.3,
        }}
      >
        ◆
      </button>
      <div style={{flex: 1}}>
        <Slider label={label} value={value} min={min} max={max} step={step} onChange={onChange} />
      </div>
    </div>
  );
};

export const PropertiesPanel: React.FC = () => {
  const {
    project, selectedClipId, updateClip, updateClipProperties, removeClip,
    currentFrame, updateKeyframes,
  } = useEditorStore();

  const selectedClip = selectedClipId
    ? project.tracks.flatMap((t) => t.clips).find((c) => c.id === selectedClipId)
    : null;

  if (!selectedClip) {
    return (
      <div style={{width: 260, minWidth: 260, background: '#12122a', borderLeft: '1px solid #1e1e3a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 13}}>
        Select a clip to edit
      </div>
    );
  }

  return (
    <div style={{width: 260, minWidth: 260, background: '#12122a', borderLeft: '1px solid #1e1e3a', display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
      <div style={{padding: '12px 14px', borderBottom: '1px solid #1e1e3a', fontSize: 13, fontWeight: 600, color: '#f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        Properties
        <Button variant="ghost" size="sm" onClick={() => removeClip(selectedClip.id)}>× Delete</Button>
      </div>

      <div style={{padding: 14, display: 'flex', flexDirection: 'column', gap: 14}}>
        {/* Name / Text */}
        {selectedClip.type === 'text' ? (
          <Input label="Text" value={selectedClip.text ?? ''} onChange={(e) => updateClip(selectedClip.id, {text: e.target.value})} />
        ) : null}
        <Input label="Name" value={selectedClip.name} onChange={(e) => updateClip(selectedClip.id, {name: e.target.value})} />

        {/* Position */}
        <div style={{fontSize: 11, color: '#666688', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1}}>Position</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8}}>
          <Input label="X" type="number" value={selectedClip.properties.x} onChange={(e) => updateClipProperties(selectedClip.id, {x: Number(e.target.value)})} />
          <Input label="Y" type="number" value={selectedClip.properties.y} onChange={(e) => updateClipProperties(selectedClip.id, {y: Number(e.target.value)})} />
        </div>

        {/* Transform with keyframes */}
        <div style={{fontSize: 11, color: '#666688', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1}}>
          Transform <span style={{fontWeight: 400, fontSize: 10}}>◆ = keyframe</span>
        </div>
        <PropRow label="Scale X" clip={selectedClip} prop="scaleX" value={selectedClip.properties.scaleX} min={0.1} max={3} step={0.01}
          onChange={(v) => updateClipProperties(selectedClip.id, {scaleX: v})} />
        <PropRow label="Scale Y" clip={selectedClip} prop="scaleY" value={selectedClip.properties.scaleY} min={0.1} max={3} step={0.01}
          onChange={(v) => updateClipProperties(selectedClip.id, {scaleY: v})} />
        <PropRow label="Rotation" clip={selectedClip} prop="rotation" value={selectedClip.properties.rotation} min={-180} max={180} step={1}
          onChange={(v) => updateClipProperties(selectedClip.id, {rotation: v})} />
        <PropRow label="Opacity" clip={selectedClip} prop="opacity" value={selectedClip.properties.opacity} min={0} max={1} step={0.01}
          onChange={(v) => updateClipProperties(selectedClip.id, {opacity: v})} />
        <PropRow label="X" clip={selectedClip} prop="x" value={selectedClip.properties.x} min={-1000} max={1000} step={1}
          onChange={(v) => updateClipProperties(selectedClip.id, {x: v})} />
        <PropRow label="Y" clip={selectedClip} prop="y" value={selectedClip.properties.y} min={-1000} max={1000} step={1}
          onChange={(v) => updateClipProperties(selectedClip.id, {y: v})} />

        {/* Timing */}
        <div style={{fontSize: 11, color: '#666688', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1}}>Timing</div>
        <Slider label="Start Frame" value={selectedClip.startFrame} min={0} max={project.duration - 1} step={1}
          onChange={(v) => updateClip(selectedClip.id, {startFrame: v})} />
        <Slider label="Duration" value={selectedClip.duration} min={1} max={project.duration} step={1}
          onChange={(v) => updateClip(selectedClip.id, {duration: v})} />

        {/* Transitions */}
        <div style={{fontSize: 11, color: '#666688', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1}}>Transitions</div>
        <div style={{display: 'flex', gap: 8}}>
          <div style={{flex: 1}}>
            <div style={{fontSize: 11, color: '#a0a0b0', marginBottom: 4}}>In</div>
            <select
              value={selectedClip.transitionIn}
              onChange={(e) => updateClip(selectedClip.id, {transitionIn: e.target.value as Clip['transitionIn']})}
              style={{width: '100%', padding: '4px 6px', background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 4, color: '#f0f0f0', fontSize: 12}}
            >
              <option value="none">None</option>
              <option value="fade">Fade in</option>
              <option value="slideLeft">Slide Left</option>
              <option value="slideRight">Slide Right</option>
            </select>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 11, color: '#a0a0b0', marginBottom: 4}}>Out</div>
            <select
              value={selectedClip.transitionOut}
              onChange={(e) => updateClip(selectedClip.id, {transitionOut: e.target.value as Clip['transitionOut']})}
              style={{width: '100%', padding: '4px 6px', background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 4, color: '#f0f0f0', fontSize: 12}}
            >
              <option value="none">None</option>
              <option value="fade">Fade out</option>
              <option value="slideLeft">Slide Left</option>
              <option value="slideRight">Slide Right</option>
            </select>
          </div>
        </div>
        <Slider label="Transition Duration (f)" value={selectedClip.transitionDuration} min={1} max={60} step={1}
          onChange={(v) => updateClip(selectedClip.id, {transitionDuration: v})} />

        {/* Effects */}
        <div style={{fontSize: 11, color: '#666688', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1}}>Effects</div>
        <Slider label="Brightness" value={selectedClip.effects.brightness} min={0} max={200} step={1}
          onChange={(v) => updateClip(selectedClip.id, {effects: {...selectedClip.effects, brightness: v}})} />
        <Slider label="Contrast" value={selectedClip.effects.contrast} min={0} max={200} step={1}
          onChange={(v) => updateClip(selectedClip.id, {effects: {...selectedClip.effects, contrast: v}})} />
        <Slider label="Saturation" value={selectedClip.effects.saturation} min={0} max={200} step={1}
          onChange={(v) => updateClip(selectedClip.id, {effects: {...selectedClip.effects, saturation: v}})} />
        <Slider label="Hue" value={selectedClip.effects.hue} min={-180} max={180} step={1}
          onChange={(v) => updateClip(selectedClip.id, {effects: {...selectedClip.effects, hue: v}})} />
        <Slider label="Blur" value={selectedClip.effects.blur} min={0} max={50} step={1}
          onChange={(v) => updateClip(selectedClip.id, {effects: {...selectedClip.effects, blur: v}})} />

        {/* Audio settings */}
        {['video', 'audio'].includes(selectedClip.type) && (
          <>
            <div style={{fontSize: 11, color: '#666688', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1}}>Audio</div>
            <Slider label="Volume" value={selectedClip.audio.volume} min={0} max={1} step={0.01}
              onChange={(v) => updateClip(selectedClip.id, {audio: {...selectedClip.audio, volume: v}})} />
            <Slider label="Fade In (f)" value={selectedClip.audio.fadeInDuration} min={0} max={60} step={1}
              onChange={(v) => updateClip(selectedClip.id, {audio: {...selectedClip.audio, fadeInDuration: v}})} />
            <Slider label="Fade Out (f)" value={selectedClip.audio.fadeOutDuration} min={0} max={60} step={1}
              onChange={(v) => updateClip(selectedClip.id, {audio: {...selectedClip.audio, fadeOutDuration: v}})} />
            <Slider label="Speed" value={selectedClip.audio.speed} min={0.25} max={4} step={0.25}
              onChange={(v) => updateClip(selectedClip.id, {audio: {...selectedClip.audio, speed: v}})} />
          </>
        )}

        {/* Text style */}
        {selectedClip.type === 'text' && (
          <>
            <div style={{fontSize: 11, color: '#666688', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1}}>Text Style</div>
            <Slider label="Font Size" value={selectedClip.fontSize ?? 48} min={12} max={200} step={1}
              onChange={(v) => updateClip(selectedClip.id, {fontSize: v})} />
            <Input label="Font Color" type="color" value={selectedClip.fontColor ?? '#ffffff'}
              onChange={(e) => updateClip(selectedClip.id, {fontColor: e.target.value})} style={{height: 32, padding: 2}} />
          </>
        )}

        {/* Reset */}
        <Button variant="ghost" size="sm"
          onClick={() => {
            updateClipProperties(selectedClip.id, DEFAULT_CLIP_PROPERTIES);
            updateClip(selectedClip.id, {
              effects: {...DEFAULT_CLIP_EFFECTS},
              audio: {...DEFAULT_AUDIO_SETTINGS},
              keyframes: [],
            });
          }}
          style={{marginTop: 8}}
        >
          Reset All
        </Button>
      </div>
    </div>
  );
};
