import React from 'react';

interface ButtonProps {
  name?: string; // Make `name` optional
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string; // Add className prop
  children?: React.ReactNode; // Add children prop
  variant?: 'default' | 'ghost' | 'outline' | 'link'; // Add variant prop
  size?: 'default' | 'sm' | 'lg' | 'icon'; // Add size prop
}

const Button = ({
  name,
  type = 'button',
  style,
  onClick,
  className,
  children,
  variant = 'default',
  size = 'default',
}: ButtonProps) => {
  // Define styles based on variant and size
  const variantStyles = {
    default: 'bg-[#634141] text-white hover:bg-[#634141]/90', // Custom color #634141
    ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizeStyles = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return (
    <button
      type={type}
      style={style}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
    >
      {children || name}
    </button>
  );
};

export default Button;