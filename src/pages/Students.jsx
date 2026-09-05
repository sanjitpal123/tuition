import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Search, Plus, Download, MoreVertical, Filter, Edit2, Trash2, X, Eye, Key, Phone, Mail, GraduationCap, ChevronRight, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export default function Students() {
  const navigate = useNavigate();
  const { students, addStudent, updateStudent, deleteStudent, batches } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  
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

  const handleOpenViewModal = (student) => {
    navigate(`/students/${student.id}`);
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
    <div className="space-y-6">
      {/* Desktop Header */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage all your students in one place.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Import Students
          </Button>
          <Button onClick={() => handleOpenModal()} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Mobile Floating Action Pill Button */}
      <button
        type="button"
        onClick={() => handleOpenModal()}
        className="sm:hidden fixed bottom-20 right-5 z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>Add Student</span>
      </button>

      {/* Batch Selector Dropdown Pill (Mobile & Desktop) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium text-sm rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm cursor-pointer"
          >
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch.id || batch._id} value={batch.id || batch._id}>
                {batch.name} {batch.class ? `(${batch.class})` : ''}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <Input 
            icon={Search} 
            placeholder="Search students by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">Total Students</p>
            <p className="mt-1 text-xl sm:text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight">{students.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">Active</p>
            <p className="mt-1 text-xl sm:text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight text-emerald-600 dark:text-emerald-400">{activeStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">Inactive</p>
            <p className="mt-1 text-xl sm:text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight text-zinc-500">{inactiveStudents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">Avg Attendance</p>
            <p className="mt-1 text-xl sm:text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight text-red-500">{avgAttendance}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.slice(0, 10).map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar fallback={student.name} size="sm" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{student.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{student.id ? student.id.slice(-6).toUpperCase() : 'N/A'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-zinc-900 dark:text-zinc-100">{student.phone}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[150px]">{student.email}</span>
                    <div className="mt-1 flex flex-col gap-1">
                      <span className="w-fit text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 font-medium tracking-wide">
                        LOGIN ID: {student.phone || student.email}
                      </span>
                      <span className="w-fit text-[10px] px-1.5 py-0.5 rounded-sm bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-medium tracking-wide">
                        PASS: {student.password || 'Not set'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default">{student.batchName}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{student.attendance ?? 100}%</span>
                    <div className="ml-2 w-16 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden hidden lg:block">
                      <div 
                        className={`h-full ${(student.attendance ?? 100) >= 90 ? 'bg-green-500' : (student.attendance ?? 100) >= 75 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${student.attendance ?? 100}%` }}
                      ></div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={student.feeStatus === 'Paid' ? 'success' : student.feeStatus === 'Pending' ? 'warning' : 'danger'}>
                    {student.feeStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{student.averageScore ?? 100}%</span>
                </TableCell>
                <TableCell>
                  <Badge variant={student.status === 'Active' ? 'success' : 'default'}>
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <button onClick={() => handleOpenViewModal(student)} className="text-zinc-400 dark:text-zinc-500 hover:text-green-400">
                    <Eye className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => handleOpenModal(student)} className="text-zinc-400 dark:text-zinc-500 hover:text-blue-400">
                    <Edit2 className="w-4 h-4 inline" />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="text-zinc-400 dark:text-zinc-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-zinc-500 dark:text-zinc-400">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> results
          </p>
        </div>
      </Card>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3">
        {filteredStudents.map((student) => (
          <div 
            key={student.id} 
            className={`bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${student.status === 'Active' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-zinc-400'}`}
          >
            {/* Top clickable row leading to Student Detail */}
            <div 
              onClick={() => handleOpenViewModal(student)}
              className="flex items-start justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Avatar fallback={student.name} size="md" className="flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white truncate group-hover:text-red-500 transition-colors">
                      {student.name}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                    {student.batchName} {student.class ? `• ${student.class}` : ''}
                  </p>
                  {student.phone && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {student.id ? `${student.id.slice(-4).toUpperCase()} • ` : ''}{student.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`text-[11px] font-extrabold uppercase tracking-wider ${student.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                  {student.status}
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Login Credentials cardlet */}
            <div className="mt-3 p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200/70 dark:border-zinc-700/60 flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold flex items-center">
                  <Key className="w-3 h-3 mr-1 text-blue-500" /> Login ID:
                </span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">{student.phone || student.email}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold">Password:</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">{student.password || 'Not set'}</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
              <div className="bg-zinc-50 dark:bg-zinc-800/30 p-2 rounded-lg">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Attendance</p>
                <p className={`text-sm font-bold mt-0.5 ${(student.attendance ?? 100) >= 90 ? 'text-green-500' : (student.attendance ?? 100) >= 75 ? 'text-amber-500' : 'text-red-500'}`}>
                  {student.attendance ?? 100}%
                </p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/30 p-2 rounded-lg">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Fee Status</p>
                <span className={`text-xs font-bold inline-block mt-0.5 ${student.feeStatus === 'Paid' ? 'text-green-500' : student.feeStatus === 'Pending' ? 'text-amber-500' : 'text-red-500'}`}>
                  {student.feeStatus}
                </span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/30 p-2 rounded-lg">
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-medium">Score</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{student.averageScore ?? 100}%</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleOpenViewModal(student)} 
                className="flex-1 flex items-center justify-center text-xs h-8"
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-green-500" />
                View Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleOpenModal(student)} 
                className="flex-1 flex items-center justify-center text-xs h-8"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1 text-blue-500" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDelete(student.id)} 
                className="flex-none px-3 text-xs h-8 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800/50"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No students found matching your search.</p>
          </div>
        )}

        <div className="text-center py-2 text-xs text-zinc-500 dark:text-zinc-400">
          Showing {filteredStudents.length} students
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.25rem + env(safe-area-inset-bottom, 0px))'
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
                {/* Decorative background glow */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
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
