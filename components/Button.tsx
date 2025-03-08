import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  name?: string;
  type?: 'button' | 'submit' | 'reset'; // Add type prop for form buttons
  style?: React.CSSProperties; // Optional style prop
}

const Button: React.FC<ButtonProps> = ({ children, onClick, name = 'Button', type = 'button', style }) => {
  return (
    <button className={styles.button} onClick={onClick} type={type} style={style}>
      {name} {children}
    </button>
  );
};

export default Button;