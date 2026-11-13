import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Layers, 
  AlertCircle, 
  Activity, 
  FileText, 
  ChevronDown,
  Sparkles,
  Check
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  activeTab, 
  setActiveTab, 
  onOpenReportModal, 
  onOpenDocsModal 
}) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles = [
    { id: 'admin', label: 'Administrator', sub: 'Dr. R. K. Sharma (Director)' },
    { id: 'student', label: 'Student', sub: 'Varun Malik (MCA Sem 3)' },
    { id: 'staff', label: 'Faculty & Staff', sub: 'Prof. Shankar Sumar' },
    { id: 'technician', label: 'Technician', sub: 'Rajesh Kumar (HVAC)' }
  ];

  const currentRoleObj = roles.find(r => r.id === currentRole) || roles[0];

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Layers },
    { id: 'complaints', label: 'Issues', icon: AlertCircle },
    { id: 'predictive', label: 'Predictive Risk', icon: Activity },
    { id: 'facilities', label: 'Facilities', icon: Building2 },
  ];

  return (
    <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="h-16 rounded-full glass-card border border-white/15 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-fuchsia-500 via-violet-500 to-amber-300 p-[1px] shadow-lg shadow-fuchsia-500/20">
            <div className="w-full h-full rounded-full bg-[#0E0F15] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
            </div>
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">CampusOps</span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
              Facility Intelligence
            </span>
          </div>
        </div>

        {/* Center Pill Navigation */}
        <nav className="hidden md:flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-md shadow-white/10' 
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Docs Pill */}
          <button
            onClick={onOpenDocsModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Academic Synopsis & Architecture Docs"
          >
            <FileText className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Synopsis</span>
          </button>

          {/* Role Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="hidden sm:inline">{currentRoleObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setRoleMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-3 w-60 rounded-2xl glass-card border border-white/20 shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Switch Active Role
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentRole(r.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        currentRole === r.id 
                          ? 'bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-white font-medium border border-fuchsia-500/30' 
                          : 'text-slate-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div>
                        <div className="text-white font-semibold">{r.label}</div>
                        <div className="text-[11px] text-slate-400">{r.sub}</div>
                      </div>
                      {currentRole === r.id && <Check className="w-3.5 h-3.5 text-fuchsia-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Report Issue Button (Bold Pill) */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/20 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span className="hidden sm:inline">Report Issue</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>

      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center justify-around mt-2 p-1.5 rounded-full glass-card border border-white/10">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-all ${
                isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
