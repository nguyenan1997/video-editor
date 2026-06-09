'use client';

import React from 'react';
import {Toolbar} from './Toolbar';
import {Preview} from './Preview';
import {Timeline} from './Timeline';
import {MediaPanel} from './MediaPanel';
import {PropertiesPanel} from './PropertiesPanel';

export const EditorLayout: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Toolbar />

      <div style={{flex: 1, display: 'flex', overflow: 'hidden'}}>
        <MediaPanel />

        <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
          <Preview />
        </div>

        <PropertiesPanel />
      </div>

      <Timeline />
    </div>
  );
};
