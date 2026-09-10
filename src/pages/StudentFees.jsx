import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { studentApi } from '../lib/api';
import { getStudentBillingCycle } from '../lib/feeCycles';
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
import { StudentFeesSkeleton } from '../components/ui/Skeleton';

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

  const tuitions = data?.tuitions || [];
  const activeTuition = tuitions.find(t => t.id === selectedTuitionId) || tuitions[0] || null;
  const feeHistory = data?.fees?.history || data?.feeHistory || [];

  // Calculate billing cycle derived from student admission date
  const billingCycle = useMemo(() => {
    if (!data?.student) return null;
    return getStudentBillingCycle(data.student, feeHistory);
  }, [data?.student, feeHistory]);

  const monthlyTuitionFee = billingCycle?.monthlyFee ?? Number(data?.student?.batch?.fee || data?.student?.fees || data?.student?.monthlyFee || 0);
  const isPaid = billingCycle?.status === 'Paid' || billingCycle?.status === 'Extra';

  // Group fee receipts by month and compute aggregated sums & balances
  const monthlyFeeGroups = useMemo(() => {
    if (!feeHistory || feeHistory.length === 0) return [];
    
    const groups = {};
    
    feeHistory.forEach(payment => {
      let monthKey = payment.month;
      if (!monthKey && payment.paymentDate) {
        monthKey = String(payment.paymentDate).slice(0, 7);
      } else if (!monthKey && payment.createdAt) {
        monthKey = String(payment.createdAt).slice(0, 7);
      }
      monthKey = monthKey || 'Unspecified';
      
      if (!groups[monthKey]) {
        groups[monthKey] = {
          monthKey,
          totalPaid: 0,
          payments: []
        };
      }
      groups[monthKey].totalPaid += Number(payment.amount) || 0;
      groups[monthKey].payments.push(payment);
    });

    return Object.values(groups).map(group => {
      const diff = group.totalPaid - monthlyTuitionFee;
      let status = 'Paid';
      let statusText = 'Paid in Full';
      let balanceAmount = 0;

      if (monthlyTuitionFee > 0) {
        if (group.totalPaid < monthlyTuitionFee) {
          status = 'Pending';
          balanceAmount = monthlyTuitionFee - group.totalPaid;
          statusText = `₹${balanceAmount} Pending`;
        } else if (group.totalPaid > monthlyTuitionFee) {
          status = 'Extra';
          balanceAmount = group.totalPaid - monthlyTuitionFee;
          statusText = `+₹${balanceAmount} Extra Paid`;
        }
      }

      return {
        ...group,
        monthlyTuitionFee,
        diff,
        balanceAmount,
        status,
        statusText
      };
    }).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [feeHistory, monthlyTuitionFee]);

  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const currentMonthGroup = monthlyFeeGroups.find(g => g.monthKey === currentMonthKey);
  const currentMonthPaid = currentMonthGroup ? currentMonthGroup.totalPaid : 0;
  const currentMonthPending = monthlyTuitionFee > 0 ? Math.max(0, monthlyTuitionFee - currentMonthPaid) : 0;
  const currentMonthExtra = monthlyTuitionFee > 0 ? Math.max(0, currentMonthPaid - monthlyTuitionFee) : 0;
  const totalAmountPaid = feeHistory.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const monthsPaidCount = monthlyFeeGroups.filter(g => g.status === 'Paid' || g.status === 'Extra').length;

  if (loading) {
    return <StudentFeesSkeleton />;
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
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Current Billing Status
              </span>
              {billingCycle && (
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                  Due: Every {billingCycle.joinDay}th of month
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                ₹{monthlyTuitionFee}
              </span>
              <span className="text-zinc-400 font-semibold text-sm">/ month</span>
              <Badge 
                variant={billingCycle?.status === 'Pending' ? 'warning' : 'success'}
                className="px-3.5 py-1 text-xs font-black uppercase tracking-wider ml-1"
              >
                {billingCycle?.status === 'Extra' ? `+₹${billingCycle.extraAmount} Extra Paid` : (billingCycle?.status || (isPaid ? 'Paid' : 'Pending'))}
              </Badge>
            </div>

            {/* Cycle Details */}
            {billingCycle && (
              <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60">
                <span><strong>Active Cycle:</strong> {billingCycle.cycleStartFormatted} - {billingCycle.cycleEndFormatted}</span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span><strong>Next Due:</strong> <span className="text-red-600 dark:text-red-400 font-bold">{billingCycle.nextDueDateFormatted}</span></span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span><strong>Joined:</strong> {billingCycle.admissionDateFormatted}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium max-w-lg">
              {data.student?.batch 
                ? `Standard monthly tuition fee for ${data.student.batch.name} (${data.student.batch.subject}).` 
                : 'No active batch fee plan configured.'}
            </p>

            {/* Billing Cycle Status Alert */}
            {billingCycle?.status === 'Pending' ? (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-2.5 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p>Fee payment of ₹{billingCycle.remainingAmount} is pending for the billing cycle (Next due date: {billingCycle.nextDueDateFormatted}). Please pay to avoid interruption.</p>
              </div>
            ) : billingCycle?.status === 'Extra' ? (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                <p>All fees are cleared and you have +₹{billingCycle.extraAmount} extra / advance balance credit. Next cycle starts on {billingCycle.nextDueDateFormatted}.</p>
              </div>
            ) : (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-start gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                <p>Your fee is fully paid for the current cycle ({billingCycle?.cycleStartFormatted} - {billingCycle?.cycleEndFormatted}). Next fee is due on {billingCycle?.nextDueDateFormatted}.</p>
              </div>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Payment Stats
              </span>
              <div className="space-y-2.5 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Monthly Due Day:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">Every {billingCycle?.joinDay || 1}th</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Next Due Date:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{billingCycle?.nextDueDateFormatted || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Months Settled:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{monthsPaidCount} months</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Total Paid All-Time:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">₹{totalAmountPaid.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-400">
              Receipts are recorded directly by your tutor.
            </div>
          </div>

        </div>
      </Card>

      {/* Payment History Log (Grouped by Month with Aggregated Sums) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-zinc-500" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Monthly Fee History & Receipts</h2>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            {monthlyFeeGroups.length} Month Cycles • {feeHistory.length} Total Receipts
          </span>
        </div>

        {monthlyFeeGroups.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20 text-zinc-500" />
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">No Payment History Yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              No previous fee transactions have been logged by your tutor for this tuition yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthlyFeeGroups.map((group) => {
              const isExtra = group.status === 'Extra';
              const isPending = group.status === 'Pending';
              const isPaidFull = group.status === 'Paid';

              return (
                <Card 
                  key={group.monthKey} 
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        isExtra || isPaidFull 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isExtra || isPaidFull ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                            Month: {group.monthKey}
                          </h3>
                          <span className="text-xs text-zinc-400 font-medium">
                            (Fee: ₹{monthlyTuitionFee})
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Total money paid this month: <strong className="text-zinc-900 dark:text-white text-sm font-bold">₹{group.totalPaid}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {isExtra && (
                        <Badge variant="success" className="bg-emerald-600 dark:bg-emerald-500 text-white font-bold px-3 py-1 text-xs">
                          +₹{group.balanceAmount} Extra Paid
                        </Badge>
                      )}
                      {isPending && (
                        <Badge variant="warning" className="px-3 py-1 font-bold text-xs">
                          ₹{group.balanceAmount} Pending
                        </Badge>
                      )}
                      {isPaidFull && (
                        <Badge variant="success" className="px-3 py-1 font-bold text-xs">
                          Paid in Full
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Individual Installment Receipts */}
                  <div className="bg-zinc-50 dark:bg-zinc-950/70 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Installment Payments ({group.payments.length})
                    </p>
                    <div className="space-y-1.5">
                      {group.payments.map((payment, pIdx) => (
                        <div key={payment._id || payment.id || pIdx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-white">
                              ₹{payment.amount}
                            </span>
                            <span className="text-zinc-400 text-[11px]">
                              (Installment #{group.payments.length - pIdx})
                            </span>
                          </div>
                          <span className="text-zinc-500 dark:text-zinc-400 text-[11px] flex items-center gap-1">
                            <Calendar size={11} />
                            {new Date(payment.createdAt || payment.paymentDate || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
