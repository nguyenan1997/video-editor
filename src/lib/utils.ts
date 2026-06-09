let idCounter = 0;

export function generateId(prefix = 'id'): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function framesToTime(frames: number, fps: number): string {
  const totalSeconds = frames / fps;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
