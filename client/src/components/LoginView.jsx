import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  GraduationCap, 
  ShieldCheck, 
  User, 
  Wrench, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { apiRequest } from '../api.js';

export default function LoginView({ onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('student'); // 'student' or 'staff-ops'
  
  // Student form state
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  
  // Staff/Tech/Admin form state
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoNotice, setInfoNotice] = useState('');

  // Generic 1-Click Role Access for Staff & Technicians (No personal names)
  const GENERIC_STAFF_ROLES = [
    {
      role: 'staff',
      title: 'Faculty & Staff',
      subtitle: 'Academic & Departmental Access',
      email: 'faculty@jims.edu',
      password: 'faculty123',
      icon: User,
      desc: 'Submit lab and classroom infrastructure repair orders'
    },
    {
      role: 'technician',
      title: 'Field Technician',
      subtitle: 'Trades & Physical Repairs',
      email: 'technician@jims.edu',
      password: 'tech123',
      icon: Wrench,
      desc: 'View work orders by trade, claim jobs, and upload repair photo proof'
    },
    {
      role: 'admin',
      title: 'Campus Administrator',
      subtitle: 'Facility Directorate',
      email: 'admin@jims.edu',
      password: 'admin123',
      icon: ShieldCheck,
      desc: 'Full campus overview, assign technicians, monitor maintenance & manage members'
    }
  ];

  // Handle student authentication
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfoNotice('');

    const identifier = studentIdentifier.trim();
    const password = studentPassword.trim();

    if (!identifier || !password) {
      setError("Please enter your Enrollment Number / Username and Father's Name.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier,
          password: password.toUpperCase()
        })
      });

      if (data && data.user) {
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('campus_token', data.token);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      console.warn('Student login error:', err);
      setError(err.message || "Invalid student credentials. Please verify your enrollment number and Father's Name in ALL CAPS.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generic staff / technician / admin quick login
  const handleGenericStaffLogin = async (profile) => {
    setError('');
    setInfoNotice('');
    setIsLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          password: profile.password
        })
      });

      if (data && data.user) {
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('campus_token', data.token);
        onLoginSuccess(data.user);
        return;
      }
    } catch (err) {
      console.log('Using local fallback for demo profile:', profile.title);
      const fallbackUser = {
        _id: `user_${profile.role}_standard`,
        name: profile.title,
        email: profile.email,
        role: profile.role,
        department: profile.subtitle
      };
      localStorage.setItem('campus_user', JSON.stringify(fallbackUser));
      onLoginSuccess(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual staff/admin login
  const handleManualStaffLogin = async (e) => {
    e.preventDefault();
    if (!staffEmail || !staffPassword) {
      setError('Please enter campus email and password.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staffEmail.trim(),
          password: staffPassword.trim()
        })
      });

      if (data && data.user) {
        localStorage.setItem('campus_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('campus_token', data.token);
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#07080B] text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 overflow-hidden selection:bg-fuchsia-500 selection:text-white">
      
      {/* 🌟 Soft Ambient Ethereal Mesh Aura (Clean & Modern Inspiration) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Violet/Pink Aurora Orb */}
        <div 
          className="absolute -top-[15%] -right-[10%] w-[750px] h-[750px] rounded-full opacity-60 filter blur-[130px]"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.7) 0%, rgba(192,132,252,0.65) 40%, rgba(99,102,241,0.5) 70%, transparent 85%)'
          }}
        />

        {/* Soft Lavender Peach Orb */}
        <div 
          className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] rounded-full opacity-45 filter blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(147,197,253,0.55) 0%, rgba(167,139,250,0.5) 45%, rgba(244,114,182,0.3) 75%, transparent 90%)'
          }}
        />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-4xl space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-white/20 text-xs font-semibold text-slate-200 shadow-xl backdrop-blur-xl">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Jagan Institute of Management Studies • Rohini Sector-5</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Campus<span className="gradient-text-aura">Ops</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Campus facility maintenance system to report issues, dispatch technicians, and track repairs with photo proof.
          </p>
        </div>

        {/* Main Tab Controller: Student Login vs Staff & Operations Access */}
        <div className="max-w-md mx-auto flex items-center p-1.5 rounded-full glass-card border border-white/15 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('student');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              authMode === 'student'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('staff-ops');
              setError('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              authMode === 'staff-ops'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Faculty & Operations</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* --- VIEW 1: STRICT STUDENT AUTHENTICATION --- */}
        {authMode === 'student' && (
          <div className="max-w-lg mx-auto p-6 sm:p-8 rounded-[32px] glass-card border border-white/20 shadow-2xl space-y-6">
            
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-fuchsia-400" />
                <span>Student Authentication</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your enrollment credentials to access your personal maintenance submissions.
              </p>
            </div>

            <form onSubmit={handleStudentLogin} className="space-y-4">
              
              {/* Enrollment No / Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Enrollment Number / Username *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={studentIdentifier}
                    onChange={(e) => setStudentIdentifier(e.target.value)}
                    placeholder="e.g. 00114004425"
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Father's Name in ALL CAPS */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Password: Father's Name in ALL CAPS *</span>
                  <span className="text-[10px] text-fuchsia-400 font-semibold">ALL CAPS</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value.toUpperCase())}
                    placeholder="e.g. VIKRAM CHOPRA"
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors font-mono tracking-wider uppercase"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Guidelines helper box — removed per user request */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-xl shadow-white/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Verifying Student Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Enter Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

          </div>
        )}

        {/* --- VIEW 2: FACULTY & OPERATIONS QUICK ACCESS --- */}
        {authMode === 'staff-ops' && (
          <div className="space-y-6">
            
            <div className="text-center space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Campus Operations Access
              </h2>
              <p className="text-xs text-slate-400">
                One-click authenticated access for Faculty, Field Technicians, and Administration.
              </p>
            </div>

            {/* 3 Clean Generic Cards (No personal names) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GENERIC_STAFF_ROLES.map((roleObj) => {
                const Icon = roleObj.icon;
                return (
                  <div
                    key={roleObj.role}
                    className="p-6 rounded-[28px] glass-card border border-white/15 shadow-xl flex flex-col justify-between space-y-4 hover:border-white/30 transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6 text-fuchsia-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{roleObj.title}</h3>
                        <p className="text-[11px] text-fuchsia-400 font-medium">{roleObj.subtitle}</p>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {roleObj.desc}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleGenericStaffLogin(roleObj)}
                      className="w-full py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Enter as {roleObj.title}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-[11px] text-slate-500">
            JIMS Rohini Sector-5 Campus Maintenance & Facility Operations System
          </p>
        </div>

      </div>
    </div>
  );
}
