import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({label, value, min, max, step = 1, onChange}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a0a0b0'}}>
      <span>{label}</span>
      <span>{value.toFixed(step < 1 ? 2 : 0)}</span>
    </div>
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: '100%',
        height: 4,
        appearance: 'none',
        background: '#2a2a4a',
        borderRadius: 2,
        outline: 'none',
        cursor: 'pointer',
      }}
    />
  </div>
);
