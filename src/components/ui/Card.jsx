import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-zinc-200/50 dark:border-white/5 shadow-md shadow-black/5 dark:shadow-black/40 overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-5 border-b border-zinc-200/50 dark:border-white/5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-heading font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-6", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
