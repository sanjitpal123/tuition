import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import { studentApi } from '../lib/api';
import { getStudentBillingCycle } from '../lib/feeCycles';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Wallet, 
  AlertCircle, 
  Building, 
  Clock, 
  Receipt, 
  CreditCard,
  Calendar,
  AlertTriangle,
  Check,
  X
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
  const feeHistory = Array.isArray(data?.fees?.history || data?.feeHistory) ? (data?.fees?.history || data?.feeHistory) : [];

  // Calculate billing cycle derived from student admission date
  const billingCycle = useMemo(() => {
    if (!data?.student) return null;
    return getStudentBillingCycle(data.student, feeHistory);
  }, [data?.student, feeHistory]);

  const monthlyTuitionFee = Number(
    data?.student?.fees || 
    data?.student?.monthlyFee || 
    billingCycle?.monthlyFee || 
    (data?.student?.batch ? (data.student.batch.fee || data.student.batch.fees) : 0)
  ) || 0;

  // Compute comprehensive fee timeline
  const feeTimeline = useMemo(() => {
    if (!data?.student) {
      return { nodes: [], totalPaid: 0, totalExpected: 0, totalDuesLeft: 0, monthsStudied: 0, admissionDateFormatted: 'N/A' };
    }

    const student = data.student;
    const monthlyFee = Number(student.fees || student.monthlyFee || (student.batch ? (student.batch.fee || student.batch.fees) : 0)) || 0;

    let admDate = student.admissionDate ? new Date(student.admissionDate) : (student.createdAt ? new Date(student.createdAt) : new Date());
    if (!isValid(admDate)) admDate = new Date();

    const admYear = admDate.getFullYear();
    const admMonth = admDate.getMonth();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const payments = Array.isArray(feeHistory) ? feeHistory : [];

    const getPaymentMonthKey = (p) => {
      if (p.month && /^\d{4}-\d{2}$/.test(p.month)) return p.month;
      if (p.paymentDate && /^\d{4}-\d{2}$/.test(String(p.paymentDate).slice(0, 7))) return String(p.paymentDate).slice(0, 7);
      if (p.createdAt && /^\d{4}-\d{2}$/.test(String(p.createdAt).slice(0, 7))) return String(p.createdAt).slice(0, 7);
      return format(now, 'yyyy-MM');
    };

    const monthKeysSet = new Set();
    let y = admYear;
    let m = admMonth;

    while (y < currentYear || (y === currentYear && m <= currentMonth)) {
      monthKeysSet.add(`${y}-${String(m + 1).padStart(2, '0')}`);
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }

    payments.forEach(p => {
      monthKeysSet.add(getPaymentMonthKey(p));
    });

    if (monthKeysSet.size === 0) {
      monthKeysSet.add(format(now, 'yyyy-MM'));
    }

    const sortedMonthKeys = Array.from(monthKeysSet).sort();

    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const monthsStudied = sortedMonthKeys.length;
    const totalExpected = monthsStudied * monthlyFee;

    const rawNodes = sortedMonthKeys.map((mKey) => {
      const dateObj = new Date(mKey + '-01');
      const monthName = isValid(dateObj) ? format(dateObj, 'MMMM yyyy') : mKey;
      const monthShort = isValid(dateObj) ? format(dateObj, 'MMM yyyy') : mKey;

      const mPayments = payments.filter(p => getPaymentMonthKey(p) === mKey);

      const paidForMonth = mPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const dueForMonth = monthlyFee > 0 ? Math.max(0, monthlyFee - paidForMonth) : 0;

      const isCurrentMonth = mKey === format(now, 'yyyy-MM');
      const isPastMonth = isValid(dateObj) && dateObj < new Date(now.getFullYear(), now.getMonth(), 1);

      let status = 'Paid';
      if (monthlyFee > 0) {
        if (paidForMonth >= monthlyFee) {
          status = 'Paid';
        } else if (paidForMonth > 0) {
          status = 'Partial';
        } else if (isPastMonth) {
          status = 'Overdue';
        } else {
          status = 'Pending';
        }
      }

      return {
        mKey,
        monthName,
        monthShort,
        paidForMonth,
        dueForMonth,
        monthlyFee,
        status,
        isCurrentMonth,
        mPayments
      };
    });

    const totalDuesLeft = rawNodes.reduce((sum, n) => sum + n.dueForMonth, 0);

    return {
      nodes: rawNodes.reverse(),
      totalPaid,
      totalExpected,
      totalDuesLeft,
      monthsStudied,
      admissionDateFormatted: format(admDate, 'dd MMM yyyy')
    };
  }, [data?.student, feeHistory]);

  if (loading) {
    return <StudentFeesSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <Card className="p-6 border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500 opacity-80" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Error Loading Fees</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{error || 'Something went wrong.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors text-xs"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-3.5 sm:px-6 py-3 pb-24 max-w-5xl mx-auto space-y-4 font-sans">
      
      {/* Tuition Selector Chips (If multiple enrolled) */}
      {tuitions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1">
            <Building size={13} /> Tuition:
          </span>
          {tuitions.map((t) => {
            const isActive = (selectedTuitionId ? t.id === selectedTuitionId : t.id === activeTuition?.id);
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTuition(t.id)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* 1. Mobile App Fee Summary Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 dark:from-zinc-950 dark:to-black text-white rounded-2xl p-4 sm:p-5 border border-zinc-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">FEE SUMMARY</span>
              <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                ₹{feeTimeline.totalPaid.toLocaleString('en-IN')} <span className="text-xs font-semibold text-zinc-400">/ ₹{feeTimeline.totalExpected.toLocaleString('en-IN')}</span>
              </h3>
            </div>
          </div>
          <Badge variant="success" className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ₹{monthlyTuitionFee}/mo
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{
              width: `${feeTimeline.totalExpected > 0 ? Math.min(100, Math.round((feeTimeline.totalPaid / feeTimeline.totalExpected) * 100)) : 0}%`
            }}
          />
        </div>

        {/* 4 Compact Stat Cards in 2x2 Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {/* Admission Date */}
          <div className="bg-zinc-800/70 dark:bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-700/50">
            <div className="flex items-center gap-1 text-zinc-400 mb-0.5">
              <Calendar className="w-3 h-3 text-blue-400" />
              <span className="text-[9px] font-bold uppercase">ADMISSION</span>
            </div>
            <p className="text-xs font-bold text-white truncate">
              {feeTimeline.admissionDateFormatted || 'N/A'}
            </p>
          </div>

          {/* Months Studied */}
          <div className="bg-zinc-800/70 dark:bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-700/50">
            <div className="flex items-center gap-1 text-zinc-400 mb-0.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-[9px] font-bold uppercase">STUDIED</span>
            </div>
            <p className="text-xs font-bold text-white">
              {feeTimeline.monthsStudied} Months
            </p>
          </div>

          {/* Total Paid */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl">
            <div className="flex items-center gap-1 text-emerald-400 mb-0.5">
              <Wallet className="w-3 h-3 text-emerald-400" />
              <span className="text-[9px] font-bold uppercase">PAID</span>
            </div>
            <p className="text-xs font-black text-emerald-400">
              ₹{feeTimeline.totalPaid.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Dues Left */}
          <div className="bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl">
            <div className="flex items-center gap-1 text-rose-400 mb-0.5">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span className="text-[9px] font-bold uppercase">DUES</span>
            </div>
            <p className="text-xs font-black text-rose-400">
              ₹{feeTimeline.totalDuesLeft.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Fee Schedule Timeline */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs overflow-hidden rounded-2xl">
        <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-zinc-900 dark:text-white text-xs sm:text-sm">
            <CreditCard className="w-4 h-4 text-red-500" />
            <span>Payment Schedule Timeline</span>
          </div>
          <span className="text-[11px] font-bold text-zinc-400">
            Fee: ₹{monthlyTuitionFee}/mo
          </span>
        </div>

        <div className="p-3 sm:p-5">
          {feeTimeline.nodes.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs font-medium">
              No billing timeline logged yet.
            </div>
          ) : (
            <div className="relative pl-5 sm:pl-7 space-y-4 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {feeTimeline.nodes.map((node) => {
                return (
                  <div key={node.mKey} className="relative group">
                    {/* Node Dot Icon */}
                    <div className={`absolute -left-5 sm:-left-7 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
                      node.status === 'Paid'
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-2xs'
                        : node.status === 'Partial'
                          ? 'bg-amber-500 border-amber-400 text-white shadow-2xs'
                          : node.status === 'Overdue'
                            ? 'bg-rose-500 border-rose-400 text-white shadow-2xs'
                            : 'bg-zinc-300 dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {node.status === 'Paid' ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : node.status === 'Overdue' ? <X className="w-2.5 h-2.5 stroke-[3]" /> : '!'}
                    </div>

                    {/* Timeline Node Card */}
                    <div className="bg-zinc-50/80 dark:bg-zinc-950/60 p-3.5 sm:p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-zinc-900 dark:text-white text-xs sm:text-sm">
                            {node.monthName}
                          </h4>
                          {node.isCurrentMonth && (
                            <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              Current
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div>
                          {node.status === 'Paid' && (
                            <Badge variant="success" className="px-2 py-0.5 font-extrabold text-[10px] bg-emerald-600 dark:bg-emerald-500 text-white">
                              Paid
                            </Badge>
                          )}
                          {node.status === 'Partial' && (
                            <Badge variant="warning" className="px-2 py-0.5 font-extrabold text-[10px]">
                              ₹{node.dueForMonth} Dues
                            </Badge>
                          )}
                          {node.status === 'Overdue' && (
                            <Badge variant="danger" className="px-2 py-0.5 font-extrabold text-[10px]">
                              ₹{node.dueForMonth} Overdue
                            </Badge>
                          )}
                          {node.status === 'Pending' && (
                            <Badge variant="secondary" className="px-2 py-0.5 font-extrabold text-[10px]">
                              ₹{node.dueForMonth} Pending
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Payment Progress line */}
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                        <span>Paid: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">₹{node.paidForMonth.toLocaleString('en-IN')}</strong> / ₹{monthlyTuitionFee}</span>
                        {node.dueForMonth > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">Due: ₹{node.dueForMonth}</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Paid in full</span>
                        )}
                      </div>

                      {/* Individual Receipts logged for this month */}
                      {node.mPayments.length > 0 && (
                        <div className="pt-1.5 space-y-1.5">
                          <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                            Receipts ({node.mPayments.length})
                          </span>
                          <div className="space-y-1.5">
                            {node.mPayments.map((payment, pIdx) => (
                              <div
                                key={payment._id || payment.id || pIdx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/80 text-xs shadow-2xs"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="p-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <Receipt className="w-3 h-3" />
                                  </div>
                                  <span className="font-extrabold text-zinc-900 dark:text-white text-xs">
                                    ₹{Number(payment.amount).toLocaleString('en-IN')}
                                  </span>
                                  {payment.paymentMode && (
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                                      {payment.paymentMode}
                                    </span>
                                  )}
                                </div>

                                <span className="text-[10px] text-zinc-400 font-medium">
                                  {new Date(payment.createdAt || payment.paymentDate || Date.now()).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

    </div>
  );
}
