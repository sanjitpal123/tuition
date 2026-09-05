import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Eye, 
  EyeOff, 
  Key, 
  Phone, 
  Mail, 
  GraduationCap, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Bell, 
  Users, 
  User, 
  UserX, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Award, 
  Lock, 
  BookOpen 
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export default function Students() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { students, addStudent, updateStudent, deleteStudent, batches, realNotifications } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [showPasswordMap, setShowPasswordMap] = useState({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    parentName: '',
    parentPhone: '',
    address: '',
    admissionDate: '',
    fees: '',
    batchId: '',
    status: 'Active',
    feeStatus: 'Pending'
  });

  const activeStudents = students.filter(s => s.status === 'Active').length;
  const inactiveStudents = students.filter(s => s.status === 'Inactive').length;
  const avgAttendance = students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.attendance || 0), 0) / students.length) : 0;
  const unreadNotificationsCount = (realNotifications || []).filter(n => !n.isRead).length;

  const togglePasswordVisibility = (studentId) => {
    setShowPasswordMap(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm));
    const sBatchId = s.batchId?._id || s.batchId;
    const matchesBatch = selectedBatchFilter === 'all' || sBatchId === selectedBatchFilter;
    return matchesSearch && matchesBatch;
  });

  const handleOpenModal = (student = null) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        name: student.name || '',
        phone: student.phone || '',
        email: student.email || '',
        password: student.password || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        address: student.address || '',
        admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : '',
        fees: student.fees || '',
        batchId: student.batchId?._id || student.batchId || '',
        status: student.status || 'Active',
        feeStatus: student.feeStatus || 'Pending'
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', email: '', password: '', parentName: '', parentPhone: '', address: '', admissionDate: '', fees: '', batchId: '', status: 'Active', feeStatus: 'Pending' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.batchId) {
      alert("Please select a batch.");
      return;
    }
    const batchName = batches.find(b => b.id === formData.batchId)?.name || 'Unknown Batch';
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateStudent(editingId, { ...formData, batchName });
      } else {
        await addStudent({
          ...formData,
          batchName,
          attendance: 100,
          averageScore: 100,
          joiningDate: new Date().toISOString()
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Failed to save student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      deleteStudent(id);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-36">

      {/* ========================================================================= */}
      {/* MOBILE SPECIFIC VIEW (< md) - Matched to provided screenshot */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-3.5 px-1">

        {/* 1. Top Header Row */}
        <div 
          className="flex items-center justify-between relative z-10 pt-1"
          style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-[#121622] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-red-500 active:scale-90 transition-all cursor-pointer flex-shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div className="min-w-0 truncate">
              <h1 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight truncate">
                Students List
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight truncate mt-0.5">
                Manage and track all your students.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-[#121622] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4.5 h-4.5 text-amber-400 stroke-[2] drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-zinc-700 stroke-[2]" />
              )}
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#121622] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
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

        {/* 2. Batch Selector Box */}
        <div className="relative">
          <div className="w-full bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800/90 rounded-2xl px-3.5 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                {selectedBatchFilter === 'all' 
                  ? 'All Batches' 
                  : (batches.find(b => b.id === selectedBatchFilter)?.name || 'Selected Batch')}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none flex-shrink-0" />
          </div>
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="all">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* 3. Search Bar with Filter Icon */}
        <div className="relative flex items-center bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800/90 rounded-2xl px-3.5 py-2.5 shadow-sm">
          <Search className="w-4 h-4 text-zinc-400 flex-shrink-0 mr-2.5" />
          <input
            type="text"
            placeholder="Search students by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-2 flex-shrink-0" />
          <button 
            type="button"
            onClick={() => setSearchTerm('')} 
            className="text-red-500 hover:text-red-400 flex-shrink-0 p-1"
            title="Filter"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. 2x2 Top Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Total Students */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 border border-red-500/20">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block leading-tight">Total Students</span>
              <span className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white block mt-0.5 leading-none">
                {students.length}
              </span>
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block leading-tight">Active</span>
                <span className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white block mt-0.5 leading-none">
                  {activeStudents}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-500 flex items-center gap-0.5 self-end mb-0.5">
              <TrendingUp className="w-3 h-3" /> {students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 100}%
            </span>
          </div>

          {/* Card 3: Inactive */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                <UserX className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block leading-tight">Inactive</span>
                <span className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white block mt-0.5 leading-none">
                  {inactiveStudents}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 self-end mb-0.5">
              {students.length > 0 ? Math.round((inactiveStudents / students.length) * 100) : 0}%
            </span>
          </div>

          {/* Card 4: Avg Attendance */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-500 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block leading-tight">Avg Attendance</span>
                <span className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white block mt-0.5 leading-none">
                  {avgAttendance}%
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-500 self-end mb-0.5">
              {avgAttendance}%
            </span>
          </div>
        </div>

        {/* 5. Student Cards List */}
        <div className="space-y-3 pt-1">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white dark:bg-[#101420] rounded-[26px] p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/90 shadow-sm space-y-3.5 relative overflow-hidden"
            >
              {/* Top Row: Avatar, Name, Batch, Phone & Chevron */}
              <div 
                onClick={() => navigate(`/students/${student.id}`)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-heading font-extrabold text-white text-xs">
                      {getInitials(student.name)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white capitalize truncate">
                        {student.name}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold border border-emerald-500/20">
                        {student.status || 'Active'}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {student.batchName || 'Batch'}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-400" />
                      <span>{student.phone || student.parentPhone || 'No phone'}</span>
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-2" />
              </div>

              {/* Middle Row: Login ID & Password Box */}
              <div className="bg-zinc-50 dark:bg-[#0c0f17] rounded-2xl p-3 border border-zinc-200/60 dark:border-zinc-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Login ID</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-900 dark:text-white">
                    {student.phone || student.email || 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-zinc-500 dark:text-zinc-400 font-medium">
                    <Key className="w-3.5 h-3.5" />
                    <span>Password</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {showPasswordMap[student.id] ? (student.password || '1234567') : '••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(student.id)}
                      className="text-red-500 hover:text-red-400 p-0.5 active:scale-90 transition-all cursor-pointer"
                      title={showPasswordMap[student.id] ? "Hide Password" : "Show Password"}
                    >
                      {showPasswordMap[student.id] ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>


              {/* 3 Action Buttons Row */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => navigate(`/students/${student.id}`)}
                  className="py-2 px-1 rounded-xl border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenModal(student)}
                  className="py-2 px-1 rounded-xl border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(student.id)}
                  className="py-2 px-1 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-[11px] font-bold flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#101420] rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 p-6">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No students found matching your search.</p>
              <Button onClick={() => handleOpenModal()} className="mt-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs">
                Add First Student
              </Button>
            </div>
          )}
        </div>

        {/* Showing students count */}
        <div className="text-center py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Showing {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on md: and up) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Students</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage all your students in one place.</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white shadow-sm font-semibold">
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </Button>
          </div>
        </div>

        {/* Batch Selector & Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search students by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="w-64">
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm cursor-pointer"
            >
              <option value="all">All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <Card className="overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Phone / Login ID</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold text-xs">
                        {getInitials(student.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-white capitalize">{student.name}</p>
                        <p className="text-xs text-zinc-500">{student.email || 'No email'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.batchName || 'General'}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">{student.phone || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.feeStatus === 'Paid' ? 'success' : (student.feeStatus === 'Overdue' ? 'danger' : 'warning')}>
                      {student.feeStatus || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-500">{student.attendance || 100}%</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/students/${student.id}`)}>
                        <Eye className="w-4 h-4 text-emerald-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenModal(student)}>
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Mobile Floating Action Pill Button */}
      <button
        type="button"
        onClick={() => handleOpenModal()}
        style={{
          bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
          right: '1.25rem'
        }}
        className="md:hidden fixed z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>Add Student</span>
      </button>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button onClick={handleCloseModal} className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{editingId ? 'Edit Student' : 'Add Student'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Name</label>
                <input 
                  required
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
              
              {/* Highlighted Credentials Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-5 my-4 shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800/50">
                      <Key className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-blue-950 dark:text-blue-100 tracking-tight">App Login Credentials</h3>
                      <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 font-medium uppercase tracking-wider mt-0.5">Student / Parent Access</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-blue-200/60 dark:border-blue-800/40 rounded-xl p-4 mb-4 shadow-sm">
                    <label className="block text-xs font-semibold text-blue-900/90 dark:text-blue-300/90 mb-2 uppercase tracking-wide">
                      Set Password
                    </label>
                    <input 
                      type="text" 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                      className="w-full bg-white dark:bg-zinc-950/80 border border-blue-200/80 dark:border-blue-800/60 rounded-lg px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:font-normal placeholder:text-zinc-400" 
                      placeholder="Enter a secure password..." 
                    />
                  </div>

                  <div className="flex items-start gap-2.5 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/30">
                    <span className="text-blue-500 dark:text-blue-400 text-sm mt-0.5 leading-none">ℹ</span>
                    <p className="text-xs text-blue-800/90 dark:text-blue-200/80 leading-relaxed">
                      The Login ID will automatically be set to the <strong>Student's Phone Number</strong> (or Parent's number if student phone is unavailable).
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Phone</label>
                <input 
                  required
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Parent Name</label>
                  <input 
                    type="text" 
                    name="parentName" 
                    value={formData.parentName} 
                    onChange={handleChange}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Parent Phone</label>
                  <input 
                    type="text" 
                    name="parentPhone" 
                    value={formData.parentPhone} 
                    onChange={handleChange}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Admission Date</label>
                  <input 
                    type="date" 
                    name="admissionDate" 
                    value={formData.admissionDate} 
                    onChange={handleChange}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Monthly Fee (₹)</label>
                <input 
                  type="number" 
                  name="fees" 
                  value={formData.fees} 
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Batch</label>
                <select 
                  required
                  name="batchId" 
                  value={formData.batchId} 
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                >
                  <option value="" disabled>Select a batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Fee Status</label>
                  <select 
                    name="feeStatus" 
                    value={formData.feeStatus} 
                    onChange={handleChange}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 pb-4 sm:pb-0 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Student')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
