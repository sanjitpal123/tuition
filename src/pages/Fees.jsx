import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Sun,
  Moon,
  Bell,
  Search,
  Calendar,
  ChevronDown,
  Filter,
  Download,
  X,
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FeesSkeleton } from '../components/ui/Skeleton';
import { FeeSummaryCards } from '../components/fees/FeeSummaryCards';
import { FeeStudentCard } from '../components/fees/FeeStudentCard';
import { PaidStudentCard } from '../components/fees/PaidStudentCard';
import { CollectPaymentModal } from '../components/fees/CollectPaymentModal';

export default function Fees() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    students,
    feePayments,
    recordFeePayment,
    deleteFeePayment,
    realNotifications,
    isLoading,
  } = useData();

  // UI State
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'paid'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedBatch, setSelectedBatch] = useState('All');

  // Modal State
  const [collectingStudent, setCollectingStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const unreadNotificationsCount = realNotifications?.filter(n => !n.read)?.length || 0;

  // Month options (12 months back + 3 forward)
  const monthOptions = useMemo(() => {
    const options = [];
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    for (let i = 0; i < 15; i++) {
      options.push({
        value: format(d, 'yyyy-MM'),
        label: format(d, 'MMMM yyyy'),
      });
      d.setMonth(d.getMonth() - 1);
    }
    return options;
  }, []);

  // Batch options
  const batchOptions = useMemo(() => {
    const batches = new Set(students.map(s => s.batchName).filter(Boolean));
    return ['All', ...Array.from(batches)].sort();
  }, [students]);

  // Compute fee statuses
  const studentStatuses = useMemo(() => {
    return students
      .filter(s => {
        if (selectedBatch !== 'All' && s.batchName !== selectedBatch) return false;

        const joinDateStr = s.admissionDate || s.joiningDate || s.createdAt;
        if (!joinDateStr) return true;
        const joinDate = new Date(joinDateStr);
        if (isNaN(joinDate.getTime())) return true;
        const selectedDateObj = new Date(selectedMonth + '-01');
        if (isNaN(selectedDateObj.getTime())) return true;
        if (joinDate.getFullYear() > selectedDateObj.getFullYear()) return false;
        if (joinDate.getFullYear() === selectedDateObj.getFullYear() && joinDate.getMonth() > selectedDateObj.getMonth()) return false;
        return true;
      })
      .map(s => {
        const sId = s._id || s.id;
        const monthlyFee = Number(s.monthlyFee || s.fees || 0);

        const totalPaidThisMonth = feePayments
          .filter(p => {
            const pStudentId = p.studentId?._id || p.studentId;
            return pStudentId === sId && p.month === selectedMonth;
          })
          .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

        const remainingBalance = Math.max(0, monthlyFee - totalPaidThisMonth);
        const extraPaid = Math.max(0, totalPaidThisMonth - monthlyFee);

        let computedFeeStatus = 'Pending';
        if (monthlyFee > 0 && totalPaidThisMonth >= monthlyFee) {
          computedFeeStatus = extraPaid > 0 ? 'Extra' : 'Paid';
        } else if (totalPaidThisMonth > 0) {
          computedFeeStatus = 'Partial';
        }

        return {
          ...s,
          monthlyFee,
          computedFeeStatus,
          totalPaidThisMonth,
          remainingBalance,
          extraPaid,
        };
      });
  }, [students, feePayments, selectedMonth, selectedBatch]);

  // Split into paid and unpaid
  const paidStudents = useMemo(
    () => studentStatuses.filter(s => s.computedFeeStatus === 'Paid' || s.computedFeeStatus === 'Extra'),
    [studentStatuses]
  );

  const unpaidStudents = useMemo(
    () => studentStatuses.filter(s => s.computedFeeStatus !== 'Paid' && s.computedFeeStatus !== 'Extra'),
    [studentStatuses]
  );

  // Stats
  const stats = useMemo(() => {
    let collected = 0;
    let pending = 0;
    studentStatuses.forEach(s => {
      collected += s.totalPaidThisMonth || 0;
      pending += s.remainingBalance || 0;
    });
    return { collected, pending };
  }, [studentStatuses]);

  // Search filter
  const filterBySearch = (list) => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(s =>
      s.name.toLowerCase().includes(term) ||
      (s.batchName && s.batchName.toLowerCase().includes(term)) ||
      (s.phone && s.phone.includes(term))
    );
  };

  const displayedStudents = filterBySearch(activeTab === 'pending' ? unpaidStudents : paidStudents);

  // Handlers
  const handleCollect = (student) => {
    setCollectingStudent(student);
  };

  const handleConfirmPayment = async ({ studentId, amount, paymentMode, note }) => {
    try {
      setIsSubmitting(true);
      await recordFeePayment({
        studentId,
        batchId: collectingStudent.batchId?._id || collectingStudent.batchId,
        amount,
        month: selectedMonth,
        paymentMode,
        note,
      });
      setCollectingStudent(null);
    } catch (err) {
      alert('Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndoPayment = (student) => {
    setDeleteTarget(student);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteFeePayment(deleteTarget.id || deleteTarget._id, selectedMonth);
      setDeleteTarget(null);
    } catch (err) {
      alert('Failed to delete payment.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditPayment = (student) => {
    // Open collect modal with context of editing
    setCollectingStudent(student);
  };

  if (isLoading) {
    return <FeesSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto pb-28 md:pb-8">

      {/* ===================== MOBILE HEADER ===================== */}
      <div className="md:hidden flex items-center justify-between pt-1 mb-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard', { replace: true })}
            className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none">
              Fees
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-none">
              Collect & track payments
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            {theme === 'dark' ? (
              <Sun className="w-4.5 h-4.5 text-amber-400" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-zinc-700" />
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            <Bell className="w-4.5 h-4.5 text-zinc-700 dark:text-zinc-300 stroke-[2]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-extrabold text-white bg-red-600 rounded-full border-2 border-white dark:border-zinc-900">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ===================== DESKTOP HEADER ===================== */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
            Fees
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Collect & track student payments
          </p>
        </div>
        <Button variant="outline" className="flex items-center">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* ===================== SUMMARY CARDS ===================== */}
      <FeeSummaryCards
        collected={stats.collected}
        pending={stats.pending}
        paidCount={paidStudents.length}
        pendingCount={unpaidStudents.length}
      />

      {/* ===================== FILTERS ROW ===================== */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        {/* Month Picker */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-700/50 rounded-xl px-3 py-2 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
              {format(new Date(selectedMonth + '-01'), 'MMM yyyy')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Batch Filter */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-700/50 rounded-xl px-3 py-2 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
              {selectedBatch === 'All' ? 'All Batches' : selectedBatch}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            {batchOptions.map(batch => (
              <option key={batch} value={batch}>
                {batch === 'All' ? 'All Batches' : batch}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[160px]">
          <div className="relative flex items-center bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-700/50 rounded-xl px-3 py-2 shadow-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="ml-1 text-zinc-400 hover:text-zinc-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===================== TABS ===================== */}
      <div className="flex mt-4 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Not Paid ({unpaidStudents.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paid')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'paid'
              ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Paid ({paidStudents.length})
        </button>
      </div>

      {/* ===================== STUDENT LIST ===================== */}
      <div className="mt-3 space-y-2 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-3">
        {displayedStudents.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl rounded-xl border border-zinc-200/50 dark:border-white/5 lg:col-span-2">
            {activeTab === 'pending' ? (
              <div>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">All fees collected! 🎉</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Every student has paid for this month</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {searchTerm ? 'No students found matching your search' : 'No payments recorded yet this month'}
                </p>
              </div>
            )}
          </div>
        ) : activeTab === 'pending' ? (
          displayedStudents.map(student => (
            <FeeStudentCard
              key={student.id || student._id}
              student={student}
              onCollect={handleCollect}
              isSubmitting={isSubmitting}
            />
          ))
        ) : (
          displayedStudents.map(student => (
            <PaidStudentCard
              key={student.id || student._id}
              student={student}
              onEdit={handleEditPayment}
              onUndo={handleUndoPayment}
            />
          ))
        )}
      </div>

      {/* ===================== MOBILE FAB ===================== */}
      {activeTab === 'pending' && unpaidStudents.length > 0 && (
        <div
          className="md:hidden fixed z-40 right-5"
          style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="bg-zinc-800/90 dark:bg-zinc-700/90 backdrop-blur-md text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg">
            {unpaidStudents.length} pending · ₹{stats.pending.toLocaleString('en-IN')}
          </div>
        </div>
      )}

      {/* ===================== COLLECT MODAL ===================== */}
      {collectingStudent && (
        <CollectPaymentModal
          student={collectingStudent}
          onConfirm={handleConfirmPayment}
          onClose={() => setCollectingStudent(null)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* ===================== DELETE CONFIRMATION ===================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/50 shadow-2xl p-6 mx-4 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-heading font-bold text-zinc-900 dark:text-white">
              Undo Payment?
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              This will delete all payment records for <strong>{deleteTarget.name}</strong> in {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Undo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
