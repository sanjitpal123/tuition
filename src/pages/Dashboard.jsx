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

  // Compute 100% real dynamic metrics from live database state
  const { attendanceRate, presentCount, absentCount, attendanceStatus, gaugeOffset } = useMemo(() => {
    if (!students || students.length === 0) {
      return { 
        attendanceRate: 0, 
        presentCount: 0, 
        absentCount: 0, 
        attendanceStatus: 'Not Marked',
        gaugeOffset: 120
      };
    }
    const withAtt = students.filter(s => typeof s.attendance === 'number');
    const rate = withAtt.length > 0
      ? Math.round(withAtt.reduce((sum, s) => sum + s.attendance, 0) / withAtt.length)
      : (students.filter(s => s.status === 'Active').length > 0 ? 100 : 0);
    
    const present = Math.round((students.length * rate) / 100);
    const absent = Math.max(0, students.length - present);
    
    let status = 'Excellent ⭐';
    if (rate >= 85) status = 'Excellent ⭐';
    else if (rate >= 75) status = 'Good 👍';
    else if (rate > 0) status = 'Needs Attention ⚠️';
    else status = 'Not Marked';

    // Arc length is ~120
    const offset = Math.max(0, Math.min(120, 120 - (120 * rate) / 100));

    return {
      attendanceRate: rate,
      presentCount: present,
      absentCount: absent,
      attendanceStatus: status,
      gaugeOffset: offset
    };
  }, [students]);

  const unreadNotificationsCount = (realNotifications || []).filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* ========================================================================= */}
      {/* MOBILE SPECIFIC VIEW (< md) - Matched pixel-perfect to provided screenshot */}
      {/* ========================================================================= */}
      <div 
        className="block md:hidden pb-36 px-4 space-y-4"
        style={{
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top, 0px))'
        }}
      >
        
        {/* Ambient background glow in dark mode */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-red-600/15 via-rose-900/5 to-transparent pointer-events-none dark:block hidden" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between pt-1 relative z-10">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Avatar Circle with red gradient & initial */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-700 text-white font-heading font-extrabold text-xl flex items-center justify-center shadow-lg shadow-red-600/25 border-2 border-white/20 dark:border-red-400/30 flex-shrink-0">
              {avatarInitial}
            </div>
            <div className="min-w-0 truncate">
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-tight">
                Good morning,
              </p>
              <h2 className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1 leading-tight truncate">
                <span>{firstName}</span>
                <span className="text-base">👋</span>
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight truncate mt-0.5">
                Here's what's happening today
              </p>
            </div>
          </div>

          {/* Header Action Buttons (Sun/Moon, Notifications, Profile) */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {theme === "dark" ? (
                <Sun className="w-4.5 h-4.5 text-amber-400 stroke-[2] drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-zinc-700 stroke-[2]" />
              )}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 rounded-full bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5 stroke-[2]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-extrabold text-white bg-red-600 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Profile Settings Button */}
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
              title="Profile Settings"
            >
              <Users className="w-4.5 h-4.5 stroke-[2]" />
            </button>
          </div>
        </div>

        {/* 1. Top 3 Metric Cards Grid (Batches, Students, Attendance) */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          
          {/* Batches Card */}
          <div 
            onClick={() => navigate('/batches')}
            className="bg-white dark:bg-[#131722] hover:bg-zinc-50 dark:hover:bg-[#181d2b] active:scale-95 transition-all rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
                {batches.length}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Batches
              </p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5 truncate">
                <TrendingUp className="w-3 h-3 inline flex-shrink-0" /> {batches.length} active
              </p>
            </div>
          </div>

          {/* Students Card */}
          <div 
            onClick={() => navigate('/students')}
            className="bg-white dark:bg-[#131722] hover:bg-zinc-50 dark:hover:bg-[#181d2b] active:scale-95 transition-all rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
                {students.length}
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Students
              </p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5 truncate">
                <TrendingUp className="w-3 h-3 inline flex-shrink-0" /> {students.length} enrolled
              </p>
            </div>
          </div>

          {/* Attendance Card */}
          <div 
            onClick={() => navigate('/attendance')}
            className="bg-white dark:bg-[#131722] hover:bg-zinc-50 dark:hover:bg-[#181d2b] active:scale-95 transition-all rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
                {attendanceRate}%
              </span>
            </div>
            <div className="mt-2">
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Attendance
              </p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5 truncate">
                <TrendingUp className="w-3 h-3 inline flex-shrink-0" /> {attendanceRate}% avg
              </p>
            </div>
          </div>

        </div>

        {/* 2. Attendance Insights Hero Card (Gauge + Sparkline Chart) */}
        <div 
          onClick={() => navigate('/attendance')}
          className="bg-white dark:bg-gradient-to-br dark:from-[#151924] dark:to-[#0f131d] rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/90 shadow-md relative overflow-hidden cursor-pointer active:scale-[0.99] transition-all"
        >
          {/* Background Ambient Glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-12 gap-3 items-center relative z-10">
            
            {/* Left Column: Circular Arc Gauge */}
            <div className="col-span-5 flex flex-col items-center justify-center border-r border-zinc-100 dark:border-zinc-800/80 pr-2">
              <div className="relative w-28 h-20 flex flex-col items-center justify-end">
                {/* SVG Semi-Circle Gauge */}
                <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="50%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#fb7185" />
                    </linearGradient>
                    <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#ef4444" floodOpacity="0.5"/>
                    </filter>
                  </defs>
                  {/* Background Track Arc */}
                  <path
                    d="M 12 52 A 38 38 0 0 1 88 52"
                    fill="none"
                    stroke="currentColor"
                    className="text-zinc-200 dark:text-zinc-800"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                  />
                  {/* Active Progress Arc */}
                  <path
                    d="M 12 52 A 38 38 0 0 1 88 52"
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="6.5"
                    strokeLinecap="round"
                    strokeDasharray="120"
                    strokeDashoffset={gaugeOffset}
                    filter="url(#gaugeGlow)"
                  />
                </svg>

                {/* Text inside gauge */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
                  <span className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
                    {attendanceRate}%
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400 leading-tight mt-0.5">
                    Attendance
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  <span>{attendanceStatus}</span>
                </span>
              </div>
            </div>

            {/* Right Column: Sparkline Line Chart & Counts */}
            <div className="col-span-7 flex flex-col justify-between pl-1">
              
              {/* SVG Sparkline Chart */}
              <div className="w-full h-12 relative">
                <svg viewBox="0 0 140 45" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparklineArea" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Filled Area */}
                  <path
                    d="M 5,35 Q 20,20 35,26 T 65,18 T 95,22 T 120,10 L 135,8 L 135,45 L 5,45 Z"
                    fill="url(#sparklineArea)"
                  />
                  {/* Line Stroke */}
                  <path
                    d="M 5,35 Q 20,20 35,26 T 65,18 T 95,22 T 120,10 L 135,8"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Data Dots */}
                  <circle cx="5" cy="35" r="2.5" fill="#ef4444" className="animate-pulse" />
                  <circle cx="35" cy="26" r="2.5" fill="#ef4444" />
                  <circle cx="65" cy="18" r="2.5" fill="#ef4444" />
                  <circle cx="95" cy="22" r="2.5" fill="#ef4444" />
                  <circle cx="120" cy="10" r="2.5" fill="#ef4444" />
                  <circle cx="135" cy="8" r="3" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
                </svg>
              </div>

              {/* Present / Absent counts */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
                <div>
                  <span className="text-base font-heading font-extrabold text-zinc-900 dark:text-white leading-none block">
                    {presentCount}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Present
                  </span>
                </div>
                <div>
                  <span className="text-base font-heading font-extrabold text-zinc-900 dark:text-white leading-none block">
                    {absentCount}
                  </span>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                    Absent
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 3. Main Functions Section Card */}
        <div className="bg-white dark:bg-[#121622] rounded-[28px] p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
          
          {/* Header Row inside the card */}
          <div className="px-1">
            <h3 className="text-base font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Main Functions
            </h3>
          </div>

          <div className="space-y-2.5">
            {/* 1. Batches Item */}
            <div
              onClick={() => navigate('/batches')}
              className="relative flex items-center justify-between p-3.5 pl-4 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] active:scale-[0.98] transition-all cursor-pointer border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden"
            >
              {/* Left Glowing Accent Bar */}
              <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-red-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-red-500/25">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white truncate">
                    Batches
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    Manage your classes
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white dark:bg-[#202738] border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-center text-zinc-400 dark:text-zinc-400 shadow-sm flex-shrink-0 ml-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 2. Students Item */}
            <div
              onClick={() => navigate('/students')}
              className="relative flex items-center justify-between p-3.5 pl-4 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] active:scale-[0.98] transition-all cursor-pointer border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden"
            >
              {/* Left Glowing Accent Bar */}
              <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-red-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-red-500/25">
                  <Users className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white truncate">
                    Students
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    View student profiles
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white dark:bg-[#202738] border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-center text-zinc-400 dark:text-zinc-400 shadow-sm flex-shrink-0 ml-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 3. Attendance Item */}
            <div
              onClick={() => navigate('/attendance')}
              className="relative flex items-center justify-between p-3.5 pl-4 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] active:scale-[0.98] transition-all cursor-pointer border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden"
            >
              {/* Left Glowing Accent Bar */}
              <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-red-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-red-500/25">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white truncate">
                    Attendance
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    Mark today's status
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white dark:bg-[#202738] border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-center text-zinc-400 dark:text-zinc-400 shadow-sm flex-shrink-0 ml-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 4. Classes Item */}
            <div
              onClick={() => navigate('/schedule?tab=list')}
              className="relative flex items-center justify-between p-3.5 pl-4 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] active:scale-[0.98] transition-all cursor-pointer border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden"
            >
              {/* Left Glowing Accent Bar */}
              <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-red-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-red-500/25">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white truncate">
                    Classes
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    View scheduled sessions
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-white dark:bg-[#202738] border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-center text-zinc-400 dark:text-zinc-400 shadow-sm flex-shrink-0 ml-2">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Quick Actions Section Card */}
        <div className="bg-white dark:bg-[#121622] rounded-[28px] p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3">
          <h3 className="text-base font-heading font-extrabold text-zinc-900 dark:text-white px-1 tracking-tight">
            Quick Actions
          </h3>

          <div className="grid grid-cols-4 gap-2 text-center">
            
            {/* 1. Fees Button */}
            <div
              onClick={() => navigate('/fees')}
              className="bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] rounded-2xl p-2.5 py-3 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 group-hover:bg-emerald-500/20 flex items-center justify-center shadow-sm border border-emerald-500/25 transition-all">
                <IndianRupee className="w-6 h-6 stroke-[2.3] drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
              </div>
              <span className="text-xs font-heading font-bold text-zinc-900 dark:text-white block leading-tight mt-2">
                Fees
              </span>
              <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 block leading-tight mt-0.5 truncate w-full">
                Manage fees
              </span>
            </div>

            {/* 2. Schedule Button */}
            <div
              onClick={() => navigate('/schedule')}
              className="bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] rounded-2xl p-2.5 py-3 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 group-hover:bg-blue-500/20 flex items-center justify-center shadow-sm border border-blue-500/25 transition-all">
                <CalendarIcon className="w-6 h-6 stroke-[2.3] drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              </div>
              <span className="text-xs font-heading font-bold text-zinc-900 dark:text-white block leading-tight mt-2">
                Schedule
              </span>
              <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 block leading-tight mt-0.5 truncate w-full">
                View timetable
              </span>
            </div>

            {/* 3. Notice Button */}
            <div
              onClick={() => navigate('/announcements')}
              className="bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] rounded-2xl p-2.5 py-3 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 group-hover:bg-amber-500/20 flex items-center justify-center shadow-sm border border-amber-500/25 transition-all">
                <Megaphone className="w-6 h-6 stroke-[2.3] drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              </div>
              <span className="text-xs font-heading font-bold text-zinc-900 dark:text-white block leading-tight mt-2">
                Notice
              </span>
              <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 block leading-tight mt-0.5 truncate w-full">
                Announcements
              </span>
            </div>

            {/* 4. Homework Button */}
            <div
              onClick={() => navigate('/homework')}
              className="bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] rounded-2xl p-2.5 py-3 border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col items-center justify-center active:scale-95 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 text-purple-500 dark:text-purple-400 group-hover:bg-purple-500/20 flex items-center justify-center shadow-sm border border-purple-500/25 transition-all">
                <BookOpen className="w-6 h-6 stroke-[2.3] drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
              </div>
              <span className="text-xs font-heading font-bold text-zinc-900 dark:text-white block leading-tight mt-2">
                Homework
              </span>
              <span className="text-[9px] font-medium text-zinc-500 dark:text-zinc-400 block leading-tight mt-0.5 truncate w-full">
                Assignments
              </span>
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

