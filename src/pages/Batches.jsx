import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  Users, 
  Clock, 
  Calendar, 
  CheckSquare, 
  IndianRupee, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  BookOpen, 
  ArrowLeft,
  Sun,
  Moon,
  Bell,
  TrendingUp,
  ChevronRight
} from 'lucide-react';

export default function Batches() {
  const { batches, addBatch, updateBatch, deleteBatch, realNotifications } = useData();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    subjects: '',
    fee: '',
  });

  const avgAttendance = batches.length > 0 ? Math.round(batches.reduce((acc, b) => acc + (b.attendanceAvg || 0), 0) / batches.length) : 0;
  const totalStudents = batches.reduce((acc, b) => acc + (b.studentsCount || 0), 0);
  const unreadNotificationsCount = (realNotifications || []).filter(n => !n.isRead).length;

  // Arc length is ~200 for 360 circle (radius 32: 2 * pi * 32 = 201)
  const circleCircumference = 201;
  const circleOffset = Math.max(0, circleCircumference - (circleCircumference * avgAttendance) / 100);

  const handleOpenModal = (batch = null) => {
    if (batch) {
      setEditingId(batch.id);
      setFormData({
        name: batch.name || '',
        class: batch.class || '',
        subjects: batch.subjects ? batch.subjects.join(', ') : '',
        fee: batch.fee || '',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', class: '', subjects: '', fee: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      ...formData,
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      fee: Number(formData.fee)
    };

    try {
      if (editingId) {
        await updateBatch(editingId, payload);
      } else {
        await addBatch({
          ...payload,
          studentsCount: 0,
          attendanceAvg: 100, // Default for new
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving batch:", error);
      alert("Failed to save batch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      deleteBatch(id);
    }
  };

  return (
    <div className="space-y-5 pb-32">
      
      {/* ========================================================================= */}
      {/* MOBILE SPECIFIC VIEW (< md) - Matched to provided screenshot */}
      {/* ========================================================================= */}
      <div className="block md:hidden space-y-4 px-1">
        
        {/* Top Header Row with Back Button, Title, and Action Controls */}
        <div 
          className="flex items-center justify-between relative z-10 pt-1"
          style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex items-center space-x-3 min-w-0">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-red-500 active:scale-90 transition-all cursor-pointer flex-shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div className="min-w-0 truncate">
              <h2 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight truncate">
                Batches
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight truncate mt-0.5">
                Manage all your batches
              </p>
            </div>
          </div>

          {/* Theme & Notifications */}
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
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
              className="relative w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-red-500 active:scale-90 transition-all cursor-pointer"
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

        {/* 1. Top 2 Metric Cards (TOTAL BATCHES & TOTAL STUDENTS) */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: TOTAL BATCHES */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#18121a] dark:to-[#110b13] rounded-3xl p-4 border border-zinc-200/80 dark:border-red-500/20 shadow-sm relative overflow-hidden flex flex-col justify-between h-[126px]">
            {/* Watermark Icon */}
            <BookOpen className="absolute -right-2 -bottom-2 w-16 h-16 text-red-500/5 dark:text-red-500/10 pointer-events-none stroke-[1.2]" />
            
            <div className="flex items-center space-x-2.5 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center flex-shrink-0 shadow-sm border border-red-500/20">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block leading-none">
                  Total
                </span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide block leading-tight mt-0.5">
                  Batches
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <span className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none block">
                {batches.length}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold mt-1.5">
                <TrendingUp className="w-2.5 h-2.5 inline flex-shrink-0" /> +{batches.length} active
              </span>
            </div>
          </div>

          {/* Card 2: TOTAL STUDENTS */}
          <div className="bg-white dark:bg-gradient-to-br dark:from-[#121824] dark:to-[#0b101c] rounded-3xl p-4 border border-zinc-200/80 dark:border-blue-500/20 shadow-sm relative overflow-hidden flex flex-col justify-between h-[126px]">
            {/* Watermark Icon */}
            <Users className="absolute -right-2 -bottom-2 w-16 h-16 text-blue-500/5 dark:text-blue-500/10 pointer-events-none stroke-[1.2]" />

            <div className="flex items-center space-x-2.5 relative z-10">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-500/20">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block leading-none">
                  Total
                </span>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide block leading-tight mt-0.5">
                  Students
                </span>
              </div>
            </div>

            <div className="relative z-10">
              <span className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-white leading-none block">
                {totalStudents}
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold mt-1.5">
                <TrendingUp className="w-2.5 h-2.5 inline flex-shrink-0" /> +{totalStudents} enrolled
              </span>
            </div>
          </div>

        </div>

        {/* 2. Attendance Insight Hero Card (Neon Green Theme) */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-[#0d1d18] dark:to-[#081410] rounded-3xl p-4 sm:p-5 border border-zinc-200/80 dark:border-emerald-500/25 shadow-md flex items-center justify-between relative overflow-hidden">
          {/* Ambient green glow */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left Column */}
          <div className="relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-sm">
              <CheckSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-wider block mt-2.5">
              AVG ATTENDANCE
            </span>
            <span className="text-2xl font-heading font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mt-1 block">
              {avgAttendance}%
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold mt-2 border border-emerald-500/20">
              <TrendingUp className="w-3 h-3" /> {avgAttendance}% this month
            </span>
          </div>

          {/* Right Column: Circular Ring Progress Gauge */}
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
              {/* Background Track Circle */}
              <circle
                cx="38"
                cy="38"
                r="32"
                fill="none"
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-800"
                strokeWidth="6"
              />
              {/* Active Emerald Progress Ring */}
              <circle
                cx="38"
                cy="38"
                r="32"
                fill="none"
                stroke="#10b981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="201"
                strokeDashoffset={circleOffset}
                className="drop-shadow-[0_0_6px_rgba(16,185,129,0.7)] transition-all duration-500"
              />
            </svg>

            {/* Glowing Indicator Dot on Top of Ring */}
            <div className="absolute top-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />

            {/* Centered Text inside Gauge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white leading-none">
                {avgAttendance}%
              </span>
              <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-400 leading-tight mt-0.5">
                Attendance
              </span>
            </div>
          </div>

        </div>

        {/* 3. Batches Cards List */}
        <div className="space-y-3 pt-1">
          {batches.map((batch) => (
            <div 
              key={batch.id} 
              className="bg-white dark:bg-[#121622] rounded-[24px] p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-3.5 transition-all"
            >
              {/* Top Row: Batch Name & Action Buttons */}
              <div className="flex items-center justify-between">
                <h3 className="text-base font-heading font-extrabold text-zinc-900 dark:text-white capitalize tracking-tight truncate">
                  {batch.name}
                </h3>

                <div className="flex items-center space-x-1.5 flex-shrink-0 ml-2">
                  <button 
                    onClick={() => handleOpenModal(batch)} 
                    className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                    title="Edit Batch"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(batch.id)} 
                    className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                    title="Delete Batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Middle Row: Enrolled Students Clickable Pill */}
              <div 
                onClick={() => navigate('/students')}
                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-[#181d2a] hover:bg-zinc-100/80 dark:hover:bg-[#1e2436] border border-zinc-200/60 dark:border-zinc-800/60 cursor-pointer active:scale-[0.99] transition-all"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                    {batch.studentsCount || 0} Students Enrolled
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
              </div>

              {/* Bottom Row: Attendance & Monthly Fee */}
              <div className="grid grid-cols-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 items-center">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    ATTENDANCE
                  </span>
                  <span className="text-xs font-extrabold text-amber-500 mt-0.5 block">
                    {batch.attendanceAvg || 0}% Avg
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    MONTHLY FEE
                  </span>
                  <span className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white mt-0.5 block">
                    ₹{(Number(batch.fee) || 0).toLocaleString()}<span className="text-[10px] font-normal text-zinc-400">/mo</span>
                  </span>
                </div>
              </div>

            </div>
          ))}

          {batches.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#121622] rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80 p-6">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No batches created yet.</p>
              <Button onClick={() => handleOpenModal()} className="mt-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs">
                Create First Batch
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on md: and up) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Batches</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage your batches, student assignments, and schedules.</p>
          </div>
          <div>
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white shadow-sm font-semibold">
              <Plus className="w-4 h-4" />
              <span>Create Batch</span>
            </Button>
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Batches</p>
              <p className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-white mt-0.5">{batches.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Students</p>
              <p className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-white mt-0.5">{totalStudents}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avg Attendance</p>
              <p className="text-2xl font-heading font-extrabold text-emerald-500 mt-0.5">{avgAttendance}%</p>
            </div>
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {batches.map((batch) => (
            <div 
              key={batch.id} 
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Card Top */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold font-heading text-zinc-900 dark:text-white tracking-tight truncate">
                        {batch.name}
                      </h3>
                      {batch.class && (
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
                          {batch.class}
                        </span>
                      )}
                    </div>

                    {/* Subject Chips */}
                    {batch.subjects && batch.subjects.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        {batch.subjects.map((sub, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button 
                      onClick={() => handleOpenModal(batch)} 
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      title="Edit Batch"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(batch.id)} 
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      title="Delete Batch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Student Enrolled Pill */}
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>{batch.studentsCount || 0} Students Enrolled</span>
                </div>
              </div>

              {/* Card Bottom Meta Bar */}
              <div className="px-5 py-3 bg-zinc-50/70 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Attendance</span>
                  <span className={`text-xs font-bold mt-0.5 ${(batch.attendanceAvg || 0) >= 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {batch.attendanceAvg || 0}% Avg
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Monthly Fee</span>
                  <span className="text-sm font-heading font-extrabold text-zinc-900 dark:text-white mt-0.5">
                    ₹{(Number(batch.fee) || 0).toLocaleString()}<span className="text-[10px] font-normal text-zinc-400">/mo</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Pill Button on Mobile */}
      <button
        type="button"
        onClick={() => handleOpenModal()}
        style={{
          bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
          right: '1.25rem'
        }}
        className="md:hidden fixed z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>Create Batch</span>
      </button>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button onClick={handleCloseModal} className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{editingId ? 'Edit Batch' : 'Create Batch'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Batch Name</label>
                <input 
                  required
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Class/Grade</label>
                  <input 
                    required
                    type="text" 
                    name="class" 
                    value={formData.class} 
                    onChange={handleChange}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Subjects (comma separated)</label>
                  <input 
                    required
                    type="text" 
                    name="subjects" 
                    value={formData.subjects} 
                    onChange={handleChange}
                    className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Monthly Fee (₹)</label>
                <input 
                  required
                  type="number" 
                  name="fee" 
                  value={formData.fee} 
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
              
              <div className="pt-6 pb-4 sm:pb-0 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Batch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
