import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({label, style, ...props}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
    {label && <span style={{fontSize: 12, color: '#a0a0b0'}}>{label}</span>}
    <input
      style={{
        width: '100%',
        padding: '6px 10px',
        background: '#1a1a2e',
        border: '1px solid #2a2a4a',
        borderRadius: 4,
        color: '#f0f0f0',
        fontSize: 13,
        outline: 'none',
        ...style,
      }}
      {...props}
    />
  </div>
);
