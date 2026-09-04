import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-sm text-left text-zinc-500 dark:text-zinc-400 dark:text-zinc-400", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("text-xs text-zinc-700 dark:text-zinc-300 uppercase bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn("bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-b hover:bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl transition-colors", className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return <th className={cn("px-6 py-3 font-heading font-semibold text-zinc-900 dark:text-white tracking-tight", className)} {...props} />;
}

export function TableCell({ className, ...props }) {
  return <td className={cn("px-6 py-4 whitespace-nowrap", className)} {...props} />;
}
