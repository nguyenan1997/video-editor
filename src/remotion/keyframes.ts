import {interpolate} from 'remotion';
import type {KeyframeTrack} from '@/types/editor';

export function getKeyframedValue(
  keyframes: KeyframeTrack[],
  property: string,
  frame: number,
  defaultValue: number
): number {
  const track = keyframes.find((k) => k.property === property);
  if (!track || track.keyframes.length === 0) return defaultValue;

  const kfs = track.keyframes;

  if (frame <= kfs[0].frame) return kfs[0].value;
  if (frame >= kfs[kfs.length - 1].frame) return kfs[kfs.length - 1].value;

  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i];
    const b = kfs[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      return interpolate(frame, [a.frame, b.frame], [a.value, b.value], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    }
  }

  return defaultValue;
}
