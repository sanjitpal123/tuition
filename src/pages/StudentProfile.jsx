import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Mail, Phone, Lock, CheckCircle } from 'lucide-react';
import { studentApi } from '../lib/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load current profile from localStorage
    const savedProfile = localStorage.getItem('studentProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        password: '' // Keep password empty
      });
    }
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const updateData = {
        name: profile.name,
        phone: profile.phone
      };
      
      // Only send password if user typed one
      if (profile.password) {
        updateData.password = profile.password;
      }
      
      const response = await studentApi.put('/student-auth/profile', updateData);
      
      // Update localStorage with new profile details
      const oldProfileStr = localStorage.getItem('studentProfile');
      if (oldProfileStr) {
        const oldProfile = JSON.parse(oldProfileStr);
        const newProfile = {
          ...oldProfile,
          name: response.data.name,
          phone: response.data.phone
        };
        localStorage.setItem('studentProfile', JSON.stringify(newProfile));
        
        // Dispatch custom event so StudentLayout header updates instantly
        window.dispatchEvent(new Event('storage'));
      }
      
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setProfile(p => ({ ...p, password: '' })); // Clear password field
      
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Profile Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">Manage your personal information</p>
        </div>
      </div>

      <Card className="p-6 md:p-8 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl bg-white dark:bg-zinc-900">
        
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3">
            <CheckCircle size={20} />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl">
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white pb-2 border-b border-zinc-100 dark:border-zinc-800">Basic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input 
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800" 
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input 
                    required
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800" 
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email Address (Read Only)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input 
                    disabled
                    value={profile.email}
                    className="pl-10 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-not-allowed opacity-70" 
                    placeholder="student@example.com"
                  />
                </div>
                <p className="text-xs text-zinc-500 mt-1">To change your email address, please contact your tutor.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white pb-2 border-b border-zinc-100 dark:border-zinc-800">Security</h3>
            
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Change Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input 
                  type="password"
                  value={profile.password}
                  onChange={(e) => setProfile({...profile, password: e.target.value})}
                  className="pl-10 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800" 
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className="px-8 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
            >
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
