import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  GraduationCap, 
  Wrench, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import { apiRequest } from '../api.js';

export default function AdminUserManagementModal({ isOpen, onClose, onUserAdded }) {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [department, setDepartment] = useState('MCA Department');
  const [trade, setTrade] = useState('Electrical & HVAC');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [program, setProgram] = useState('MCA Shift-1');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter the user full name.' });
      return;
    }
    if (role === 'student' && (!enrollmentNumber.trim() || !fatherName.trim())) {
      setStatusMsg({ type: 'error', text: 'Enrollment number and Father\'s Name (ALL CAPS) are required for students.' });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const payload = {
        name: name.trim(),
        role,
        department,
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim() || undefined,
        enrollmentNumber: role === 'student' ? enrollmentNumber.trim() : null,
        fatherName: role === 'student' ? fatherName.trim().toUpperCase() : null,
        trade: (role === 'technician' || role === 'helper') ? trade : null,
        program: role === 'student' ? program : null
      };

      const res = await apiRequest('/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setStatusMsg({ 
        type: 'success', 
        text: res.message || `${role.toUpperCase()} added successfully to Firebase!` 
      });

      if (onUserAdded) onUserAdded(res.user);

      // Reset form fields
      setName('');
      setEnrollmentNumber('');
      setFatherName('');
      setPhone('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        onClose();
      }, 1400);

    } catch (err) {
      console.error('Add user error:', err);
      setStatusMsg({ 
        type: 'error', 
        text: err.message || 'Failed to save member to Firebase.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative z-10 w-full max-w-xl rounded-[32px] glass-card border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Add Campus Member</h2>
              <p className="text-xs text-slate-400">Save new student, technician, helper, or faculty permanently to Firebase</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-4 gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          {[
            { id: 'student', label: 'Student', icon: GraduationCap },
            { id: 'technician', label: 'Technician', icon: Wrench },
            { id: 'helper', label: 'Helper', icon: User },
            { id: 'staff', label: 'Faculty', icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            const isActive = role === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setRole(t.id);
                  setStatusMsg(null);
                }}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

        {statusMsg && (
          <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Full Name *</label>
            <input 
              type="text" 
              required
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
            />
          </div>

          {/* Student Specific Fields */}
          {role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Enrollment Number *</label>
                <input 
                  type="text" 
                  required
                  value={enrollmentNumber} 
                  onChange={e => setEnrollmentNumber(e.target.value)}
                  placeholder="e.g. 05014004425"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Father's Name (Password in CAPS) *</label>
                <input 
                  type="text" 
                  required
                  value={fatherName} 
                  onChange={e => setFatherName(e.target.value.toUpperCase())}
                  placeholder="e.g. SURESH KUMAR"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 font-mono transition-colors uppercase"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">Program / Shift</label>
                <select
                  value={program}
                  onChange={e => setProgram(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-fuchsia-500"
                >
                  <option value="MCA Shift-1">MCA Shift-1 (04425)</option>
                  <option value="MCA Shift-2">MCA Shift-2 (50404425)</option>
                  <option value="BCA">BCA Program</option>
                  <option value="BBA">BBA Program</option>
                </select>
              </div>
            </div>
          )}

          {/* Technician / Helper Trade & Credentials */}
          {(role === 'technician' || role === 'helper') && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Assigned Trade / Skill</label>
                  <select
                    value={trade}
                    onChange={e => setTrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="Electrical & HVAC">Electrical & HVAC</option>
                    <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
                    <option value="Civil & Carpentry">Civil & Carpentry</option>
                    <option value="IT & Networking">IT & Networking</option>
                    <option value="General Maintenance">General Maintenance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98100 12345"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Login Email *</label>
                  <input 
                    type="email" 
                    required
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. technician@jims.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Login Password *</label>
                  <input 
                    type="text" 
                    required
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="e.g. tech123"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Faculty / Staff Fields */}
          {role === 'staff' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Academic Department</label>
                  <input 
                    type="text" 
                    value={department} 
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. MCA Department"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98100 12345"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Official Campus Email *</label>
                  <input 
                    type="email" 
                    required
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@jims.edu"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Login Password *</label>
                  <input 
                    type="text" 
                    required
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    placeholder="e.g. faculty123"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full glass-pill text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Firebase...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5 text-slate-900" />
                  <span>Save Member</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

