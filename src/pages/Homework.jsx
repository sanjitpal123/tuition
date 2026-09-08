import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
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
  User,
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
  Sun,
  Moon,
  Bell,
  Camera,
  Image as ImageIcon,
  Maximize2,
  Download,
  UploadCloud
} from 'lucide-react';
import { format } from 'date-fns';

export default function Homework() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { batches, students, realNotifications } = useData();
  const [homeworkList, setHomeworkList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'overdue'

  const unreadNotificationsCount = realNotifications?.filter(n => !n.read)?.length || 0;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    batchId: '',
    dueDate: '',
    description: '',
    image: null
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG, WEBP)');
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = (e) => {
    if (e) e.stopPropagation();
    setFormData(prev => ({ ...prev, image: null }));
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData({
      title: '',
      subject: '',
      batchId: '',
      dueDate: '',
      description: '',
      image: null
    });
  };

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
      
      const payloadData = new FormData();
      payloadData.append('title', formData.title.trim());
      payloadData.append('subject', formData.subject.trim());
      payloadData.append('batchId', formData.batchId);
      payloadData.append('batchName', selectedBatch?.name || 'Assigned Batch');
      payloadData.append('dueDate', new Date(formData.dueDate).toISOString());
      if (formData.description) payloadData.append('description', formData.description.trim());
      payloadData.append('createdAt', new Date().toISOString());
      
      if (formData.image) {
        payloadData.append('image', formData.image);
      }

      let createdItem = null;
      try {
        const res = await api.post('/homework', payloadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        createdItem = res.data;
      } catch (apiErr) {
        console.warn('Backend /homework endpoint not reachable, saving locally:', apiErr);
        createdItem = {
          title: formData.title.trim(),
          subject: formData.subject.trim(),
          batchId: formData.batchId,
          batchName: selectedBatch?.name || 'Assigned Batch',
          dueDate: new Date(formData.dueDate).toISOString(),
          description: formData.description.trim(),
          createdAt: new Date().toISOString(),
          _id: 'hw_' + Date.now(),
          id: 'hw_' + Date.now(),
          imageUrl: imagePreview || (formData.image ? URL.createObjectURL(formData.image) : null)
        };
      }

      const updated = [createdItem, ...homeworkList];
      setHomeworkList(updated);
      localStorage.setItem('tutor_homework_cache', JSON.stringify(updated));

      handleCloseModal();
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
    <div className="max-w-5xl mx-auto">
      
      {/* ========================================================================= */}
      {/* MOBILE VIEW (Visible on md:hidden) */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-4 pb-28">

        {/* 1. Mobile Top Header Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm active:scale-95 transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none">
                Homework & Tasks
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-none">
                Track and manage all homework & tasks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-zinc-700" />
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="relative w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95 transition-all"
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

        {/* 2. Top 3 Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: Total Tasks */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800/80 border-b-2 border-b-rose-500 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center mb-1">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              TOTAL TASKS
            </span>
            <span className="text-xl font-heading font-extrabold text-zinc-900 dark:text-white mt-0.5">
              {homeworkList.length}
            </span>
          </div>

          {/* Card 2: Active Due */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800/80 border-b-2 border-b-amber-500 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              ACTIVE DUE
            </span>
            <span className="text-xl font-heading font-extrabold text-amber-500 mt-0.5">
              {activeCount}
            </span>
          </div>

          {/* Card 3: Past Due */}
          <div className="bg-white dark:bg-[#101420] rounded-2xl p-3 border border-zinc-200/80 dark:border-zinc-800/80 border-b-2 border-b-rose-500 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-1">
              <AlertCircle className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              PAST DUE
            </span>
            <span className="text-xl font-heading font-extrabold text-rose-500 mt-0.5">
              {overdueCount}
            </span>
          </div>
        </div>

        {/* 3. Batch Selector Dropdown Box */}
        <div className="relative">
          <div className="w-full bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3.5 py-3 flex items-center justify-between shadow-sm cursor-pointer">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
              {selectedBatchFilter === 'all' 
                ? 'All Batches' 
                : (batches.find(b => (b.id === selectedBatchFilter || b._id === selectedBatchFilter))?.name || 'Selected Batch')}
            </span>
            <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none flex-shrink-0" />
          </div>
          <select
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          >
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch.id || batch._id} value={batch.id || batch._id}>
                {batch.name} {batch.class ? `(${batch.class})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Search Bar with Filter Icon */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3.5 py-2.5 shadow-sm">
            <Search className="w-4 h-4 text-zinc-400 flex-shrink-0 mr-2.5" />
            <input
              type="text"
              placeholder="Search homework by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none truncate pr-1"
            />
          </div>

          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shadow-sm active:scale-95 transition-all flex-shrink-0"
            title="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 5. Homework Cards List */}
        <div className="space-y-3 pt-1">
          {filteredHomework.map((item) => {
            const itemBatchId = typeof item.batchId === 'object' ? (item.batchId?._id || item.batchId?.id) : item.batchId;
            const batch = batches.find(b => (b.id === itemBatchId || b._id === itemBatchId));
            const batchName = item.batchName || batch?.name || 'sanjit';
            const isOverdue = item.dueDate && new Date(item.dueDate) < now;
            const formattedDue = item.dueDate 
              ? format(new Date(item.dueDate), 'MMM dd') 
              : 'No due date';

            return (
              <div
                key={item._id || item.id}
                className="bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 space-y-2.5 shadow-sm"
              >
                {/* Top Badges & Delete Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-red-500/15 text-red-600 dark:text-red-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-500/20 uppercase tracking-wider">
                      {item.subject}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      isOverdue 
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                      {isOverdue ? 'PAST DUE' : 'ACTIVE DUE'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id || item.id)}
                    className="w-8 h-8 rounded-xl bg-zinc-50 dark:bg-[#0c0f17] border border-zinc-200/80 dark:border-zinc-800 text-zinc-400 hover:text-red-500 flex items-center justify-center active:scale-95 transition-all"
                    title="Delete Homework"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-base font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {item.title}
                </h3>

                {/* Description / Instructions */}
                {item.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                {/* Image Attachment */}
                {item.imageUrl && (
                  <div 
                    className="mt-2 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group cursor-pointer"
                    onClick={() => setViewingImage({ url: item.imageUrl, title: item.title })}
                  >
                    <img src={item.imageUrl} alt="Homework Attachment" className="w-full max-h-44 object-cover group-hover:scale-105 transition-transform duration-200" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]">
                      <Maximize2 className="w-4 h-4" />
                      <span>Click to view full image</span>
                    </div>
                  </div>
                )}

                {/* Bottom Metadata: Batch & Due Date */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-semibold">
                    <User className="w-3.5 h-3.5 text-red-500" />
                    <span>{batchName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {formattedDue}</span>
                  </div>
                </div>

              </div>
            );
          })}

          {filteredHomework.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-[#101420] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-6">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                No homework tasks found matching your search.
              </p>
            </div>
          )}
        </div>

        {/* 6. Floating Action Button (`+ Assign Homework`) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
            right: '1.25rem'
          }}
          className="fixed z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-5 w-5 stroke-[2.5]" />
          <span>Assign Homework</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* DESKTOP VIEW (Visible on md: and up) */}
      {/* ========================================================================= */}
      <div className="hidden md:block space-y-6 pb-20">
        {/* Desktop Header */}
        <div className="flex items-center justify-between">
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

        {/* Top Metric Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Tasks</p>
                <p className="text-2xl font-heading font-extrabold text-zinc-900 dark:text-white mt-0.5">{homeworkList.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Due</p>
                <p className="text-2xl font-heading font-extrabold text-amber-500 mt-0.5">{activeCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Past Due</p>
                <p className="text-2xl font-heading font-extrabold text-rose-500 mt-0.5">{overdueCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="w-64">
            <select
              value={selectedBatchFilter}
              onChange={(e) => setSelectedBatchFilter(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm cursor-pointer"
            >
              <option value="all">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id || batch._id} value={batch.id || batch._id}>
                  {batch.name} {batch.class ? `(${batch.class})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 max-w-sm">
            <Input 
              icon={Search} 
              placeholder="Search homework by title or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop Homework Cards List */}
        <div className="grid grid-cols-2 gap-4">
          {filteredHomework.map(item => {
            const itemBatchId = typeof item.batchId === 'object' ? (item.batchId?._id || item.batchId?.id) : item.batchId;
            const batch = batches.find(b => (b.id === itemBatchId || b._id === itemBatchId));
            const batchName = item.batchName || batch?.name || 'Assigned Batch';
            const isOverdue = item.dueDate && new Date(item.dueDate) < now;

            return (
              <Card key={item._id || item.id} className="border border-zinc-200 dark:border-zinc-800 border-l-4 border-l-red-500 shadow-sm">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                          {item.subject}
                        </span>
                        <Badge variant={isOverdue ? 'danger' : 'warning'} className="text-[10px] font-extrabold uppercase tracking-wider">
                          {isOverdue ? 'Past Due' : 'Active Due'}
                        </Badge>
                      </div>

                      <button
                        onClick={() => handleDelete(item._id || item.id)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold font-heading text-zinc-900 dark:text-white tracking-tight mt-1">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 line-clamp-3">
                        {item.description}
                      </p>
                    )}

                    {/* Image Attachment */}
                    {item.imageUrl && (
                      <div 
                        className="mt-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group cursor-pointer"
                        onClick={() => setViewingImage({ url: item.imageUrl, title: item.title })}
                      >
                        <img src={item.imageUrl} alt="Homework Attachment" className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]">
                          <Maximize2 className="w-4 h-4" />
                          <span>Click to view full image</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-semibold">
                      <Users className="w-3.5 h-3.5 text-red-500" />
                      <span>{batchName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Due: {item.dueDate ? format(new Date(item.dueDate), 'MMM dd, yyyy') : 'No date'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button 
              onClick={handleCloseModal} 
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Attach Photo / Worksheet (Optional)
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 p-2.5">
                    <div className="relative rounded-xl overflow-hidden max-h-48 flex items-center justify-center bg-zinc-900/10 dark:bg-zinc-950/40">
                      <img 
                        src={imagePreview} 
                        alt="Selected Homework Preview" 
                        className="w-full max-h-48 object-contain rounded-lg cursor-pointer"
                        onClick={() => setViewingImage({ url: imagePreview, title: formData.title || 'Selected Photo' })}
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingImage({ url: imagePreview, title: formData.title || 'Selected Photo' })}
                          className="bg-black/60 hover:bg-black/80 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-md transition-all shadow-sm"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/90 hover:bg-white text-zinc-900 dark:bg-zinc-800/90 dark:text-white dark:hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 backdrop-blur-md transition-all shadow-sm"
                        >
                          <Camera className="w-3.5 h-3.5 text-red-500" />
                          <span>Change</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1 pt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="truncate max-w-[200px] font-semibold text-zinc-700 dark:text-zinc-300">
                        {formData.image?.name || 'Attached photo'}
                      </span>
                      <span className="font-mono">
                        {formData.image?.size ? (formData.image.size / (1024 * 1024)).toFixed(2) + ' MB' : ''}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-4 text-center cursor-pointer bg-zinc-50/60 dark:bg-zinc-800/40 hover:bg-red-50/20 dark:hover:bg-red-950/10 transition-all flex flex-col items-center justify-center gap-2 group active:scale-[0.99]"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Click to upload photo or take picture
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        PNG, JPG, JPEG, WEBP up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
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

      {/* ========================================================================= */}
      {/* FULL SCREEN IMAGE LIGHTBOX VIEWER */}
      {/* ========================================================================= */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          {/* Top Header Bar */}
          <div 
            className="w-full max-w-4xl flex items-center justify-between text-white px-2 pt-2 sm:pt-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold truncate max-w-[220px] sm:max-w-md">
                {viewingImage.title || 'Homework Image'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={viewingImage.url} 
                download={viewingImage.title || 'homework-image'}
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Open in new tab / Download"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Save / Open</span>
              </a>
              <button
                type="button"
                onClick={() => setViewingImage(null)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image */}
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

          {/* Bottom Bar Info */}
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
