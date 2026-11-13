import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Layers, 
  AlertCircle, 
  Activity, 
  FileText, 
  ChevronDown,
  User,
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
    { id: 'admin', label: 'Administrator', sub: 'Dr. R. K. Sharma' },
    { id: 'student', label: 'Student', sub: 'Varun Malik (MCA)' },
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
    <header className="sticky top-0 z-40 bg-[#0B0F17]/85 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white">CampusOps</span>
              <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-500 font-normal">
                Facility Intelligence
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-white/[0.08] text-white' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Docs button */}
          <button
            onClick={onOpenDocsModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors cursor-pointer border border-transparent hover:border-white/[0.06]"
            title="Project Documentation & Architecture"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>

          {/* Role selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                {currentRoleObj.label[0]}
              </div>
              <span className="hidden sm:inline text-slate-300">{currentRoleObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setRoleMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#111622] border border-white/[0.1] shadow-2xl p-1.5 z-50 space-y-0.5">
                  <div className="px-2.5 py-1.5 text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    Switch Perspective
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentRole(r.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        currentRole === r.id 
                          ? 'bg-blue-600/10 text-blue-400 font-medium' 
                          : 'text-slate-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div>
                        <div className="text-slate-200 font-medium">{r.label}</div>
                        <div className="text-[11px] text-slate-500">{r.sub}</div>
                      </div>
                      {currentRole === r.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* New Issue Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>
        </div>

      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center justify-around border-t border-white/[0.05] px-2 py-1.5 bg-[#0B0F17]">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
