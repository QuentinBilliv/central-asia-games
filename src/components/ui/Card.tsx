'use client';

import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'game' | 'elevated';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl overflow-hidden',
          {
            'bg-white border border-sand-200 shadow-sm': variant === 'default',
            'bg-white border-2 border-gold-200 shadow-md hover:shadow-xl hover:border-gold-400 transition-all duration-300 cursor-pointer':
              variant === 'game',
            'bg-white shadow-lg border border-sand-200': variant === 'elevated',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
