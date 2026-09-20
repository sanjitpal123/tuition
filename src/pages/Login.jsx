import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  School,
  Phone,
  KeyRound
} from "lucide-react";
import api from "../lib/api";
import { useData } from "../context/DataContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshData } = useData();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isStudentLogin, setIsStudentLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("tutorToken")) {
      navigate("/dashboard");
    } else if (localStorage.getItem("studentToken")) {
      navigate("/student/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      if (isResetMode) {
        // Handle Password Reset
        await api.post("/auth/reset-password", {
          email,
          newPassword: password,
        });
        setSuccess("Password changed successfully! You can now sign in.");
        setIsResetMode(false);
      } else {
        if (isStudentLogin) {
          const { studentApi } = await import("../lib/api");
          const { data } = await studentApi.post("/student-auth/login", {
            email,
            password,
          });
          localStorage.setItem("studentToken", data.token);
          localStorage.setItem("studentProfile", JSON.stringify(data));
          navigate("/student/dashboard");
        } else {
          const { data } = await api.post("/auth/login", { email, password });
          localStorage.setItem("tutorToken", data.token);
          localStorage.setItem("tutorProfile", JSON.stringify(data));
          await refreshData();
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isResetMode ? "Failed to reset password" : "Invalid credentials. Please try again."),
      );
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
      {/* LEFT SIDE - STYLISH BRAND HERO (Desktop Viewports) */}
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

        {/* Brand Top Header */}
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

        {/* Center Hero Content Card */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 py-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-red-400" /> Platform Built For Success
            </span>

            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Manage your students.{" "}
              <span className="bg-gradient-to-r from-red-500 via-rose-400 to-red-600 bg-clip-text text-transparent">
                Focus on teaching.
              </span>
            </h1>

            <p className="text-zinc-400 text-base leading-relaxed">
              The all-in-one portal designed for individual tutors & students to seamlessly track attendance, manage monthly fees, schedule classes, and share homework.
            </p>
          </div>

          {/* Feature Badges List */}
          <div className="grid grid-cols-1 gap-3.5">
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">Automated Fee Collection</h4>
                <p className="text-[11px] text-zinc-400 truncate">Real-time payment history, receipt logging & pending dues tracking.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">Instant Attendance Logs</h4>
                <p className="text-[11px] text-zinc-400 truncate">1-tap batch attendance marking with student portal sync.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">Multi-Tuition Student Portal</h4>
                <p className="text-[11px] text-zinc-400 truncate">Students switch seamlessly between all enrolled tuitions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Metric Pill */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-zinc-800/60 text-xs text-zinc-400 font-medium">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-red-500" />
            <span>Trusted by Tutors & Students nationwide</span>
          </div>
          <span className="text-zinc-500 text-[11px]">v2.4 Secured Portal</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE - LOGIN FORM & MOBILE BRAND HEADER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col justify-center items-center p-5 sm:p-8 lg:p-12 xl:p-16 z-10 my-auto">
        <div className="w-full max-w-md space-y-7">

          {/* Mobile Top Brand Header (Mobile Viewports Only) */}
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
              {isResetMode
                ? "Reset Your Password"
                : isStudentLogin
                  ? "Student Sign In"
                  : "Welcome Back, Tutor"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium">
              {isResetMode
                ? "Enter your account email and a new password."
                : isStudentLogin
                  ? "Access your tuition timetable, fee history, and homework."
                  : "Sign in to manage your tuition batches and student records."}
            </p>
          </div>

          {/* Role Segmented Switcher (Tutor vs Student) */}
          {!isResetMode && (
            <div className="grid grid-cols-2 p-1.5 bg-[#12141d] rounded-2xl border border-zinc-800/80 shadow-inner">
              <button
                type="button"
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                  !isStudentLogin
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => { setIsStudentLogin(false); setError(""); }}
              >
                <School size={16} />
                <span>Tutor Portal</span>
              </button>

              <button
                type="button"
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
                  isStudentLogin
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30"
                    : "text-zinc-400 hover:text-white"
                }`}
                onClick={() => { setIsStudentLogin(true); setError(""); }}
              >
                <GraduationCap size={16} />
                <span>Student Portal</span>
              </button>
            </div>
          )}

          {/* Main Login Form Card */}
          <div className="bg-[#0f1118]/80 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-zinc-800/80 shadow-2xl space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email / Phone Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-zinc-300 uppercase tracking-wider"
                >
                  {isStudentLogin ? "Email or Phone Number" : "Email Address"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    {isStudentLogin ? <Phone size={16} /> : <Mail size={16} />}
                  </div>
                  <input
                    id="email"
                    name="email"
                    type={isStudentLogin ? "text" : "email"}
                    autoComplete="off"
                    placeholder={isStudentLogin ? "Enter registered email or phone" : "Enter tutor email address"}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#161822] border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-zinc-300 uppercase tracking-wider"
                  >
                    {isResetMode ? "New Password" : "Password"}
                  </label>
                  {!isResetMode && (
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder={isResetMode ? "Enter new strong password" : "Enter account password"}
                    required
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

              {/* Success Alert */}
              {success && (
                <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{isResetMode ? "Updating Password..." : "Authenticating..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span>{isResetMode ? "Update Password" : isStudentLogin ? "Sign In to Student Portal" : "Sign In to Tutor Portal"}</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </button>

              {/* Reset Password Cancel Option */}
              {isResetMode && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Footer Call to Action */}
          <div className="text-center pt-2">
            <p className="text-xs text-zinc-400 font-medium">
              New to Setupclass?{" "}
              <button
                onClick={() => navigate("/onboarding")}
                className="font-bold text-red-500 hover:text-red-400 underline underline-offset-4 transition-colors inline-flex items-center gap-1"
              >
                Create your tutor account <ArrowRight size={12} />
              </button>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
