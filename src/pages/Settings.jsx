import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Edit2, 
  LogOut, 
  ShieldCheck, 
  Bell, 
  Palette, 
  X, 
  Check,
  GraduationCap,
  Users
} from 'lucide-react';

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      className={`${
        enabled 
          ? 'bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_12px_rgba(239,68,68,0.35)] border border-red-500/50' 
          : 'bg-zinc-200 dark:bg-zinc-800'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { batches, students } = useData();

  const [currentUser, setCurrentUser] = useState(() => {
    return JSON.parse(localStorage.getItem('tutorProfile') || '{"name":"Tutor","email":"tutor@setupclass.com","tuitionName":"Setupclass Tuition Hub"}');
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    tuitionName: currentUser.tuitionName || 'Setupclass Tuition Hub'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState({
    attendanceReminders: true,
    feeReminders: true,
    classReminders: true,
    testResultNotifications: true
  });

  const handleToggle = (key) => (value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleOpenEditModal = () => {
    setEditFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      tuitionName: currentUser.tuitionName || 'Setupclass Tuition Hub'
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updatedProfile = {
        ...currentUser,
        ...editFormData
      };
      localStorage.setItem('tutorProfile', JSON.stringify(updatedProfile));
      setCurrentUser(updatedProfile);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of your account?")) {
      localStorage.removeItem("tutorToken");
      localStorage.removeItem("tutorProfile");
      navigate("/login");
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-24">
      {/* Desktop Header */}
      <div className="hidden sm:block">
        <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Profile & Settings</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage your teacher profile, preferences, and account credentials.</p>
      </div>

      {/* 1. Teacher Profile Identity Card */}
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-heading font-bold text-2xl shadow-md shadow-red-950/20 flex-shrink-0">
                <Avatar fallback={currentUser.name || 'T'} size="lg" className="w-full h-full text-2xl rounded-2xl" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-zinc-900 dark:text-white truncate capitalize">
                    {currentUser.name || 'Tutor'}
                  </h2>
                  <Badge variant="success" className="text-[10px] font-bold uppercase tracking-wider">
                    Active Teacher
                  </Badge>
                </div>
                
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{currentUser.tuitionName || 'Setupclass Tuition Hub'}</span>
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    {currentUser.email || 'tutor@setupclass.com'}
                  </span>
                  {currentUser.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {currentUser.phone}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleOpenEditModal} variant="outline" className="flex items-center gap-2 text-xs sm:text-sm h-10 w-full sm:w-auto justify-center">
                <Edit2 className="w-4 h-4 text-blue-500" />
                <span>Edit Profile</span>
              </Button>
            </div>
          </div>

          {/* Quick Account Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Assigned Batches</span>
              <p className="text-xl font-heading font-bold text-zinc-900 dark:text-white mt-0.5">{batches.length}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Active Students</span>
              <p className="text-xl font-heading font-bold text-zinc-900 dark:text-white mt-0.5">{students.length}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Access Level</span>
              <p className="text-xl font-heading font-bold text-emerald-500 mt-0.5">Admin Tutor</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Notification Preferences */}
      <Card>
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-red-500" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <li className="flex items-center justify-between p-4 sm:p-5">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Attendance Reminders</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Get notified when attendance is not marked for a class.</p>
              </div>
              <Toggle enabled={settings.attendanceReminders} onChange={handleToggle('attendanceReminders')} />
            </li>
            <li className="flex items-center justify-between p-4 sm:p-5">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Fee Reminders</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Automatic notifications for pending and overdue tuition fees.</p>
              </div>
              <Toggle enabled={settings.feeReminders} onChange={handleToggle('feeReminders')} />
            </li>
            <li className="flex items-center justify-between p-4 sm:p-5">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Class Reminders</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Receive an alert 15 minutes before scheduled lectures.</p>
              </div>
              <Toggle enabled={settings.classReminders} onChange={handleToggle('classReminders')} />
            </li>
            <li className="flex items-center justify-between p-4 sm:p-5">
              <div className="pr-4">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Notice & Broadcast Alerts</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Notify immediately when an announcement is sent.</p>
              </div>
              <Toggle enabled={settings.testResultNotifications} onChange={handleToggle('testResultNotifications')} />
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 3. Appearance Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-4 h-4 text-red-500" />
            Appearance & Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Select your dashboard theme appearance.</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm">
             <div 
               onClick={() => setTheme('light')}
               className={`p-4 bg-gray-50 border-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${theme === 'light' ? 'border-red-600 shadow-md ring-2 ring-red-500/20' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}
             >
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-amber-400" />
                </div>
                <span className="text-sm font-bold text-zinc-900">Light Mode</span>
             </div>

             <div 
               onClick={() => setTheme('dark')}
               className={`p-4 bg-zinc-950 border-2 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${theme === 'dark' ? 'border-red-600 shadow-md ring-2 ring-red-500/20' : 'border-zinc-800 hover:border-zinc-700'}`}
             >
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-2 shadow-sm">
                  <div className="w-4 h-4 rounded-full bg-indigo-400" />
                </div>
                <span className="text-sm font-bold text-white">Dark Mode</span>
             </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 4. Danger Zone / Logout Section */}
      <Card className="border-red-200 dark:border-red-950/60 bg-gradient-to-br from-red-50/50 to-rose-50/30 dark:from-red-950/10 dark:to-transparent">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Account Session</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Securely sign out of your tutor dashboard on this device.
            </p>
          </div>

          <Button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-6 shadow-md shadow-red-950/30 active:scale-95 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </Button>
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button 
              onClick={() => setIsEditModalOpen(false)} 
              className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-5">Edit Teacher Profile</h2>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Teacher Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Tuition / Coaching Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.tuitionName}
                  onChange={e => setEditFormData({...editFormData, tuitionName: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={editFormData.phone}
                  onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
