'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border-2 border-sand-300 bg-white text-night placeholder:text-night-300 focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise transition-colors duration-200',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
export default Input;
