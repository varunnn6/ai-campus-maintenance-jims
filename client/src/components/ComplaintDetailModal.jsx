import React, { useState } from 'react';
import { apiRequest } from '../api.js';
import { 
  X, 
  MapPin, 
  User, 
  Clock, 
  Tag, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  Wrench, 
  AlertTriangle, 
  ArrowRight, 
  Star,
  Send,
  Loader2,
  ShieldCheck,
  History
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
  const [newStatus, setNewStatus] = useState(complaint?.status || 'Submitted');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Technician resolution log state
  const [actionTaken, setActionTaken] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [costEstimated, setCostEstimated] = useState('');
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
        body: JSON.stringify({ status: statusToSet, note: customNote || statusNote })
      });
      if (data && onStatusUpdated) onStatusUpdated(data.complaint);
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Technician Work-Order Log & Resolution
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
          statusResult: 'Resolved'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              {complaint.complaintId}
            </span>
            <div>
              <h2 className="text-base font-bold text-white line-clamp-1">{complaint.title}</h2>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{complaint.category}</span>
                <span>•</span>
                <span>{complaint.location?.building} ({complaint.location?.room})</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Stepper */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Complaint Resolution Lifecycle
            </span>
            <div className="flex items-center justify-between relative">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={step} className="flex-1 flex flex-col items-center relative z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-lg'
                        : isPassed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] mt-1.5 font-medium ${
                      isCurrent ? 'text-blue-400 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                );
              })}
              {/* Connector line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(Math.max(0, currentStepIdx) / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details & AI Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Issue Description, Image & History */}
            <div className="lg:col-span-2 space-y-5">
              {/* Issue Description Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Issue Summary & Location
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {complaint.description}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block">Facility / Building</span>
                    <span className="font-medium text-slate-200">{complaint.location?.building}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Room Number</span>
                    <span className="font-medium text-slate-200">{complaint.location?.room || 'General Area'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Asset Tag</span>
                    <span className="font-medium text-slate-200">{complaint.location?.specificAsset || 'None specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reported By</span>
                    <span className="font-medium text-slate-200">{complaint.reportedBy?.name} ({complaint.reportedBy?.role})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Priority</span>
                    <span className={`font-bold ${
                      complaint.priority === 'Critical' ? 'text-rose-400' :
                      complaint.priority === 'High' ? 'text-amber-400' : 'text-yellow-400'
                    }`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Reported Date</span>
                    <span className="font-medium text-slate-200">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photo & Computer Vision Inspection Card */}
              {complaint.images && complaint.images.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    Visual Inspection & Computer Vision Analysis
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-48 h-32 rounded-lg overflow-hidden border border-slate-700 bg-black flex items-center justify-center shrink-0">
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
                          <div className="text-emerald-400 font-medium">
                            Computer Vision Confidence: {Math.round((complaint.cvAnalysis.confidence || 0.9) * 100)}%
                          </div>
                          <div className="text-slate-400 italic">
                            Action: {complaint.cvAnalysis.suggestedAction}
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-400">Photo attached for technician inspection.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Maintenance History Timeline */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-400" />
                  Audit Trail & Maintenance Timeline
                </h3>
                <div className="space-y-3 pl-2 border-l border-slate-800">
                  {(complaint.history || []).map((h, idx) => (
                    <div key={idx} className="relative pl-4 space-y-0.5">
                      <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{h.status}</span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(h.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{h.note}</p>
                      <span className="text-[10px] text-slate-500">Updated by {h.updatedBy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Feedback Display */}
              {complaint.feedback && complaint.feedback.rating && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">Student / Staff Resolution Feedback</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < complaint.feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    "{complaint.feedback.comment || 'Issue was resolved swiftly and properly.'}"
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: AI Triage Insights & Role Actions */}
            <div className="space-y-5">
              {/* AI Triage Card */}
              <div className="p-4 rounded-xl bg-gradient-to-b from-blue-950/50 to-indigo-950/30 border border-blue-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                    AI Triage Intelligence
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">NLP Model Classification</span>
                    <div className="font-semibold text-white flex items-center justify-between mt-0.5">
                      <span>{complaint.aiClassification?.category || complaint.category}</span>
                      <span className="text-emerald-400 font-mono">
                        {Math.round((complaint.aiClassification?.confidence || 0.92) * 100)}% Match
                      </span>
                    </div>
                  </div>

                  {complaint.aiClassification?.keywords && complaint.aiClassification.keywords.length > 0 && (
                    <div>
                      <span className="text-slate-400 block text-[11px] mb-1">Keywords Extracted</span>
                      <div className="flex flex-wrap gap-1">
                        {complaint.aiClassification.keywords.map(kw => (
                          <span key={kw} className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {complaint.aiPriority && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Priority Scoring Factors</span>
                      <div className="text-slate-300 text-[11px] mt-1 space-y-1">
                        <div>Urgency Score: <strong>{complaint.aiPriority.urgencyScore}/100</strong></div>
                        <div>Target SLA: <strong>{complaint.aiPriority.slaHours} Hours</strong></div>
                        <ul className="list-disc list-inside text-slate-400 mt-1">
                          {(complaint.aiPriority.rationale || []).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION: Admin Controls (Assign Technician & Transition Status) */}
              {(currentRole === 'admin' || currentRole === 'staff') && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    Admin & Facility Controls
                  </h3>

                  {/* Assign Technician Form */}
                  <form onSubmit={handleAssignTechnician} className="space-y-2">
                    <label className="text-[11px] text-slate-400 block">Dispatch Technician</label>
                    <select
                      value={selectedTech}
                      onChange={(e) => setSelectedTech(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      <option value="">Select Technician...</option>
                      {technicians.map(t => (
                        <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={isAssigning || !selectedTech}
                      className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                      {isAssigning ? 'Assigning...' : 'Dispatch Technician'}
                    </button>
                  </form>

                  {/* Manual Status Transition */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="text-[11px] text-slate-400 block">Update Status Directly</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {['Verified', 'In Progress', 'Resolved', 'Closed'].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateStatus(st, `Status updated by Admin to ${st}`)}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                        >
                          Mark as {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION: Technician Workspace (Start work / Log Resolution) */}
              {currentRole === 'technician' && complaint.status !== 'Resolved' && complaint.status !== 'Closed' && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-3">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                    <Wrench className="w-4 h-4" />
                    Technician Work Log
                  </div>

                  {complaint.status === 'Assigned' && (
                    <button
                      onClick={() => handleUpdateStatus('In Progress', 'Technician on-site and beginning diagnostics')}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg"
                    >
                      Start Work (Mark In Progress)
                    </button>
                  )}

                  <form onSubmit={handleLogResolution} className="space-y-2.5 pt-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Repairs Performed</label>
                      <textarea
                        required
                        rows={2}
                        value={actionTaken}
                        onChange={(e) => setActionTaken(e.target.value)}
                        placeholder="e.g., Replaced 32A MCB breaker, tightened neutral line..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400 block">Parts Replaced</label>
                        <input
                          type="text"
                          value={partsReplaced}
                          onChange={(e) => setPartsReplaced(e.target.value)}
                          placeholder="e.g., MCB Breaker"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block">Est. Cost (₹)</label>
                        <input
                          type="number"
                          value={costEstimated}
                          onChange={(e) => setCostEstimated(e.target.value)}
                          placeholder="e.g., 850"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoggingAction}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors"
                    >
                      {isLoggingAction ? 'Recording...' : 'Complete Work & Mark Resolved'}
                    </button>
                  </form>
                </div>
              )}

              {/* ACTION: Student / Staff Feedback Form when Resolved */}
              {(complaint.status === 'Resolved' || complaint.status === 'Closed') && !complaint.feedback?.rating && !feedbackSubmitted && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Rate Maintenance Resolution
                  </h3>
                  <form onSubmit={handleSendFeedback} className="space-y-2.5">
                    <div className="flex items-center gap-1.5 justify-center py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1 cursor-pointer"
                        >
                          <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Optional remarks on resolution quality..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingFeedback}
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                    >
                      {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
