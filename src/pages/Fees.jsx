import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { IndianRupee, Download, Plus, Search, Filter, X, Edit2, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/Input';

export default function Fees() {
  const { students, feePayments, recordFeePayment, updateStudent, deleteFeePayment } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isEditFeeModalOpen, setIsEditFeeModalOpen] = useState(false);
  const [editingFeeStudent, setEditingFeeStudent] = useState(null);
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFeeStudentId, setDeletingFeeStudentId] = useState(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate last 6 months for filter
  const monthOptions = useMemo(() => {
    const options = [];
    const d = new Date();
    for (let i = 0; i < 6; i++) {
      options.push(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 7));
      d.setMonth(d.getMonth() - 1);
    }
    return options;
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Compute fee statuses for the selected month
  const studentStatuses = useMemo(() => {
    return students.map(s => {
      let status = 'Pending';
      if (selectedMonth === currentMonth) {
        status = s.feeStatus;
      } else {
        const hasPaid = feePayments.some(p => {
          const pStudentId = p.studentId?._id || p.studentId;
          const sId = s._id || s.id;
          return pStudentId === sId && p.month === selectedMonth;
        });
        status = hasPaid ? 'Paid' : 'Pending';
      }
      return { ...s, computedFeeStatus: status };
    });
  }, [students, feePayments, selectedMonth]);

  // Calculate dynamic stats based on selected month
  const stats = useMemo(() => {
    let expected = 0;
    let collected = 0;
    let pending = 0;
    let overdue = 0;

    studentStatuses.forEach(s => {
      const fee = s.monthlyFee || 0;
      expected += fee;
      if (s.computedFeeStatus === 'Paid') collected += fee;
      else if (s.computedFeeStatus === 'Pending') pending += fee;
      else if (s.computedFeeStatus === 'Overdue') overdue += fee;
    });

    return { expected, collected, pending, overdue };
  }, [studentStatuses]);

  const filteredStudents = studentStatuses.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.batchName && s.batchName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingStudents = students.filter(s => s.feeStatus !== 'Paid');

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
        amount: student.monthlyFee || 0,
        month: selectedMonth
      });
      setIsModalOpen(false);
      setSelectedStudentId('');
      setReceiptData({ student, amount: student.monthlyFee || 0, date: new Date() });
      setShowReceipt(true);
    } catch (err) {
      alert("Failed to record payment.");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleMarkPaid = async (id) => {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    try {
      setIsSubmittingPayment(true);
      await recordFeePayment({
        studentId: student.id,
        batchId: student.batchId?._id || student.batchId,
        amount: student.monthlyFee || 0,
        month: selectedMonth
      });
      setReceiptData({ student, amount: student.monthlyFee || 0, date: new Date() });
      setShowReceipt(true);
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
    setNewFeeAmount(student.monthlyFee || 0);
    setIsEditFeeModalOpen(true);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Fees & Payments</h1>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Manage student fee collections and track revenue.</p>
        </div>
        <div className="flex mt-4 sm:mt-0 space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Mobile Floating Action Pill Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        style={{
          bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
          right: '1.25rem'
        }}
        className="sm:hidden fixed z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>Record Fee</span>
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 truncate pr-2">Expected</p>
              <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
            </div>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">₹{stats.expected.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 truncate pr-2">Collected</p>
              <Badge variant="success" className="bg-green-100 text-green-700 text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5">
                {stats.expected ? Math.round((stats.collected / stats.expected) * 100) : 0}%
              </Badge>
            </div>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">₹{stats.collected.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 truncate pr-2">Pending</p>
              <Badge variant="warning" className="bg-amber-100 text-amber-700 text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5">
                {stats.expected ? Math.round((stats.pending / stats.expected) * 100) : 0}%
              </Badge>
            </div>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">₹{stats.pending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 truncate pr-2">Overdue</p>
              <Badge variant={stats.overdue > 0 ? "danger" : "default"} className={`${stats.overdue > 0 ? "bg-red-100 text-red-700" : ""} text-[10px] sm:text-xs px-1.5 py-0 sm:px-2.5 sm:py-0.5`}>
                {stats.overdue > 0 ? 'Needs Action' : 'Good'}
              </Badge>
            </div>
            <p className="mt-1 sm:mt-2 text-xl sm:text-3xl lg:text-4xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">₹{stats.overdue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Table & Cards container */}
        <div>
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
              <CardTitle>Fee Records</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition-colors w-full sm:w-auto"
                />
                <Input 
                  icon={Search} 
                  placeholder="Search records..." 
                  className="w-full sm:w-64" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>

            {/* Desktop Table */}
            <div className="hidden md:block">
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
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">{student.id.toUpperCase()}</p>
                      </TableCell>
                      <TableCell><span className="text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">{student.batchName}</span></TableCell>
                      <TableCell><span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">₹{student.monthlyFee || 0}</span></TableCell>
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
                          {student.computedFeeStatus !== 'Paid' && (
                            <Button size="sm" onClick={() => handleMarkPaid(student.id)}>Mark Paid</Button>
                          )}
                          {student.computedFeeStatus === 'Paid' && (
                            <Button size="sm" variant="outline" onClick={() => {
                              setReceiptData({ student, amount: student.monthlyFee || 0, date: new Date() });
                              setShowReceipt(true);
                            }}>Receipt</Button>
                          )}
                          <button onClick={() => handleOpenEditFee(student)} className="text-zinc-400 hover:text-blue-500 p-1 transition-colors" title="Edit Fee Amount">
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
                      <TableCell colSpan={5} className="text-center py-4 text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">
                        No students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Fee Cards List */}
            <div className="md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredStudents.map((student) => (
                <div key={student.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-heading font-bold text-zinc-900 dark:text-white truncate">
                        {student.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                          {student.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs text-zinc-400">•</span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                          {student.batchName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-zinc-900 dark:text-white">
                        ₹{student.monthlyFee || 0}
                      </p>
                      <div className="mt-1">
                        {student.computedFeeStatus === 'Paid' ? (
                          <Badge variant="success" className="text-[11px]">Paid</Badge>
                        ) : student.computedFeeStatus === 'Overdue' ? (
                          <Badge variant="error" className="text-[11px]">Overdue</Badge>
                        ) : (
                          <Badge variant="warning" className="text-[11px]">Pending</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex-1">
                      {student.computedFeeStatus !== 'Paid' ? (
                        <Button size="sm" className="w-full text-xs h-8" onClick={() => handleMarkPaid(student.id)}>
                          Mark Paid
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => {
                          setReceiptData({ student, amount: student.monthlyFee || 0, date: new Date() });
                          setShowReceipt(true);
                        }}>
                          View Receipt
                        </Button>
                      )}
                    </div>
                    <button 
                      onClick={() => handleOpenEditFee(student)} 
                      className="p-2 text-zinc-500 hover:text-blue-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" 
                      title="Edit Fee Amount"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {student.computedFeeStatus === 'Paid' && (
                      <button 
                        onClick={() => handleDeletePaymentClick(student.id)} 
                        className="p-2 text-zinc-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" 
                        title="Delete Payment Record"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredStudents.length === 0 && (
                <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                  No students found.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

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
                <label className="block text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 mb-1">Select Student</label>
                <select 
                  required
                  value={selectedStudentId} 
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                >
                  <option value="" disabled>Choose pending student</option>
                  {pendingStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - {s.batchName} (₹{s.monthlyFee || 0})</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-6 pb-4 sm:pb-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedStudentId || pendingStudents.length === 0 || isSubmittingPayment}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all"
                >
                  {isSubmittingPayment ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowReceipt(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div id="receipt-content" className="p-4 text-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Payment Receipt</h2>
              <p className="text-sm text-zinc-500 mb-6">{receiptData.date.toLocaleDateString()}</p>
              
              <div className="space-y-2 text-left mb-6">
                <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Student:</span> {receiptData.student.name}</p>
                <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Batch:</span> {receiptData.student.batchName}</p>
                <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Amount Paid:</span> ₹{receiptData.amount}</p>
                <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Month:</span> {receiptData.date.toISOString().slice(0, 7)}</p>
              </div>
              <div className="border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-4">
                <p className="text-xs text-zinc-400">Thank you for your payment!</p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1" onClick={() => window.print()}>Print Receipt</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowReceipt(false)}>Close</Button>
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
                    className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setIsEditFeeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingEdit} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white border-none shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] disabled:opacity-50">
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
                <Button type="button" disabled={isDeleting} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white border-none shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] disabled:opacity-50" onClick={confirmDeletePayment}>
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
