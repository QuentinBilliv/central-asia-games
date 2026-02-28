'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-turquoise text-white hover:bg-turquoise-600 focus:ring-turquoise active:bg-turquoise-700 shadow-md hover:shadow-lg':
              variant === 'primary',
            'bg-gold text-white hover:bg-gold-600 focus:ring-gold active:bg-gold-700 shadow-md hover:shadow-lg':
              variant === 'secondary',
            'border-2 border-turquoise text-turquoise hover:bg-turquoise-50 focus:ring-turquoise':
              variant === 'outline',
            'text-turquoise hover:bg-turquoise-50 focus:ring-turquoise':
              variant === 'ghost',
          },
          {
            'text-sm px-3 py-1.5': size === 'sm',
            'text-base px-5 py-2.5': size === 'md',
            'text-lg px-8 py-3.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
