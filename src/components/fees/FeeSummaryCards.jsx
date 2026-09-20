import React from "react";
import { CheckCircle2, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FeeSummaryCards({
  collected,
  pending,
  paidCount,
  pendingCount,
  overdueCount = 0,
  totalStudents = 0,
}) {
  const navigator = useNavigate();
  function handleNavigate() {
    navigator("/overduestudents");
  }
  return (
    <div className="gap-3 sm:gap-4">
      {/* Collected & Pending Card */}
      <div className="flex w-full gap-2 pb-2">
        {/* Collected Card */}
        <div className="bg-white/80 w-[50%] dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 shadow-md shadow-black/5 dark:shadow-black/40 p-4 sm:p-5 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Collected
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight">
            ₹{collected.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            from {paidCount} student{paidCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Pending Card */}
        <div className="bg-white/80 w-[50%] dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-amber-500/30 dark:border-amber-500/20 shadow-md shadow-black/5 dark:shadow-black/40 p-4 sm:p-5 hover:border-amber-500/60 dark:hover:border-amber-500/50 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Pending
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
            ₹{pending.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
            from {pendingCount} student{pendingCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Overdue Card */}
      <div
        className="group relative bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-red-500/40 dark:border-red-500/30 shadow-md shadow-black/5 dark:shadow-black/40 p-4 sm:p-5 cursor-pointer hover:border-red-500/80 dark:hover:border-red-500/70 hover:shadow-lg hover:shadow-red-500/10 active:scale-[0.99] transition-all overflow-hidden"
        onClick={() => handleNavigate()}
      >
        {/* Subtle Ambient Hover Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/15 transition-all pointer-events-none" />

        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/30 transition-colors">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Overdue Students
            </span>
          </div>
          
          {/* Action Button Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all font-bold text-xs shadow-xs">
            <span>View List</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5] transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="flex items-baseline justify-between relative z-10">
          <div>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {overdueCount}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
              out of {totalStudents} student{totalStudents !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
