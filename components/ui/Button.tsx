'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white hover:opacity-90',
    secondary: 'text-white hover:opacity-90',
  };

  const styleVar = {
    primary: { backgroundColor: '#0088D0' },
    secondary: { backgroundColor: '#981E52' },
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      style={styleVar[variant]}
      {...props}
    >
      {children}
    </button>
  );
}