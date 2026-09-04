import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  LogOut, 
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
  ChevronDown,
  BookText,
  CheckCircle2,
  Circle,
  Building
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams] = useSearchParams();
  const selectedTuitionId = searchParams.get('tuitionId');
  const [showTuitionDropdown, setShowTuitionDropdown] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        // Pass the tuition ID to fetch specific dashboard
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
        setError(err.response?.data?.message || 'Failed to fetch dashboard');
        if (err.response?.status === 401) {
          localStorage.removeItem('studentToken');
          localStorage.removeItem('studentProfile');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, selectedTuitionId]);

  const handleLogout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentProfile');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <Card className="max-w-md w-full p-8 text-center shadow-xl shadow-red-500/5 border-red-100 dark:border-red-900/30">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <p className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Oops! Something went wrong</p>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">{error}</p>
          <button onClick={handleLogout} className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">
            <LogOut size={18} />
            Return to Login
          </button>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null; // Or some other fallback UI
  }

  const attendancePercentage = data?.attendance?.totalClasses > 0 
    ? Math.round((data.attendance.totalAttended / data.attendance.totalClasses) * 100) 
    : 0;

  const multipleTuitions = data?.tuitions || [];
  const activeTuition = multipleTuitions.find(t => t.id === selectedTuitionId) || multipleTuitions[0] || null;

  const todaysClass = data?.todaysClass || null;
  const homeworkList = data?.homework || [];


  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-4 md:p-8 lg:p-10 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Tuition Selector */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center gap-5 mb-6 md:mb-0">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
               <User size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Hi, {data.student?.name?.split(' ')[0] || 'Student'} 👋
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Ready for your classes today?</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          </div>
        </header>

        {/* Today's Class Banner */}
        {todaysClass && (
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 rounded-3xl p-6 md:p-8 shadow-xl shadow-indigo-900/10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Clock size={160} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">Today's Class</span>
                  <span className="text-indigo-200 text-sm font-medium flex items-center gap-1">
                    <Clock size={14} /> {todaysClass.time}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-2">{todaysClass.subject}</h2>
                <p className="text-indigo-100 font-medium text-lg max-w-xl">{todaysClass.topic}</p>
              </div>
              <div className="bg-black/20 backdrop-blur-md p-4 rounded-2xl md:min-w-[200px] border border-white/10">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-indigo-300 mt-1" />
                  <div>
                    <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-1">Location</p>
                    <p className="font-bold">{todaysClass.room}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Batch Card */}
          <Card className="col-span-1 p-7 flex flex-col justify-between shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900 group relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Layers size={160} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                   <BookOpen size={20} />
                </div>
                <h2 className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Your Batch</h2>
              </div>
              <p className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">{data.student?.batch ? data.student.batch.name : 'Unassigned'}</p>
            </div>
            
            {data.student?.batch && (
              <div className="space-y-3 mt-auto relative z-10">
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <Layers size={18} className="text-zinc-400" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex-1">Subject</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{data.student.batch.subject}</p>
                </div>
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <Calendar size={18} className="text-zinc-400" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex-1">Schedule</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[120px]" title={data.student.batch.schedule}>{data.student.batch.schedule}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Fee Status Card */}
          <Card className="col-span-1 p-7 flex flex-col justify-between shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900 group">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                   <Wallet size={20} />
                </div>
                <h2 className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Fee Status</h2>
              </div>
              
              <div className="flex items-end gap-3 mt-4">
                <span className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                  {data.student?.batch ? `₹${data.student.batch.fee}` : 'N/A'}
                </span>
                <div className="mb-2">
                  <Badge variant={
                    data.student?.feeStatus === 'Paid' ? 'success' :
                    data.student?.feeStatus === 'Pending' ? 'warning' : 'danger'
                  } className="px-3 py-1 font-bold text-xs uppercase tracking-wide">
                    {data.student?.feeStatus || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
               <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
               <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                 Keep your fees updated to avoid any interruption.
               </p>
            </div>
          </Card>

          {/* Attendance Card */}
          <Card className="col-span-1 p-7 flex flex-col justify-between shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900">
            <div>
               <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
                   <GraduationCap size={20} />
                </div>
                <h2 className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs">Attendance</h2>
              </div>
              
              <div className="flex items-baseline gap-2 mt-4">
                <span className="text-4xl lg:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">{data.attendance?.totalAttended || 0}</span>
                <span className="text-zinc-400 dark:text-zinc-500 text-lg font-bold">/ {data.attendance?.totalClasses || 0}</span>
                <span className="text-zinc-400 dark:text-zinc-500 text-sm font-medium ml-1 hidden lg:inline">classes</span>
              </div>
            </div>
            
            <div className="mt-8 bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Attendance Rate</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{attendancePercentage}%</span>
              </div>
              <div className="w-full bg-zinc-200/50 dark:bg-zinc-800 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                    attendancePercentage >= 75 ? 'bg-emerald-500' : 
                    attendancePercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${attendancePercentage}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section: Announcements & Homework */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          
          {/* Homework Section */}
          <div>
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl shadow-sm">
                  <BookText size={20} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Homework & Tasks</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              {homeworkList.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
                  <BookText size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">No pending homework.</p>
                  <p className="text-sm mt-1 opacity-70">You're all caught up!</p>
                </div>
              ) : (
                homeworkList.map((hw) => (
                  <Card key={hw.id} className={`p-5 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-md transition-all rounded-2xl bg-white dark:bg-zinc-900 ${hw.status === 'completed' ? 'opacity-70' : ''}`}>
                    <div className="flex items-start gap-4">
                      <button className="flex-shrink-0 mt-0.5 text-zinc-300 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                        {hw.status === 'completed' ? <CheckCircle2 size={24} className="text-emerald-500" /> : <Circle size={24} />}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className={`font-bold text-base leading-tight ${hw.status === 'completed' ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>{hw.title}</h3>
                          <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">
                            {hw.subject}
                          </span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-2 flex items-center gap-1.5">
                          <Clock size={14} /> Due: {hw.dueDate}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Announcements Section */}
          <div>
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shadow-sm">
                <BellRing size={20} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Announcements</h2>
            </div>
            
            <div className="space-y-4">
              {(!data.announcements || data.announcements.length === 0) ? (
                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700">
                  <BellRing size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">No announcements right now.</p>
                </div>
              ) : (
                data.announcements.map((ann, idx) => (
                  <Card key={idx} className="p-5 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 hover:shadow-md transition-all rounded-2xl bg-white dark:bg-zinc-900 group">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 dark:text-amber-400">
                          <BellRing size={18} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                          <h3 className="font-bold text-base leading-tight text-zinc-900 dark:text-white">{ann.title}</h3>
                          <span className="flex-shrink-0 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md uppercase tracking-wider">
                            {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed font-medium">{ann.message}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
