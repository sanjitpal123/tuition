import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { 
  IndianRupee, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal,
  X, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Bell, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Wallet, 
  FileCheck, 
  Clock, 
  AlertCircle, 
  Eye, 
  CheckCircle2 
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { format } from 'date-fns';
import { getStudentBillingCycle } from '../lib/feeCycles';

export default function Fees() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { students, feePayments, recordFeePayment, updateStudent, deleteFeePayment, updateFeePayment, realNotifications } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState(false);
  const [editingFeeStudent, setEditingFeeStudent] = useState(null);
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFeeStudentId, setDeletingFeeStudentId] = useState(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const unreadNotificationsCount = realNotifications?.filter(n => !n.read)?.length || 0;

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Generate 24 months (past, current, future) for smooth native dropdown selection
  const monthOptions = useMemo(() => {
    const options = [];
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    for (let i = 0; i < 24; i++) {
      const value = format(d, 'yyyy-MM');
      const label = format(d, 'MMMM yyyy');
      options.push({ value, label });
      d.setMonth(d.getMonth() - 1);
    }
    return options;
  }, []);

  // Compute fee statuses for the selected month
  const studentStatuses = useMemo(() => {
    return students.map(s => {
      const sId = s._id || s.id;
      const monthlyFee = Number(s.monthlyFee || s.fees || 0);
      const billingCycle = getStudentBillingCycle(s, feePayments);

      // Calculate total paid this month
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
        billingCycle,
        computedFeeStatus, 
        totalPaidThisMonth, 
        remainingBalance,
        extraPaid
      };
    });
  }, [students, feePayments, selectedMonth]);

  // Calculate dynamic stats based on selected month
  const stats = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let pending = 0;
    let overdue = 0;

    studentStatuses.forEach(s => {
      const fee = s.monthlyFee || s.fees || 0;
      expected += fee;
      collected += s.totalPaidThisMonth || 0;
      pending += s.remainingBalance || 0;
      
      if (s.computedFeeStatus === 'Overdue') {
        overdue += s.remainingBalance || 0;
      }
    });

    return { expected, collected, pending, overdue };
  }, [studentStatuses]);

  const filteredStudents = studentStatuses.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.batchName && s.batchName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm)) ||
    (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingStudents = studentStatuses.filter(s => s.computedFeeStatus !== 'Paid');
  const [paymentAmount, setPaymentAmount] = useState('');

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    try {
      setIsSubmittingPayment(true);
      await recordFeePayment({
        studentId: student.id,
        batchId: student.batchId?._id || student.batchId,
        amount: Number(paymentAmount) || 0,
        month: selectedMonth
      });
      setIsModalOpen(false);
      setSelectedStudentId('');
      setPaymentAmount('');
    } catch (err) {
      alert("Failed to record payment.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleMarkPaid = async (id) => {
    const student = studentStatuses.find(s => s.id === id);
    if (!student) return;
    
    try {
      setIsSubmittingPayment(true);
      await recordFeePayment({
        studentId: student.id,
        batchId: student.batchId?._id || student.batchId,
        amount: student.remainingBalance || 0,
        month: selectedMonth
      });
    } catch (err) {
      alert("Failed to record payment.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleDeletePaymentClick = (id) => {
    setDeletingFeeStudentId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!deletingFeeStudentId) return;
    try {
      setIsDeleting(true);
      await deleteFeePayment(deletingFeeStudentId, selectedMonth);
      setIsDeleteModalOpen(false);
      setDeletingFeeStudentId(null);
    } catch (err) {
      alert("Failed to delete payment.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditFee = (student) => {
    setEditingFeeStudent(student);
    setNewFeeAmount(student.monthlyFee || student.fees || 0);
    setIsEditFeeModalOpen(true);
  };

  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [editingPaymentStudent, setEditingPaymentStudent] = useState(null);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [isSubmittingPaymentEdit, setIsSubmittingPaymentEdit] = useState(false);

  const handleOpenEditPayment = (student) => {
    setEditingPaymentStudent(student);
    setNewPaymentAmount(student.totalPaidThisMonth || 0);
    setIsEditPaymentModalOpen(true);
  };

  const handleEditPaymentSubmit = async (e) => {
    e.preventDefault();
    if (newPaymentAmount !== null && newPaymentAmount !== "") {
      try {
        setIsSubmittingPaymentEdit(true);
        await updateFeePayment(editingPaymentStudent.id, selectedMonth, Number(newPaymentAmount));
        setIsEditPaymentModalOpen(false);
      } catch (err) {
        alert("Failed to update payment amount.");
      } finally {
        setIsSubmittingPaymentEdit(false);
      }
    }
  };

  const handleEditFeeSubmit = async (e) => {
    e.preventDefault();
    if (newFeeAmount !== null && newFeeAmount !== "") {
      try {
        setIsSubmittingEdit(true);
        await updateStudent(editingFeeStudent.id, { fees: Number(newFeeAmount) });
        setIsEditFeeModalOpen(false);
      } catch (err) {
        alert("Failed to update fee.");
      } finally {
        setIsSubmittingEdit(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* ========================================================================= */}
      {/* MOBILE VIEW (Visible on md:hidden) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4 pb-28">

        {/* 1. Mobile Header */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm active:scale-95 transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none">
                Fee Records
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-none">
                Track and manage all fee collections
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95 transition-all"
              title="Toggle Theme"
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
              className="relative w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95 transition-all"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5 stroke-[2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-extrabold text-white bg-red-600 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Expected */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 border-l-4 border-l-emerald-500 shadow-sm flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Expected</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
              ₹{stats.expected.toLocaleString()}
            </div>
          </div>

          {/* Card 2: Collected */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 border-l-4 border-l-emerald-500 shadow-sm flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Collected</span>
              </div>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/20">
                {stats.expected ? Math.round((stats.collected / stats.expected) * 100) : 0}%
              </span>
            </div>
            <div className="mt-2 text-xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
              ₹{stats.collected.toLocaleString()}
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 border-l-4 border-l-amber-500 shadow-sm flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Pending</span>
              </div>
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/20">
                {stats.expected ? Math.round((stats.pending / stats.expected) * 100) : 0}%
              </span>
            </div>
            <div className="mt-2 text-xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
              ₹{stats.pending.toLocaleString()}
            </div>
          </div>

          {/* Card 4: Overdue */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 border-l-4 border-l-red-500 shadow-sm flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Overdue</span>
              </div>
              <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-red-500/20">
                {stats.overdue > 0 ? 'Needs Action' : 'Good'}
              </span>
            </div>
            <div className="mt-2 text-xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
              ₹{stats.overdue.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 3. Fee Records Section */}
        <div className="space-y-3 pt-1">
          <h2 className="text-base font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
            Fee Records
          </h2>

          {/* Month Selector Box */}
          <div className="relative cursor-pointer">
            <div className="w-full bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3.5 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                  {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none flex-shrink-0" />
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 shadow-sm">
              <Search className="w-4 h-4 text-zinc-400 flex-shrink-0 mr-2.5" />
              <input
                type="text"
                placeholder="Search records by name, roll or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none truncate pr-1"
              />
            </div>

            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shadow-sm active:scale-95 transition-all flex-shrink-0"
              title="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Student Fee Cards List */}
          <div className="space-y-3 pt-1">
            {filteredStudents.map((student) => {
              const rollNumber = student.rollNo || student.id.slice(-6).toUpperCase();
              const dateStr = format(new Date(), 'dd MMM yyyy');
              const timeStr = format(new Date(), 'hh:mm a');

              return (
                <div
                  key={student.id}
                  className="bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 space-y-3 shadow-sm"
                >
                  {/* Card Header & Amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-700 mt-0.5">
                        {getInitials(student.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-heading font-bold text-zinc-900 dark:text-white truncate">
                          {student.name}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                          Roll No. {rollNumber} • {student.batchName || 'General'}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 flex-wrap">
                          <Calendar className="w-3 h-3 text-red-500" />
                          <span>Joined: {student.billingCycle?.admissionDateFormatted || dateStr}</span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="font-semibold text-zinc-600 dark:text-zinc-300">
                            Next Due: {student.billingCycle?.nextDueDateFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-heading font-extrabold text-zinc-900 dark:text-white">
                        ₹{student.monthlyFee || 0}
                      </p>

                      <div className="mt-1">
                        {student.computedFeeStatus === 'Paid' || student.computedFeeStatus === 'Extra' ? (
                          <span className="inline-flex items-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            Paid
                          </span>
                        ) : student.computedFeeStatus === 'Overdue' ? (
                          <span className="inline-flex items-center bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    {student.computedFeeStatus === 'Paid' ? (
                      <div
                        className="flex-1 py-2 px-3 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Paid (₹{student.totalPaidThisMonth}/₹{student.monthlyFee})</span>
                      </div>
                    ) : student.computedFeeStatus === 'Extra' ? (
                      <div
                        className="flex-1 py-2 px-3 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>+₹{student.extraPaid} Extra Paid (₹{student.totalPaidThisMonth}/₹{student.monthlyFee})</span>
                      </div>
                    ) : student.computedFeeStatus === 'Partial' ? (
                      <div
                        className="flex-1 py-2 px-3 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>₹{student.remainingBalance} Remaining (Paid: ₹{student.totalPaidThisMonth})</span>
                      </div>
                    ) : student.computedFeeStatus === 'Overdue' ? (
                      <div
                        className="flex-1 py-2 px-3 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>Overdue (₹{student.monthlyFee})</span>
                      </div>
                    ) : (
                      <div
                        className="flex-1 py-2 px-3 rounded-xl border border-orange-500/30 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>₹{student.monthlyFee} Pending</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenEditPayment(student)}
                      className="w-10 h-8.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
                      title="Record/Edit Payment Amount"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {(student.computedFeeStatus === 'Paid' || student.computedFeeStatus === 'Extra' || student.totalPaidThisMonth > 0) && (
                      <button
                        type="button"
                        onClick={() => handleDeletePaymentClick(student.id)}
                        className="w-10 h-8.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
                        title="Delete Payment Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-[#101420] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No fee records found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Mobile Floating Action Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            right: '1.25rem'
          }}
          className="fixed z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span>Record Fee</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on md: and up) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Fees & Payments</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage student fee collections and track revenue.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center bg-red-600 hover:bg-red-500 text-white font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Desktop Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Expected</p>
                <IndianRupee className="w-4 h-4 text-zinc-400" />
              </div>
              <p className="mt-2 text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">₹{stats.expected.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Collected</p>
                <Badge variant="success" className="text-xs">
                  {stats.expected ? Math.round((stats.collected / stats.expected) * 100) : 0}%
                </Badge>
              </div>
              <p className="mt-2 text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">₹{stats.collected.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pending</p>
                <Badge variant="warning" className="text-xs">
                  {stats.expected ? Math.round((stats.pending / stats.expected) * 100) : 0}%
                </Badge>
              </div>
              <p className="mt-2 text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">₹{stats.pending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Overdue</p>
                <Badge variant={stats.overdue > 0 ? "danger" : "default"} className="text-xs">
                  {stats.overdue > 0 ? 'Needs Action' : 'Good'}
                </Badge>
              </div>
              <p className="mt-2 text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">₹{stats.overdue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Table & Cards container */}
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <CardTitle>Fee Records</CardTitle>
            <div className="flex gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Input 
                icon={Search} 
                placeholder="Search records..." 
                className="w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          {/* Desktop Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.slice(0, 15).map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{student.name}</p>
                    <p className="text-xs text-zinc-400">{student.id.toUpperCase()}</p>
                  </TableCell>
                  <TableCell><span className="text-sm text-zinc-500 dark:text-zinc-400">{student.batchName}</span></TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        ₹{student.monthlyFee || student.fees || 0}
                      </span>
                      {student.totalPaidThisMonth > 0 && (
                        <div className="text-[11px] font-medium mt-0.5 space-x-1.5">
                          <span className="text-green-600 dark:text-green-400">Paid: ₹{student.totalPaidThisMonth}</span>
                          {student.remainingBalance > 0 && (
                            <span className="text-amber-600 dark:text-amber-400">Rem: ₹{student.remainingBalance}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.computedFeeStatus === 'Paid' ? (
                      <Badge variant="success">Paid</Badge>
                    ) : student.computedFeeStatus === 'Overdue' ? (
                      <Badge variant="error">Overdue</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => handleOpenEditPayment(student)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 transition-colors" title="Record/Edit Payment Amount">
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {student.computedFeeStatus === 'Paid' && (
                        <button onClick={() => handleDeletePaymentClick(student.id)} className="text-zinc-400 hover:text-red-500 p-1 transition-colors" title="Delete Payment Record">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-zinc-500 dark:text-zinc-400">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Record Payment</h2>
            
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Select Student</label>
                <select 
                  required
                  value={selectedStudentId} 
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedStudentId(id);
                    const s = pendingStudents.find(st => st.id === id);
                    if (s) setPaymentAmount(s.remainingBalance || 0);
                  }}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                >
                  <option value="" disabled>Choose pending student</option>
                  {pendingStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.batchName} (Remaining: ₹{s.remainingBalance || 0})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Amount to Pay</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
              
              <div className="pt-6 pb-4 sm:pb-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentId || pendingStudents.length === 0 || isSubmittingPayment}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none transition-all"
                >
                  {isSubmittingPayment ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Edit Payment Modal */}
      {isEditPaymentModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 relative">
              <button 
                onClick={() => setIsEditPaymentModalOpen(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full p-1.5"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Edit Payment Amount</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Update the total amount paid by {editingPaymentStudent?.name} for this month.</p>
              
              <form onSubmit={handleEditPaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Total Paid (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newPaymentAmount}
                    onChange={e => setNewPaymentAmount(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditPaymentModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={isSubmittingPaymentEdit}
                  >
                    {isSubmittingPaymentEdit ? 'Saving...' : 'Save Payment'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Fee Modal */}
      {isEditFeeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl w-full max-w-md shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 relative">
              <button 
                onClick={() => setIsEditFeeModalOpen(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full p-1.5"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Edit Monthly Fee</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Update the expected monthly fee for {editingFeeStudent?.name}.</p>
              
              <form onSubmit={handleEditFeeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Fee Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newFeeAmount}
                    onChange={e => setNewFeeAmount(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditFeeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingEdit} className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white border-none shadow-md disabled:opacity-50">
                    {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete Payment Record?</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Are you sure you want to delete this payment record for {
                  new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
                }? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingFeeStudentId(null);
                }}>
                  Cancel
                </Button>
                <Button type="button" disabled={isDeleting} className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white border-none shadow-md disabled:opacity-50" onClick={confirmDeletePayment}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
