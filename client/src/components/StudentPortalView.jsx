import React from 'react';
import { 
  Camera, 
  MapPin, 
  User, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowRight,
  ImageIcon
} from 'lucide-react';

const STATUS_STEPS = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'];

export default function StudentPortalView({ 
  complaints = [], 
  currentUser,
  currentRole, 
  onSelectComplaint, 
  onOpenReportModal 
}) {
  const isStudent = currentRole === 'student';
  const displayName = currentUser?.name || (isStudent ? 'Student' : 'Faculty Member');
  const enrollmentNo = currentUser?.enrollmentNumber;
  const program = currentUser?.program || currentUser?.department || 'MCA Department';

  // Filter complaints reported by this specific student/user
  const myComplaints = complaints.filter(c => {
    if (!currentUser) return false;
    // Match by DB id
    if (currentUser._id && c.reportedBy?.id === currentUser._id) return true;
    // Match by enrollment number (most reliable for students)
    if (currentUser.enrollmentNumber && c.reportedBy?.enrollmentNumber === currentUser.enrollmentNumber) return true;
    // Match by name (case-insensitive)
    if (currentUser.name && c.reportedBy?.name && 
        c.reportedBy.name.toLowerCase() === currentUser.name.toLowerCase()) return true;
    // Match by email
    if (currentUser.email && c.reportedBy?.email && 
        c.reportedBy.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
    return false;
  });

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
      
      {/* Personalized Welcome Banner */}
      <div className="relative rounded-[32px] overflow-hidden glass-card border border-white/20 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Soft Ambient Aurora Orb */}
        <div 
          className="absolute -right-[10%] -top-[20%] w-[450px] h-[450px] rounded-full opacity-60 filter blur-[90px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.8) 0%, rgba(192,132,252,0.7) 45%, rgba(99,102,241,0.5) 75%)'
          }}
        />

        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-fuchsia-300">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
            <span>{isStudent ? 'Student Self-Service Portal' : 'Faculty Service Portal'}</span>
            {enrollmentNo && <span className="font-mono text-slate-300">• {enrollmentNo}</span>}
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome, {displayName}
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {program} • Report maintenance issues in classrooms, labs, or canteens, and track technician repair progress with photo proof.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={onOpenReportModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/20 active:scale-95"
          >
            <Camera className="w-4 h-4 text-fuchsia-600" />
            <span>Report an Issue</span>
          </button>
        </div>

      </div>

      {/* My Active Tracked Issues */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">My Submissions & Status Tracking</h2>
            <p className="text-xs text-slate-400">Live progress updates, technician notes, and completion proof photos</p>
          </div>
          <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full glass-pill">
            {myComplaints.length} Submitted
          </span>
        </div>

        {myComplaints.length === 0 ? (
          <div className="p-10 rounded-[32px] glass-card border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <Camera className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No maintenance complaints submitted yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Noticed a broken fixture, AC issue, or lab hardware defect? Submit a report with a photo to auto-dispatch our field technicians.
              </p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="px-6 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <Camera className="w-3.5 h-3.5 text-fuchsia-600" />
              <span>Report First Incident</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myComplaints.map(item => {
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
                          {item.priority}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{item.location?.facilityName || item.location?.building} • Floor: {item.location?.floor || '1st'} ({item.location?.room || 'Main'})</span>
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

                  {/* Resolution Proof Notice */}
                  {isResolved && item.resolutionPhotos && item.resolutionPhotos.length > 0 && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>Completion photo proof uploaded by field technician</span>
                      </div>
                      <button
                        onClick={() => onSelectComplaint(item)}
                        className="font-bold underline text-white"
                      >
                        Inspect Photo Proof
                      </button>
                    </div>
                  )}

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
                            <span>Rate Repair Quality</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
