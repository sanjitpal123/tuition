import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Megaphone, Plus, Search, Users, X, Send } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';

export default function Announcements() {
  const { batches, students, notifications: announcements, refreshData } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'all',
    targetId: '',
    audience: 'both'
  });

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    setFormData({ title: '', message: '', targetType: 'all', targetId: '', audience: 'both' });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'targetType') {
      setFormData(prev => ({ ...prev, targetId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { ...formData };
      if (!payload.targetId) {
        delete payload.targetId;
      }
      await api.post('/announcements', payload);
      await refreshData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create announcement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetName = (a) => {
    if (a.targetType === 'all') return 'All Students';
    if (a.targetType === 'batch') {
      return batches.find(b => b.id === a.targetId || b._id === a.targetId)?.name || 'Batch';
    }
    if (a.targetType === 'student') {
      return students.find(s => s.id === a.targetId || s._id === a.targetId)?.name || 'Student';
    }
    return 'Unknown';
  };

  const getAudienceName = (a) => {
    if (a.audience === 'students') return 'Students';
    if (a.audience === 'parents') return 'Parents';
    return 'Students & Parents';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      {/* Header */}
      <div className="hidden sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Announcements</h1>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Broadcast messages to students, parents, or specific batches.</p>
        </div>
        <Button onClick={handleOpenModal} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Mobile Floating Action Pill Button */}
      <button
        type="button"
        onClick={handleOpenModal}
        style={{
          bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
          right: '1.25rem'
        }}
        className="sm:hidden fixed z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>New Notice</span>
      </button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
        <Input 
          type="text" 
          placeholder="Search announcements..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 w-full sm:w-96"
        />
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card className="bg-white/40 dark:bg-zinc-900/40 border-dashed border-black/10 dark:border-white/10">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">No announcements found</h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 text-center max-w-md mb-6">
                Keep everyone in the loop! Send your first announcement to students or parents.
              </p>
              <Button onClick={handleOpenModal} variant="outline">Create Announcement</Button>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement._id || announcement.id} className="hover:border-black/10 dark:border-white/10 transition-colors">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="hidden sm:flex mt-1 w-10 h-10 rounded-full bg-indigo-500/10 items-center justify-center shrink-0">
                      <Megaphone className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{announcement.title}</h3>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed whitespace-pre-wrap">{announcement.message}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        <Badge variant="secondary" className="flex items-center bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          <Users className="w-3 h-3 mr-1" />
                          {getTargetName(announcement)}
                        </Badge>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">•</span>
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">To: {getAudienceName(announcement)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4 hidden sm:block">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{format(new Date(announcement.createdAt || new Date()), 'MMM dd, yyyy')}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{format(new Date(announcement.createdAt || new Date()), 'hh:mm a')}</p>
                  </div>
                </div>
                {/* Mobile Date Display */}
                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between sm:hidden">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{format(new Date(announcement.createdAt || new Date()), 'MMM dd, yyyy')}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">{format(new Date(announcement.createdAt || new Date()), 'hh:mm a')}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5 shrink-0">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
                <Send className="w-5 h-5 mr-2 text-indigo-400" />
                Send Announcement
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="announcement-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Announcement Title</label>
                  <Input 
                    name="title" 
                    required 
                    placeholder="e.g. Test Tomorrow, Class Cancelled"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Message</label>
                  <textarea 
                    name="message"
                    required
                    rows={4}
                    placeholder="Type your message here..."
                    className="w-full bg-white/50 dark:bg-zinc-950/50 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Target</label>
                    <select
                      name="targetType"
                      className="w-full bg-white/50 dark:bg-zinc-950/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.targetType}
                      onChange={handleChange}
                    >
                      <option value="all">All Students</option>
                      <option value="batch">Specific Batch</option>
                      <option value="student">Specific Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Audience</label>
                    <select
                      name="audience"
                      className="w-full bg-white/50 dark:bg-zinc-950/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.audience}
                      onChange={handleChange}
                    >
                      <option value="both">Students & Parents</option>
                      <option value="students">Only Students</option>
                      <option value="parents">Only Parents</option>
                    </select>
                  </div>
                </div>

                {formData.targetType === 'batch' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Select Batch</label>
                    <select
                      name="targetId"
                      required
                      className="w-full bg-white/50 dark:bg-zinc-950/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.targetId}
                      onChange={handleChange}
                    >
                      <option value="">Select a batch...</option>
                      {batches.map(b => (
                        <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.targetType === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Select Student</label>
                    <select
                      name="targetId"
                      required
                      className="w-full bg-white/50 dark:bg-zinc-950/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.targetId}
                      onChange={handleChange}
                    >
                      <option value="">Select a student...</option>
                      {students.map(s => (
                        <option key={s.id || s._id} value={s.id || s._id}>{s.name} ({s.batchName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-6 border-t border-black/5 dark:border-white/5 flex justify-end space-x-3 bg-white/50 dark:bg-zinc-900/50 shrink-0 rounded-b-2xl">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" form="announcement-form" className="bg-indigo-600 hover:bg-indigo-700 text-white border-0" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Announcement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
