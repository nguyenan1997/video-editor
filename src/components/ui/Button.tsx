import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {background: '#2a2a4a', color: '#f0f0f0'},
  primary: {background: '#e94560', color: '#ffffff'},
  ghost: {background: 'transparent', color: '#a0a0b0'},
  danger: {background: '#ff4444', color: '#ffffff'},
};

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: {padding: '4px 8px', fontSize: 12, gap: 4},
  md: {padding: '8px 14px', fontSize: 14, gap: 6},
  lg: {padding: '10px 20px', fontSize: 16, gap: 8},
};

export const Button: React.FC<ButtonProps> = ({variant = 'default', size = 'md', icon, children, style, ...props}) => (
  <button
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      borderRadius: 6,
      cursor: 'pointer',
      fontWeight: 500,
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
      opacity: props.disabled ? 0.4 : 1,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    }}
    {...props}
  >
    {icon}
    {children}
  </button>
);
