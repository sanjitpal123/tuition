import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import api from '../lib/api';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Filter,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Homework() {
  const { batches, students } = useData();
  const [homeworkList, setHomeworkList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'overdue'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    batchId: '',
    dueDate: '',
    description: ''
  });

  // Fetch homework assignments
  const fetchHomework = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/homework').catch(() => null);
      if (res && Array.isArray(res.data)) {
        setHomeworkList(res.data);
        localStorage.setItem('tutor_homework_cache', JSON.stringify(res.data));
      } else {
        const cached = localStorage.getItem('tutor_homework_cache');
        if (cached) {
          setHomeworkList(JSON.parse(cached));
        } else {
          setHomeworkList([]);
        }
      }
    } catch (err) {
      console.error('Failed to load homework:', err);
      const cached = localStorage.getItem('tutor_homework_cache');
      if (cached) setHomeworkList(JSON.parse(cached));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const handleCreateHomework = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subject || !formData.batchId || !formData.dueDate) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedBatch = batches.find(b => (b.id === formData.batchId || b._id === formData.batchId));
      const payload = {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        batchId: formData.batchId,
        batchName: selectedBatch?.name || 'Assigned Batch',
        dueDate: new Date(formData.dueDate).toISOString(),
        description: formData.description.trim(),
        createdAt: new Date().toISOString()
      };

      let createdItem = null;
      try {
        const res = await api.post('/homework', payload);
        createdItem = res.data;
      } catch (apiErr) {
        console.warn('Backend /homework endpoint not reachable, saving locally:', apiErr);
        createdItem = {
          ...payload,
          _id: 'hw_' + Date.now(),
          id: 'hw_' + Date.now()
        };
      }

      const updated = [createdItem, ...homeworkList];
      setHomeworkList(updated);
      localStorage.setItem('tutor_homework_cache', JSON.stringify(updated));

      setIsModalOpen(false);
      setFormData({
        title: '',
        subject: '',
        batchId: '',
        dueDate: '',
        description: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to assign homework.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this homework assignment?')) return;
    try {
      await api.delete(`/homework/${id}`).catch(() => null);
      const updated = homeworkList.filter(item => (item._id !== id && item.id !== id));
      setHomeworkList(updated);
      localStorage.setItem('tutor_homework_cache', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
      alert('Failed to delete homework assignment.');
    }
  };

  // Filtered List
  const now = new Date();
  const filteredHomework = useMemo(() => {
    return homeworkList.filter(item => {
      // Search Term
      const matchesSearch = 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Batch Filter
      if (selectedBatchFilter !== 'all') {
        const itemBatchId = typeof item.batchId === 'object' ? (item.batchId?._id || item.batchId?.id) : item.batchId;
        if (itemBatchId !== selectedBatchFilter) return false;
      }

      // Status Filter
      if (statusFilter !== 'all') {
        const isOverdue = item.dueDate && new Date(item.dueDate) < now;
        if (statusFilter === 'overdue' && !isOverdue) return false;
        if (statusFilter === 'pending' && isOverdue) return false;
      }

      return true;
    });
  }, [homeworkList, searchTerm, selectedBatchFilter, statusFilter, now]);

  // Overall Stats
  const overdueCount = useMemo(() => {
    return homeworkList.filter(item => item.dueDate && new Date(item.dueDate) < now).length;
  }, [homeworkList, now]);

  const activeCount = homeworkList.length - overdueCount;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-28">
      {/* Desktop Header */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Homework & Tasks</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Assign and manage homework assignments for your student batches.</p>
        </div>
        <div>
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Assign Homework</span>
          </Button>
        </div>
      </div>

      {/* Mobile Floating Action Pill Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-20 right-5 z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>Assign Homework</span>
      </button>

      {/* Top Metric Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 text-center sm:text-left transition-all">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Tasks</p>
            <p className="text-lg sm:text-2xl font-heading font-extrabold text-zinc-900 dark:text-white leading-tight mt-0.5">{homeworkList.length}</p>
          </div>
        </div>

        {/* Active Due */}
        <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 text-center sm:text-left transition-all">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Due</p>
            <p className="text-lg sm:text-2xl font-heading font-extrabold text-amber-500 leading-tight mt-0.5">{activeCount}</p>
          </div>
        </div>

        {/* Past Due */}
        <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-3 text-center sm:text-left transition-all">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Past Due</p>
            <p className="text-lg sm:text-2xl font-heading font-extrabold text-rose-500 leading-tight mt-0.5">{overdueCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Batch Filter Dropdown */}
        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium text-xs sm:text-sm rounded-xl px-4 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm cursor-pointer"
          >
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch.id || batch._id} value={batch.id || batch._id}>
                {batch.name} {batch.class ? `(${batch.class})` : ''}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Search Input */}
        <div className="flex-1 min-w-0">
          <Input 
            icon={Search} 
            placeholder="Search homework by title or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Homework Cards List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-9 h-9 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-3 text-red-500">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">No homework found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-sm">
              {searchTerm || selectedBatchFilter !== 'all' 
                ? "No assignments matching your selected filters." 
                : "You haven't assigned any homework yet. Click '+ Assign Homework' to create one."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredHomework.map(item => {
              const itemBatchId = typeof item.batchId === 'object' ? (item.batchId?._id || item.batchId?.id) : item.batchId;
              const batch = batches.find(b => (b.id === itemBatchId || b._id === itemBatchId));
              const batchName = item.batchName || batch?.name || 'Assigned Batch';
              const batchClass = batch?.class || '';

              const isOverdue = item.dueDate && new Date(item.dueDate) < now;

              return (
                <div 
                  key={item._id || item.id} 
                  className="group relative overflow-hidden bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Subject & Delete */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                          {item.subject}
                        </span>
                        <Badge variant={isOverdue ? 'danger' : 'warning'} className="text-[10px] font-extrabold uppercase tracking-wider">
                          {isOverdue ? 'Overdue' : 'Active Due'}
                        </Badge>
                      </div>

                      <button
                        onClick={() => handleDelete(item._id || item.id)}
                        className="p-1.5 -mr-1 -mt-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base sm:text-lg font-bold font-heading text-zinc-900 dark:text-white tracking-tight mt-1">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Meta Container */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 truncate">
                      <Users className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="font-semibold truncate">{batchName} {batchClass ? `(${batchClass})` : ''}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Homework Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.25rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-5">Assign New Homework</h2>
            
            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Exercise 4.2 Q1 to Q10"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mathematics"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Target Batch</label>
                <select
                  required
                  value={formData.batchId}
                  onChange={e => setFormData({...formData, batchId: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="" disabled>Select a batch</option>
                  {batches.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.name} {b.class ? `(${b.class})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Instructions & Details (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions, pages to read, or submission guidelines..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Homework'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
