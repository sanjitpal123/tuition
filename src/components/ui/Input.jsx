import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "block w-full rounded-md border-0 py-2 text-zinc-900 dark:text-zinc-100 shadow-md shadow-black/40 ring-1 ring-inset ring-gray-300 placeholder:text-zinc-400 dark:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6",
          Icon ? "pl-10" : "pl-3",
          className
        )}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
