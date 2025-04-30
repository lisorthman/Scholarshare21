import { ReactNode } from 'react';

export function Card({ children, className = '', onClick }: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-lg shadow p-4 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
