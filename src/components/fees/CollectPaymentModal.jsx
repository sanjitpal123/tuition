import React, { useState } from 'react';
import { X, Check, IndianRupee } from 'lucide-react';

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

export function CollectPaymentModal({ student, onConfirm, onClose, isSubmitting }) {
  const monthlyFee = student?.monthlyFee || 0;
  const remaining = student?.remainingBalance || monthlyFee;
  const alreadyPaid = student?.totalPaidThisMonth || 0;

  const [amount, setAmount] = useState(String(remaining));
  const [paymentMode, setPaymentMode] = useState('cash');
  const [note, setNote] = useState('');

  if (!student) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;
    onConfirm({
      studentId: student.id || student._id,
      amount: numAmount,
      paymentMode,
      note: note.trim() || undefined,
    });
  };

  const parsedAmount = Number(amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-2xl max-h-[85vh] overflow-y-auto">
        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Student Info */}
          <div className="flex flex-col items-center text-center pt-1">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 font-bold text-lg flex items-center justify-center mb-3">
              {getInitials(student.name)}
            </div>
            <h3 className="text-lg font-heading font-bold text-zinc-900 dark:text-white">
              {student.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {student.batchName || 'General'}
            </p>
          </div>

          {/* Fee Info */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3.5 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Monthly Fee</span>
              <span className="font-bold text-zinc-900 dark:text-white">₹{monthlyFee.toLocaleString('en-IN')}</span>
            </div>
            {alreadyPaid > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Already Paid</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">₹{alreadyPaid.toLocaleString('en-IN')}</span>
              </div>
            )}
            {alreadyPaid > 0 && (
              <div className="flex justify-between text-sm pt-1.5 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500 dark:text-zinc-400">Remaining</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">₹{remaining.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
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
                className="block w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 py-3 pl-8 pr-4 text-xl font-heading font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="0"
                autoFocus
              />
            </div>
            {remaining > 0 && parsedAmount !== remaining && (
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="mt-1.5 text-xs text-red-500 hover:text-red-400 font-medium"
              >
                Set to ₹{remaining}
              </button>
            )}
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Payment Mode
            </label>
            <div className="flex gap-2">
              {['cash', 'upi', 'bank_transfer'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
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
              className="block w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 py-2.5 px-3.5 text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={!parsedAmount || parsedAmount <= 0 || isSubmitting}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition-all text-white text-base font-bold shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Recording...</span>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Confirm Payment · ₹{parsedAmount.toLocaleString('en-IN')}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
