import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  BookOpen, 
  Wallet, 
  GraduationCap, 
  BellRing,
  User,
  Calendar,
  Layers,
  AlertCircle,
  Clock,
  MapPin,
  BookText,
  CheckCircle2,
  Circle,
  Building,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Check,
  X,
  FileText,
  Maximize2,
  Download
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTuitionId = searchParams.get('tuitionId');
  const [viewingImage, setViewingImage] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const url = selectedTuitionId 
          ? `/student-auth/dashboard?tuitionId=${selectedTuitionId}`
          : `/student-auth/dashboard`;
        const response = await studentApi.get(url);
        setData(response.data);
        
        // Keep local storage tuitions in sync
        if (response.data.tuitions) {
          const profile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
          profile.tuitions = response.data.tuitions;
          localStorage.setItem('studentProfile', JSON.stringify(profile));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
        if (err.response?.status === 401) {
          localStorage.removeItem('studentToken');
          localStorage.removeItem('studentProfile');
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, selectedTuitionId]);

  const handleSelectTuition = (tuitionId) => {
    setSearchParams(tuitionId ? { tuitionId } : {}, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="relative mb-4">
          <div className="w-12 h-12 border-4 border-red-200 dark:border-red-950 border-t-red-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading tuition workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-xl border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Unable to Load Dashboard</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            Retry
          </button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const tuitions = data?.tuitions || [];
  const activeTuition = tuitions.find(t => t.id === selectedTuitionId) || tuitions[0] || null;
  const attendance = data?.attendance || { totalAttended: 0, totalClasses: 0, records: [] };
  const attendancePercentage = attendance.totalClasses > 0 
    ? Math.round((attendance.totalAttended / attendance.totalClasses) * 100) 
    : 0;
  const absentDays = Math.max(0, (attendance.totalClasses || 0) - (attendance.totalAttended || 0));

  const todaysClass = data?.todaysClass || null;
  const homeworkList = data?.homework || data?.homeworks || [];
  const announcementsList = data?.announcements || [];
  const feeHistory = data?.fees?.history || data?.feeHistory || [];
  const monthsPaidCount = feeHistory.filter(h => h.status === 'Paid' || h.amount > 0).length;

  const tuitionQuery = selectedTuitionId ? `?tuitionId=${selectedTuitionId}` : '';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans transition-colors duration-300">
      
      {/* 1. Multiple Tuitions Selector Hub */}
      {tuitions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-red-600 dark:text-red-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Your Enrolled Tuitions ({tuitions.length})
              </h2>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium hidden sm:inline">
              Tap a tuition to switch data view
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tuitions.map((t) => {
              const isActive = (selectedTuitionId ? t.id === selectedTuitionId : t.id === activeTuition?.id);
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelectTuition(t.id)}
                  type="button"
                  className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden border flex items-center justify-between gap-3 group ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg shadow-red-600/20 border-red-500 ring-2 ring-red-500/30 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950 scale-[1.01]'
                      : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200/80 dark:border-zinc-800/80 hover:border-red-300 dark:hover:border-red-900/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm uppercase ${
                      isActive 
                        ? 'bg-white/20 text-white backdrop-blur-sm' 
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {t.name?.charAt(0) || 'T'}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-sm sm:text-base truncate leading-snug ${isActive ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                        {t.name}
                      </h3>
                      <p className={`text-xs truncate font-medium ${isActive ? 'text-red-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {t.batchName || t.subject || 'Student Class'}
                      </p>
                    </div>
                  </div>
                  
                  {isActive ? (
                    <span className="flex-shrink-0 px-2.5 py-1 bg-white/25 backdrop-blur-md rounded-full text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-xs font-semibold text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 flex items-center gap-1 transition-colors">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. Active Tuition Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white p-6 sm:p-8 md:p-10 border border-zinc-800/80 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Selected Tuition
              </span>
              {activeTuition && (
                <span className="px-3 py-1 bg-white/10 text-zinc-300 rounded-full text-xs font-semibold">
                  {activeTuition.name}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Welcome back, <span className="text-red-500">{data.student?.name?.split(' ')[0] || 'Student'}</span>!
            </h1>
            
            <p className="text-zinc-400 text-sm sm:text-base font-normal">
              Viewing real-time records for <strong className="text-white font-semibold">{activeTuition?.name || 'Your Tuition'}</strong>. Track your attendance, homework tasks, and fee receipts.
            </p>
          </div>

          {/* Quick Enrolled Details Pill */}
          <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row md:flex-col gap-4 min-w-[220px]">
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Your Batch</span>
              <p className="text-base font-bold text-white">{data.student?.batch?.name || 'Enrolled'}</p>
            </div>
            <div className="border-t border-white/10 sm:border-t-0 sm:border-l md:border-l-0 md:border-t pt-3 sm:pt-0 sm:pl-4 md:pl-0 md:pt-3">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Subject</span>
              <p className="text-sm font-semibold text-red-400">{data.student?.batch?.subject || 'All Classes'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Today's Class Alert (If active) */}
      {todaysClass && (
        <section className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-red-600/15 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-wider uppercase">
                Today's Class
              </span>
              <span className="text-red-100 text-xs font-semibold flex items-center gap-1">
                <Clock size={13} /> {todaysClass.time}
              </span>
            </div>
            <h2 className="text-2xl font-black">{todaysClass.subject}</h2>
            <p className="text-red-100 text-sm font-medium">{todaysClass.topic}</p>
          </div>

          <div className="relative z-10 bg-black/20 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10 flex items-center gap-3">
            <MapPin size={20} className="text-red-200 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-red-200 font-bold uppercase tracking-wider">Room / Location</p>
              <p className="font-bold text-sm">{todaysClass.room || 'Main Classroom'}</p>
            </div>
          </div>
        </section>
      )}

      {/* 4. Core 4-Metric Real Data Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Attendance */}
        <Card className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-red-300 dark:hover:border-red-900/40 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {attendancePercentage}% Rate
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Attendance</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white">{attendance.totalAttended}</span>
              <span className="text-sm font-semibold text-zinc-400">/ {attendance.totalClasses} classes</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {absentDays} {absentDays === 1 ? 'day' : 'days'} absent
            </span>
            <Link 
              to={`/student/attendance${tuitionQuery}`} 
              replace 
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 2: Monthly Fee */}
        <Card className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-red-300 dark:hover:border-red-900/40 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <Badge variant={
                data.student?.feeStatus === 'Paid' ? 'success' :
                data.student?.feeStatus === 'Pending' ? 'warning' : 'danger'
              } className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5">
                {data.student?.feeStatus || 'Pending'}
              </Badge>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Monthly Fee</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white">
                {data.student?.batch?.fee ? `₹${data.student.batch.fee}` : '₹0'}
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {monthsPaidCount} {monthsPaidCount === 1 ? 'month' : 'months'} paid
            </span>
            <Link 
              to={`/student/fees${tuitionQuery}`} 
              replace 
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 3: Homework & Assignments */}
        <Card className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-red-300 dark:hover:border-red-900/40 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BookText className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {homeworkList.length} Tasks
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Assignments</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white">{homeworkList.length}</span>
              <span className="text-sm font-semibold text-zinc-400">assigned</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Worksheets & Tasks
            </span>
            <Link 
              to={`/student/homework${tuitionQuery}`} 
              replace 
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 4: Announcements & Notices */}
        <Card className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col justify-between hover:border-red-300 dark:hover:border-red-900/40 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {announcementsList.length} Total
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Notices</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white">{announcementsList.length}</span>
              <span className="text-sm font-semibold text-zinc-400">broadcasts</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Updates from tutor
            </span>
            <Link 
              to={`/student/announcements${tuitionQuery}`} 
              replace 
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              Board <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

      </section>

      {/* 5. Detailed Dual Activity Panels: Homework & Announcements */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Panel 1: Homework Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <BookOpen size={18} />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Active Homework</h2>
            </div>
            <Link 
              to={`/student/homework${tuitionQuery}`} 
              replace 
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              See all ({homeworkList.length}) <ArrowRight size={13} />
            </Link>
          </div>

          {homeworkList.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl">
              <BookText size={36} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No active homework</p>
              <p className="text-xs text-zinc-400 mt-0.5">You're completely up to date for this tuition.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {homeworkList.slice(0, 3).map((hw, idx) => {
                const isOverdue = hw.dueDate && new Date(hw.dueDate) < new Date();
                return (
                  <Card 
                    key={hw._id || hw.id || idx} 
                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md">
                          {hw.subject || 'Assignment'}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-1">
                          {hw.title}
                        </h3>
                        {hw.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {hw.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={isOverdue ? 'danger' : 'warning'} className="text-[10px] uppercase font-bold px-2 py-0.5">
                        {isOverdue ? 'Overdue' : 'Pending'}
                      </Badge>
                    </div>

                    {hw.imageUrl && (
                      <div 
                        className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group cursor-pointer max-h-36"
                        onClick={() => setViewingImage({ url: hw.imageUrl, title: hw.title })}
                      >
                        <img src={hw.imageUrl} alt="Homework Task" className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]">
                          <Maximize2 className="w-4 h-4" />
                          <span>Tap to view image</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className={isOverdue ? 'text-red-500' : 'text-amber-500'} />
                        {hw.dueDate ? `Due: ${new Date(hw.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'No due date'}
                      </span>
                      <Link 
                        to={`/student/homework${tuitionQuery}`} 
                        replace 
                        className="text-red-600 dark:text-red-400 font-bold hover:underline"
                      >
                        View Full Task
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel 2: Announcements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <BellRing size={18} />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Tuition Notices</h2>
            </div>
            <Link 
              to={`/student/announcements${tuitionQuery}`} 
              replace 
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              See all ({announcementsList.length}) <ArrowRight size={13} />
            </Link>
          </div>

          {announcementsList.length === 0 ? (
            <Card className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl">
              <BellRing size={36} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No announcements yet</p>
              <p className="text-xs text-zinc-400 mt-0.5">Your tutor hasn't posted any notices for this tuition.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {announcementsList.slice(0, 3).map((ann, idx) => (
                <Card 
                  key={ann._id || idx} 
                  className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                      {ann.title}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md uppercase flex-shrink-0">
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
                    {ann.message}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* Full screen Lightbox viewer for Homework Images */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div 
            className="w-full max-w-4xl flex items-center justify-between text-white px-2 pt-2 sm:pt-0"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-sm font-bold truncate max-w-[220px] sm:max-w-md">
              {viewingImage.title || 'Homework Image'}
            </span>
            <div className="flex items-center gap-2">
              <a 
                href={viewingImage.url} 
                download={viewingImage.title || 'homework-image'}
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Open / Download"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </a>
              <button
                type="button"
                onClick={() => setViewingImage(null)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div 
            className="relative max-w-4xl max-h-[78vh] w-full flex-1 flex items-center justify-center overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={viewingImage.url} 
              alt={viewingImage.title || 'Homework Image'} 
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          <div 
            className="text-xs text-zinc-400 text-center pb-2 select-none"
            onClick={e => e.stopPropagation()}
          >
            Tap anywhere outside or click Close to exit
          </div>
        </div>
      )}

    </div>
  );
}
