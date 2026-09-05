import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CalendarDays, 
  CreditCard, 
  School, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Key, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  MessageSquare, 
  Send, 
  Printer, 
  Copy, 
  Check, 
  X, 
  IndianRupee, 
  Plus, 
  IdCard as IdCardIcon,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import api from '../lib/api';

export default function StudentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    students, 
    batches, 
    scheduleClasses, 
    feePayments, 
    recordFeePayment, 
    updateStudent, 
    deleteStudent, 
    refreshData,
    isLoading: isDataLoading 
  } = useData();

  const currentUser = JSON.parse(localStorage.getItem('tutorProfile') || '{"tuitionName":"Setupclass"}');
  const student = students.find(s => s.id === id || s._id === id);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'attendance' | 'fees' | 'idcard'
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Record Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMonth, setPaymentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Receipt Modal State
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState(false);

  // Monthly Tuition Classes Count
  const totalTuitionClassesThisMonth = React.useMemo(() => {
    if (!student || !scheduleClasses) return 0;
    
    let sBatchId = null;
    if (student.batchId) {
      sBatchId = typeof student.batchId === 'object' ? (student.batchId._id || student.batchId.id) : student.batchId;
    }
    if (!sBatchId && student.batchName && batches) {
      const found = batches.find(b => b.name === student.batchName);
      if (found) sBatchId = found._id || found.id;
    }
    sBatchId = sBatchId ? String(sBatchId) : null;

    return scheduleClasses.filter(c => {
      let cBatchId = c.batchId;
      if (cBatchId && typeof cBatchId === 'object') {
        cBatchId = cBatchId._id || cBatchId.id;
      }
      cBatchId = cBatchId ? String(cBatchId) : null;

      if (!sBatchId || !cBatchId || cBatchId !== sBatchId) return false;
      if (!c.date) return false;
      return c.date.startsWith(selectedMonth);
    }).length;
  }, [student, scheduleClasses, batches, selectedMonth]);

  // Fetch Attendance stats for the selected month
  useEffect(() => {
    const fetchStats = async () => {
      if (!student) return;
      try {
        setIsStatsLoading(true);
        const res = await api.get(`/attendance/student/${student.id || student._id}/stats?month=${selectedMonth}`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchStats();
  }, [student, selectedMonth]);

  // Filter student fee payments
  const studentFeeHistory = React.useMemo(() => {
    if (!student || !feePayments) return [];
    const sId = student._id || student.id;
    return feePayments.filter(p => {
      const pStudentId = p.studentId?._id || p.studentId;
      return pStudentId === sId;
    }).sort((a, b) => new Date(b.createdAt || b.paymentDate || b.month) - new Date(a.createdAt || a.paymentDate || a.month));
  }, [student, feePayments]);

  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-9 h-9 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-6">
        <p className="text-zinc-500 dark:text-zinc-400 mb-4 font-medium">Student not found or may have been deleted.</p>
        <Button onClick={() => navigate('/students')}>Return to Students List</Button>
      </div>
    );
  }

  // Communication Handlers
  const cleanPhone = (student.phone || '').replace(/\D/g, '');
  const handleCall = () => {
    if (!cleanPhone) {
      alert("No phone number registered for this student.");
      return;
    }
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleSMS = () => {
    if (!cleanPhone) {
      alert("No phone number registered for this student.");
      return;
    }
    window.location.href = `sms:${cleanPhone}`;
  };

  const handleWhatsApp = () => {
    if (!cleanPhone) {
      alert("No phone number registered for this student.");
      return;
    }
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${student.name}? This will remove all their records.`)) {
      try {
        await deleteStudent(student.id || student._id);
        navigate('/students');
      } catch (err) {
        alert("Failed to delete student.");
      }
    }
  };

  // Edit Handlers
  const handleOpenEditModal = () => {
    setEditFormData({
      name: student.name || '',
      phone: student.phone || '',
      email: student.email || '',
      password: student.password || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      address: student.address || '',
      admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : '',
      fees: student.fees || student.monthlyFee || '',
      batchId: student.batchId?._id || student.batchId || '',
      status: student.status || 'Active',
      feeStatus: student.feeStatus || 'Pending'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setIsSavingEdit(true);
      const batchName = batches.find(b => b.id === editFormData.batchId || b._id === editFormData.batchId)?.name || student.batchName;
      await updateStudent(student.id || student._id, { ...editFormData, batchName });
      setIsEditModalOpen(false);
      refreshData();
    } catch (err) {
      alert("Failed to update student profile.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Payment Recording
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsRecordingPayment(true);
      await recordFeePayment({
        studentId: student.id || student._id,
        batchId: student.batchId?._id || student.batchId,
        amount: Number(paymentAmount) || student.monthlyFee || 0,
        month: paymentMonth
      });
      setIsPayModalOpen(false);
      setReceiptData({
        student,
        amount: Number(paymentAmount) || student.monthlyFee || 0,
        date: new Date(),
        month: paymentMonth
      });
      setShowReceipt(true);
      refreshData();
    } catch (err) {
      alert("Failed to record fee payment.");
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const copyCredentials = () => {
    const text = `Login ID: ${student.phone || student.email}\nPassword: ${student.password || 'Not set'}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-20">
      
      {/* Desktop Header */}
      <div className="hidden sm:flex items-center space-x-4 mb-2">
        <button 
          onClick={() => navigate('/students')} 
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
            Student Management
          </h1>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            View and manage student profile, attendance, payments, and ID card.
          </p>
        </div>
      </div>

      {/* Top Student Identity Card (Matching reference design) */}
      <Card className="bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold text-2xl border border-zinc-200 dark:border-zinc-700 shadow-inner flex-shrink-0">
              <Avatar fallback={student.name} size="lg" className="w-full h-full text-2xl rounded-2xl" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-zinc-900 dark:text-white truncate">
                  {student.name}
                </h2>
                <Badge variant={student.status === 'Active' ? 'success' : 'default'} className="text-[11px] font-bold">
                  {student.status}
                </Badge>
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <span>{student.batchName}</span>
                {student.class && <span>• {student.class}</span>}
                {student.phone && <span>• {student.phone}</span>}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                ID: {(student.id || student._id || '').slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <Button variant="outline" size="sm" onClick={handleOpenEditModal} className="flex-1 sm:flex-none flex items-center gap-1.5 h-9">
              <Edit2 className="w-4 h-4 text-blue-500" />
              <span>Edit Profile</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setPaymentAmount(student.monthlyFee || ''); setIsPayModalOpen(true); }} className="flex-1 sm:flex-none flex items-center gap-1.5 h-9 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60">
              <IndianRupee className="w-4 h-4" />
              <span>Record Fee</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Navigation Segmented Tabs (Profile / Tuition / School / Fees / ID Card) */}
      <div className="grid grid-cols-5 gap-1 sm:gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTab === 'attendance'
              ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Tuition</span>
        </button>

        <button
          onClick={() => setActiveTab('school')}
          className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTab === 'school'
              ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <School className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>School</span>
        </button>

        <button
          onClick={() => setActiveTab('fees')}
          className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTab === 'fees'
              ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Fees</span>
        </button>

        <button
          onClick={() => setActiveTab('idcard')}
          className={`py-2 px-1 sm:py-2.5 sm:px-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 ${
            activeTab === 'idcard'
              ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <IdCardIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>ID Card</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PROFILE SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* App Access Credentials Box */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-800/40 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500 text-white shadow-sm">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100">Student App Login Credentials</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Use these details for the student/parent mobile login</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={copyCredentials} className="text-xs h-8 flex items-center gap-1 border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-zinc-900/80">
                {copiedKey ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
                <span>{copiedKey ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <div className="bg-white/90 dark:bg-zinc-900/80 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Login ID (Phone/Email)</p>
                <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-0.5">{student.phone || student.email || 'N/A'}</p>
              </div>
              <div className="bg-white/90 dark:bg-zinc-900/80 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Password</p>
                <p className="text-sm font-mono font-bold text-zinc-900 dark:text-white mt-0.5">{student.password || 'Not set'}</p>
              </div>
            </div>
          </div>

          {/* Detailed Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Personal & Academic Details */}
            <Card>
              <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-red-500" />
                  Academic & Enrollment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Assigned Batch</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{student.batchName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Monthly Fee</span>
                  <span className="font-bold text-zinc-900 dark:text-white">₹{student.fees || student.monthlyFee || 0}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Fee Status</span>
                  <Badge variant={student.feeStatus === 'Paid' ? 'success' : student.feeStatus === 'Pending' ? 'warning' : 'danger'}>
                    {student.feeStatus}
                  </Badge>
                </div>
                <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Total Score</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{student.averageScore || 100}%</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-zinc-500 dark:text-zinc-400">Admission Date</span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Parent Info */}
            <Card>
              <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-red-500" />
                  Contact & Guardian Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Student Phone</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{student.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Email</span>
                  <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[180px]">{student.email || 'No email'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Parent / Guardian</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{student.parentName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-500 dark:text-zinc-400">Parent Phone</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{student.parentPhone || 'N/A'}</span>
                </div>
                <div className="flex items-start justify-between py-1.5">
                  <span className="text-zinc-500 dark:text-zinc-400">Address</span>
                  <span className="font-medium text-zinc-900 dark:text-white text-right max-w-[200px]">{student.address || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TUITION ATTENDANCE SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Month Selector Bar */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Select Month:</span>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Stats Breakdown */}
          {isStatsLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-green-500/30 p-4 rounded-2xl text-center shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Present</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-500 mt-1">
                    {stats.tuitionPresent} <span className="text-sm text-zinc-400 font-normal">/ {totalTuitionClassesThisMonth}</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-red-500/30 p-4 rounded-2xl text-center shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Absent</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-500 mt-1">
                    {stats.tuitionAbsent} <span className="text-sm text-zinc-400 font-normal">/ {totalTuitionClassesThisMonth}</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-amber-500/30 p-4 rounded-2xl text-center shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Late</p>
                  <p className="text-2xl sm:text-3xl font-bold text-amber-500 mt-1">
                    {stats.tuitionLate} <span className="text-sm text-zinc-400 font-normal">/ {totalTuitionClassesThisMonth}</span>
                  </p>
                </div>
              </div>

              {/* Tuition Attendance Overview Card */}
              <Card>
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-red-500" />
                    Tuition Batch Attendance Summary ({selectedMonth})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 dark:text-zinc-400">Total Tuition Classes Scheduled</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{totalTuitionClassesThisMonth} Classes</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 dark:text-zinc-400">Classes Attended</span>
                    <span className="font-semibold text-green-500">{stats.tuitionPresent + stats.tuitionLate} Classes</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-500 dark:text-zinc-400">Tuition Attendance Rate</span>
                    <span className="font-bold text-red-500">
                      {totalTuitionClassesThisMonth > 0 
                        ? Math.round(((stats.tuitionPresent + stats.tuitionLate) / totalTuitionClassesThisMonth) * 100) 
                        : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500">
              No tuition attendance recorded for this month.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SCHOOL ATTENDANCE SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'school' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Month Selector Bar */}
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Select Month:</span>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Stats Breakdown */}
          {isStatsLoading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-indigo-500/30 p-5 rounded-2xl text-center shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Went to School</p>
                  <p className="text-3xl sm:text-4xl font-bold text-indigo-500 mt-1">
                    {stats.schoolYes} <span className="text-sm text-zinc-400 font-normal">Days</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-orange-500/30 p-5 rounded-2xl text-center shadow-sm">
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Did Not Go</p>
                  <p className="text-3xl sm:text-4xl font-bold text-orange-500 mt-1">
                    {stats.schoolNo} <span className="text-sm text-zinc-400 font-normal">Days</span>
                  </p>
                </div>
              </div>

              {/* School Attendance Summary Card */}
              <Card>
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-base flex items-center gap-2">
                    <School className="w-4 h-4 text-indigo-500" />
                    Regular School Attendance Record ({selectedMonth})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 dark:text-zinc-400">Total Marked Days</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{stats.schoolYes + stats.schoolNo} Days</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-zinc-500 dark:text-zinc-400">School Regularity Rate</span>
                    <span className="font-bold text-indigo-500">
                      {stats.schoolYes + stats.schoolNo > 0 
                        ? Math.round((stats.schoolYes / (stats.schoolYes + stats.schoolNo)) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 pt-1">
                    * School attendance is recorded daily alongside tuition attendance during batch sessions.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500">
              No school attendance recorded for this month.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FEES & PAYMENT HISTORY SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'fees' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Fee Overview Card */}
          <Card className="bg-gradient-to-br from-red-500/5 to-rose-500/10 border-red-200 dark:border-red-900/40">
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Monthly Tuition Fee</p>
                <h3 className="text-3xl font-heading font-extrabold text-zinc-900 dark:text-white mt-1">
                  ₹{student.fees || student.monthlyFee || 0}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Current Status: <span className="font-bold text-zinc-900 dark:text-white">{student.feeStatus}</span>
                </p>
              </div>

              <Button 
                onClick={() => { setPaymentAmount(student.monthlyFee || ''); setIsPayModalOpen(true); }}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Record Fee Payment</span>
              </Button>
            </CardContent>
          </Card>

          {/* Payment History List */}
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-500" />
                  Payment History & Receipts
                </span>
                <span className="text-xs font-normal text-zinc-500">
                  {studentFeeHistory.length} Recorded Payments
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {studentFeeHistory.length === 0 ? (
                <div className="text-center py-10 text-zinc-500 dark:text-zinc-400 text-sm">
                  No payment history found for this student.
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {studentFeeHistory.map((payment) => (
                    <div key={payment._id || payment.id} className="p-4 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <div>
                        <p className="text-base font-bold text-zinc-900 dark:text-white">
                          ₹{payment.amount}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Month: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{payment.month || 'Current'}</span> • Paid on {new Date(payment.createdAt || payment.paymentDate || Date.now()).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant="success">Paid</Badge>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setReceiptData({
                              student,
                              amount: payment.amount,
                              date: new Date(payment.createdAt || payment.paymentDate || Date.now()),
                              month: payment.month
                            });
                            setShowReceipt(true);
                          }}
                          className="text-xs h-8 flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DIGITAL ID CARD SECTION */}
      {/* ========================================================================= */}
      {activeTab === 'idcard' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-center">
            {/* Student ID Card Badge */}
            <div 
              id="student-id-card" 
              className="w-full max-w-sm bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white rounded-3xl p-6 border-2 border-red-500/30 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative top glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
              
              {/* ID Card Header */}
              <div className="text-center pb-4 border-b border-zinc-800">
                <span className="text-lg font-heading font-black text-red-500 tracking-wider uppercase">
                  {currentUser.tuitionName || "Setupclass Tuition Hub"}
                </span>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-0.5">Student Identity Card</p>
              </div>

              {/* ID Card Body */}
              <div className="flex flex-col items-center text-center mt-5">
                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 p-1 mb-3">
                  <Avatar fallback={student.name} size="xl" className="w-full h-full text-2xl rounded-full" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">{student.name}</h3>
                <p className="text-xs text-red-400 font-semibold mt-0.5">{student.batchName} {student.class ? `(${student.class})` : ''}</p>
              </div>

              {/* ID Card Meta Fields */}
              <div className="mt-5 space-y-2 text-xs bg-zinc-900/80 p-3.5 rounded-2xl border border-zinc-800">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Roll / ID:</span>
                  <span className="font-mono font-bold text-zinc-200">{(student.id || student._id || '').slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Phone:</span>
                  <span className="font-medium text-zinc-200">{student.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Parent:</span>
                  <span className="font-medium text-zinc-200">{student.parentName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="font-bold text-emerald-400">{student.status}</span>
                </div>
              </div>

              {/* ID Card Footer */}
              <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Authorized Card</span>
                <span>Setupclass System</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4">
            <Button onClick={() => window.print()} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              <span>Print / Save ID Card</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DIRECT COMMUNICATION ACTIONS (Matching Reference Screen List) */}
      {/* ========================================================================= */}
      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 px-1">
          Direct Communication & Actions
        </h4>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
          {/* Call Action */}
          <button 
            onClick={handleCall}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Call Student</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{student.phone || 'No number'}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* SMS Action */}
          <button 
            onClick={handleSMS}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">Text Message (SMS)</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Send direct SMS reminder</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* WhatsApp Action */}
          <button 
            onClick={handleWhatsApp}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">WhatsApp Chat</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Open WhatsApp conversation</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Delete Student Action */}
          <button 
            onClick={handleDelete}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 group-hover:scale-105 transition-transform">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Delete Student</p>
                <p className="text-xs text-red-400/80">Permanently remove student record</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Edit Student Profile</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={editFormData.name} 
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Phone (Student Login ID)</label>
                <input 
                  required
                  type="text" 
                  value={editFormData.phone} 
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">App Login Password</label>
                <input 
                  type="text" 
                  value={editFormData.password} 
                  onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Monthly Fee (₹)</label>
                <input 
                  type="number" 
                  value={editFormData.fees} 
                  onChange={(e) => setEditFormData(prev => ({ ...prev, fees: e.target.value }))}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Batch</label>
                <select 
                  value={editFormData.batchId} 
                  onChange={(e) => setEditFormData(prev => ({ ...prev, batchId: e.target.value }))}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                >
                  {batches.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>{b.name} ({b.class || 'Class'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Status</label>
                  <select 
                    value={editFormData.status} 
                    onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Fee Status</label>
                  <select 
                    value={editFormData.feeStatus} 
                    onChange={(e) => setEditFormData(prev => ({ ...prev, feeStatus: e.target.value }))}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Parent Name</label>
                <input 
                  type="text" 
                  value={editFormData.parentName} 
                  onChange={(e) => setEditFormData(prev => ({ ...prev, parentName: e.target.value }))}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Parent Phone</label>
                <input 
                  type="text" 
                  value={editFormData.parentPhone} 
                  onChange={(e) => setEditFormData(prev => ({ ...prev, parentPhone: e.target.value }))}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSavingEdit} className="flex-1">
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECORD PAYMENT MODAL */}
      {/* ========================================================================= */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <button onClick={() => setIsPayModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Record Fee Payment</h2>
            
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Student</label>
                <p className="font-semibold text-zinc-900 dark:text-white">{student.name} ({student.batchName})</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Fee Month</label>
                <input 
                  type="month" 
                  value={paymentMonth} 
                  onChange={(e) => setPaymentMonth(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Amount Paid (₹)</label>
                <input 
                  required
                  type="number" 
                  value={paymentAmount} 
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsPayModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isRecordingPayment} className="flex-1 bg-red-600 hover:bg-red-500">
                  {isRecordingPayment ? 'Recording...' : 'Confirm Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECEIPT MODAL */}
      {/* ========================================================================= */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowReceipt(false)} className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div id="receipt-content" className="text-center pt-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950/40 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-black text-zinc-900 dark:text-white">Fee Receipt</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{receiptData.date.toLocaleDateString()}</p>

              <div className="mt-5 space-y-2.5 text-left text-xs bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/50">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Student:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{receiptData.student.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Batch:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{receiptData.student.batchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount Paid:</span>
                  <span className="font-bold text-green-600 dark:text-green-400 text-sm">₹{receiptData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">For Month:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{receiptData.month || receiptData.date.toISOString().slice(0, 7)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
                Authorized receipt from {currentUser.tuitionName || "Setupclass"}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button className="flex-1" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1.5" />
                Print
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowReceipt(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
