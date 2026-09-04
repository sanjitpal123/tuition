import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { BookOpen, Clock, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

export default function StudentHomework() {
  const [searchParams] = useSearchParams();
  const selectedTuitionId = searchParams.get('tuitionId');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
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

  const homeworks = data.homeworks || [];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl">
          <BookOpen size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Homework & Tasks</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage your assignments</p>
        </div>
      </div>

      <div className="space-y-4">
        {homeworks.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl text-zinc-500 dark:text-zinc-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No homework assigned for this tuition at the moment.</p>
          </div>
        ) : (
          homeworks.map((task) => {
            const isOverdue = new Date(task.dueDate) < new Date();
            return (
              <Card key={task._id} className="p-0 overflow-hidden shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900 flex flex-col md:flex-row">
                <div className={`w-2 md:w-3 flex-shrink-0 ${isOverdue ? 'bg-red-500' : 'bg-purple-500'}`}></div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 block">
                          {task.subject}
                        </span>
                        <h3 className="font-bold text-xl text-zinc-900 dark:text-white">{task.title}</h3>
                      </div>
                      <Badge variant={isOverdue ? 'danger' : 'warning'} className="px-3 py-1 uppercase tracking-wider text-xs font-bold">
                        {isOverdue ? 'OVERDUE' : 'PENDING'}
                      </Badge>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
                      {task.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      <Clock size={16} className={isOverdue ? 'text-red-500' : 'text-amber-500'} />
                      <span className={isOverdue ? 'text-red-600 dark:text-red-500' : 'text-amber-600 dark:text-amber-500'}>
                        Due: {new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700">
                      <FileText size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
