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
  Check,
  Wrench,
  User,
  ListTodo,
  Inbox,
  LogOut
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  currentUser,
  onLogout,
  activeTab, 
  setActiveTab, 
  onOpenReportModal, 
  onOpenDocsModal 
}) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles = [
    { 
      id: 'student', 
      label: 'Student', 
      name: 'Varun Malik', 
      tag: 'MCA Sem 3',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      id: 'staff', 
      label: 'Faculty & Staff', 
      name: 'Prof. Shankar Sumar', 
      tag: 'MCA Department',
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      id: 'technician', 
      label: 'Field Technician', 
      name: 'Rajesh Kumar', 
      tag: 'Sr. HVAC & Electrical',
      color: 'from-amber-500 to-orange-600'
    },
    { 
      id: 'admin', 
      label: 'Administrator', 
      name: 'Dr. R. K. Sharma', 
      tag: 'Facility Director',
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const currentRoleObj = roles.find(r => r.id === currentRole) || roles[0];
  const displayName = currentUser?.name || currentRoleObj.name;

  // Dynamic Navigation Items Tailored Specifically to Role Capabilities
  const getNavItems = () => {
    switch (currentRole) {
      case 'student':
      case 'staff':
        return [
          { id: 'my-requests', label: 'My Submissions', icon: Inbox },
          { id: 'all-issues', label: 'Campus Feed', icon: AlertCircle },
          { id: 'facilities', label: 'Facility Directory', icon: Building2 },
        ];
      case 'technician':
        return [
          { id: 'tech-assigned', label: 'My Work Orders', icon: Wrench },
          { id: 'tech-queue', label: 'Open Campus Queue', icon: ListTodo },
          { id: 'tech-completed', label: 'Completed Repairs', icon: Layers },
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'Executive Overview', icon: Layers },
          { id: 'complaints', label: 'Dispatch & Incidents', icon: AlertCircle },
          { id: 'predictive', label: 'Predictive Radar', icon: Activity },
          { id: 'facilities', label: 'Campus Facilities', icon: Building2 },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-2 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-6">
      <div className="h-14 sm:h-16 rounded-full glass-card border border-white/15 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" 
          onClick={() => {
            if (currentRole === 'student' || currentRole === 'staff') setActiveTab('my-requests');
            else if (currentRole === 'technician') setActiveTab('tech-assigned');
            else setActiveTab('dashboard');
          }}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-fuchsia-500 via-violet-500 to-amber-300 p-[1px] shadow-lg shadow-fuchsia-500/20">
            <div className="w-full h-full rounded-full bg-[#0E0F15] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-300" />
            </div>
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white block">CampusOps</span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
              {currentRoleObj.label} Mode
            </span>
          </div>
        </div>

        {/* Dynamic Center Navigation */}
        <nav className="hidden lg:flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
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
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          
          {/* Docs Pill */}
          <button
            onClick={onOpenDocsModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Academic Project Synopsis & Architecture"
          >
            <FileText className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Synopsis</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentRoleObj.color} animate-pulse shrink-0`} />
              <div className="text-left truncate max-w-[100px] sm:max-w-none">
                <span className="hidden sm:inline">{displayName}</span>
                <span className="sm:hidden">{currentRoleObj.label}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {roleMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setRoleMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-3 w-64 rounded-2xl glass-card border border-white/20 shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Switch User Role
                  </div>
                  {roles.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentRole(r.id);
                        if (r.id === 'student' || r.id === 'staff') setActiveTab('my-requests');
                        else if (r.id === 'technician') setActiveTab('tech-assigned');
                        else setActiveTab('dashboard');
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        currentRole === r.id 
                          ? 'bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 text-white font-medium border border-fuchsia-500/30' 
                          : 'text-slate-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          <span>{r.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                            {r.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{r.tag}</div>
                      </div>
                      {currentRole === r.id && <Check className="w-3.5 h-3.5 text-fuchsia-400" />}
                    </button>
                  ))}
                  
                  {/* Logout item */}
                  {onLogout && (
                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Action Button: Students/Staff/Admin get Report Issue */}
          {(currentRole === 'student' || currentRole === 'staff' || currentRole === 'admin') && (
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/20 active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-slate-900" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>
          )}

          {/* Logout button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 sm:p-2 rounded-full glass-pill text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>

      {/* Mobile nav strip (Touch optimized) */}
      <div className="lg:hidden flex items-center justify-around mt-2 p-1 rounded-full glass-card border border-white/10">
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
