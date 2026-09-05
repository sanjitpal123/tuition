import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Users, Clock, Calendar, CheckSquare, IndianRupee, Plus, MoreHorizontal, Edit2, Trash2, X, BookOpenIcon } from 'lucide-react';

export default function Batches() {
  const { batches, addBatch, updateBatch, deleteBatch } = useData();
  
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
    <div className="space-y-5 pb-24">
      {/* Desktop Header */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
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

      {/* Mobile Floating Action Pill Button */}
      <button
        type="button"
        onClick={() => handleOpenModal()}
        className="sm:hidden fixed bottom-20 right-5 z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>Create Batch</span>
      </button>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <BookOpenIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Batches</p>
            <p className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-900 dark:text-white mt-0.5">{batches.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Students</p>
            <p className="text-xl sm:text-2xl font-heading font-extrabold text-zinc-900 dark:text-white mt-0.5">{totalStudents}</p>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avg Attendance</p>
            <p className="text-xl sm:text-2xl font-heading font-extrabold text-emerald-500 mt-0.5">{avgAttendance}%</p>
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
            <div className="p-4 sm:p-5 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold font-heading text-zinc-900 dark:text-white tracking-tight truncate">
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
            <div className="px-4 sm:px-5 py-3 bg-zinc-50/70 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
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

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.25rem + env(safe-area-inset-bottom, 0px))'
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
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

