import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  Wrench, 
  User, 
  ShieldCheck,
  Search,
  Mail,
  Save,
  Check,
  Users,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../api.js';

export default function AdminUserManagementModal({ isOpen, onClose, onUserAdded }) {
  // Main view mode: 'directory' (assign gmails) or 'add-member' (create new user)
  const [activeMode, setActiveMode] = useState('directory');

  // Directory filter states
  const [selectedRole, setSelectedRole] = useState('student');
  const [searchQuery, setSearchQuery] = useState('');
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Per-row email inputs and save status tracking
  // emailInputs: { [userId]: 'varun@gmail.com' }
  const [emailInputs, setEmailInputs] = useState({});
  // savingRows: { [userId]: boolean }
  const [savingRows, setSavingRows] = useState({});
  // savedRows: { [userId]: boolean }
  const [savedRows, setSavedRows] = useState({});
  const [isBatchSaving, setIsBatchSaving] = useState(false);

  // Add Member Form state
  const [newRole, setNewRole] = useState('student');
  const [newName, setNewName] = useState('');
  const [newEnrollment, setNewEnrollment] = useState('');
  const [newFatherName, setNewFatherName] = useState('');
  const [newDepartment, setNewDepartment] = useState('MCA Department');
  const [newTrade, setNewTrade] = useState('Electrical & HVAC');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newProgram, setNewProgram] = useState('MCA Shift-1');
  const [newPassword, setNewPassword] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addStatusMsg, setAddStatusMsg] = useState(null);

  // Fetch users whenever modal opens or role/search filter changes
  useEffect(() => {
    if (isOpen && activeMode === 'directory') {
      fetchDirectoryUsers();
    }
  }, [isOpen, activeMode, selectedRole]);

  // Debounced search trigger
  useEffect(() => {
    if (!isOpen || activeMode !== 'directory') return;
    const timer = setTimeout(() => {
      fetchDirectoryUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDirectoryUsers = async () => {
    setLoadingUsers(true);
    setErrorMsg('');
    try {
      const queryParams = new URLSearchParams();
      if (selectedRole && selectedRole !== 'all') {
        queryParams.append('role', selectedRole);
      }
      if (searchQuery.trim()) {
        queryParams.append('search', searchQuery.trim());
      }

      const res = await apiRequest(`/auth/users?${queryParams.toString()}`);
      if (res && res.users) {
        setUserList(res.users);
        // Pre-fill email inputs with existing recovery emails
        const initialInputs = {};
        res.users.forEach(u => {
          initialInputs[u._id] = u.recoveryEmail || '';
        });
        setEmailInputs(initialInputs);
      }
    } catch (err) {
      console.error('Error fetching directory users:', err);
      setErrorMsg(err.message || 'Failed to load user directory.');
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  // Single user Gmail save
  const handleSaveEmail = async (user) => {
    const updatedEmail = (emailInputs[user._id] || '').trim().toLowerCase();
    
    if (updatedEmail && (!updatedEmail.includes('@') || !updatedEmail.includes('.'))) {
      setErrorMsg(`Please enter a valid Gmail address for ${user.name}`);
      return;
    }

    setSavingRows(prev => ({ ...prev, [user._id]: true }));
    setErrorMsg('');

    try {
      const res = await apiRequest(`/auth/users/${encodeURIComponent(user._id)}/email`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryEmail: updatedEmail })
      });

      setSavedRows(prev => ({ ...prev, [user._id]: true }));
      setSuccessToast(`Saved recovery Gmail for ${user.name}`);

      // Update local state
      setUserList(prev => prev.map(u => {
        if (u._id === user._id) {
          return {
            ...u,
            recoveryEmail: updatedEmail,
            hasRecoveryEmail: Boolean(updatedEmail && updatedEmail.includes('@') && !updatedEmail.endsWith('@jims.edu'))
          };
        }
        return u;
      }));

      setTimeout(() => {
        setSavedRows(prev => ({ ...prev, [user._id]: false }));
        setSuccessToast('');
      }, 2500);

    } catch (err) {
      console.error('Error updating user email:', err);
      setErrorMsg(err.message || `Failed to update email for ${user.name}`);
    } finally {
      setSavingRows(prev => ({ ...prev, [user._id]: false }));
    }
  };

  // Batch save all modified rows
  const handleBatchSave = async () => {
    // Find all users where input differs from original userList
    const updates = [];
    userList.forEach(u => {
      const currentVal = (emailInputs[u._id] || '').trim().toLowerCase();
      const originalVal = (u.recoveryEmail || '').trim().toLowerCase();
      if (currentVal !== originalVal && currentVal.includes('@')) {
        updates.push({
          id: u._id,
          enrollmentNumber: u.enrollmentNumber,
          recoveryEmail: currentVal
        });
      }
    });

    if (updates.length === 0) {
      setSuccessToast('No unsaved email changes to apply.');
      setTimeout(() => setSuccessToast(''), 2000);
      return;
    }

    setIsBatchSaving(true);
    setErrorMsg('');

    try {
      const res = await apiRequest('/auth/users/batch-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      setSuccessToast(`Successfully updated ${res.updatedCount || updates.length} recovery Gmail(s)!`);
      fetchDirectoryUsers();

      setTimeout(() => {
        setSuccessToast('');
      }, 3000);

    } catch (err) {
      console.error('Batch save error:', err);
      setErrorMsg(err.message || 'Failed to apply batch updates.');
    } finally {
      setIsBatchSaving(false);
    }
  };

  // Add Member Form submission
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setAddStatusMsg({ type: 'error', text: 'Please enter the user full name.' });
      return;
    }
    if (newRole === 'student' && (!newEnrollment.trim() || !newFatherName.trim())) {
      setAddStatusMsg({ type: 'error', text: "Enrollment number and Father's Name (ALL CAPS) are required for students." });
      return;
    }

    setIsAddingUser(true);
    setAddStatusMsg(null);

    try {
      const payload = {
        name: newName.trim(),
        role: newRole,
        department: newDepartment,
        email: newEmail.trim(),
        phone: newPhone.trim(),
        password: newPassword.trim() || undefined,
        enrollmentNumber: newRole === 'student' ? newEnrollment.trim() : null,
        fatherName: newRole === 'student' ? newFatherName.trim().toUpperCase() : null,
        trade: (newRole === 'technician' || newRole === 'helper') ? newTrade : null,
        program: newRole === 'student' ? newProgram : null
      };

      const res = await apiRequest('/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setAddStatusMsg({ 
        type: 'success', 
        text: res.message || `${newRole.toUpperCase()} added successfully to Firebase!` 
      });

      if (onUserAdded) onUserAdded(res.user);

      // Reset form
      setNewName('');
      setNewEnrollment('');
      setNewFatherName('');
      setNewPhone('');
      setNewEmail('');
      setNewPassword('');

      setTimeout(() => {
        setActiveMode('directory');
        fetchDirectoryUsers();
      }, 1200);

    } catch (err) {
      console.error('Add user error:', err);
      setAddStatusMsg({ 
        type: 'error', 
        text: err.message || 'Failed to save member to Firebase.' 
      });
    } finally {
      setIsAddingUser(false);
    }
  };

  // Count metrics
  const totalInView = userList.length;
  const linkedCount = userList.filter(u => u.hasRecoveryEmail).length;
  const missingCount = totalInView - linkedCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative z-10 w-full max-w-4xl rounded-[32px] glass-card border border-white/20 p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] flex flex-col backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/30 text-fuchsia-300 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Campus Directory & Recovery Emails</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20">
                  Admin Authority
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Link verified recovery Gmails for students, technicians, faculty & staff for secure password resets
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setActiveMode('directory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'directory'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Assign Recovery Gmails</span>
            </button>
            <button
              onClick={() => setActiveMode('add-member')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'add-member'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Member</span>
            </button>
          </div>

          {activeMode === 'directory' && (
            <div className="flex items-center gap-2">
              <button
                onClick={fetchDirectoryUsers}
                disabled={loadingUsers}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Refresh user list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin text-fuchsia-400' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleBatchSave}
                disabled={isBatchSaving || loadingUsers}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-fuchsia-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isBatchSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save All Changes</span>
              </button>
            </div>
          )}
        </div>

        {/* Global Feedback Banner */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successToast && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shrink-0 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{successToast}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 1: DIRECTORY & GMAIL ASSIGNMENT                     */}
        {/* ======================================================== */}
        {activeMode === 'directory' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            
            {/* Filter Bar: Profile Role Tabs & Live Search Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              
              {/* Profile Filter Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'student', label: 'Students', icon: GraduationCap },
                  { id: 'staff', label: 'Faculty & Staff', icon: ShieldCheck },
                  { id: 'technician', label: 'Technicians', icon: Wrench },
                  { id: 'helper', label: 'Helpers', icon: User },
                  { id: 'all', label: 'All Profiles', icon: Users }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isSelected = selectedRole === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedRole(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30'
                          : 'text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Direct Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or enrollment..."
                  className="w-full pl-8 pr-8 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metrics KPI Bar */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs shrink-0">
              <div className="text-center sm:text-left sm:pl-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Accounts</span>
                <span className="font-bold text-white text-sm sm:text-base">{totalInView}</span>
              </div>
              <div className="text-center sm:text-left sm:pl-2 border-x border-white/10">
                <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">Recovery Gmails Linked</span>
                <span className="font-bold text-emerald-300 text-sm sm:text-base">{linkedCount}</span>
              </div>
              <div className="text-center sm:text-left sm:pl-2">
                <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">Needs Recovery Gmail</span>
                <span className="font-bold text-amber-300 text-sm sm:text-base">{missingCount}</span>
              </div>
            </div>

            {/* User Directory Rows */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[260px]">
              {loadingUsers ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400" />
                  <p className="text-xs text-slate-400">Loading campus members from Firebase...</p>
                </div>
              ) : userList.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-2 text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <Users className="w-8 h-8 text-slate-500" />
                  <p className="text-xs font-semibold text-slate-300">No members found</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    {searchQuery ? `No profiles matched "${searchQuery}". Try another name or enrollment number.` : 'No profiles in this category.'}
                  </p>
                </div>
              ) : (
                userList.map((user) => {
                  const isSaving = savingRows[user._id];
                  const isSaved = savedRows[user._id];
                  const currentInput = emailInputs[user._id] ?? (user.recoveryEmail || '');
                  const hasEmail = Boolean(user.hasRecoveryEmail);

                  return (
                    <div 
                      key={user._id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-xs sm:text-sm truncate">
                            {user.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            user.role === 'student' ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' :
                            user.role === 'technician' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                            user.role === 'staff' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                            'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20'
                          }`}>
                            {user.role}
                          </span>
                          {hasEmail ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Linked
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />
                              Missing Gmail
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                          {user.enrollmentNumber && (
                            <span className="font-mono text-fuchsia-400 font-semibold">
                              Roll: {user.enrollmentNumber}
                            </span>
                          )}
                          {user.fatherName && (
                            <span className="text-slate-400">
                              • S/D of {user.fatherName}
                            </span>
                          )}
                          {user.department && (
                            <span className="text-slate-400">
                              • {user.department}
                            </span>
                          )}
                          {user.trade && (
                            <span className="text-amber-400">
                              • {user.trade}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Gmail Input & Save Button */}
                      <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
                        <div className="relative flex-1 sm:w-64">
                          <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            value={currentInput}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEmailInputs(prev => ({ ...prev, [user._id]: val }));
                            }}
                            placeholder="Enter Gmail for OTP..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                          />
                        </div>

                        <button
                          onClick={() => handleSaveEmail(user)}
                          disabled={isSaving}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                            isSaved
                              ? 'bg-emerald-500 text-slate-950 font-extrabold'
                              : 'bg-white text-slate-900 hover:bg-slate-100 shadow-sm'
                          }`}
                        >
                          {isSaving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                💡 Recovery Gmails are stored permanently in Firebase and used to dispatch OTP verification codes whenever members request a password change.
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: REGISTER NEW CAMPUS MEMBER                      */}
        {/* ======================================================== */}
        {activeMode === 'add-member' && (
          <form onSubmit={handleAddMemberSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
            
            {addStatusMsg && (
              <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                addStatusMsg.type === 'success' 
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}>
                {addStatusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{addStatusMsg.text}</span>
              </div>
            )}

            {/* Role Selector Tabs */}
            <div className="grid grid-cols-4 gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              {[
                { id: 'student', label: 'Student', icon: GraduationCap },
                { id: 'technician', label: 'Technician', icon: Wrench },
                { id: 'helper', label: 'Helper', icon: User },
                { id: 'staff', label: 'Faculty', icon: ShieldCheck }
              ].map(t => {
                const Icon = t.icon;
                const isActive = newRole === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setNewRole(t.id);
                      setAddStatusMsg(null);
                    }}
                    className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white text-slate-900 shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Varun Malik"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>

              {/* Recovery Gmail */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Recovery Gmail (For Password OTP)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. varunmalik616@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>

              {/* Student Fields */}
              {newRole === 'student' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Enrollment Number *</label>
                    <input
                      type="text"
                      required
                      value={newEnrollment}
                      onChange={(e) => setNewEnrollment(e.target.value)}
                      placeholder="e.g. 01514004425"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Father's Name (ALL CAPS) *</label>
                    <input
                      type="text"
                      required
                      value={newFatherName}
                      onChange={(e) => setNewFatherName(e.target.value.toUpperCase())}
                      placeholder="e.g. SUNIL MALIK"
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs uppercase focus:outline-none focus:border-fuchsia-500 transition-colors"
                    />
                  </div>
                </>
              )}

              {/* Trade for Technician / Helper */}
              {(newRole === 'technician' || newRole === 'helper') && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Assigned Trade *</label>
                  <select
                    value={newTrade}
                    onChange={(e) => setNewTrade(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#121622] border border-white/10 text-white text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                  >
                    <option value="Electrical & HVAC">Electrical & HVAC</option>
                    <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
                    <option value="Carpentry & Furniture">Carpentry & Furniture</option>
                    <option value="IT Infrastructure & Network">IT Infrastructure & Network</option>
                    <option value="Civil & Masonry">Civil & Masonry</option>
                    <option value="Housekeeping & Sanitation">Housekeeping & Sanitation</option>
                    <option value="All Trades">All Trades (General)</option>
                  </select>
                </div>
              )}

              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. MCA Department"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Contact Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +91 99580 XXXXX"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAddingUser}
              className="w-full py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-white/20 active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {isAddingUser ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Adding Member to Firebase...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Save Member & Enable Recovery Email</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
