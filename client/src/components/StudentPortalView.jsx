import React, { useState } from 'react';
import { 
  Plus, 
  Camera, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  ArrowRight, 
  MapPin, 
  User, 
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';

const STATUS_STEPS = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

export default function StudentPortalView({ 
  complaints = [], 
  currentRole, 
  onSelectComplaint, 
  onOpenReportModal 
}) {
  const isStudent = currentRole === 'student';
  const userName = isStudent ? 'Varun Malik' : 'Prof. Shankar Sumar';
  const userRoleLabel = isStudent ? 'MCA Student' : 'MCA Faculty Member';

  // Filter complaints reported by student/faculty or general if empty
  const myComplaints = complaints.filter(c => 
    (c.reportedBy?.name && c.reportedBy.name.toLowerCase().includes(isStudent ? 'varun' : 'shankar')) ||
    (c.reportedBy?.role === currentRole)
  );

  // If no specific match, show complaints so the user has interactive demo items
  const displayList = myComplaints.length > 0 ? myComplaints : complaints.slice(0, 3);

  const getStepIndex = (status) => {
    switch (status) {
      case 'Submitted': return 0;
      case 'Verified': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved':
      case 'Closed': return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Friendly Welcome & Fast Action Banner */}
      <div className="relative rounded-[32px] overflow-hidden glass-card border border-white/20 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Glow */}
        <div 
          className="absolute -right-[10%] -top-[20%] w-[450px] h-[450px] rounded-full opacity-60 filter blur-[90px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.85) 0%, rgba(192,132,252,0.7) 45%, rgba(99,102,241,0.5) 75%)'
          }}
        />

        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-fuchsia-300">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>{userRoleLabel} • Self-Service Hub</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Hello, {userName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Report broken campus infrastructure, track real-time technician dispatch, and verify completed maintenance with photo proofs.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={onOpenReportModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/20 active:scale-95"
          >
            <Camera className="w-4 h-4 text-fuchsia-600" />
            <span>Report Defect with Photo</span>
          </button>
        </div>

      </div>

      {/* My Active Tracked Issues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">My Submissions & Status Tracking</h2>
            <p className="text-xs text-slate-400">Live progress tracking and technician feedback</p>
          </div>
          <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full glass-pill">
            {displayList.length} Requests
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {displayList.map(item => {
            const currentStep = getStepIndex(item.status);
            const isResolved = item.status === 'Resolved' || item.status === 'Closed';
            const hasFeedback = item.feedback && item.feedback.rating;

            return (
              <div
                key={item._id || item.complaintId}
                className="p-6 rounded-[28px] glass-card border border-white/15 space-y-5 hover:border-white/25 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-fuchsia-300">
                        {item.complaintId}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs font-semibold text-slate-300">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        item.priority === 'Critical' ? 'text-rose-300 bg-rose-500/20 border-rose-500/30' : 'text-slate-300 bg-white/10 border-white/15'
                      }`}>
                        {item.priority} Urgency
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{item.location?.facilityName || item.location?.building} ({item.location?.room || 'Main Hall'})</span>
                    </p>
                  </div>

                  {/* Status Badge & View Button */}
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isResolved 
                        ? 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'
                        : item.status === 'In Progress'
                        ? 'text-violet-300 bg-violet-500/20 border-violet-500/30'
                        : 'text-amber-300 bg-amber-500/20 border-amber-500/30'
                    }`}>
                      {item.status}
                    </span>

                    <button
                      onClick={() => onSelectComplaint(item)}
                      className="px-4 py-1.5 rounded-full glass-pill text-xs font-semibold text-white hover:text-white transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Progress Stepper Bar */}
                <div className="pt-2">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {STATUS_STEPS.map((step, idx) => {
                      const isComplete = idx <= currentStep;
                      const isCurrent = idx === currentStep;
                      return (
                        <div key={step} className="space-y-1.5">
                          <div className={`h-1.5 rounded-full transition-all ${
                            isComplete 
                              ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 shadow-sm shadow-fuchsia-500/50' 
                              : 'bg-white/10'
                          }`} />
                          <span className={`text-[10px] font-semibold block truncate ${
                            isCurrent 
                              ? 'text-fuchsia-300 font-bold' 
                              : isComplete 
                              ? 'text-slate-300' 
                              : 'text-slate-500'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Technician or Feedback Prompt */}
                <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>
                      {item.assignedTo?.name ? (
                        <>Technician: <strong className="text-slate-200">{item.assignedTo.name}</strong></>
                      ) : (
                        'Awaiting technician dispatch'
                      )}
                    </span>
                  </div>

                  {/* Feedback action if resolved */}
                  {isResolved && (
                    <div className="flex items-center gap-2">
                      {hasFeedback ? (
                        <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                          <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                          <span>Rated {item.feedback.rating}/5 stars</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onSelectComplaint(item)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors cursor-pointer text-[11px]"
                        >
                          <Star className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Rate Resolution Quality</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
