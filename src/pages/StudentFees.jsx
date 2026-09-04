import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentApi } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Wallet, AlertCircle } from 'lucide-react';

export default function StudentFees() {
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
        setError(err.response?.data?.message || 'Failed to fetch fees data');
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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl">
          <Wallet size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Fee Details</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage and track your tuition fees</p>
        </div>
      </div>

      <Card className="p-8 shadow-lg border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider text-sm mb-2">Current Fee Status</h2>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white">
                {data.student?.batch ? `₹${data.student.batch.fee}` : 'N/A'}
              </span>
              <div className="mb-2">
                <Badge variant={
                  data.student?.feeStatus === 'Paid' ? 'success' :
                  data.student?.feeStatus === 'Pending' ? 'warning' : 'danger'
                } className="px-4 py-1.5 font-bold text-sm uppercase tracking-wider">
                  {data.student?.feeStatus || 'N/A'}
                </Badge>
              </div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4 font-medium">
              {data.student?.batch ? `Monthly fee for ${data.student.batch.name} (${data.student.batch.subject})` : 'No active batch assigned.'}
            </p>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 w-full md:w-auto min-w-[250px]">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-2">Payment Info</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Please contact your tutor to process payments or resolve any discrepancies.</p>
            {data.student?.feeStatus !== 'Paid' && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
                <AlertCircle size={18} className="flex-shrink-0" />
                <p>Your fee is currently pending. Please pay soon to avoid interruption.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Payment History</h2>
        {(!data.fees?.history || data.fees.history.length === 0) ? (
          <div className="text-center p-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl text-zinc-500 dark:text-zinc-400">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No fee history records found for this tuition.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.fees.history.map((record) => (
              <Card key={record._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className="p-3 rounded-xl flex-shrink-0 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">
                      {new Date(record.month).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
                      Paid on: {new Date(record.paymentDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="block text-2xl font-black text-zinc-900 dark:text-white mb-1">
                    ₹{record.amount}
                  </span>
                  <Badge variant="success" className="px-3 py-1 uppercase tracking-wider text-xs font-bold">
                    PAID
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
