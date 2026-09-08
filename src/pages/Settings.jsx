import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Bell, 
  Edit2, 
  Mail, 
  Phone, 
  Building2, 
  LogOut, 
  ShieldCheck, 
  Palette, 
  X, 
  Check, 
  Users, 
  BookOpen, 
  Calendar, 
  IndianRupee, 
  Clock, 
  Megaphone, 
  Star,
  Sparkles,
  Award,
  ChevronRight,
  UserCheck,
  Lock,
  Smartphone,
  Key,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/Button';

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      className={`${
        enabled 
          ? 'bg-red-600 shadow-[0_0_14px_rgba(239,68,68,0.6)]' 
          : 'bg-zinc-200 dark:bg-zinc-800/90'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-200 ease-in-out focus:outline-none`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span className="sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5 shadow-md' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { batches, students, realNotifications } = useData();

  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('tutorProfile') || '{"name":"Sanjit","email":"sanjitpal1234@gmail.com","tuitionName":"Setupclass Tuition Hub"}');
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: currentUser.name || 'Sanjit',
    email: currentUser.email || 'sanjitpal1234@gmail.com',
    phone: currentUser.phone || '',
    tuitionName: currentUser.tuitionName || 'Setupclass Tuition Hub'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [settings, setSettings] = useState({
    attendanceReminders: true,
    feeReminders: true,
    classReminders: true,
    noticeAlerts: true
  });

  const handleToggle = (key) => (value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      name: currentUser.name || 'Sanjit',
      email: currentUser.email || 'sanjitpal1234@gmail.com',
      phone: currentUser.phone || '',
      tuitionName: currentUser.tuitionName || 'Setupclass Tuition Hub'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updatedProfile = {
        ...currentUser,
        ...editFormData
      };
      localStorage.setItem('tutorProfile', JSON.stringify(updatedProfile));
      setCurrentUser(updatedProfile);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem("tutorToken");
    localStorage.removeItem("tutorProfile");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  const unreadCount = (realNotifications || []).filter(n => !n.isRead).length;

  const getInitials = (name) => {
    if (!name) return 'SA';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const activeStudentsCount = students.filter(s => s.status === 'Active').length;

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-36">
      
      {/* ========================================================================= */}
      {/* 1. TOP MOBILE APP HEADER */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between relative z-10 pt-1 px-0.5">
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-red-500 active:scale-95 transition-all cursor-pointer flex-shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="min-w-0 truncate">
            <h1 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight truncate">
              Profile & Settings
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-none mt-0.5">
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-95 transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 stroke-[2] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-zinc-700 stroke-[2]" />
            )}
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-95 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5 stroke-[2]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-extrabold text-white bg-red-600 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TEACHER PROFILE HERO CARD (App-Style Glass Container) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-b from-white to-zinc-50 dark:from-[#101420] dark:to-[#0c0f18] rounded-[28px] p-5 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm space-y-4">
        
        {/* Subtle Ambient Red Glow in Background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-red-500/10 dark:bg-red-600/10 blur-3xl pointer-events-none" />

        {/* Top Profile Details Row */}
        <div className="flex items-center gap-4 relative z-10">
          
          {/* Glowing Circular Avatar with Verified Badge */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-heading font-extrabold text-white text-xl tracking-tight shadow-inner">
                {getInitials(currentUser.name)}
              </div>
            </div>
            {/* Online Status Dot */}
            <span className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#101420] shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          {/* Teacher Information */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white capitalize tracking-tight truncate">
                {currentUser.name || 'Sanjit'}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Teacher
              </span>
            </div>

            {/* Rating / Meta Line */}
            <div className="flex items-center gap-2 mt-1">
              <div className="inline-flex items-center gap-1 bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-extrabold border border-amber-500/20">
                <Star className="w-3 h-3 fill-current" />
                <span>4.9</span>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">(128 reviews)</span>
            </div>

            {/* Email Line */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
              <Mail className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="truncate">{currentUser.email || 'sanjitpal1234@gmail.com'}</span>
            </div>
          </div>

        </div>

        {/* Edit Profile Action Button */}
        <button
          onClick={handleOpenEditModal}
          className="w-full py-2.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 active:scale-[0.98] transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm relative z-10"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>

        {/* 2 Mini Stats Cards */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 relative z-10">
          
          {/* Card 1: Assigned Batches */}
          <div className="bg-zinc-50/80 dark:bg-[#151a26]/90 border border-zinc-200/70 dark:border-zinc-800/80 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:border-red-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider block leading-tight">
                ASSIGNED BATCHES
              </span>
              <span className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white block mt-0.5 leading-none">
                {batches.length}
              </span>
            </div>
          </div>

          {/* Card 2: Active Students */}
          <div className="bg-zinc-50/80 dark:bg-[#151a26]/90 border border-zinc-200/70 dark:border-zinc-800/80 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:border-blue-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider block leading-tight">
                ACTIVE STUDENTS
              </span>
              <span className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white block mt-0.5 leading-none">
                {activeStudentsCount}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. NOTIFICATION PREFERENCES (App-Style Grouped List) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#101420] rounded-[28px] p-5 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm space-y-3">
        
        {/* Card Title */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20 shadow-sm">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white">
            Notification Preferences
          </h3>
        </div>

        {/* 4 Preference Rows */}
        <div className="space-y-2.5">
          
          {/* Row 1: Attendance Reminders */}
          <div className="bg-zinc-50/90 dark:bg-[#151a26]/90 rounded-2xl p-3.5 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-between gap-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#101420] text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Attendance Reminders
                </p>
                <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Get notified when attendance is not marked for a class.
                </p>
              </div>
            </div>
            <Toggle enabled={settings.attendanceReminders} onChange={handleToggle('attendanceReminders')} />
          </div>

          {/* Row 2: Fee Reminders */}
          <div className="bg-zinc-50/90 dark:bg-[#151a26]/90 rounded-2xl p-3.5 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-between gap-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#101420] text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <IndianRupee className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Fee Reminders
                </p>
                <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Automatic notifications for pending and overdue tuition fees.
                </p>
              </div>
            </div>
            <Toggle enabled={settings.feeReminders} onChange={handleToggle('feeReminders')} />
          </div>

          {/* Row 3: Class Reminders */}
          <div className="bg-zinc-50/90 dark:bg-[#151a26]/90 rounded-2xl p-3.5 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-between gap-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#101420] text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Class Reminders
                </p>
                <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Receive an alert 15 minutes before scheduled lectures.
                </p>
              </div>
            </div>
            <Toggle enabled={settings.classReminders} onChange={handleToggle('classReminders')} />
          </div>

          {/* Row 4: Notice & Broadcast Alerts */}
          <div className="bg-zinc-50/90 dark:bg-[#151a26]/90 rounded-2xl p-3.5 border border-zinc-200/70 dark:border-zinc-800/80 flex items-center justify-between gap-3 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#101420] text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Notice & Broadcast Alerts
                </p>
                <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Notify immediately when an announcement is sent.
                </p>
              </div>
            </div>
            <Toggle enabled={settings.noticeAlerts} onChange={handleToggle('noticeAlerts')} />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. APPEARANCE & THEME (App-Style Visual Preview Cards) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#101420] rounded-[28px] p-5 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm space-y-4">
        
        {/* Card Title & Active Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20 shadow-sm">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
                Appearance & Theme
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Customize your interface visual style
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 uppercase tracking-wider">
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>

        {/* 2 Visual Preview Theme Cards */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          
          {/* Light Mode Preview Card */}
          <div 
            onClick={() => setTheme('light')}
            className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between overflow-hidden ${
              theme === 'light' 
                ? 'border-red-600 bg-red-50/40 dark:bg-zinc-800/90 shadow-md shadow-red-600/10' 
                : 'border-zinc-200/80 dark:border-zinc-800/90 bg-zinc-50/80 dark:bg-[#151a26]/80 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {/* Active Top-Right Badge */}
            {theme === 'light' && (
              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md z-10">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}

            {/* Mini UI Layout Mockup for Light Mode */}
            <div className="w-full h-16 rounded-xl bg-white border border-zinc-200 p-2 shadow-inner flex flex-col justify-between mb-3 overflow-hidden pointer-events-none">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  <div className="w-8 h-1.5 rounded-full bg-zinc-200" />
                </div>
                <div className="w-3 h-3 rounded bg-zinc-100" />
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="h-4 rounded bg-red-50 border border-red-100" />
                <div className="h-4 rounded bg-zinc-100" />
              </div>
            </div>

            {/* Label & Description */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-heading font-extrabold text-zinc-900 dark:text-white block">
                  Light Mode
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">
                  Clean & Bright
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <Sun className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Dark Mode Preview Card */}
          <div 
            onClick={() => setTheme('dark')}
            className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between overflow-hidden ${
              theme === 'dark' 
                ? 'border-red-600 bg-[#121622] shadow-[0_0_24px_rgba(239,68,68,0.25)]' 
                : 'border-zinc-200/80 dark:border-zinc-800/90 bg-zinc-50/80 dark:bg-[#151a26]/80 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {/* Active Top-Right Badge */}
            {theme === 'dark' && (
              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md z-10 shadow-red-600/50">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}

            {/* Mini UI Layout Mockup for Dark Mode */}
            <div className="w-full h-16 rounded-xl bg-[#090c14] border border-zinc-800 p-2 shadow-inner flex flex-col justify-between mb-3 overflow-hidden pointer-events-none">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                  <div className="w-8 h-1.5 rounded-full bg-zinc-700" />
                </div>
                <div className="w-3 h-3 rounded bg-zinc-800" />
              </div>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <div className="h-4 rounded bg-red-950/40 border border-red-500/30" />
                <div className="h-4 rounded bg-zinc-800/80" />
              </div>
            </div>

            {/* Label & Description */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-heading font-extrabold text-zinc-900 dark:text-white block">
                  Dark Mode
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">
                  OLED Deep Dark
                </span>
              </div>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Moon className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. ACCOUNT & SECURITY (Native Inset-Grouped List & Action Tiles) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#101420] rounded-[28px] p-5 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm space-y-4">
        
        {/* Card Title & Active Session Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
                Account & Security
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Session credentials & app controls
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Session
          </span>
        </div>

        {/* Grouped App Inset Tiles */}
        <div className="bg-zinc-50/90 dark:bg-[#151a26]/90 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 divide-y divide-zinc-200/60 dark:divide-zinc-800/80 overflow-hidden">
          
          {/* Tile 1: Primary Organization / Coaching Profile */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-800/60 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20 shadow-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white truncate leading-tight">
                  {currentUser.tuitionName || 'Setupclass Tuition Hub'}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate leading-tight">
                  Role: Master Administrator
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </button>

          {/* Tile 2: Password & Credentials */}
          <button
            type="button"
            onClick={handleOpenEditModal}
            className="w-full p-3.5 flex items-center justify-between gap-3 text-left hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-800/60 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20 shadow-sm">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white truncate leading-tight">
                  Password & Security
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate leading-tight">
                  Manage login credentials & security
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </button>

          {/* Tile 3: Current Device Session */}
          <div className="w-full p-3.5 flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-500/20 shadow-sm">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white truncate leading-tight">
                  Current Device Session
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate leading-tight">
                  Mobile App Client • Active
                </p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] flex-shrink-0" />
          </div>

        </div>

        {/* Polished Native Log Out Button */}
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 font-heading font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[2.4]" />
          <span>Log Out of Dashboard</span>
        </button>

        {/* App Version Tag */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800/80 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Setupclass Tuition Hub • v2.4.0</span>
          </div>
          <p className="text-[9px] text-zinc-400 dark:text-zinc-600 mt-1.5 font-medium">
            © 2026 Setupclass. All rights reserved.
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL (Adapts to Bottom Sheet on Mobile) */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-[#101420] border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button 
              onClick={() => setIsEditModalOpen(false)} 
              className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white mb-5">Edit Teacher Profile</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Teacher Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#0c0f18] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Tuition / Coaching Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.tuitionName}
                  onChange={e => setEditFormData({...editFormData, tuitionName: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#0c0f18] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#0c0f18] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={editFormData.phone}
                  onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-[#0c0f18] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>

              <div className="pt-4 pb-2 sm:pb-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NATIVE LOGOUT CONFIRMATION BOTTOM SHEET MODAL */}
      {/* ========================================================================= */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-[#101420] border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            {/* Top Sheet Handle */}
            <div className="w-12 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-5 sm:hidden" />
            
            <div className="text-center space-y-3">
              {/* Alert Icon */}
              <div className="w-14 h-14 rounded-full bg-red-500/15 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto shadow-inner">
                <LogOut className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <h3 className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white">
                  Log Out of Dashboard?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed px-2">
                  You will be signed out of your tutor dashboard on this device. You will need your login credentials to sign back in.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="flex-1 rounded-2xl bg-red-600 hover:bg-red-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer active:scale-95"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
