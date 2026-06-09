'use client';

import React, {useRef, useEffect, useCallback} from 'react';
import {Player} from '@remotion/player';
import type {PlayerRef} from '@remotion/player';
import {useEditorStore} from '@/store/editor-store';
import {EditorComposition} from '@/remotion/EditorComposition';

export const Preview: React.FC = () => {
  const {project, currentFrame, setCurrentFrame, setIsPlaying} = useEditorStore();
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onFrame = (e: {detail: {frame: number}}) => {
      setCurrentFrame(e.detail.frame);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    player.addEventListener('frameupdate', onFrame);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);
    player.addEventListener('ended', onEnded);

    return () => {
      player.removeEventListener('frameupdate', onFrame);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
      player.removeEventListener('ended', onEnded);
    };
  }, [setCurrentFrame, setIsPlaying]);

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d0d1a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          aspectRatio: '16/9',
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
        }}
      >
        <Player
          ref={playerRef}
          component={EditorComposition}
          inputProps={{project}}
          durationInFrames={project.duration}
          compositionWidth={project.width}
          compositionHeight={project.height}
          fps={project.fps}
          style={{width: '100%', height: '100%'}}
          controls
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 24,
          fontSize: 13,
          color: '#a0a0b0',
          fontVariantNumeric: 'tabular-nums',
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 10px',
          borderRadius: 4,
        }}
      >
        {currentFrame} / {project.duration} ({project.fps} fps)
      </div>
    </div>
  );
};
