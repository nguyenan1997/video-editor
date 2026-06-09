import React, {useMemo} from 'react';
import {Sequence, useCurrentFrame, interpolate} from 'remotion';
import type {Clip} from '@/types/editor';
import {getKeyframedValue} from '@/remotion/keyframes';

export const TextLayer: React.FC<{clip: Clip}> = ({clip}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - clip.startFrame;
  const duration = clip.duration;

  const x = useMemo(() => getKeyframedValue(clip.keyframes, 'x', localFrame, clip.properties.x), [clip.keyframes, clip.properties.x, localFrame]);
  const y = useMemo(() => getKeyframedValue(clip.keyframes, 'y', localFrame, clip.properties.y), [clip.keyframes, clip.properties.y, localFrame]);
  const scaleX = useMemo(() => getKeyframedValue(clip.keyframes, 'scaleX', localFrame, clip.properties.scaleX), [clip.keyframes, clip.properties.scaleX, localFrame]);
  const scaleY = useMemo(() => getKeyframedValue(clip.keyframes, 'scaleY', localFrame, clip.properties.scaleY), [clip.keyframes, clip.properties.scaleY, localFrame]);
  const rotation = useMemo(() => getKeyframedValue(clip.keyframes, 'rotation', localFrame, clip.properties.rotation), [clip.keyframes, clip.properties.rotation, localFrame]);
  const baseOpacity = useMemo(() => getKeyframedValue(clip.keyframes, 'opacity', localFrame, clip.properties.opacity), [clip.keyframes, clip.properties.opacity, localFrame]);

  const fadeIn = clip.transitionIn === 'fade'
    ? interpolate(localFrame, [0, clip.transitionDuration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  const fadeOut = clip.transitionOut === 'fade'
    ? interpolate(localFrame, [duration - clip.transitionDuration, duration], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  const opacity = baseOpacity * fadeIn * fadeOut;

  return (
    <Sequence from={clip.startFrame} durationInFrames={clip.duration} name={clip.name}>
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width: '100%', height: '100%',
          transform: `translate(${x}px, ${y}px) scale(${scaleX}) rotate(${rotation}deg)`,
          opacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          filter: clip.effects.blur > 0 ? `blur(${clip.effects.blur}px)` : undefined,
        }}
      >
        <span
          style={{
            fontSize: clip.fontSize ?? 48,
            color: clip.fontColor ?? '#ffffff',
            fontFamily: clip.fontFamily ?? 'Arial, sans-serif',
            textAlign: clip.textAlign ?? 'center',
            fontWeight: 700,
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {clip.text}
        </span>
      </div>
    </Sequence>
  );
};
