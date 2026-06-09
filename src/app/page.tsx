'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const EditorLayout = dynamic(
  () => import('@/components/editor/EditorLayout').then((m) => ({default: m.EditorLayout})),
  {ssr: false}
);

export default function Home() {
  return <EditorLayout />;
}
