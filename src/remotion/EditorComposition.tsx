import React, {useMemo} from 'react';
import type {Project} from '@/types/editor';
import {VideoLayer} from './layers/VideoLayer';
import {TextLayer} from './layers/TextLayer';
import {AudioLayer} from './layers/AudioLayer';

export const EditorComposition: React.FC<{project: Project}> = ({project}) => {
  const videoClips = useMemo(() => {
    return project.tracks
      .filter((t) => t.isVisible && (t.type === 'video' || t.type === 'overlay'))
      .flatMap((t) => t.clips);
  }, [project.tracks]);

  const textClips = useMemo(() => {
    return project.tracks
      .filter((t) => t.isVisible && t.type === 'text')
      .flatMap((t) => t.clips);
  }, [project.tracks]);

  const audioClips = useMemo(() => {
    return project.tracks
      .filter((t) => !t.isMuted && t.type === 'audio')
      .flatMap((t) => t.clips);
  }, [project.tracks]);

  return (
    <div
      style={{
        width: project.width,
        height: project.height,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {videoClips.map((clip) => (
        <VideoLayer key={clip.id} clip={clip} />
      ))}
      {textClips.map((clip) => (
        <TextLayer key={clip.id} clip={clip} />
      ))}
      {audioClips.map((clip) => (
        <AudioLayer key={clip.id} clip={clip} />
      ))}
    </div>
  );
};
