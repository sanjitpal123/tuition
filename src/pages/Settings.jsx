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
  Star 
} from 'lucide-react';
import { Button } from '../components/ui/Button';

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      className={`${
        enabled 
          ? 'bg-red-600 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
          : 'bg-zinc-300 dark:bg-zinc-800'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span className="sr-only">Toggle setting</span>
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { batches, students, realNotifications } = useData();

  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('tutorProfile') || '{"name":"Sanjit","email":"sanjit@example.com","tuitionName":"Setupclass Tuition Hub"}');
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: currentUser.name || 'Sanjit',
    email: currentUser.email || 'sanjit@example.com',
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
      email: currentUser.email || 'sanjit@example.com',
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

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of your tutor dashboard?")) {
      localStorage.removeItem("tutorToken");
      localStorage.removeItem("tutorProfile");
      navigate("/login");
    }
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
      {/* MOBILE HEADER (Matches design screenshot) */}
      {/* ========================================================================= */}
      <div 
        className="flex items-center justify-between relative z-10 pt-1 px-1 sm:px-0"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#121622] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-red-500 active:scale-90 transition-all cursor-pointer flex-shrink-0"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div className="min-w-0 truncate">
            <h1 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight truncate">
              Profile & Settings
            </h1>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#121622] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
            title="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 stroke-[2] drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-zinc-700 stroke-[2]" />
            )}
          </button>

          <button
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 rounded-2xl bg-white dark:bg-[#121622] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
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
      {/* 1. TEACHER PROFILE HERO CARD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#101420] rounded-[28px] p-5 border border-zinc-200/80 dark:border-zinc-800/90 shadow-sm space-y-4">
        
        {/* Top Profile Details Row */}
        <div className="flex items-center gap-4">
          
          {/* Glowing Circular Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-[0_0_16px_rgba(239,68,68,0.4)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-heading font-extrabold text-white text-xl tracking-tight">
                {getInitials(currentUser.name)}
              </div>
            </div>
          </div>

          {/* Teacher Information */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white capitalize tracking-tight truncate">
                {currentUser.name || 'Sanjit'}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Teacher
              </span>
            </div>

            {/* Rating / Meta Line */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              <span className="text-red-500 font-bold">★</span>
              <span className="font-extrabold text-zinc-900 dark:text-white">4.9</span>
              <span className="text-zinc-400 dark:text-zinc-500">(128)</span>
            </div>

            {/* Email Line */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
              <Mail className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
              <span className="truncate">{currentUser.email || 'sanjit@example.com'}</span>
            </div>
          </div>

        </div>

        {/* Edit Profile Outline Button */}
        <button
          onClick={handleOpenEditModal}
          className="w-full py-2.5 px-4 rounded-2xl border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 active:scale-[0.99] transition-all font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>

        {/* Inner Metrics Matrix */}
        <div className="space-y-2.5 pt-1">
          {/* Top 2 Mini Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Assigned Batches */}
            <div className="bg-zinc-50 dark:bg-[#151a26] border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block leading-tight">
                  ASSIGNED BATCHES
                </span>
                <span className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white block mt-0.5 leading-none">
                  {batches.length}
                </span>
              </div>
            </div>

            {/* Active Students */}
            <div className="bg-zinc-50 dark:bg-[#151a26] border border-zinc-200/60 dark:border-zinc-800/80 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block leading-tight">
                  ACTIVE STUDENTS
                </span>
                <span className="text-lg font-heading font-extrabold text-zinc-900 dark:text-white block mt-0.5 leading-none">
                  {activeStudentsCount}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. NOTIFICATION PREFERENCES CARD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#101420] rounded-[28px] p-5 border border-zinc-200/80 dark:border-zinc-800/90 shadow-sm space-y-3">
        
        {/* Card Title */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white">
            Notification Preferences
          </h3>
        </div>

        {/* 4 Preference Rows */}
        <div className="space-y-2.5">
          
          {/* Row 1: Attendance Reminders */}
          <div className="bg-zinc-50 dark:bg-[#151a26] rounded-2xl p-3.5 border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900/90 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Attendance Reminders
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Get notified when attendance is not marked for a class.
                </p>
              </div>
            </div>
            <Toggle enabled={settings.attendanceReminders} onChange={handleToggle('attendanceReminders')} />
          </div>

          {/* Row 2: Fee Reminders */}
          <div className="bg-zinc-50 dark:bg-[#151a26] rounded-2xl p-3.5 border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900/90 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Fee Reminders
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Automatic notifications for pending and overdue tuition fees.
                </p>
              </div>
            </div>
            <Toggle enabled={settings.feeReminders} onChange={handleToggle('feeReminders')} />
          </div>

          {/* Row 3: Class Reminders */}
          <div className="bg-zinc-50 dark:bg-[#151a26] rounded-2xl p-3.5 border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900/90 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Class Reminders
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Receive an alert 15 minutes before scheduled lectures.
                </p>
              </div>
            </div>
            <Toggle enabled={settings.classReminders} onChange={handleToggle('classReminders')} />
          </div>

          {/* Row 4: Notice & Broadcast Alerts */}
          <div className="bg-zinc-50 dark:bg-[#151a26] rounded-2xl p-3.5 border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900/90 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 border border-zinc-200/60 dark:border-zinc-700/60">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-zinc-900 dark:text-white leading-tight">
                  Notice & Broadcast Alerts
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">
                  Notify immediately when an announcement is sent.
                </p>
              </div>
            </div>
            <Toggle enabled={settings.noticeAlerts} onChange={handleToggle('noticeAlerts')} />
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. APPEARANCE & THEME CARD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#101420] rounded-[28px] p-5 border border-zinc-200/80 dark:border-zinc-800/90 shadow-sm space-y-3">
        
        {/* Card Title */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white">
              Appearance & Theme
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Select your dashboard theme appearance.
          </p>
        </div>

        {/* 2 Selectable Cards */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          
          {/* Light Mode Selection Card */}
          <div 
            onClick={() => setTheme('light')}
            className={`relative p-5 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 ${
              theme === 'light' 
                ? 'border-red-600 bg-red-500/5 dark:bg-zinc-800/80 shadow-md shadow-red-950/10' 
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#151a26] hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {theme === 'light' && (
              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center mb-2.5 shadow-sm">
              <Sun className="w-6 h-6 text-amber-500 stroke-[2]" />
            </div>
            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
              Light Mode
            </span>
          </div>

          {/* Dark Mode Selection Card */}
          <div 
            onClick={() => setTheme('dark')}
            className={`relative p-5 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 ${
              theme === 'dark' 
                ? 'border-red-600 bg-[#121622] shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#151a26] hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {theme === 'dark' && (
              <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}

            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2.5 shadow-sm">
              <Moon className="w-6 h-6 text-indigo-400 stroke-[2]" />
            </div>
            <span className="text-xs font-extrabold text-zinc-900 dark:text-white">
              Dark Mode
            </span>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. ACCOUNT SESSION CARD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#101420] rounded-[28px] p-5 border border-zinc-200/80 dark:border-zinc-800/90 shadow-sm space-y-3">
        
        {/* Card Title */}
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white">
              Account Session
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Securely sign out of your tutor dashboard on this device.
          </p>
        </div>

        {/* Large Full-Width Red Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-heading font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-red-950/40 active:scale-[0.99] transition-all cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
          <span>Log Out</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* EDIT PROFILE MODAL (Adapts to Bottom Sheet on Mobile) */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button 
              onClick={() => setIsEditModalOpen(false)} 
              className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-5">Edit Teacher Profile</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Teacher Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Tuition / Coaching Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.tuitionName}
                  onChange={e => setEditFormData({...editFormData, tuitionName: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={editFormData.phone}
                  onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="pt-4 pb-2 sm:pb-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-500 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
