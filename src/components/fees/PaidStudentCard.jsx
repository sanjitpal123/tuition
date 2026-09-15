import React from 'react';
import { CheckCircle2, Edit2, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

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

export function PaidStudentCard({ student, onEdit, onUndo }) {
  const paidAmount = student.totalPaidThisMonth || 0;
  const monthlyFee = student.monthlyFee || 0;
  const extra = student.extraPaid || 0;

  return (
    <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-emerald-500/10 dark:border-emerald-500/5 shadow-md shadow-black/5 dark:shadow-black/40 p-4 flex items-center gap-3 sm:gap-4 transition-all">
      {/* Avatar with check overlay */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs sm:text-sm flex items-center justify-center">
          {getInitials(student.name)}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-900">
          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-heading font-bold text-zinc-900 dark:text-white truncate">
          {student.name}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
          {student.batchName || 'General'}
        </p>
      </div>

      {/* Paid Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-base sm:text-lg font-heading font-bold text-emerald-600 dark:text-emerald-400">
          ₹{paidAmount.toLocaleString('en-IN')}
        </p>
        {extra > 0 && (
          <p className="text-[10px] text-emerald-500 font-medium mt-0.5">
            +₹{extra} extra
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(student)}
            className="w-8 h-8 rounded-lg border border-zinc-200/80 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center active:scale-95 transition-all"
            title="Edit payment"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onUndo && (
          <button
            type="button"
            onClick={() => onUndo(student)}
            className="w-8 h-8 rounded-lg border border-red-500/20 text-red-400 hover:text-red-500 hover:bg-red-500/5 flex items-center justify-center active:scale-95 transition-all"
            title="Undo payment"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
