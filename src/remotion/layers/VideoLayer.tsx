import React, {useMemo} from 'react';
import {Img, Video, Sequence, useCurrentFrame, interpolate} from 'remotion';
import type {Clip} from '@/types/editor';
import {getKeyframedValue} from '@/remotion/keyframes';

export const VideoLayer: React.FC<{clip: Clip}> = ({clip}) => {
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

  const slideInX = clip.transitionIn === 'slideLeft'
    ? interpolate(localFrame, [0, clip.transitionDuration], [200, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : clip.transitionIn === 'slideRight'
    ? interpolate(localFrame, [0, clip.transitionDuration], [-200, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0;

  const slideOutX = clip.transitionOut === 'slideLeft'
    ? interpolate(localFrame, [duration - clip.transitionDuration, duration], [0, -200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : clip.transitionOut === 'slideRight'
    ? interpolate(localFrame, [duration - clip.transitionDuration, duration], [0, 200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 0;

  const opacity = baseOpacity * fadeIn * fadeOut;

  const filter = useMemo(() => {
    const parts: string[] = [];
    if (clip.effects.brightness !== 100) parts.push(`brightness(${clip.effects.brightness}%)`);
    if (clip.effects.contrast !== 100) parts.push(`contrast(${clip.effects.contrast}%)`);
    if (clip.effects.saturation !== 100) parts.push(`saturate(${clip.effects.saturation}%)`);
    if (clip.effects.blur > 0) parts.push(`blur(${clip.effects.blur}px)`);
    if (clip.effects.hue !== 0) parts.push(`hue-rotate(${clip.effects.hue}deg)`);
    return parts.join(' ');
  }, [clip.effects]);

  const transform = `translate(${x + slideInX + slideOutX}px, ${y}px) scaleX(${scaleX}) scaleY(${scaleY}) rotate(${rotation}deg)`;

  return (
    <Sequence from={clip.startFrame} durationInFrames={clip.duration} name={clip.name}>
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0,
          width: '100%', height: '100%',
          opacity,
          transform,
          filter: filter || undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {clip.type === 'video' ? (
          <Video src={clip.src ?? ''} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        ) : (
          <Img src={clip.src ?? ''} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
        )}
      </div>
    </Sequence>
  );
};
