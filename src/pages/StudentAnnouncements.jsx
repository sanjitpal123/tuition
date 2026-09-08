import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Megaphone, AlertCircle, Calendar, Building, ArrowLeft, BellRing } from 'lucide-react';

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
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-red-200 dark:border-red-950 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading announcements...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <Card className="p-8 border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900">
          <AlertCircle className="w-14 h-14 mx-auto mb-4 text-red-500 opacity-80" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Error Loading Announcements</h2>
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
  const announcements = data.announcements || [];

  const tuitionQuery = selectedTuitionId ? `?tuitionId=${selectedTuitionId}` : '';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
            <BellRing size={28} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">Notice Board</h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
              Official announcements and updates for {activeTuition?.name || 'your tuition'}
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

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-20 text-zinc-500" />
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">No Announcements</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Your tutor hasn't posted any notices for this tuition yet. Check back soon for updates.
            </p>
          </div>
        ) : (
          announcements.map((announcement, idx) => (
            <Card 
              key={announcement._id || idx} 
              className="p-6 sm:p-7 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-lg sm:text-xl text-zinc-900 dark:text-white">
                  {announcement.title}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                  <Calendar size={12} />
                  {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap pt-1">
                {announcement.message}
              </p>
            </Card>
          ))
        )}
      </div>

    </div>
  );
}
