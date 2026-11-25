import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Layers, 
  AlertCircle, 
  Activity, 
  ChevronDown,
  Sparkles,
  Check,
  Wrench, 
  User, 
  ListTodo, 
  Inbox, 
  LogOut,
  UserPlus,
  Users,
  Key
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  currentUser,
  onLogout,
  activeTab, 
  setActiveTab, 
  onOpenReportModal,
  onOpenAddUserModal,
  onOpenChangeCredentials
}) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roleLabels = {
    student: { label: 'Student', color: 'from-blue-500 to-indigo-600' },
    staff: { label: 'Faculty & Staff', color: 'from-emerald-500 to-teal-600' },
    technician: { label: 'Field Technician', color: 'from-amber-500 to-orange-600' },
    admin: { label: 'Campus Administrator', color: 'from-purple-500 to-pink-600' }
  };

  const currentRoleConfig = roleLabels[currentRole] || roleLabels.student;

  // Determine display name strictly according to active role so student credentials don't linger
  const displayName = (() => {
    if (currentRole === 'student') {
      return (currentUser?.role === 'student' && currentUser?.name) ? currentUser.name : 'Student Member';
    }
    if (currentRole === 'technician') {
      return (currentUser?.role === 'technician' && currentUser?.name) ? currentUser.name : 'Field Technician';
    }
    if (currentRole === 'admin') {
      return (currentUser?.role === 'admin' && currentUser?.name) ? currentUser.name : 'Campus Administrator';
    }
    if (currentRole === 'staff') {
      return (currentUser?.role === 'staff' && currentUser?.name) ? currentUser.name : 'Faculty & Staff';
    }
    return currentRoleConfig.label;
  })();

  const displaySubtitle = (() => {
    if (currentRole === 'student' && currentUser?.role === 'student' && currentUser?.enrollmentNumber) {
      return currentUser.enrollmentNumber;
    }
    if (currentRole === 'technician') {
      return 'Campus Maintenance Trade';
    }
    if (currentRole === 'admin') {
      return 'Facility Directorate';
    }
    if (currentRole === 'staff') {
      return 'Academic Department';
    }
    return currentRoleConfig.label;
  })();

  // Dynamic Navigation Items Tailored Specifically to Role Capabilities (No synopsis, no facility directory)
  const getNavItems = () => {
    switch (currentRole) {
      case 'student':
      case 'staff':
        return [
          { id: 'my-requests', label: 'My Submissions', icon: Inbox },
          { id: 'all-issues', label: 'Campus Feed', icon: AlertCircle }
        ];
      case 'technician':
        return [
          { id: 'tech-assigned', label: 'My Work Orders', icon: Wrench },
          { id: 'tech-queue', label: 'Open Campus Pool', icon: ListTodo },
          { id: 'tech-completed', label: 'Completed Repairs', icon: Layers }
        ];
      case 'admin':
      default:
        return [
          { id: 'dashboard', label: 'Overview', icon: Layers },
          { id: 'complaints', label: 'Campus Incidents', icon: AlertCircle },
          { id: 'predictive', label: 'Preventive Care', icon: Activity }
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
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-fuchsia-500 via-violet-500 to-amber-300 p-[1px] shadow-lg shadow-fuchsia-500/20 overflow-hidden">
            <img src="/logo.png" alt="CampusOps Logo" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm tracking-tight text-white block">CampusOps</span>
            <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
              {currentRoleConfig.label}
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
          
          {/* Admin Directory & Emails Button */}
          {currentRole === 'admin' && onOpenAddUserModal && (
            <button
              onClick={onOpenAddUserModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-bold text-fuchsia-300 hover:text-white border-fuchsia-500/40 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 transition-all cursor-pointer shadow-lg shadow-fuchsia-500/10"
              title="Assign Recovery Emails & Search Campus Directory"
            >
              <Users className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="hidden sm:inline">Directory & Emails</span>
            </button>
          )}

          {/* Reset Password Button For Every Profile */}
          {onOpenChangeCredentials && (
            <button
              onClick={onOpenChangeCredentials}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-300 hover:text-white border-white/10 hover:border-fuchsia-500/30 transition-colors cursor-pointer"
              title="Reset Password via Email OTP"
            >
              <Key className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Reset Password</span>
            </button>
          )}

          {/* User Profile Pill & Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full glass-pill text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentRoleConfig.color} animate-pulse shrink-0`} />
              <div className="text-left truncate max-w-[110px] sm:max-w-none">
                <span className="truncate block font-medium">{displayName}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {roleMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setRoleMenuOpen(false)} 
                />
                <div className="absolute right-0 mt-3 w-64 rounded-2xl glass-card border border-white/20 shadow-2xl p-2.5 z-50 space-y-1.5 backdrop-blur-2xl">
                  
                  {/* Current User Card */}
                  <div className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                    <div className="text-xs font-bold text-white truncate">{displayName}</div>
                    <div className="text-[10px] text-fuchsia-400 font-mono">
                      {displaySubtitle}
                    </div>
                  </div>

                  <div className="px-2 pt-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Switch Active Mode
                  </div>

                  {[
                    { id: 'student', label: 'Student Mode', desc: 'Submit & Track Requests' },
                    { id: 'staff', label: 'Faculty & Staff', desc: 'Departmental Requests' },
                    { id: 'technician', label: 'Field Technician', desc: 'Accept Jobs & Proofs' },
                    { id: 'admin', label: 'Administrator', desc: 'Campus Oversight & Members' }
                  ].map(r => (
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
                        <div className="text-white font-semibold">{r.label}</div>
                        <div className="text-[10px] text-slate-400">{r.desc}</div>
                      </div>
                      {currentRole === r.id && <Check className="w-3.5 h-3.5 text-fuchsia-400" />}
                    </button>
                  ))}
                  
                  {/* Change Credentials option */}
                  {onOpenChangeCredentials && (
                    <div className="pt-1.5 border-t border-white/10">
                      <button
                        onClick={() => {
                          setRoleMenuOpen(false);
                          onOpenChangeCredentials();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs text-fuchsia-300 hover:bg-fuchsia-500/10 transition-colors cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-fuchsia-400" />
                        <span>Change Password (OTP)</span>
                      </button>
                    </div>
                  )}

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
              className="flex items-center gap-1 sm:gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/20 active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-slate-900" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </button>
          )}

          {/* Quick Sign Out icon */}
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
