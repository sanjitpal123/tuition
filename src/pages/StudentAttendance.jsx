import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  parseISO,
  getDay,
  isBefore,
  startOfToday
} from 'date-fns';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  CheckSquare,
  AlertCircle,
  Calendar,
  CalendarDays,
  Check,
  X,
  Clock,
  Building,
  School,
  ArrowLeft,
  CalendarCheck,
  CalendarX,
  Layers
} from 'lucide-react';

export default function StudentAttendance() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTuitionId = searchParams.get('tuitionId');

  // Selected Month (defaults to current month YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [attendanceType, setAttendanceType] = useState('tuition'); // 'tuition' | 'school'

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
        setError(err.response?.data?.message || 'Failed to fetch attendance data');
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
  const allRecords = data?.attendance?.records || [];

  // Filter records for the selected month
  const monthlyRecords = useMemo(() => {
    return allRecords.filter(r => {
      if (!r.date) return false;
      const dateStr = typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().split('T')[0];
      return dateStr.startsWith(selectedMonth);
    });
  }, [allRecords, selectedMonth]);

  function sundayCount(year, month) {
    const totaldays = new Date(year, month, 0).getDate();
    let sundays = 0;
    for (let day = 1; day <= totaldays; day++) {
      const date = new Date(year, month - 1, day);
      if (date.getDay() === 0) {
        sundays++;
      }
    }
    return sundays;
  }
  // Compute monthly stats
  const monthlyStats = useMemo(() => {
    let tuitionPresent = 0;
    let tuitionAbsent = 0;
    let tuitionLate = 0;
    let schoolYes = 0;
    let schoolNo = 0;


    monthlyRecords.forEach(r => {
      const tStatus = r.tution_present || r.status || '';
      if (tStatus.toLowerCase() === 'present') tuitionPresent++;
      else if (tStatus.toLowerCase() === 'absent') tuitionAbsent++;
      else if (tStatus.toLowerCase() === 'late') tuitionLate++;

      const sStatus = r.School_status || r.schoolStatus || '';
      if (sStatus === 'Yes' || sStatus.toLowerCase() === 'present') schoolYes++;
      else if (sStatus === 'No' || sStatus.toLowerCase() === 'absent') schoolNo++;
    });

    const totalTuitionClasses = tuitionPresent + tuitionAbsent + tuitionLate;
    const totalAttended = tuitionPresent + tuitionLate;
    const tuitionRate = totalTuitionClasses > 0 ? Math.round((totalAttended / totalTuitionClasses) * 100) : 0;

    const [year, month] = (selectedMonth || new Date().toISOString().slice(0, 7)).split('-').map(Number);
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    const totalSundays = sundayCount(year, month);
    const totalSchoolDays = Math.max(1, totalDaysInMonth - totalSundays);

    const schoolRate = totalSchoolDays > 0 ? Math.round((schoolYes / totalSchoolDays) * 100) : 0;

    return {
      tuitionPresent,
      tuitionAbsent,
      tuitionLate,
      totalTuitionClasses,
      totalAttended,
      tuitionRate,
      schoolYes,
      schoolNo,
      totalSchoolDays,
      schoolRate
    };
  }, [monthlyRecords, selectedMonth]);

  // Render the interactive monthly calendar
  const renderCalendar = (type = 'tuition') => {
    if (!selectedMonth) return null;

    try {
      const monthDate = parseISO(selectedMonth + '-01');
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const days = eachDayOfInterval({ start, end });
      const firstDayOfWeek = getDay(start); // 0 = Sunday, 1 = Monday

      const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

      return (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider text-center">
            MONTHLY CALENDAR
          </h4>

          <div className="grid grid-cols-7 gap-1.5 text-center text-xs mb-1">
            {weekdays.map(day => (
              <div key={day} className="text-zinc-400 font-bold py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ))}

            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const record = monthlyRecords.find(r => {
                const rDateStr = typeof r.date === 'string' ? r.date.split('T')[0] : format(new Date(r.date), 'yyyy-MM-dd');
                return rDateStr === dateStr;
              });

              let bgColor = "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400";

              if (record) {
                if (type === 'tuition') {
                  const status = (record.tution_present || record.status || '').toLowerCase();
                  if (status === 'present') {
                    bgColor = "bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/20";
                  } else if (status === 'absent') {
                    bgColor = "bg-red-500 text-white font-bold shadow-sm shadow-red-500/20";
                  } else if (status === 'late') {
                    bgColor = "bg-amber-500 text-white font-bold shadow-sm shadow-amber-500/20";
                  }
                } else if (type === 'school') {
                  const sStatus = record.School_status || record.schoolStatus || '';
                  if (sStatus === 'Yes' || sStatus.toLowerCase() === 'present') {
                    bgColor = "bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/20";
                  } else if (sStatus === 'No' || sStatus.toLowerCase() === 'absent') {
                    bgColor = "bg-red-500 text-white font-bold shadow-sm shadow-red-500/20";
                  }
                }
              }

              return (
                <div
                  key={dateStr}
                  className={`p-2.5 rounded-xl text-xs flex items-center justify-center transition-all ${bgColor}`}
                  title={`${dateStr}: ${record ? (record.tution_present || record.status || 'Marked') : 'No Record'}`}
                >
                  {format(day, 'd')}
                </div>
              );
            })}
          </div>

          {type === 'tuition' ? (
            <div className="flex items-center justify-center gap-4 mt-5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Present</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Absent</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Late</div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 mt-5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Went to School</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Did Not Go</div>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-red-200 dark:border-red-950 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading attendance calendar...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <Card className="p-8 border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900">
          <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-500 opacity-80" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Error Loading Attendance</h2>
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
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto space-y-6 font-sans">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl">
            <CheckSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">Attendance Calendar</h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Monthly attendance calendar for {activeTuition?.name || 'your tuition'}
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
                className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${isActive
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

      {/* Month Selector Bar (Matching reference design) */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <span className="text-sm font-bold text-zinc-900 dark:text-white">Select Month:</span>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3.5 py-1.5 text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 cursor-pointer"
        />
      </div>

      {/* Type Toggle: Tuition Attendance vs School Attendance */}
      <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
        <button
          onClick={() => setAttendanceType('tuition')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${attendanceType === 'tuition'
            ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Tuition Attendance</span>
        </button>

        <button
          onClick={() => setAttendanceType('school')}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${attendanceType === 'school'
            ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
        >
          <School className="w-4 h-4" />
          <span>School Attendance</span>
        </button>
      </div>

      {/* 1. TUITION ATTENDANCE VIEW */}
      {attendanceType === 'tuition' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top 3 KPI Cards: Present, Absent, Late (Matching screenshot) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-green-500/40 p-4 sm:p-5 rounded-2xl text-center shadow-sm">
              <p className="text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Present</p>
              <p className="text-2xl sm:text-4xl font-extrabold text-green-500 mt-1.5">
                {monthlyStats.tuitionPresent + monthlyStats.tuitionLate} <span className="text-xs sm:text-sm text-zinc-400 font-normal">/ {monthlyStats.totalTuitionClasses}</span>
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-red-500/40 p-4 sm:p-5 rounded-2xl text-center shadow-sm">
              <p className="text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Absent</p>
              <p className="text-2xl sm:text-4xl font-extrabold text-red-500 mt-1.5">
                {monthlyStats.tuitionAbsent} <span className="text-xs sm:text-sm text-zinc-400 font-normal">/ {monthlyStats.totalTuitionClasses}</span>
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-amber-500/40 p-4 sm:p-5 rounded-2xl text-center shadow-sm">
              <p className="text-[11px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Late</p>
              <p className="text-2xl sm:text-4xl font-extrabold text-amber-500 mt-1.5">
                {monthlyStats.tuitionLate} <span className="text-xs sm:text-sm text-zinc-400 font-normal">/ {monthlyStats.totalTuitionClasses}</span>
              </p>
            </div>
          </div>

          {/* Attendance Summary & Calendar Card (Exact match to reference) */}
          <Card className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <CalendarDays className="w-5 h-5 text-red-500 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                Tuition Batch Attendance Summary ({selectedMonth})
              </h3>
            </div>

            <div className="p-2 sm:p-4 space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Total Tuition Classes Scheduled</span>
                <span className="font-bold text-zinc-900 dark:text-white">{monthlyStats.totalTuitionClasses} Classes</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Classes Attended</span>
                <span className="font-bold text-emerald-500">{monthlyStats.totalAttended} Classes</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Tuition Attendance Rate</span>
                <span className="font-extrabold text-red-500 text-base">
                  {monthlyStats.tuitionRate}%
                </span>
              </div>

              {/* Monthly Calendar Grid */}
              {renderCalendar('tuition')}
            </div>
          </Card>
        </div>
      )}

      {/* 2. SCHOOL ATTENDANCE VIEW */}
      {attendanceType === 'school' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-indigo-500/40 p-5 rounded-2xl text-center shadow-sm">
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Went to School</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-500 mt-1.5">
                {monthlyStats.schoolYes} <span className="text-xs sm:text-sm text-zinc-400 font-normal">Days</span>
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-orange-500/40 p-5 rounded-2xl text-center shadow-sm">
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Did Not Go</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-orange-500 mt-1.5">
                {monthlyStats.schoolNo} <span className="text-xs sm:text-sm text-zinc-400 font-normal">Days</span>
              </p>
            </div>
          </div>

          <Card className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-md">
            <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <School className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                Regular School Attendance Record ({selectedMonth})
              </h3>
            </div>

            <div className="p-2 sm:p-4 space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Total Marked Days</span>
                <span className="font-bold text-zinc-900 dark:text-white">{monthlyStats.totalSchoolDays} Days</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">School Regularity Rate</span>
                <span className="font-extrabold text-indigo-500 text-base">
                  {monthlyStats.schoolRate}%
                </span>
              </div>

              {/* Monthly Calendar Grid for School */}
              {renderCalendar('school')}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
