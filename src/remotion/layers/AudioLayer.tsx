import React from 'react';
import {Audio, Sequence, useCurrentFrame, interpolate} from 'remotion';
import type {Clip} from '@/types/editor';

export const AudioLayer: React.FC<{clip: Clip}> = ({clip}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - clip.startFrame;
  const duration = clip.duration;

  const baseVolume = clip.audio.volume;

  const fadeIn = clip.audio.fadeInDuration > 0
    ? interpolate(localFrame, [0, clip.audio.fadeInDuration], [0, baseVolume], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : baseVolume;

  const fadeOut = clip.audio.fadeOutDuration > 0
    ? interpolate(localFrame, [duration - clip.audio.fadeOutDuration, duration], [baseVolume, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : baseVolume;

  const volume = Math.min(fadeIn, fadeOut);

  return (
    <Sequence from={clip.startFrame} durationInFrames={clip.duration} name={clip.name}>
      {clip.src && (
        <Audio
          src={clip.src}
          volume={volume}
          playbackRate={clip.audio.speed}
        />
      )}
    </Sequence>
  );
};
