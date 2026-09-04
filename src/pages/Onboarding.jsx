import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../lib/api';
import { useData } from '../context/DataContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    tuitionName: '',
    password: ''
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('tutorToken', data.token);
      localStorage.setItem('tutorProfile', JSON.stringify(data));
      await refreshData();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black opacity-90"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 p-12 max-w-lg text-center">
          <div className="mb-8 inline-block p-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl/50 rounded-2xl border border-red-700/50 shadow-2xl">
            <span className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight block mb-2">Setupclass</span>
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">Start managing your tuition efficiently today.</h2>
          <p className="text-red-300 text-lg">Join thousands of tutors using Setupclass to streamline attendance, fees, and scheduling.</p>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl font-bold text-red-500 tracking-tight">Setupclass</span>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Create your account</h2>
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">
              Set up your tutor profile in seconds.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">Full Name</label>
                <div className="mt-2">
                  <Input name="name" value={formData.name} onChange={handleChange} required placeholder="Rahul Sharma" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">Email Address</label>
                  <div className="mt-2">
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="rahul@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">Phone Number</label>
                  <div className="mt-2">
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+91 98765 43210" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">Tuition/Institute Name</label>
                <div className="mt-2">
                  <Input name="tuitionName" value={formData.tuitionName} onChange={handleChange} required placeholder="Sharma Mathematics" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">Password</label>
                <div className="mt-2">
                  <Input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a secure password" minLength={6} />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold leading-6 text-red-500 hover:text-red-400">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
