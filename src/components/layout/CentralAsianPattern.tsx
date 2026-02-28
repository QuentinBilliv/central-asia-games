'use client';

import { cn } from '@/lib/utils';

interface CentralAsianPatternProps {
  variant?: 'suzani' | 'ikat' | 'geometric';
  className?: string;
}

export default function CentralAsianPattern({
  variant = 'suzani',
  className,
}: CentralAsianPatternProps) {
  const patternSrc = `/patterns/${variant}.svg`;

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{
        backgroundImage: `url(${patternSrc})`,
        backgroundRepeat: 'repeat',
      }}
    />
  );
}
