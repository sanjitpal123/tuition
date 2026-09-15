import React from 'react';
import { IndianRupee } from 'lucide-react';

function getInitials(name) {
  if (!name) return 'ST';
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function FeeStudentCard({ student, onCollect, isSubmitting }) {
  const remaining = student.remainingBalance || student.monthlyFee || 0;
  const isPartial = student.totalPaidThisMonth > 0 && student.computedFeeStatus !== 'Paid';

  return (
    <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-zinc-200/50 dark:border-white/5 shadow-md shadow-black/5 dark:shadow-black/40 p-4 flex items-center gap-3 sm:gap-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
      {/* Avatar */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 font-bold text-xs sm:text-sm flex items-center justify-center flex-shrink-0">
        {getInitials(student.name)}
      </div>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-heading font-bold text-zinc-900 dark:text-white truncate">
          {student.name}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
          {student.batchName || 'General'}
        </p>
        {isPartial && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
            ₹{student.totalPaidThisMonth} paid · ₹{remaining} left
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0 mr-1 sm:mr-2">
        <p className="text-lg sm:text-xl font-heading font-bold text-zinc-900 dark:text-white">
          ₹{remaining.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Collect Button */}
      <button
        type="button"
        onClick={() => onCollect(student)}
        disabled={isSubmitting}
        className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white text-xs sm:text-sm font-bold shadow-sm disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
      >
        <IndianRupee className="w-3.5 h-3.5 hidden sm:block" />
        <span>Collect</span>
      </button>
    </div>
  );
}
