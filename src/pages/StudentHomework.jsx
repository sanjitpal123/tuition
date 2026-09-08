import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  Maximize2, 
  Download, 
  X, 
  Building,
  ArrowLeft
} from 'lucide-react';

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
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-red-200 dark:border-red-950 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading homework assignments...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <Card className="p-8 border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900">
          <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-500 opacity-80" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Error Loading Homework</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{error || 'Something went wrong.'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
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

  const tuitionQuery = selectedTuitionId ? `?tuitionId=${selectedTuitionId}` : '';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
            <BookOpen size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">Homework & Tasks</h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Assignments and worksheets for {activeTuition?.name || 'your tuition'}
            </p>
          </div>
        </div>

        <Link
          to={`/student/dashboard${tuitionQuery}`}
          replace
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>

      {/* Tuition Selector Chips */}
      {tuitions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex-shrink-0 mr-1 flex items-center gap-1.5">
            <Building size={14} /> Tuition:
          </span>
          {tuitions.map((t) => {
            const isActive = (selectedTuitionId ? t.id === selectedTuitionId : t.id === activeTuition?.id);
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTuition(t.id)}
                type="button"
                className={`px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-red-300'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Homework List */}
      <div className="space-y-4">
        {homeworks.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20 text-zinc-500" />
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">No Homework Assigned</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              You are completely caught up! No active assignments found for this tuition.
            </p>
          </div>
        ) : (
          homeworks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
            return (
              <Card 
                key={task._id || task.id} 
                className="p-0 overflow-hidden shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900 flex flex-col md:flex-row hover:shadow-md transition-shadow"
              >
                <div className={`w-full md:w-3 h-2 md:h-auto flex-shrink-0 ${isOverdue ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-0.5 rounded-md mb-1.5 inline-block">
                          {task.subject || 'Assignment'}
                        </span>
                        <h3 className="font-bold text-xl text-zinc-900 dark:text-white">{task.title}</h3>
                      </div>
                      <Badge variant={isOverdue ? 'danger' : 'warning'} className="px-3 py-1 uppercase tracking-wider text-xs font-bold">
                        {isOverdue ? 'OVERDUE' : 'PENDING'}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}

                    {task.imageUrl && (
                      <div 
                        className="mt-4 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group cursor-pointer max-w-md"
                        onClick={() => setViewingImage({ url: task.imageUrl, title: task.title })}
                      >
                        <img 
                          src={task.imageUrl} 
                          alt="Homework Attachment" 
                          className="w-full max-h-60 object-cover group-hover:scale-105 transition-transform duration-200" 
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[2px]">
                          <Maximize2 className="w-4 h-4" />
                          <span>Click to preview image</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs sm:text-sm font-medium">
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                      <Clock size={16} className={isOverdue ? 'text-red-500' : 'text-amber-500'} />
                      <span className={isOverdue ? 'text-red-600 dark:text-red-500 font-semibold' : 'text-zinc-700 dark:text-zinc-300'}>
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                      </span>
                    </div>
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
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div 
            className="w-full max-w-4xl flex items-center justify-between text-white px-2 pt-2 sm:pt-0"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-sm font-bold truncate max-w-[220px] sm:max-w-md">
              {viewingImage.title || 'Homework Image'}
            </span>
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
                title="Close"
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
