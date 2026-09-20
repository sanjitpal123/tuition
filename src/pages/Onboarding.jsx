import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Rocket
} from 'lucide-react';
import api from '../lib/api';
import { useData } from '../context/DataContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshData } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08090d] text-zinc-100 flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-red-500 selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none translate-x-1/3 translate-y-1/3" />
      
      {/* ========================================================================= */}
      {/* LEFT SIDE - BRAND HERO (Desktop Viewports) */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 xl:p-16 flex-col justify-between border-r border-zinc-800/60 bg-gradient-to-br from-[#0c0e15] via-[#090a0f] to-[#050608] overflow-hidden">
        
        {/* Subtle Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)",
            backgroundSize: "32px 32px"
          }} 
        />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
              Setupclass
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 mt-1 block">
              Smart Tuition Management
            </span>
          </div>
        </div>

        {/* Center Hero Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 py-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Rocket className="w-3.5 h-3.5 text-red-400" /> Instant Tutor Onboarding
            </span>

            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Start managing your tuition{" "}
              <span className="bg-gradient-to-r from-red-500 via-rose-400 to-red-600 bg-clip-text text-transparent">
                efficiently today.
              </span>
            </h1>

            <p className="text-zinc-400 text-base leading-relaxed">
              Join thousands of individual tutors using Setupclass to streamline attendance, automate monthly fee receipts, and publish schedules.
            </p>
          </div>

          {/* Feature Badges List */}
          <div className="grid grid-cols-1 gap-3.5">
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">Setup Profile in Seconds</h4>
                <p className="text-[11px] text-zinc-400 truncate">Create batches, set fees, and add students with 1-click invite link.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">Automated Student Accounts</h4>
                <p className="text-[11px] text-zinc-400 truncate">Students access attendance, homework, and fee receipts automatically.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">100% Encrypted & Private</h4>
                <p className="text-[11px] text-zinc-400 truncate">Your tuition records and financial logs remain completely secure.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metric Pill */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-zinc-800/60 text-xs text-zinc-400 font-medium">
          <span>Free Tutor Account Creation</span>
          <span className="text-zinc-500 text-[11px]">Setupclass Platform v2.4</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE - REGISTRATION FORM */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-5 sm:p-8 lg:p-12 xl:p-16 z-10 my-auto">
        <div className="w-full max-w-md space-y-7">

          {/* Mobile Top Brand Header */}
          <div className="lg:hidden text-center space-y-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 mx-auto flex items-center justify-center text-white shadow-xl shadow-red-600/30">
              <GraduationCap className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Setupclass
            </h1>
            <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-extrabold uppercase tracking-wider">
              Smart Tuition Management
            </span>
          </div>

          {/* Form Header Title */}
          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Create your account
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              Set up your tutor profile in seconds to manage student batches.
            </p>
          </div>

          {/* Registration Form Card */}
          <div className="bg-[#0f1118]/80 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-zinc-800/80 shadow-2xl space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User size={16} />
                  </div>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Rahul Sharma" 
                    className="w-full pl-10 pr-4 py-3 bg-[#161822] border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Grid: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Mail size={16} />
                    </div>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      placeholder="rahul@gmail.com" 
                      className="w-full pl-10 pr-4 py-3 bg-[#161822] border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      required 
                      placeholder="+91 98765 43210" 
                      className="w-full pl-10 pr-4 py-3 bg-[#161822] border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Tuition/Institute Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Tuition / Institute Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Building size={16} />
                  </div>
                  <input 
                    name="tuitionName" 
                    value={formData.tuitionName} 
                    onChange={handleChange} 
                    required 
                    placeholder="Sharma Mathematics Academy" 
                    className="w-full pl-10 pr-4 py-3 bg-[#161822] border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock size={16} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    placeholder="Create a secure password" 
                    minLength={6} 
                    className="w-full pl-10 pr-10 py-3 bg-[#161822] border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      <span>Create Tutor Account</span>
                      <ArrowRight size={16} />
                    </div>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Footer Call to Action */}
          <div className="text-center pt-1">
            <p className="text-xs text-zinc-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-red-500 hover:text-red-400 underline underline-offset-4 transition-colors inline-flex items-center gap-1">
                Sign in <ArrowRight size={12} />
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
