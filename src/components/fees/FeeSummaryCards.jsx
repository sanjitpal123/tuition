import React from "react";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export function FeeSummaryCards({
  collected,
  pending,
  paidCount,
  pendingCount,
  overdueCount = 0,
  totalStudents = 0,
}) {
  return (
    <div className="gap-3 sm:gap-4">
      {/* Collected & Pending Card */}
      <div className="flex w-full gap-2 pb-2">
        <div className="bg-white/80 w-[50%] dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-md shadow-black/5 dark:shadow-black/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Collected
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
            ₹{collected.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            from {paidCount} student{paidCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Pending Card */}
        <div className="bg-white/80 w-[50%] dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-amber-500/30 dark:border-amber-500/20 shadow-md shadow-black/5 dark:shadow-black/40 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Pending
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
            ₹{pending.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
            from {pendingCount} student{pendingCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Overdue Card */}
      <div className="bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-red-500/30 dark:border-red-500/20 shadow-md shadow-black/5 dark:shadow-black/40 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Overdue Students
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
          {overdueCount}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
          out of {totalStudents} student{totalStudents !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
