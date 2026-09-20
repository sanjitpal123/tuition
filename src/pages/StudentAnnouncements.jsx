import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Megaphone, AlertCircle, Calendar, Building, BellRing } from 'lucide-react';
import { AnnouncementsSkeleton } from '../components/ui/Skeleton';

export default function StudentAnnouncements() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTuitionId = searchParams.get('tuitionId');

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
        setError(err.response?.data?.message || 'Failed to fetch announcements');
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
    return <AnnouncementsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center">
        <Card className="p-6 border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500 opacity-80" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Error Loading Notices</h2>
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
  const announcements = data.announcements || [];

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

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
            <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-20 text-zinc-500" />
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">No Notice Broadcasts</h3>
            <p className="text-xs text-zinc-400 mt-0.5 max-w-sm mx-auto">
              Your tutor hasn't posted any notices for this tuition yet.
            </p>
          </div>
        ) : (
          announcements.map((announcement, idx) => (
            <Card 
              key={announcement._id || idx} 
              className="p-4 sm:p-5 shadow-2xs border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900 border-l-4 border-l-amber-500 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-white leading-snug">
                  {announcement.title}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-bold flex-shrink-0">
                  <Calendar size={11} />
                  {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pt-0.5">
                {announcement.message}
              </p>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
