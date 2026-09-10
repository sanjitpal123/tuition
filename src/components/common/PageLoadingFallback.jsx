import React, { useState, useEffect } from 'react';
import { GraduationCap, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function PageLoadingFallback() {
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    "Preparing your workspace...",
    "Syncing batches and timetables...",
    "Retrieving latest records...",
    "Almost ready..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden select-none">
      
      {/* 1. Subtle Background Grid Pattern with Radial Gradient Fade */}
      <div 
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ef4444 1px, transparent 1px), radial-gradient(#ef4444 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px'
        }}
      />

      {/* 2. Soft Ambient Crimson Aura Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] bg-red-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-rose-500/25 rounded-full blur-[60px] pointer-events-none" />

      {/* 3. Main Luxury Floating Card */}
      <div className="relative z-10 flex flex-col items-center w-[90%] max-w-sm p-8 sm:p-9 rounded-[32px] bg-zinc-900/80 border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl animate-in zoom-in-95 fade-in duration-300">
        
        {/* Top Mini Brand Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-extrabold uppercase tracking-widest text-red-400 mb-6 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span>Tuition Hub</span>
        </div>

        {/* Multi-layered Orbital Rings & Center Icon */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          
          {/* Outer Pulsing Aura */}
          <div className="absolute inset-0 rounded-full bg-red-600/15 animate-ping" style={{ animationDuration: '2.5s' }} />

          {/* Outer Rotating Dashed Track */}
          <div 
            className="absolute -inset-2 rounded-full border border-dashed border-red-500/30 animate-spin" 
            style={{ animationDuration: '12s' }}
          />

          {/* Middle High-Speed Conic Gradient Ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-red-500 border-r-rose-500/50 animate-spin"
            style={{ animationDuration: '1.2s' }}
          />

          {/* Inner Counter-Rotating Ring */}
          <div 
            className="absolute inset-1.5 rounded-full border border-transparent border-b-red-400 border-l-red-500/30 animate-spin" 
            style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          />

          {/* Center Brand Orb with Glowing Shield */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] flex items-center justify-center transform hover:scale-105 transition-all">
            <GraduationCap className="w-7 h-7 stroke-[2.2] drop-shadow-md" />
            
            {/* Sparkle Accent Dot */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-zinc-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Dynamic Status Text */}
        <div className="text-center space-y-1.5 w-full">
          <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>Loading Experience</span>
            <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
          </h3>
          
          <div className="h-5 flex items-center justify-center overflow-hidden">
            <p 
              key={tipIndex} 
              className="text-xs font-medium text-zinc-400 animate-in slide-in-from-bottom-2 fade-in duration-300"
            >
              {tips[tipIndex]}
            </p>
          </div>
        </div>

        {/* Ultra-Smooth Luminous Beam Progress Track */}
        <div className="w-full mt-6 space-y-2">
          <div className="w-full h-1.5 bg-zinc-800/90 rounded-full overflow-hidden p-[1px] relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-transparent via-red-500 to-rose-400 rounded-full w-1/2 animate-[shimmer_1.8s_ease-in-out_infinite] shadow-[0_0_12px_rgba(239,68,68,0.8)]"
              style={{
                animation: 'pulseBeam 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
          </div>
        </div>

      </div>

      {/* Bottom Security / Quality Tag */}
      <div className="relative z-10 flex items-center gap-1.5 mt-6 text-[11px] font-semibold text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-red-500/80" />
        <span>Secure Cloud Synchronized</span>
      </div>

      {/* Embedded Custom Keyframe Animations */}
      <style>{`
        @keyframes pulseBeam {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}

export default PageLoadingFallback;
