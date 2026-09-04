import React from 'react';
import { cn } from '../../lib/utils';

export function Avatar({ src, alt, fallback, className, size = 'default' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    default: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-24 w-24 text-2xl'
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 font-semibold", sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt || ''} className="h-full w-full object-cover" />
      ) : (
        <span className="uppercase">{fallback?.substring(0, 2) || 'TU'}</span>
      )}
    </div>
  );
}
