import React from 'react';
import { 
  Building2, 
  Cpu, 
  Wrench, 
  AlertTriangle, 
  PlusCircle, 
  BarChart3, 
  ListFilter, 
  Zap, 
  BookOpen, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  activeTab, 
  setActiveTab, 
  onOpenReportModal, 
  onOpenDocsModal,
  systemStatus 
}) {
  const roles = [
    { id: 'admin', label: 'Admin (Dr. Sharma)', badge: 'Admin', color: 'bg-purple-600 text-purple-100' },
    { id: 'student', label: 'Student (Varun)', badge: 'Student', color: 'bg-blue-600 text-blue-100' },
    { id: 'staff', label: 'Faculty (Prof. Shankar)', badge: 'Staff', color: 'bg-emerald-600 text-emerald-100' },
    { id: 'technician', label: 'Technician (Rajesh)', badge: 'Tech', color: 'bg-amber-600 text-amber-100' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top institution bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/60 text-xs text-slate-400 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-400 tracking-wide">JAGAN INSTITUTE OF MANAGEMENT STUDIES (JIMS)</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">Sector-5, Rohini, Delhi – 110085 (GGSIPU Affiliated)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">API: <strong className="text-emerald-400 font-mono">Port 5005</strong></span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-slate-300">AI Engine: <strong className="text-blue-400 font-mono">Port 5001</strong></span>
          </div>
          <span className="text-slate-600">•</span>
          <button 
            onClick={onOpenDocsModal}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Project Synopsis & Viva Docs</span>
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">AI-Driven Predictive Campus Maintenance</h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  MCA Sem 3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Facility Management & Machine Learning Failure Forecasting System
              </p>
            </div>
          </div>

          {/* Quick role switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              Role:
            </span>
            <div className="flex items-center gap-1">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => setCurrentRole(r.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    currentRole === r.id
                      ? `${r.color} shadow-sm font-semibold`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {r.badge}
                </button>
              ))}
            </div>
          </div>

          {/* Report Issue CTA Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Issue (AI Triage)</span>
          </button>
        </div>

        {/* Tab navigation bar */}
        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Complaints & Lifecycle Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('predictive')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'predictive'
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Predictive Maintenance & Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('facilities')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'facilities'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Campus Facilities & Assets</span>
          </button>

          {currentRole === 'technician' && (
            <button
              onClick={() => setActiveTab('technician')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'technician'
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Technician Work Orders</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
