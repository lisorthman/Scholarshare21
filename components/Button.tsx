// components/Button.tsx
import React from 'react';

interface ButtonProps {
  name: string;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Add event parameter
}

const Button = ({ name, type = 'button', style, onClick }: ButtonProps) => {
  return (
    <button
      type={type}
      style={{
        backgroundColor: '#634141',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        ...style,
      }}
      onClick={onClick} // Pass the onClick prop
    >
      {name}
    </button>
  );
};

export default Button;