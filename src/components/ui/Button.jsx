import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
  const variants = {
    primary: 'bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-500/50 text-white hover:from-red-600 hover:to-red-700',
    secondary: 'bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#030303]/80 shadow-sm shadow-black/5 dark:shadow-black/40',
    outline: 'border border-red-500 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
    ghost: 'text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:bg-zinc-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-black/5 dark:shadow-black/40',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10 flex items-center justify-center',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
