import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  BookOpen, 
  Clock, 
  AlertCircle, 
  Maximize2, 
  Download, 
  X, 
  Building
} from 'lucide-react';
import { HomeworkSkeleton } from '../components/ui/Skeleton';

export default function StudentHomework() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTuitionId = searchParams.get('tuitionId');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingImage, setViewingImage] = useState(null);
  
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const url = selectedTuitionId 
          ? `/student-auth/dashboard?tuitionId=${selectedTuitionId}`
          : `/student-auth/dashboard`;
        const response = await studentApi.get(url);
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch homework');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedTuitionId]);

  const handleSelectTuition = (tuitionId) => {
    setSearchParams(tuitionId ? { tuitionId } : {}, { replace: true });
  };

  if (loading) {
    return <HomeworkSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <Card className="p-6 border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500 opacity-80" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Error Loading Homework</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">{error || 'Something went wrong.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors text-xs"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  const tuitions = data?.tuitions || [];
  const activeTuition = tuitions.find(t => t.id === selectedTuitionId) || tuitions[0] || null;
  const homeworks = data.homework || data.homeworks || [];

  return (
    <div className="px-3.5 sm:px-6 py-3 pb-24 max-w-5xl mx-auto space-y-4 font-sans">
      
      {/* Tuition Selector Chips */}
      {tuitions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1.5">
            <Building size={13} /> Tuition:
          </span>
          {tuitions.map((t) => {
            const isActive = (selectedTuitionId ? t.id === selectedTuitionId : t.id === activeTuition?.id);
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTuition(t.id)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Homework List */}
      <div className="space-y-3">
        {homeworks.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20 text-zinc-500" />
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No Homework Assigned</h3>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-sm mx-auto">
              You're completely caught up! No active tasks found.
            </p>
          </div>
        ) : (
          homeworks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
            return (
              <Card 
                key={task._id || task.id} 
                className={`p-4 sm:p-5 shadow-2xs border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900 space-y-3 border-l-4 ${isOverdue ? 'border-l-red-500' : 'border-l-purple-500'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md inline-block mb-1">
                      {task.subject || 'Assignment'}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white leading-snug">{task.title}</h3>
                  </div>
                  <Badge variant={isOverdue ? 'danger' : 'warning'} className="px-2 py-0.5 uppercase text-[9px] font-black tracking-wider flex-shrink-0">
                    {isOverdue ? 'OVERDUE' : 'PENDING'}
                  </Badge>
                </div>

                {task.description && (
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}

                {task.imageUrl && (
                  <div 
                    className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group cursor-pointer max-h-48"
                    onClick={() => setViewingImage({ url: task.imageUrl, title: task.title })}
                  >
                    <img 
                      src={task.imageUrl} 
                      alt="Homework Attachment" 
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200" 
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]">
                      <Maximize2 className="w-4 h-4" />
                      <span>Preview image</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
                    <Clock size={13} className={isOverdue ? 'text-red-500' : 'text-amber-500'} />
                    <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Full screen Lightbox viewer */}
      {viewingImage && (
        <div 
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div 
            className="w-full max-w-4xl flex items-center justify-between text-white px-2 pt-2"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-sm font-bold truncate max-w-[220px]">
              {viewingImage.title || 'Homework Image'}
            </span>
            <div className="flex items-center gap-2">
              <a 
                href={viewingImage.url} 
                download={viewingImage.title || 'homework-image'}
                target="_blank" 
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
              >
                <Download className="w-4 h-4" /> Save
              </a>
              <button
                type="button"
                onClick={() => setViewingImage(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

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
        </div>
      )}

    </div>
  );
}
