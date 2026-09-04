import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckSquare, AlertCircle, Calendar, Check, X } from 'lucide-react';

export default function StudentAttendance() {
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
        setError(err.response?.data?.message || 'Failed to fetch attendance data');
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

  const attendance = data.attendance || { totalAttended: 0, totalClasses: 0, records: [] };
  const attendanceRate = attendance.totalClasses > 0 
    ? Math.round((attendance.totalAttended / attendance.totalClasses) * 100) 
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl">
          <CheckSquare size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Attendance</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Track your class attendance history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900">
          <h2 className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs mb-2">Overall Rate</h2>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black text-zinc-900 dark:text-white">{attendanceRate}%</span>
          </div>
          <div className="mt-6 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${attendanceRate >= 75 ? 'bg-emerald-500' : attendanceRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
              style={{ width: `${attendanceRate}%` }}
            ></div>
          </div>
        </Card>

        <Card className="col-span-2 p-6 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900 flex items-center justify-between">
          <div className="text-center w-1/2 border-r border-zinc-200 dark:border-zinc-800">
            <h2 className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs mb-2">Classes Attended</h2>
            <span className="text-4xl font-black text-emerald-600 dark:text-emerald-500">{attendance.totalAttended}</span>
          </div>
          <div className="text-center w-1/2">
            <h2 className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-xs mb-2">Total Classes</h2>
            <span className="text-4xl font-black text-zinc-900 dark:text-white">{attendance.totalClasses}</span>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Recent History</h2>
        {(!attendance.records || attendance.records.length === 0) ? (
          <div className="text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No attendance records found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendance.records.map((record) => (
              <Card key={record._id} className="p-4 flex items-center justify-between shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900 group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${
                    record.status === 'Present' 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {record.status === 'Present' ? <Check size={20} /> : <X size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">
                      {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                    {record.topic && <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">{record.topic}</p>}
                  </div>
                </div>
                <div>
                  <Badge variant={record.status === 'Present' ? 'success' : 'danger'} className="px-3 py-1 uppercase tracking-wider text-xs font-bold">
                    {record.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
