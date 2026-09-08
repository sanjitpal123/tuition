import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Wallet, 
  AlertCircle, 
  Building, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Receipt, 
  CreditCard,
  Layers,
  Calendar
} from 'lucide-react';

export default function StudentFees() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTuitionId = searchParams.get('tuitionId');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const url = selectedTuitionId 
          ? `/student-auth/dashboard?tuitionId=${selectedTuitionId}`
          : `/student-auth/dashboard`;
        const response = await studentApi.get(url);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch fees data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedTuitionId]);

  const handleSelectTuition = (tuitionId) => {
    setSearchParams(tuitionId ? { tuitionId } : {}, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-red-200 dark:border-red-950 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading fee records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <Card className="p-8 border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900">
          <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-500 opacity-80" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Error Loading Fees</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{error || 'Something went wrong.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  const tuitions = data?.tuitions || [];
  const activeTuition = tuitions.find(t => t.id === selectedTuitionId) || tuitions[0] || null;
  const isPaid = data.student?.feeStatus === 'Paid';
  const feeHistory = data.fees?.history || data.feeHistory || [];
  
  const totalAmountPaid = feeHistory.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const monthsPaidCount = feeHistory.filter(h => h.status === 'Paid' || (Number(h.amount) || 0) > 0).length;

  const tuitionQuery = selectedTuitionId ? `?tuitionId=${selectedTuitionId}` : '';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Wallet size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">Fee Details & History</h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Financial summary for {activeTuition?.name || 'your tuition'}
            </p>
          </div>
        </div>

        <Link
          to={`/student/dashboard${tuitionQuery}`}
          replace
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Tuition Selector Chips */}
      {tuitions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1.5">
            <Building size={14} /> Tuition:
          </span>
          {tuitions.map((t) => {
            const isActive = (selectedTuitionId ? t.id === selectedTuitionId : t.id === activeTuition?.id);
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTuition(t.id)}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-red-300'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Overview Card */}
      <Card className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Current Billing Status
            </span>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                {data.student?.batch?.fee ? `₹${data.student.batch.fee}` : '₹0'}
              </span>
              <span className="text-zinc-400 font-semibold text-sm">/ month</span>
              <Badge 
                variant={isPaid ? 'success' : data.student?.feeStatus === 'Pending' ? 'warning' : 'danger'}
                className="px-3.5 py-1 text-xs font-black uppercase tracking-wider ml-1"
              >
                {data.student?.feeStatus || 'Pending'}
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-lg">
              {data.student?.batch 
                ? `Standard monthly tuition fee for ${data.student.batch.name} (${data.student.batch.subject}).` 
                : 'No active batch fee plan configured.'}
            </p>

            {!isPaid && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>Your fee for the current cycle is pending. Please contact your tutor or pay via authorized channels.</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Payment Stats
              </span>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Months Paid:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{monthsPaidCount} months</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Total Paid:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">₹{totalAmountPaid.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-400">
              Need assistance? Speak with your tutor.
            </div>
          </div>

        </div>
      </Card>

      {/* Payment History Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-zinc-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Payment Receipts History</h2>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            {feeHistory.length} receipts
          </span>
        </div>

        {feeHistory.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20 text-zinc-500" />
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">No Payment History Yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              No previous fee transactions have been logged by your tutor for this tuition yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {feeHistory.map((record, idx) => (
              <Card 
                key={record._id || idx} 
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                      {record.month 
                        ? new Date(record.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) 
                        : `Monthly Payment #${idx + 1}`}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                      <Calendar size={12} />
                      Paid on: {record.paymentDate 
                        ? new Date(record.paymentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) 
                        : 'Recorded'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                  <span className="text-2xl font-black text-zinc-900 dark:text-white">
                    ₹{record.amount}
                  </span>
                  <Badge variant="success" className="px-3 py-1 text-xs font-black uppercase tracking-wider">
                    PAID
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
