import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Bell, 
  Users, 
  UserX, 
  UserCheck, 
  Percent, 
  Save 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import api from '../lib/api';

export default function Attendance() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { batches, students, refreshData, realNotifications } = useData();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unreadNotificationsCount = realNotifications?.filter(n => !n.read)?.length || 0;

  const handleOpenViewModal = (student) => {
    navigate(`/students/${student.id}`);
  };

  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0].id);
    }
  }, [batches, selectedBatch]);
  
  // State for attendance form: { studentId: { tuition: 'present' | 'absent' | 'late', school: 'yes' | 'no' } }
  const [attendanceState, setAttendanceState] = useState({});

  useEffect(() => {
    const fetchExistingAttendance = async () => {
      if (!selectedBatch) return;
      try {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const { data } = await api.get(`/attendance/batch/${selectedBatch}?date=${dateStr}`);
        
        const newState = {};
        data.forEach(record => {
          let tuition = 'present';
          if (record.tution_present === 'Absent') tuition = 'absent';
          if (record.tution_present === 'Late') tuition = 'late';
          
          let school = record.School_status === 'No' ? 'no' : 'yes';
          
          newState[record.studentId] = { tuition, school };
        });
        setAttendanceState(newState);
      } catch (err) {
        console.error('Failed to fetch existing attendance', err);
      }
    };
    
    fetchExistingAttendance();
  }, [selectedBatch, currentDate]);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      // Transform local state to backend schema
      const records = Object.entries(attendanceState).map(([studentId, data]) => {
        let tution_present = 'Present';
        if (data.tuition === 'absent') tution_present = 'Absent';
        if (data.tuition === 'late') tution_present = 'Late';
        
        const School_status = data.school === 'no' ? 'No' : 'Yes';
        
        return { studentId, tution_present, School_status };
      });

      if (records.length === 0) return;

      const payload = {
        batchId: selectedBatch,
        date: format(currentDate, 'yyyy-MM-dd'),
        records
      };

      await api.post('/attendance', payload);
      alert('Attendance saved successfully!');
      // Refresh global state so batches page updates its average
      refreshData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Failed to save attendance: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const batchStudents = selectedBatch ? students.filter(s => {
    const sBatchId = s.batchId?._id || s.batchId;
    return sBatchId === selectedBatch;
  }).slice(0, 25) : [];
  
  const handleMarkAllPresent = () => {
    const newState = {};
    batchStudents.forEach(s => {
      newState[s.id] = { tuition: 'present', school: 'yes' };
    });
    setAttendanceState(newState);
  };
  
  const handleClearAll = () => {
    setAttendanceState({});
  };
  
  const setStatus = (studentId, type, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: status
      }
    }));
  };

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

  const presentCount = Object.values(attendanceState).filter(s => s?.tuition === 'present').length;
  const absentCount = Object.values(attendanceState).filter(s => s?.tuition === 'absent').length;
  const lateCount = Object.values(attendanceState).filter(s => s?.tuition === 'late').length;
  const totalMarked = presentCount + absentCount + lateCount;
  const attendancePercentage = totalMarked > 0 ? Math.round(((presentCount + lateCount) / totalMarked) * 100) : 0;

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* ========================================================================= */}
      {/* MOBILE VIEW (Visible on md:hidden) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4 pb-28">

        {/* 1. Mobile Top Header Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm active:scale-95 transition-all"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none">
                Attendance
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-none">
                Track and manage attendance
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

        {/* 2. Attendance Actions Row */}
        <div className="flex items-center justify-between gap-2 pt-1 px-0.5">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            ATTENDANCE ACTIONS
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-1.5 rounded-xl border border-red-500/30 dark:border-red-500/30 bg-transparent hover:bg-red-500/10 text-xs font-bold text-red-600 dark:text-red-400 active:scale-95 transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-sm shadow-red-600/30 active:scale-95 transition-all"
            >
              Mark All Present
            </button>
          </div>
        </div>

        {/* 3. Batch Selector & Date Picker Card */}
        <div className="bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800/90 rounded-2xl p-3 space-y-2.5 shadow-sm">
          {/* Batch Selector Dropdown */}
          <div className="relative">
            <div className="w-full bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                {batches.find(b => b.id === selectedBatch)?.name || 'Select Batch'}
              </span>
              <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none flex-shrink-0" />
            </div>
            <select
              value={selectedBatch || ''}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="" disabled>Select Batch</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker Bar */}
          <div className="bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-2 py-1.5 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevDay}
              className="w-8 h-8 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 active:scale-90 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="relative flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-200 cursor-pointer">
              <Calendar className="w-4 h-4 text-zinc-400" />
              <span>{format(currentDate, 'MMM dd, yyyy')}</span>
              <input
                type="date"
                value={format(currentDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  if (e.target.value) {
                    setCurrentDate(new Date(e.target.value + 'T00:00:00'));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="w-8 h-8 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 active:scale-90 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. 2x2 Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Present */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Present</span>
            </div>
            <div className="mt-2 text-2xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400 leading-none relative z-10">
              {presentCount}
            </div>
            <Users className="w-14 h-14 text-zinc-200/70 dark:text-zinc-800/30 absolute -right-2 -bottom-2 pointer-events-none select-none" />
          </div>

          {/* Card 2: Absent */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <UserX className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-red-600 dark:text-red-400">Absent</span>
            </div>
            <div className="mt-2 text-2xl font-heading font-extrabold text-red-600 dark:text-red-400 leading-none relative z-10">
              {absentCount}
            </div>
            <Users className="w-14 h-14 text-zinc-200/70 dark:text-zinc-800/30 absolute -right-2 -bottom-2 pointer-events-none select-none" />
          </div>

          {/* Card 3: Late */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Late</span>
            </div>
            <div className="mt-2 text-2xl font-heading font-extrabold text-amber-600 dark:text-amber-400 leading-none relative z-10">
              {lateCount}
            </div>
            <Users className="w-14 h-14 text-zinc-200/70 dark:text-zinc-800/30 absolute -right-2 -bottom-2 pointer-events-none select-none" />
          </div>

          {/* Card 4: Attendance Percentage */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3.5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[94px]">
            <div className="flex items-center gap-2 relative z-10">
              <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <Percent className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Attendance</span>
            </div>
            <div className="mt-2 text-2xl font-heading font-extrabold text-rose-600 dark:text-rose-400 leading-none relative z-10">
              {attendancePercentage}%
            </div>
            <Users className="w-14 h-14 text-zinc-200/70 dark:text-zinc-800/30 absolute -right-2 -bottom-2 pointer-events-none select-none" />
          </div>
        </div>

        {/* 5. Student List Cards */}
        <div className="space-y-3">
          {batchStudents.map((student, index) => {
            const status = attendanceState[student.id];
            const studentCode = student.studentId || student.id || student.phone;

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-3.5 space-y-3 shadow-sm"
              >
                {/* Student Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="text-xs font-extrabold text-zinc-400 dark:text-zinc-500 w-4 flex-shrink-0">
                      {index + 1}.
                    </span>
                    <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {getInitials(student.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-heading font-bold text-zinc-900 dark:text-white truncate leading-snug">
                        {student.name}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate">
                        {studentCode}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenViewModal(student)}
                    className="w-8 h-8 rounded-xl bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
                    title="View Student"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                {/* Tuition Attendance Options: Present / Absent / Late */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Present Button */}
                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'tuition', 'present')}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border",
                      status?.tuition === 'present'
                        ? "bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500/60 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "bg-zinc-50 dark:bg-[#0c0f17] border-zinc-200/70 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0",
                      status?.tuition === 'present'
                        ? "border-emerald-500"
                        : "border-zinc-400 dark:border-zinc-600"
                    )}>
                      {status?.tuition === 'present' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </span>
                    <span>Present</span>
                  </button>

                  {/* Absent Button */}
                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'tuition', 'absent')}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border",
                      status?.tuition === 'absent'
                        ? "bg-red-500/10 dark:bg-red-500/15 border-red-500/60 text-red-600 dark:text-red-400 shadow-sm"
                        : "bg-zinc-50 dark:bg-[#0c0f17] border-zinc-200/70 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0",
                      status?.tuition === 'absent'
                        ? "border-red-500"
                        : "border-zinc-400 dark:border-zinc-600"
                    )}>
                      {status?.tuition === 'absent' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      )}
                    </span>
                    <span>Absent</span>
                  </button>

                  {/* Late Button */}
                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'tuition', 'late')}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border",
                      status?.tuition === 'late'
                        ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/60 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "bg-zinc-50 dark:bg-[#0c0f17] border-zinc-200/70 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0",
                      status?.tuition === 'late'
                        ? "border-amber-500"
                        : "border-zinc-400 dark:border-zinc-600"
                    )}>
                      {status?.tuition === 'late' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </span>
                    <span>Late</span>
                  </button>
                </div>

                {/* School Attendance Options: Went to School / Did not Go */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'school', 'yes')}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border",
                      status?.school === 'yes'
                        ? "bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "bg-zinc-50 dark:bg-[#0c0f17] border-zinc-200/70 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0",
                      status?.school === 'yes'
                        ? "border-blue-500"
                        : "border-zinc-400 dark:border-zinc-600"
                    )}>
                      {status?.school === 'yes' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </span>
                    <span>Went to School</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus(student.id, 'school', 'no')}
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border",
                      status?.school === 'no'
                        ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "bg-zinc-50 dark:bg-[#0c0f17] border-zinc-200/70 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0",
                      status?.school === 'no'
                        ? "border-amber-500"
                        : "border-zinc-400 dark:border-zinc-600"
                    )}>
                      {status?.school === 'no' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </span>
                    <span>Did not Go</span>
                  </button>
                </div>

              </div>
            );
          })}

          {batchStudents.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#101420] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                No students found in this batch.
              </p>
            </div>
          )}
        </div>

        {/* 6. Save Attendance Button (Mobile) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || totalMarked === 0}
            className={cn(
              "w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 active:scale-98 transition-all",
              isSubmitting || totalMarked === 0
                ? "bg-red-600/60 opacity-80 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-500 cursor-pointer"
            )}
          >
            <Save className="w-4.5 h-4.5" />
            <span>
              {isSubmitting ? 'Saving...' : `Save Attendance (${totalMarked}/${batchStudents.length})`}
            </span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on md: and up) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6 pb-20">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Attendance</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Take attendance for your classes.</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClearAll}>Clear</Button>
            <Button onClick={handleMarkAllPresent} className="bg-red-600 hover:bg-red-500 text-white font-semibold">
              Mark All Present
            </Button>
          </div>
        </div>

        {/* Selectors */}
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl">
            {/* Desktop Selector */}
            <div className="flex items-center space-x-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-lg p-1 w-auto">
              {batches.slice(0, 4).map(batch => (
                <button
                  key={batch.id}
                  onClick={() => setSelectedBatch(batch.id)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                    selectedBatch === batch.id 
                      ? "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-md" 
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {batch.name}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-lg p-1.5 px-3">
              <button 
                onClick={handlePrevDay}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 dark:text-zinc-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center font-medium text-zinc-900 dark:text-zinc-100 min-w-[120px] justify-center relative">
                <Calendar className="w-4 h-4 mr-2 text-zinc-400 dark:text-zinc-500" />
                <span>{format(currentDate, 'MMM dd, yyyy')}</span>
                <input 
                  type="date"
                  value={format(currentDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    if (e.target.value) {
                      setCurrentDate(new Date(e.target.value + 'T00:00:00'));
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <button 
                onClick={handleNextDay}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 dark:text-zinc-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Summary 4-grid */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-t-2 border-t-green-500">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-green-500 mb-1">Present</p>
              <p className="text-3xl font-bold text-green-500">{presentCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-t-2 border-t-red-500">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-red-500 mb-1">Absent</p>
              <p className="text-3xl font-bold text-red-500">{absentCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-t-2 border-t-amber-500">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-amber-500 mb-1">Late</p>
              <p className="text-3xl font-bold text-amber-500">{lateCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-t-2 border-t-indigo-500">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-indigo-400 mb-1">Attendance</p>
              <p className="text-3xl font-bold text-indigo-500">{attendancePercentage}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Table / List */}
        <Card className="border border-zinc-200 dark:border-zinc-800">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {batchStudents.map((student, index) => {
              const status = attendanceState[student.id];
              return (
                <div key={student.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/80 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-zinc-400 dark:text-zinc-500 w-6">{index + 1}.</div>
                    <Avatar fallback={student.name} size="sm" className="ml-2" />
                    <div className="ml-3 flex items-center space-x-2">
                      <div>
                        <p className="text-sm font-heading font-semibold text-zinc-900 dark:text-white tracking-tight">{student.name}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">{student.id.toUpperCase()}</p>
                      </div>
                      <button 
                        onClick={() => handleOpenViewModal(student)} 
                        className="text-zinc-400 hover:text-green-500 p-1 bg-gray-100 dark:bg-zinc-800 rounded transition-colors"
                        title="View Student"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Tuition Attendance */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 w-16 uppercase tracking-wider">Tuition</span>
                      <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <button
                          onClick={() => setStatus(student.id, 'tuition', 'present')}
                          className={cn(
                            "flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            status?.tuition === 'present' ? "bg-green-500/10 text-green-500 ring-1 ring-green-500/50" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>
                        <button
                          onClick={() => setStatus(student.id, 'tuition', 'absent')}
                          className={cn(
                            "flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            status?.tuition === 'absent' ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/50" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>
                        <button
                          onClick={() => setStatus(student.id, 'tuition', 'late')}
                          className={cn(
                            "flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            status?.tuition === 'late' ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/50" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Late</span>
                        </button>
                      </div>
                    </div>

                    {/* School Attendance */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 w-16 uppercase tracking-wider">School</span>
                      <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <button
                          onClick={() => setStatus(student.id, 'school', 'yes')}
                          className={cn(
                            "flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            status?.school === 'yes' ? "bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/50" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Went to School</span>
                        </button>
                        <button
                          onClick={() => setStatus(student.id, 'school', 'no')}
                          className={cn(
                            "flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            status?.school === 'no' ? "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/50" : "text-zinc-400 hover:text-zinc-200"
                          )}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Did not Go</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Desktop Save Action */}
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={handleSave}
            disabled={isSubmitting || totalMarked === 0}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 shadow-md"
          >
            {isSubmitting ? 'Saving...' : `Save Attendance (${totalMarked}/${batchStudents.length})`}
          </Button>
        </div>
      </div>

    </div>
  );
}
