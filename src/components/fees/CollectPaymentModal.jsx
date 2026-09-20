import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, IndianRupee } from 'lucide-react';
import { format, isValid } from 'date-fns';

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

export function CollectPaymentModal({ student, onConfirm, onSubmit, onClose, isSubmitting }) {
  const handlePayment = onConfirm || onSubmit;
  const monthlyFee = Number(student?.monthlyFee || student?.fees || student?.feeStatus?.monthlyFee || student?.fee || 0);
  const remaining = Number(
    student?.remainingBalance ??
    student?.pendingAmount ??
    (student?.feeStatus?.pendingAmount ? Math.abs(student.feeStatus.pendingAmount) : null) ??
    monthlyFee
  );
  const alreadyPaid = Number(student?.totalPaidThisMonth || 0);

  // Month options dropdown (12 months back + 2 forward from admission)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    let admDate = student?.admissionDate ? new Date(student.admissionDate) : (student?.createdAt ? new Date(student.createdAt) : new Date());
    if (!isValid(admDate)) admDate = new Date();

    const startDate = new Date(Math.min(admDate.getTime(), new Date(now.getFullYear(), now.getMonth() - 6, 1).getTime()));
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 1);

    let curr = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (curr <= endDate) {
      const val = format(curr, 'yyyy-MM');
      const label = format(curr, 'MMMM yyyy');
      options.push({ value: val, label });
      curr.setMonth(curr.getMonth() + 1);
    }

    return options.reverse(); // Newest month on top
  }, [student]);

  const [selectedFeeMonth, setSelectedFeeMonth] = useState(
    student?.selectedMonth || student?.month || format(new Date(), 'yyyy-MM')
  );

  const [amount, setAmount] = useState(String(monthlyFee || ''));
  const [paymentMode, setPaymentMode] = useState('cash');
  const [note, setNote] = useState('');

  // Automatically default amount collecting to monthlyFee whenever month or student changes
  useEffect(() => {
    const fee = Number(student?.monthlyFee || student?.fees || student?.feeStatus?.monthlyFee || student?.fee || 0);
    if (fee > 0) {
      setAmount(String(fee));
    }
    if (student?.selectedMonth || student?.month) {
      setSelectedFeeMonth(student.selectedMonth || student.month);
    }
  }, [selectedFeeMonth, student, monthlyFee]);

  if (!student) return null;

  const handleSubmit = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;

    const sId = student._id || student.id;
    const bId = typeof student.batchId === 'object' ? (student.batchId?._id || student.batchId?.id) : student.batchId;

    const payload = {
      studentId: sId,
      batchId: bId,
      amount: numAmount,
      month: selectedFeeMonth,
      paymentMode,
      note: note ? note.trim() : undefined,
    };

    if (typeof handlePayment === 'function') {
      handlePayment(payload);
    } else {
      console.error("No onConfirm or onSubmit callback provided to CollectPaymentModal");
    }
  };

  const parsedAmount = Number(amount) || 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center mb-14 sm:mb-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-2xl max-h-[80vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Form Body */}
          <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
            {/* Student Info (Horizontal on mobile, vertical on sm) */}
            <div className="flex items-center sm:flex-col sm:text-center gap-3 sm:gap-0 pt-1">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 font-bold text-sm sm:text-lg flex items-center justify-center sm:mb-3 flex-shrink-0">
                {getInitials(student.name)}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-zinc-900 dark:text-white leading-tight">
                  {student.name}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  {student.batchName || 'General'}
                </p>
              </div>
            </div>

            {/* Select Fee Month Dropdown */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Collecting Fee For Month
              </label>
              <select
                value={selectedFeeMonth}
                onChange={(e) => setSelectedFeeMonth(e.target.value)}
                className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 py-2.5 px-3.5 text-sm font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} {opt.value === format(new Date(), 'yyyy-MM') ? '(Current Month)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Fee Info */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 sm:p-3.5 space-y-1">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Monthly Tuition Fee</span>
                <span className="font-bold text-zinc-900 dark:text-white">₹{monthlyFee.toLocaleString('en-IN')}</span>
              </div>
              {alreadyPaid > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">Already Paid ({selectedFeeMonth})</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">₹{alreadyPaid.toLocaleString('en-IN')}</span>
                </div>
              )}
              {alreadyPaid > 0 && (
                <div className="flex justify-between text-xs sm:text-sm pt-1 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-500 dark:text-zinc-400">Remaining</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">₹{remaining.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Amount Collecting
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-400 dark:text-zinc-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 py-2.5 sm:py-3 pl-8 pr-4 text-lg sm:text-xl font-heading font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="0"
                  autoFocus
                />
              </div>
              {monthlyFee > 0 && parsedAmount !== monthlyFee && (
                <button
                  type="button"
                  onClick={() => setAmount(String(monthlyFee))}
                  className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  Set to Monthly Fee (₹{monthlyFee})
                </button>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Payment Mode
              </label>
              <div className="flex gap-2">
                {['cash', 'upi', 'bank_transfer'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                      paymentMode === mode
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    {mode === 'cash' ? 'Cash' : mode === 'upi' ? 'UPI' : 'Bank'}
                  </button>
                ))}
              </div>
            </div>

            {/* Note (optional) */}
            <div>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                maxLength={200}
                className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 py-2 sm:py-2.5 px-3.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Sticky Footer Confirm Button */}
          <div className="p-3.5 sm:p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800 flex-shrink-0">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!parsedAmount || parsedAmount <= 0 || isSubmitting}
              className="w-full py-3 sm:py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white text-sm sm:text-base font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Recording...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Confirm Payment · ₹{parsedAmount.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
