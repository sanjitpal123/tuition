import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Users, 
  BookOpen, 
  Clock, 
  IndianRupee, 
  Activity, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  CheckSquare, 
  Award,
  GraduationCap,
  ChevronRight,
  Lock,
  CheckCircle2,
  Megaphone,
  Sun,
  Moon,
  Bell
} from 'lucide-react';
import { Button } from '../components/ui/Button';

function StatCard({ title, value, icon: Icon, trend, subtext }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start sm:items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
            <p className="mt-1 sm:mt-2 text-2xl sm:text-4xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">{value}</p>
          </div>
          <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-950/30 rounded-lg">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-500" />
          </div>
        </div>
        {(trend || subtext) && (
          <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
            {trend && <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />}
            <span className={trend ? "text-green-600 font-medium" : "text-zinc-500 dark:text-zinc-400"}>
              {trend || subtext}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { students, scheduleClasses, recentActivity, batches, realNotifications } = useData();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('tutorProfile') || '{"name":"Tutor"}');

  const { pendingAmount, pendingCount } = useMemo(() => {
    let amt = 0;
    let cnt = 0;
    students.forEach(s => {
      if (s.feeStatus !== 'Paid') {
        amt += (Number(s.monthlyFee) || 0);
        cnt++;
      }
    });
    return { pendingAmount: amt, pendingCount: cnt };
  }, [students]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCount = scheduleClasses.filter(c => {
    if (!c.date) return false;
    return c.date.split('T')[0] === todayStr;
  }).length;

  const getComparableDate = (cls) => {
    const d = new Date(cls.date);
    if (isNaN(d.getTime())) return new Date(0);
    let h = 0, m = 0;
    if (cls.time) {
      const timeParts = cls.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeParts) {
        h = parseInt(timeParts[1], 10);
        m = parseInt(timeParts[2], 10);
        const ampm = timeParts[3]?.toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
      }
    }
    d.setHours(h, m, 0, 0);
    return d;
  };

  const upcomingClasses = scheduleClasses
    .filter(c => {
      if (!c.date) return false;
      return getComparableDate(c) >= new Date();
    })
    .sort((a, b) => getComparableDate(a) - getComparableDate(b))
    .slice(0, 3);
  
  const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'Tutor';
  const avatarInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'T';

  return (
    <div className="space-y-6 md:space-y-8">
      
      {/* ========================================================================= */}
      {/* MOBILE SPECIFIC VIEW (< md) - Full width hero & rounded overlapping cards */}
      {/* ========================================================================= */}
      <div className="block md:hidden pb-6">
        
        {/* Top Hero Banner - Full Width Edge to Edge */}
        <div 
          className="w-full bg-gradient-to-br from-red-600 via-red-500 to-rose-700 dark:from-[#1a0505] dark:via-[#160606] dark:to-[#080202] px-5 pb-12 text-white relative shadow-lg shadow-red-950/20 border-b border-red-500/20"
          style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
        >
          
          {/* Subtle background ambient glows */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 dark:bg-red-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/15 dark:bg-red-900/15 blur-3xl pointer-events-none" />

          {/* User Row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-white/20 dark:bg-red-500/20 backdrop-blur-md flex items-center justify-center text-white dark:text-red-400 font-heading font-bold text-xl shadow-inner border border-white/30 dark:border-red-500/30 flex-shrink-0">
                {avatarInitial}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-red-100/90 dark:text-zinc-400">Welcome back</p>
                <h2 className="text-lg font-heading font-bold tracking-tight text-white capitalize leading-tight truncate">
                  {currentUser.name?.toLowerCase() || 'tutor'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/90 backdrop-blur-md flex items-center justify-center text-white border border-white/30 dark:border-zinc-700 shadow-md shadow-black/10 dark:shadow-black/40 active:scale-90 transition-all cursor-pointer"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-amber-400 stroke-[2] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                ) : (
                  <Moon className="w-5 h-5 text-white stroke-[2]" />
                )}
              </button>

              {/* Notifications Button */}
              <button
                onClick={() => navigate('/notifications')}
                className="relative w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/90 backdrop-blur-md flex items-center justify-center text-white border border-white/30 dark:border-zinc-700 shadow-md shadow-black/10 dark:shadow-black/40 active:scale-90 transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-white dark:text-zinc-100 stroke-[2]" />
                {realNotifications && realNotifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold leading-none text-white bg-red-600 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm">
                    {realNotifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Settings / Lock Button */}
              <button
                onClick={() => navigate('/settings')}
                className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/90 backdrop-blur-md flex items-center justify-center text-white border border-white/30 dark:border-zinc-700 shadow-md shadow-black/10 dark:shadow-black/40 active:scale-90 transition-all cursor-pointer"
                title="Settings"
              >
                <Lock className="w-5 h-5 text-white dark:text-zinc-100 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* 3 Metric Cards in Row */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 relative z-10">
            
            {/* Batches Pill */}
            <div 
              onClick={() => navigate('/batches')}
              className="bg-white/15 dark:bg-zinc-900/80 hover:bg-white/20 dark:hover:bg-zinc-900 active:scale-95 transition-all backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/20 dark:border-red-500/20 flex flex-col items-center justify-center cursor-pointer shadow-sm"
            >
              <GraduationCap className="w-5 h-5 text-white dark:text-red-400 mb-1" />
              <span className="text-lg font-heading font-extrabold text-white leading-tight">
                {batches.length}
              </span>
              <span className="text-[11px] font-medium text-red-100/90 dark:text-zinc-400 leading-tight mt-0.5">
                Batches
              </span>
            </div>

            {/* Students Pill */}
            <div 
              onClick={() => navigate('/students')}
              className="bg-white/15 dark:bg-zinc-900/80 hover:bg-white/20 dark:hover:bg-zinc-900 active:scale-95 transition-all backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/20 dark:border-red-500/20 flex flex-col items-center justify-center cursor-pointer shadow-sm"
            >
              <Users className="w-5 h-5 text-white dark:text-red-400 mb-1" />
              <span className="text-lg font-heading font-extrabold text-white leading-tight">
                {students.length}
              </span>
              <span className="text-[11px] font-medium text-red-100/90 dark:text-zinc-400 leading-tight mt-0.5">
                Students
              </span>
            </div>

            {/* Attendance Pill */}
            <div 
              onClick={() => navigate('/attendance')}
              className="bg-white/15 dark:bg-zinc-900/80 hover:bg-white/20 dark:hover:bg-zinc-900 active:scale-95 transition-all backdrop-blur-md rounded-2xl p-2.5 text-center border border-white/20 dark:border-red-500/20 flex flex-col items-center justify-center cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-white dark:text-red-400 mb-1" />
              <span className="text-lg font-heading font-extrabold text-white leading-tight">
                {students.length > 0 ? "Ready" : "0%"}
              </span>
              <span className="text-[11px] font-medium text-red-100/90 dark:text-zinc-400 leading-tight mt-0.5">
                Attendance
              </span>
            </div>

          </div>
        </div>

        {/* Main Functions Section Card - Rounded Overlapping Container */}
        <div className="mx-4 -mt-6 relative z-10 bg-white dark:bg-zinc-900 rounded-[28px] p-5 shadow-xl border border-black/5 dark:border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
              Main Functions
            </h3>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
              Daily
            </span>
          </div>

          <div className="space-y-3">
            {/* Batches Item */}
            <div
              onClick={() => navigate('/batches')}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-red-50/50 dark:hover:bg-zinc-800/80 active:scale-[0.98] transition-all cursor-pointer border border-zinc-100 dark:border-zinc-800/60 shadow-sm"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-heading font-bold text-zinc-900 dark:text-white truncate">
                    Batches
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    Manage classes
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-2" />
            </div>

            {/* Students Item */}
            <div
              onClick={() => navigate('/students')}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-red-50/50 dark:hover:bg-zinc-800/80 active:scale-[0.98] transition-all cursor-pointer border border-zinc-100 dark:border-zinc-800/60 shadow-sm"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-heading font-bold text-zinc-900 dark:text-white truncate">
                    Students
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    View profiles
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-2" />
            </div>

            {/* Attendance Item */}
            <div
              onClick={() => navigate('/attendance')}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-red-50/50 dark:hover:bg-zinc-800/80 active:scale-[0.98] transition-all cursor-pointer border border-zinc-100 dark:border-zinc-800/60 shadow-sm"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-heading font-bold text-zinc-900 dark:text-white truncate">
                    Attendance
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                    Mark today's status
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* Other Activity Section */}
        <div className="mx-4 mt-5 space-y-3">
          <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white px-1 tracking-tight">
            Other Activity
          </h3>

          <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-5 shadow-md border border-black/5 dark:border-white/5 backdrop-blur-xl">
            <div className="grid grid-cols-4 gap-3 text-center">
              
              {/* 1. Fees Button */}
              <button
                onClick={() => navigate('/fees')}
                className="flex flex-col items-center justify-center space-y-2 group active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 group-hover:bg-red-500/10 group-hover:text-red-500 dark:group-hover:bg-red-500/20 dark:group-hover:text-red-400 flex items-center justify-center shadow-sm border border-black/5 dark:border-zinc-700/60 transition-all">
                  <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Fees
                </span>
              </button>

              {/* 2. Schedule Button */}
              <button
                onClick={() => navigate('/schedule')}
                className="flex flex-col items-center justify-center space-y-2 group active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 group-hover:bg-red-500/10 group-hover:text-red-500 dark:group-hover:bg-red-500/20 dark:group-hover:text-red-400 flex items-center justify-center shadow-sm border border-black/5 dark:border-zinc-700/60 transition-all">
                  <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Schedule
                </span>
              </button>

              {/* 3. Notice Button */}
              <button
                onClick={() => navigate('/announcements')}
                className="flex flex-col items-center justify-center space-y-2 group active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 group-hover:bg-red-500/10 group-hover:text-red-500 dark:group-hover:bg-red-500/20 dark:group-hover:text-red-400 flex items-center justify-center shadow-sm border border-black/5 dark:border-zinc-700/60 transition-all">
                  <Megaphone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Notice
                </span>
              </button>

              {/* 4. HomeWork Button */}
              <button
                onClick={() => navigate('/schedule')}
                className="flex flex-col items-center justify-center space-y-2 group active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-200 group-hover:bg-red-500/10 group-hover:text-red-500 dark:group-hover:bg-red-500/20 dark:group-hover:text-red-400 flex items-center justify-center shadow-sm border border-black/5 dark:border-zinc-700/60 transition-all">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  HomeWork
                </span>
              </button>

            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (hidden on mobile, visible on md: and up) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">
            Good morning, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Here's what's happening with your tuition today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <div onClick={() => navigate('/students')} className="cursor-pointer transition-transform hover:scale-105">
            <StatCard title="Total Students" value={students.length} icon={Users} trend="Active roster" />
          </div>
          <div onClick={() => navigate('/schedule')} className="cursor-pointer transition-transform hover:scale-105">
            <StatCard title="Classes" value={todaysCount} icon={Clock} subtext="Today's Classes" />
          </div>
          <div onClick={() => navigate('/fees')} className="cursor-pointer transition-transform hover:scale-105">
            <StatCard title="Pending Fees" value={`₹${pendingAmount.toLocaleString()}`} icon={IndianRupee} subtext={`${pendingCount} pending`} />
          </div>
          <div onClick={() => navigate('/attendance')} className="cursor-pointer transition-transform hover:scale-105">
            <StatCard title="Attendance" value="Ready" icon={Activity} subtext="Today's log" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Today's Classes */}
          <div className="xl:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Classes</CardTitle>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => navigate('/schedule')}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.length === 0 && (
                    <p className="text-zinc-400 dark:text-zinc-500 text-sm">No upcoming classes.</p>
                  )}
                  {upcomingClasses.map((c) => {
                    let batchName = 'N/A';
                    if (c.batchId && typeof c.batchId === 'object') {
                      batchName = c.batchId.name || c.batchId.class || 'N/A';
                    } else if (c.batchId) {
                      const foundBatch = batches.find(b => b.id === c.batchId || b._id === c.batchId);
                      if (foundBatch) batchName = foundBatch.name;
                    }
                    return (
                      <div key={c.id || c._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl rounded-lg border border-black/5 dark:border-white/5">
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                          <div className="p-2 sm:p-3 bg-white dark:bg-zinc-900/40 backdrop-blur-xl rounded-md shadow-sm dark:shadow-md shadow-black/5 dark:shadow-black/40 border border-zinc-100 dark:border-white/5 text-center min-w-[65px] sm:min-w-[70px]">
                            <div className="text-[10px] sm:text-xs font-semibold text-red-500 uppercase">TIME</div>
                            <div className="text-sm font-heading font-bold text-zinc-900 dark:text-white tracking-tight">{c.time || 'N/A'}</div>
                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{new Date(c.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-heading font-semibold text-zinc-900 dark:text-white tracking-tight truncate">{c.subject || c.title || 'Class'}</h4>
                            <div className="flex flex-wrap items-center mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 gap-x-3 gap-y-1">
                              <span className="flex items-center whitespace-nowrap"><BookOpen className="w-3 h-3 mr-1" /> Batch: {batchName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2">
                          {c.status === 'Completed' ? (
                            <Badge variant="success" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 justify-center">Completed</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 justify-center">Upcoming</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivity.length === 0 && <p className="text-zinc-400 dark:text-zinc-500 text-sm">No recent activity.</p>}
                    {recentActivity.slice(0,5).map((activity, activityIdx) => (
                      <li key={activity._id || activityIdx}>
                        <div className="relative pb-8">
                          {activityIdx !== Math.min(recentActivity.length, 5) - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-zinc-700" aria-hidden="true" />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-zinc-900">
                                <Activity className="w-4 h-4" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{activity.type}</p>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">{activity.text}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
}

