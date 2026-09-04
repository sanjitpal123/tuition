import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { useData } from '../context/DataContext';

export default function Profile() {
  const { students, batches } = useData();
  const currentUser = JSON.parse(localStorage.getItem('tutorProfile') || '{}');
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Tutor Profile</h1>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Manage your personal and professional details.</p>
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar fallback={currentUser.name || 'Tutor'} size="xl" />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">{currentUser.name}</h2>
              <p className="text-sm text-red-500 font-medium mt-1">Admin Tutor</p>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Email Address</p>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 mt-1">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Phone Number</p>
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 mt-1">{currentUser.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tuition Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="space-y-1.5">
               <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tuition Name</label>
               <Input defaultValue={currentUser.tuitionName || 'My Tuition'} readOnly />
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
             <div>
               <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Students</p>
               <p className="mt-2 text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight">{students.length}</p>
             </div>
             <div>
               <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Batches</p>
               <p className="mt-2 text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight">{batches.length}</p>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
