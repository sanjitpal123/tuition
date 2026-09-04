import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">{title}</h1>
      <p className="mt-4 text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">This page is under construction.</p>
    </div>
  );
}
