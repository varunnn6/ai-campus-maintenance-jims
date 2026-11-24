import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../api.js';

export default function ChangeCredentialsModal({ isOpen, onClose, currentUser, onCredentialsUpdated }) {
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification, 3: success
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpTarget, setOtpTarget] = useState('email'); // 'email' or 'phone'
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentEmail = currentUser?.email || '';
  const currentPhone = currentUser?.phone || '';

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newEmail && !newPhone && !newPassword) {
      setErrorMsg('Please enter at least one credential to update (new email, phone, or password).');
      return;
    }

    // Determine destination contact for OTP
    const destinationContact = otpTarget === 'email' 
      ? (newEmail.trim() || currentEmail) 
      : (newPhone.trim() || currentPhone);

    if (!destinationContact) {
      setErrorMsg(`No destination ${otpTarget} found to dispatch OTP. Please enter your new ${otpTarget}.`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiRequest('/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: destinationContact,
          purpose: 'credential_update'
        })
      });

      if (res && res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and save
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }

    setIsLoading(true);

    try {
      const destinationContact = otpTarget === 'email' 
        ? (newEmail.trim() || currentEmail) 
        : (newPhone.trim() || currentPhone);

      const res = await apiRequest('/auth/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?._id || currentUser?.id,
          currentIdentifier: currentUser?.enrollmentNumber || currentUser?.email || currentUser?.username,
          contact: destinationContact,
          otp: otp.trim(),
          newEmail: newEmail.trim() || undefined,
          newPhone: newPhone.trim() || undefined,
          newPassword: newPassword.trim() || undefined
        })
      });

      setSuccessMsg(res.message || 'Your login credentials have been updated successfully!');
      setStep(3);

      if (res.user && onCredentialsUpdated) {
        onCredentialsUpdated(res.user);
      }

      setTimeout(() => {
        handleResetAndClose();
      }, 2000);

    } catch (err) {
      setErrorMsg(err.message || 'OTP verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setNewEmail('');
    setNewPhone('');
    setNewPassword('');
    setOtp('');
    setDemoOtp('');
    setErrorMsg('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0" onClick={handleResetAndClose} />

      <div className="relative z-10 w-full max-w-lg rounded-[32px] glass-card border border-white/20 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Update Login Credentials
              </h2>
              <p className="text-xs text-slate-400">
                Securely update your email, phone, or password with OTP verification
              </p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Badge */}
        <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">{currentUser?.name || 'Logged-in Member'}</div>
            <div className="text-[10px] text-fuchsia-400 font-mono capitalize">
              {currentUser?.role || 'User'} • {currentUser?.enrollmentNumber || currentUser?.email || 'Active'}
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter New Credentials */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            
            {/* New Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>New Official Email (optional)</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={currentEmail || "e.g. yourname@jims.edu"}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>

            {/* New Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>New Mobile Number (optional)</span>
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder={currentPhone || "+91 98100 12345"}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>New Password (optional)</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password to update"
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-fuchsia-500 transition-colors"
              />
            </div>

            {/* OTP Destination Preference */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-slate-300 block">
                Send Verification OTP code via:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOtpTarget('email')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    otpTarget === 'email'
                      ? 'bg-fuchsia-500/20 border-fuchsia-500 text-white'
                      : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOtpTarget('phone')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    otpTarget === 'phone'
                      ? 'bg-fuchsia-500/20 border-fuchsia-500 text-white'
                      : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Phone SMS OTP</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-xl shadow-white/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Generating Verification OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter & Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            
            {/* Demo Notice Banner */}
            {demoOtp && (
              <div className="p-3.5 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/30 text-white text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-fuchsia-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Demo Mode Verification Code</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Your 6-digit OTP code is: <span className="font-mono font-bold text-base text-white tracking-widest px-2 py-0.5 rounded bg-black/40 border border-fuchsia-500/30 ml-1">{demoOtp}</span>
                </p>
                <p className="text-[10px] text-slate-400">
                  (In live production, this code is dispatched directly to your {otpTarget})
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Enter 6-Digit OTP Code *
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 123456"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-white placeholder-slate-500 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-fuchsia-500 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ← Back to credentials
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                className="text-fuchsia-400 hover:text-fuchsia-300 font-semibold cursor-pointer"
              >
                Resend Code
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full py-3 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-xl shadow-white/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Verifying Code & Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Credentials</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Credentials Updated!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              {successMsg || 'Your login credentials have been permanently updated.'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
