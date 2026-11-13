import React, { useState } from 'react';
import { apiRequest } from '../api.js';
import { 
  X, 
  MapPin, 
  User, 
  Clock, 
  Camera, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  Star, 
  Send, 
  Loader2, 
  ShieldCheck, 
  History,
  Sparkles,
  Upload,
  Check,
  RefreshCw
} from 'lucide-react';

const STATUS_STEPS = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function ComplaintDetailModal({ 
  complaint, 
  isOpen, 
  onClose, 
  currentRole, 
  technicians = [], 
  onStatusUpdated 
}) {
  const [selectedTech, setSelectedTech] = useState('');
  const [assignNote, setAssignNote] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Status transition state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Technician resolution log state
  const [actionTaken, setActionTaken] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [costEstimated, setCostEstimated] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [isLoggingAction, setIsLoggingAction] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!isOpen || !complaint) return null;

  const currentStepIdx = STATUS_STEPS.indexOf(complaint.status);

  // Handle Technician Assignment
  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    if (!selectedTech) return;
    setIsAssigning(true);
    try {
      const data = await apiRequest(`/complaints/${complaint._id || complaint.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: selectedTech, note: assignNote })
      });
      if (data && onStatusUpdated) onStatusUpdated(data.complaint);
    } catch (err) {
      console.error('Assign error:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (statusToSet, customNote) => {
    setIsUpdatingStatus(true);
    try {
      const data = await apiRequest(`/complaints/${complaint._id || complaint.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusToSet, note: customNote })
      });
      if (data && onStatusUpdated) onStatusUpdated(data.complaint);
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Image File Upload for Completion Proof
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompletionPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Technician Work-Order Log & Resolution with Proof
  const handleLogResolution = async (e) => {
    e.preventDefault();
    if (!actionTaken.trim()) return;
    setIsLoggingAction(true);
    try {
      await apiRequest('/maintenance/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': 'technician'
        },
        body: JSON.stringify({
          complaintId: complaint.complaintId,
          actionTaken,
          partsReplaced: partsReplaced ? partsReplaced.split(',').map(s => s.trim()) : [],
          costEstimated: Number(costEstimated) || 0,
          statusResult: 'Resolved',
          remarks: completionPhoto ? 'Completion photo proof attached' : ''
        })
      });

      // Refresh complaint
      const updatedC = await apiRequest(`/complaints/${complaint._id || complaint.id}`);
      if (updatedC && onStatusUpdated) onStatusUpdated(updatedC);
    } catch (err) {
      console.error('Log resolution error:', err);
    } finally {
      setIsLoggingAction(false);
    }
  };

  // Handle Feedback Submission
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const data = await apiRequest(`/complaints/${complaint._id || complaint.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: feedbackComment })
      });
      if (data) {
        setFeedbackSubmitted(true);
        if (onStatusUpdated) onStatusUpdated(data.complaint);
      }
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-rose-300 bg-rose-500/20 border-rose-400/30';
      case 'High': return 'text-amber-300 bg-amber-500/20 border-amber-400/30';
      case 'Medium': return 'text-sky-300 bg-sky-500/20 border-sky-400/30';
      default: return 'text-slate-300 bg-white/10 border-white/15';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Radiant Floating Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[32px] glass-card border border-white/20 p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6)] space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-fuchsia-300">
                {complaint.complaintId}
              </span>
              <span className="text-slate-500">•</span>
              <span className={`text-[10px] font-mono font-bold px-3 py-0.5 rounded-full border ${getPriorityStyle(complaint.priority)}`}>
                {complaint.priority} Urgency
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300 font-medium">
                {complaint.category}
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight">
              {complaint.title}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{complaint.location?.facilityName || complaint.location?.building} • {complaint.location?.room || 'General Area'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full glass-pill text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Stepper */}
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="relative flex items-center justify-between">
            {STATUS_STEPS.map((step, idx) => {
              const isPassed = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={step} className="flex flex-col items-center relative z-10 space-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isPassed 
                      ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-md shadow-fuchsia-500/40' 
                      : 'bg-white/10 text-slate-400'
                  }`}>
                    {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span className={`text-[10px] font-semibold hidden sm:block ${
                    isCurrent ? 'text-fuchsia-300 font-bold' : isPassed ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Details, Photos, History */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Recurring Problem & Complete Replacement Advisor Banner */}
            {(complaint.recurrenceAlert || (complaint.occurrences && complaint.occurrences >= 2)) && (
              <div className={`p-4 rounded-2xl border ${
                (complaint.recurrenceAlert?.isReplacementCandidate || (complaint.occurrences && complaint.occurrences >= 3))
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              } space-y-2.5`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    (complaint.recurrenceAlert?.isReplacementCandidate || (complaint.occurrences && complaint.occurrences >= 3))
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                  }`}>
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      (complaint.recurrenceAlert?.isReplacementCandidate || (complaint.occurrences && complaint.occurrences >= 3))
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}>
                      {(complaint.recurrenceAlert?.isReplacementCandidate || (complaint.occurrences && complaint.occurrences >= 3))
                        ? 'Repeat Problem • Complete Replacement Advised'
                        : 'Frequent Breakdown Notice'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      {complaint.recurrenceAlert?.headline || `Reported ${complaint.occurrences || 2} times in ${complaint.roomNumber || 'this location'}`}
                    </h4>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {complaint.recurrenceAlert?.recommendation || 'This unit/location breaks down repeatedly. Continuous patch repairs cost more than permanent replacement. The campus administrator is advised to approve a complete replacement rather than another routine repair.'}
                </p>
              </div>
            )}

            {/* Description Card */}
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Incident Description & Context
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-normal">
                {complaint.description}
              </p>
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
                <span>Reported by: <strong className="text-white">{complaint.reportedBy?.name || 'Campus Member'}</strong></span>
                <span>Date: {new Date(complaint.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Photos & Computer Vision */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-fuchsia-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Defect Photos & Visual Analysis
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden border border-white/15 bg-black/40 flex items-center justify-center shrink-0">
                    <img src={complaint.images[0].url} alt="Defect" className="max-h-full object-contain" />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {complaint.cvAnalysis ? (
                      <>
                        <div className="font-bold text-white text-sm">
                          {complaint.cvAnalysis.detectedFault}
                        </div>
                        <div className="text-slate-400">
                          {complaint.cvAnalysis.visualFeatures}
                        </div>
                        <div className="text-emerald-400 font-semibold font-mono">
                          Confidence: {Math.round((complaint.cvAnalysis.confidence || 0.95) * 100)}%
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400">Visual proof attached for inspection.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Audit History Timeline */}
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Lifecycle Audit Trail
                </h3>
              </div>
              <div className="space-y-3 pl-3 border-l border-white/15">
                {(complaint.history || []).map((h, idx) => (
                  <div key={idx} className="relative pl-4 space-y-0.5">
                    <div className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full bg-fuchsia-500 ring-4 ring-black" />
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-white font-bold">{h.status}</span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(h.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{h.note}</p>
                    <span className="text-[10px] text-slate-500">By {h.updatedBy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Feedback Display */}
            {complaint.feedback?.rating && (
              <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">User Satisfaction Feedback</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < complaint.feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "{complaint.feedback.comment || 'Repair was carried out quickly and successfully.'}"
                </p>
              </div>
            )}

          </div>

          {/* Right Column: Tailored Role Actions */}
          <div className="space-y-5">
            
            {/* TECHNICIAN WORKSPACE & PROOF OF WORK */}
            {currentRole === 'technician' && complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
              <div className="p-5 rounded-2xl glass-card border border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Field Technician Resolution</span>
                </div>

                <form onSubmit={handleLogResolution} className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Actions Taken</label>
                    <textarea
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                      placeholder="e.g. Replaced faulty MCB breaker and tested voltage nominal..."
                      rows={2}
                      className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Parts Replaced (comma separated)</label>
                    <input
                      type="text"
                      value={partsReplaced}
                      onChange={(e) => setPartsReplaced(e.target.value)}
                      placeholder="e.g. 16A MCB Switch, Wiring"
                      className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Completion Photo Upload */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Upload Work Completion Photo</label>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 hover:border-amber-400/50 bg-black/20 cursor-pointer transition-colors text-xs text-slate-300">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>{completionPhoto ? 'Photo Attached (Click to change)' : 'Attach Fixed Photo Proof'}</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {completionPhoto && (
                      <div className="mt-2 h-24 rounded-lg overflow-hidden border border-white/15">
                        <img src={completionPhoto} alt="Proof" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingAction || !actionTaken.trim()}
                    className="w-full py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoggingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    )}
                    <span>Mark as Resolved & Submit Proof</span>
                  </button>
                </form>
              </div>
            )}

            {/* STUDENT / FACULTY: RATE SERVICE QUALITY */}
            {(currentRole === 'student' || currentRole === 'staff') && (complaint.status === 'Resolved' || complaint.status === 'Closed') && !complaint.feedback?.rating && (
              <div className="p-5 rounded-2xl glass-card border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>Rate Resolution Quality</span>
                </div>
                <p className="text-xs text-slate-300">
                  Did the technician resolve this issue to your satisfaction?
                </p>

                <div className="flex items-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-white ml-2">{rating}/5 Stars</span>
                </div>

                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Leave a comment for the campus maintenance team..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />

                <button
                  onClick={handleSendFeedback}
                  disabled={isSubmittingFeedback}
                  className="w-full py-2.5 rounded-full bg-white text-slate-900 font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Service Feedback</span>
                </button>
              </div>
            )}

            {/* ADMIN / SUPERVISOR CONTROLS */}
            {currentRole === 'admin' && (
              <div className="p-5 rounded-2xl glass-card border border-white/15 space-y-4">
                <div className="flex items-center gap-2 text-fuchsia-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
                  <span>Admin Dispatch Controls</span>
                </div>

                {/* Dispatch Form */}
                <form onSubmit={handleAssignTechnician} className="space-y-2">
                  <label className="text-[11px] text-slate-400 block">Dispatch Technician</label>
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-fuchsia-400 cursor-pointer"
                  >
                    <option value="">Select Technician...</option>
                    {technicians.map(t => (
                      <option key={t._id} value={t._id} className="bg-[#111622]">{t.name} ({t.department})</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={isAssigning || !selectedTech}
                    className="w-full py-2 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {isAssigning ? 'Dispatching...' : 'Assign to Job'}
                  </button>
                </form>

                {/* Direct Status Actions */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <label className="text-[11px] text-slate-400 block">Override Ticket Lifecycle</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Verified', 'In Progress', 'Resolved', 'Closed'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st, `Status updated by Director to ${st}`)}
                        className="py-1.5 px-3 rounded-full glass-pill text-[11px] font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                      >
                        Set {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
