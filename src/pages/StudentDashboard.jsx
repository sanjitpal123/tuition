import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { getStudentBillingCycle } from '../lib/feeCycles';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  BookOpen, 
  Wallet, 
  GraduationCap, 
  BellRing,
  Calendar,
  AlertCircle,
  Clock,
  MapPin,
  BookText,
  ArrowRight,
  Sparkles,
  Maximize2,
  Download,
  X,
  CreditCard,
  ChevronRight,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { StudentDashboardSkeleton } from '../components/ui/Skeleton';

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

  const tuitions = data?.tuitions || [];
  const activeTuition = tuitions.find(t => t.id === selectedTuitionId) || tuitions[0] || null;
  const attendance = data?.attendance || { totalAttended: 0, totalClasses: 0, records: [] };
  const attendancePercentage = attendance.totalClasses > 0 
    ? Math.round((attendance.totalAttended / attendance.totalClasses) * 100) 
    : 0;
  const absentDays = Math.max(0, (attendance.totalClasses || 0) - (attendance.totalAttended || 0));

  const todaysClass = data?.todaysClass || null;
  const homeworkList = Array.isArray(data?.homework || data?.homeworks) ? (data?.homework || data?.homeworks) : [];
  const announcementsList = Array.isArray(data?.announcements) ? data.announcements : [];
  const feeHistory = Array.isArray(data?.fees?.history || data?.feeHistory) ? (data?.fees?.history || data?.feeHistory) : [];
  const classesList = Array.isArray(data?.classes) ? data.classes : [];
  
  // Calculate billing cycle derived from student admission date
  const billingCycle = React.useMemo(() => {
    if (!data?.student) return null;
    return getStudentBillingCycle(data.student, feeHistory);
  }, [data?.student, feeHistory]);

  const monthlyTuitionFee = billingCycle?.monthlyFee ?? Number(data?.student?.batch?.fee || data?.student?.fees || data?.student?.monthlyFee || 0);

  const tuitionQuery = selectedTuitionId ? `?tuitionId=${selectedTuitionId}` : '';
  const studentFirstName = data?.student?.name ? data.student.name.split(' ')[0] : 'Student';

  // Compute fallback schedule days if no database class records
  const batchScheduleDays = React.useMemo(() => {
    if (classesList.length > 0) return [];
    const rawSchedule = data?.student?.batch?.schedule;
    if (Array.isArray(rawSchedule) && rawSchedule.length > 0) return rawSchedule;
    return ['Mon', 'Wed', 'Fri'];
  }, [classesList, data?.student?.batch?.schedule]);

  if (loading) {
    return <StudentDashboardSkeleton />;
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

  return (
    <div className="px-3.5 sm:px-6 md:px-8 py-3 max-w-7xl mx-auto space-y-4 sm:space-y-6 font-sans">
      
      {/* 1. Native Mobile Header Greeting */}
      <div className="flex items-center justify-between bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl p-3.5 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
            Hi, <span className="text-red-600 dark:text-red-500">{studentFirstName}</span> 👋
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
              {activeTuition?.name || 'Your Tuition'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
              {data.student?.batch?.name || 'Batch'}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">SUBJECT</span>
          <span className="text-xs font-bold text-red-500">{data.student?.batch?.subject || 'All Classes'}</span>
        </div>
      </div>

      {/* 2. Sleek "Today's Class" Native App Widget */}
      {todaysClass && (
        <section className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 dark:from-zinc-950 dark:to-zinc-900 text-white rounded-2xl p-4 sm:p-5 border-l-4 border-l-red-500 border-zinc-800/80 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider">
                TODAY'S CLASS
              </span>
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Clock size={12} className="text-amber-400" /> {todaysClass.time || 'As Scheduled'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
              {todaysClass.subject || data.student?.batch?.name || 'Batch Session'}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">{todaysClass.topic || 'Regular Session'}</p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-zinc-800/80 px-3 py-2 rounded-xl border border-zinc-700/60 self-start sm:self-auto">
            <MapPin size={14} className="text-red-400 flex-shrink-0" />
            <span className="font-bold text-zinc-200">{todaysClass.room || 'Main Room'}</span>
          </div>
        </section>
      )}

      {/* 3. 1-Tap Mobile Quick Action Buttons (Horizontal Chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link 
          to={`/student/fees${tuitionQuery}`}
          replace
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex-shrink-0 active:scale-95"
        >
          <CreditCard size={14} /> Pay Fee
        </Link>
        <Link 
          to={`/student/homework${tuitionQuery}`}
          replace
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all flex-shrink-0 active:scale-95"
        >
          <BookText size={14} /> View Homework
        </Link>
        <Link 
          to={`/student/attendance${tuitionQuery}`}
          replace
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all flex-shrink-0 active:scale-95"
        >
          <GraduationCap size={14} /> Attendance Log
        </Link>
        <Link 
          to={`/student/announcements${tuitionQuery}`}
          replace
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all flex-shrink-0 active:scale-95"
        >
          <BellRing size={14} /> Notices
        </Link>
      </div>

      {/* 4. Native Mobile 2x2 App Grid (2 Columns on Mobile screens) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Attendance */}
        <Link 
          to={`/student/attendance${tuitionQuery}`} 
          replace 
          className="block group"
        >
          <Card className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:border-blue-400 dark:hover:border-blue-900/60 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {attendancePercentage}%
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">ATTENDANCE</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">{attendance.totalAttended}</span>
                <span className="text-xs text-zinc-400">/{attendance.totalClasses}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-red-500 group-hover:translate-x-0.5 transition-transform">
              <span>{absentDays} absent</span>
              <ChevronRight size={13} />
            </div>
          </Card>
        </Link>

        {/* Metric 2: Monthly Fee */}
        <Link 
          to={`/student/fees${tuitionQuery}`} 
          replace 
          className="block group"
        >
          <Card className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:border-emerald-400 dark:hover:border-emerald-900/60 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <Badge variant={billingCycle?.status === 'Pending' ? 'warning' : 'success'} className="text-[9px] font-black uppercase px-1.5 py-0.5">
                  {billingCycle?.status === 'Extra' ? `+₹${billingCycle.extraAmount}` : (billingCycle?.status || 'Paid')}
                </Badge>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">MONTHLY FEE</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">₹{monthlyTuitionFee}</span>
                <span className="text-[10px] text-zinc-400">/mo</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span className="truncate">History</span>
              <ChevronRight size={13} />
            </div>
          </Card>
        </Link>

        {/* Metric 3: Assignments */}
        <Link 
          to={`/student/homework${tuitionQuery}`} 
          replace 
          className="block group"
        >
          <Card className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:border-purple-400 dark:hover:border-purple-900/60 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <BookText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  {homeworkList.length} Tasks
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">HOMEWORK</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">{homeworkList.length}</span>
                <span className="text-xs text-zinc-400">active</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
              <span>View Tasks</span>
              <ChevronRight size={13} />
            </div>
          </Card>
        </Link>

        {/* Metric 4: Notices */}
        <Link 
          to={`/student/announcements${tuitionQuery}`} 
          replace 
          className="block group"
        >
          <Card className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs hover:border-amber-400 dark:hover:border-amber-900/60 transition-all h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BellRing className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {announcementsList.length} Total
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">NOTICES</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">{announcementsList.length}</span>
                <span className="text-xs text-zinc-400">posts</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
              <span>Notice Board</span>
              <ChevronRight size={13} />
            </div>
          </Card>
        </Link>

      </section>

      {/* 5. Class Routine & Schedule List View */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <Calendar size={16} />
            </div>
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white">Class Schedule & Routine</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {classesList.length > 0 ? `${classesList.length} Scheduled` : `${data.student?.batch?.name || 'Batch'} Routine`}
          </span>
        </div>

        {classesList.length > 0 ? (
          <div className="space-y-2">
            {classesList.map((cls, idx) => {
              const classDateStr = cls.date ? new Date(cls.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Scheduled';
              return (
                <div 
                  key={cls._id || idx}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-zinc-900 dark:text-white text-xs sm:text-sm">
                        {cls.subject || data.student?.batch?.subject || 'Class Session'}
                      </h3>
                      <span className="text-zinc-400 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-amber-500" />
                        {classDateStr} • {cls.time || data.student?.batch?.time || 'Scheduled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={cls.status === 'Completed' ? 'success' : cls.status === 'Cancelled' ? 'danger' : 'secondary'}
                      className="text-[9.5px] font-extrabold uppercase px-2 py-0.5"
                    >
                      {cls.status || 'Upcoming'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {batchScheduleDays.map((day, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-zinc-900 dark:text-white text-xs sm:text-sm">
                      {data.student?.batch?.subject || data.student?.batch?.name || 'Class Session'}
                    </h3>
                    <span className="text-zinc-400 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                      <Clock size={11} className="text-amber-500" />
                      Every {day} • {data.student?.batch?.time || 'As Scheduled'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                  Regular
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Compact Native Activity Feed (Homework & Notices) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        
        {/* Panel 1: Homework Tasks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-purple-500" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Active Assignments</h2>
            </div>
            <Link to={`/student/homework${tuitionQuery}`} replace className="text-xs font-bold text-red-500 hover:underline">
              See all ({homeworkList.length})
            </Link>
          </div>

          {homeworkList.length === 0 ? (
            <Card className="p-5 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No active homework assigned</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {homeworkList.slice(0, 2).map((hw, idx) => (
                <Card 
                  key={hw._id || hw.id || idx} 
                  className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded">
                        {hw.subject || 'Assignment'}
                      </span>
                      <h3 className="text-xs font-bold text-zinc-900 dark:text-white mt-1">{hw.title}</h3>
                    </div>
                    <Badge variant="warning" className="text-[9px] font-extrabold uppercase px-1.5 py-0.5">Pending</Badge>
                  </div>

                  {hw.imageUrl && (
                    <div 
                      className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group cursor-pointer max-h-28"
                      onClick={() => setViewingImage({ url: hw.imageUrl, title: hw.title })}
                    >
                      <img src={hw.imageUrl} alt="Homework Task" className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-200" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Panel 2: Announcements */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <BellRing size={16} className="text-amber-500" />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white">Recent Notices</h2>
            </div>
            <Link to={`/student/announcements${tuitionQuery}`} replace className="text-xs font-bold text-red-500 hover:underline">
              See all ({announcementsList.length})
            </Link>
          </div>

          {announcementsList.length === 0 ? (
            <Card className="p-5 text-center bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No notice broadcasts yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {announcementsList.slice(0, 2).map((ann, idx) => (
                <Card 
                  key={ann._id || idx} 
                  className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white">{ann.title}</h3>
                    <span className="text-[9px] text-zinc-400 font-bold">{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{ann.message}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* Full screen Lightbox viewer for Homework Images */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div 
            className="w-full max-w-4xl flex items-center justify-between text-white px-2 pt-2"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-sm font-bold truncate max-w-[220px]">
              {viewingImage.title || 'Homework Image'}
            </span>
            <div className="flex items-center gap-2">
              <a 
                href={viewingImage.url} 
                download={viewingImage.title || 'homework-image'}
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Download className="w-4 h-4" /> Save
              </a>
              <button
                type="button"
                onClick={() => setViewingImage(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
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
        </div>
      )}

    </div>
  );
}
