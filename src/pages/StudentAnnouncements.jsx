import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Megaphone, AlertCircle, Calendar } from 'lucide-react';

export default function StudentAnnouncements() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchParams] = useSearchParams();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{error || 'Something went wrong'}</p>
      </div>
    );
  }

  const announcements = data.announcements || [];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
          <Megaphone size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Announcements</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Updates and notices from your tutor</p>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl text-zinc-500 dark:text-zinc-400">
            <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No announcements at the moment.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement._id} className="p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-xl text-zinc-900 dark:text-white">{announcement.title}</h3>
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full font-medium">
                  <Calendar size={12} />
                  {new Date(announcement.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {announcement.message}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
