import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import api from '../lib/api';

export default function Attendance() {
  const navigate = useNavigate();
  const { batches, students, refreshData } = useData();
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenViewModal = (student) => {
    navigate(`/students/${student.id}`);
  };

  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0].id);
    }
  }, [batches, selectedBatch]);
  
  // Mock state for attendance form: { studentId: { tuition: 'present' | 'absent' | 'late', school: 'yes' | 'no' } }
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
    // Handle both populated batchId (object) and unpopulated (string)
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

  const presentCount = Object.values(attendanceState).filter(s => s?.tuition === 'present').length;
  const absentCount = Object.values(attendanceState).filter(s => s?.tuition === 'absent').length;
  const lateCount = Object.values(attendanceState).filter(s => s?.tuition === 'late').length;
  const totalMarked = presentCount + absentCount + lateCount;
  const attendancePercentage = totalMarked > 0 ? Math.round(((presentCount + lateCount) / totalMarked) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Desktop Header */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Attendance</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Take attendance for your classes.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleClearAll}>Clear</Button>
          <Button onClick={handleMarkAllPresent}>Mark All Present</Button>
        </div>
      </div>

      {/* Mobile Quick Actions Row */}
      <div className="sm:hidden flex items-center justify-between gap-2 px-1">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Attendance Actions</span>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleClearAll} className="h-8 text-xs px-3">Clear</Button>
          <Button size="sm" onClick={handleMarkAllPresent} className="h-8 text-xs px-3">Mark All Present</Button>
        </div>
      </div>

      {/* Selectors */}
      <Card>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl/50">
          {/* Desktop Selector */}
          <div className="hidden sm:flex items-center space-x-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-lg p-1 w-auto">
            {batches.slice(0, 4).map(batch => (
              <button
                key={batch.id}
                onClick={() => setSelectedBatch(batch.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors",
                  selectedBatch === batch.id 
                    ? "bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] border border-red-500/50 text-white shadow-md shadow-black/40" 
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:bg-zinc-800/50"
                )}
              >
                {batch.name}
              </button>
            ))}
          </div>

          {/* Mobile Selector */}
          <div className="sm:hidden w-full">
            <select
              value={selectedBatch || ''}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5 shadow-sm"
            >
              <option value="" disabled>Select Batch</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-black/5 dark:border-white/5 rounded-lg p-1.5 px-3 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() - 1);
                setCurrentDate(newDate);
              }}
              className="p-1 hover:bg-gray-100 dark:bg-zinc-800 rounded-full text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">
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
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setDate(newDate.getDate() + 1);
                setCurrentDate(newDate);
              }}
              className="p-1 hover:bg-gray-100 dark:bg-zinc-800 rounded-full text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-t-2 border-black/5 dark:border-white/5 border-t-green-500 shadow-md shadow-black/40">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-green-500 mb-1">Present</p>
            <p className="text-3xl font-bold text-green-400">{presentCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-t-2 border-black/5 dark:border-white/5 border-t-red-500 shadow-md shadow-black/40">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-red-500 mb-1">Absent</p>
            <p className="text-3xl font-bold text-red-400">{absentCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-t-2 border-black/5 dark:border-white/5 border-t-amber-500 shadow-md shadow-black/40">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-amber-500 mb-1">Late</p>
            <p className="text-3xl font-bold text-amber-400">{lateCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-t-2 border-black/5 dark:border-white/5 border-t-indigo-500 shadow-md shadow-black/40">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-red-400 mb-1">Attendance</p>
            <p className="text-3xl font-bold text-red-500">{attendancePercentage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card>
        <div className="divide-y divide-zinc-800">
          {batchStudents.map((student, index) => {
            const status = attendanceState[student.id];
            return (
              <div key={student.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl transition-colors">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-zinc-400 dark:text-zinc-500 w-6">{index + 1}.</div>
                  <Avatar fallback={student.name} size="sm" className="ml-2" />
                  <div className="ml-3 flex items-center space-x-2">
                    <div>
                      <p className="text-sm font-heading font-semibold text-zinc-900 dark:text-white tracking-tight">{student.name}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">{student.id.toUpperCase()}</p>
                    </div>
                    <button 
                      onClick={() => handleOpenViewModal(student)} 
                      className="text-zinc-400 dark:text-zinc-500 hover:text-green-400 p-1 bg-gray-100/50 dark:bg-zinc-800/50 rounded hover:bg-gray-100 dark:bg-zinc-800 transition-colors"
                      title="View Student"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 self-start sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
                  
                  {/* Tuition Attendance */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 w-16 uppercase tracking-wider hidden sm:block">Tuition</span>
                    <div className="flex bg-gray-100/50 dark:bg-zinc-800/50 p-1 rounded-lg w-full sm:w-auto">
                      <button
                        onClick={() => setStatus(student.id, 'tuition', 'present')}
                        className={cn(
                          "flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                          status?.tuition === 'present' ? "bg-green-500/10 backdrop-blur-xl text-green-400 shadow-sm ring-1 ring-green-500/50" : "text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 hover:bg-gray-200/50 dark:bg-zinc-700/50"
                        )}
                      >
                        <CheckCircle2 className={cn("w-3.5 h-3.5", status?.tuition === 'present' ? "text-green-600" : "")} />
                        <span>Present</span>
                      </button>
                      <button
                        onClick={() => setStatus(student.id, 'tuition', 'absent')}
                        className={cn(
                          "flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                          status?.tuition === 'absent' ? "bg-red-500/10 backdrop-blur-xl text-red-400 shadow-sm ring-1 ring-red-500/50" : "text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 hover:bg-gray-200/50 dark:bg-zinc-700/50"
                        )}
                      >
                        <XCircle className={cn("w-3.5 h-3.5", status?.tuition === 'absent' ? "text-red-600" : "")} />
                        <span>Absent</span>
                      </button>
                      <button
                        onClick={() => setStatus(student.id, 'tuition', 'late')}
                        className={cn(
                          "flex-1 sm:flex-none flex items-center justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                          status?.tuition === 'late' ? "bg-amber-500/10 backdrop-blur-xl text-amber-400 shadow-sm ring-1 ring-amber-500/50" : "text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 hover:bg-gray-200/50 dark:bg-zinc-700/50"
                        )}
                      >
                        <Clock className={cn("w-3.5 h-3.5", status?.tuition === 'late' ? "text-amber-600" : "")} />
                        <span>Late</span>
                      </button>
                    </div>
                  </div>

                  {/* School Attendance */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 w-16 uppercase tracking-wider hidden sm:block">School</span>
                    <div className="flex bg-gray-100/50 dark:bg-zinc-800/50 p-1 rounded-lg w-full sm:w-auto">
                      <button
                        onClick={() => setStatus(student.id, 'school', 'yes')}
                        className={cn(
                          "flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                          status?.school === 'yes' ? "bg-indigo-500/10 backdrop-blur-xl text-indigo-400 shadow-sm ring-1 ring-indigo-500/50" : "text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 hover:bg-gray-200/50 dark:bg-zinc-700/50"
                        )}
                      >
                        <CheckCircle2 className={cn("w-3.5 h-3.5", status?.school === 'yes' ? "text-indigo-500" : "")} />
                        <span>Went to School</span>
                      </button>
                      <button
                        onClick={() => setStatus(student.id, 'school', 'no')}
                        className={cn(
                          "flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                          status?.school === 'no' ? "bg-orange-500/10 backdrop-blur-xl text-orange-400 shadow-sm ring-1 ring-orange-500/50" : "text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300 hover:bg-gray-200/50 dark:bg-zinc-700/50"
                        )}
                      >
                        <XCircle className={cn("w-3.5 h-3.5", status?.school === 'no' ? "text-orange-500" : "")} />
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
      
      {/* Mobile Sticky Save Action */}
      <div 
        style={{ bottom: 'calc(3.9rem + env(safe-area-inset-bottom, 0px))' }}
        className="fixed left-0 right-0 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 sm:relative sm:bottom-auto sm:bg-transparent sm:border-0 sm:p-0 z-30 flex justify-end shadow-md"
      >
        <Button 
          size="lg" 
          onClick={handleSave}
          disabled={isSubmitting || totalMarked === 0}
          className="w-full sm:w-auto shadow-lg sm:shadow-md bg-red-600 hover:bg-red-500 text-white font-bold"
        >
          {isSubmitting ? 'Saving...' : `Save Attendance (${totalMarked}/${batchStudents.length})`}
        </Button>
      </div>
    </div>
  );
}
