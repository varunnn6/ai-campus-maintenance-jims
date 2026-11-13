import React, { useState } from 'react';
import { 
  Wrench, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Plus, 
  Loader2, 
  ListTodo,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { apiRequest } from '../api.js';

export default function TechnicianPortalView({ 
  complaints = [], 
  currentUser,
  onSelectComplaint, 
  onRefresh, 
  activeSubTab = 'assigned' 
}) {
  const [subTab, setSubTab] = useState(activeSubTab);
  const [processingId, setProcessingId] = useState(null);

  const techName = currentUser?.name || 'Field Technician';
  const techTrade = currentUser?.trade || 'Electrical & HVAC';

  // Filter complaints based on technician perspective
  const assignedJobs = complaints.filter(c => 
    (c.assignedTo?.id === currentUser?._id) ||
    (c.assignedTo?.name && currentUser?.name && c.assignedTo.name.toLowerCase() === currentUser.name.toLowerCase()) ||
    (c.status === 'Assigned' || c.status === 'In Progress')
  );

  const openQueue = complaints.filter(c => 
    (!c.assignedTo?.name || c.assignedTo?.name === '') &&
    c.status !== 'Resolved' && 
    c.status !== 'Closed'
  );

  const completedJobs = complaints.filter(c => 
    c.status === 'Resolved' || c.status === 'Closed'
  );

  // Quick Action: Accept an unassigned job (Opt-In)
  const handleAcceptJob = async (c, e) => {
    e.stopPropagation();
    setProcessingId(c._id || c.complaintId);
    try {
      await apiRequest(`/complaints/${c._id || c.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'In Progress',
          technicianId: currentUser?._id || 'tech',
          technicianName: techName,
          note: `Incident claimed by ${techName} (${techTrade})` 
        })
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Accept job error:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Quick Action: Mark In-Progress
  const handleStartWork = async (c, e) => {
    e.stopPropagation();
    setProcessingId(c._id || c.complaintId);
    try {
      await apiRequest(`/complaints/${c._id || c.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'In Progress', 
          technicianName: techName,
          note: `${techName} arrived on-site, beginning diagnostics & repairs` 
        })
      });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Start work error:', err);
    } finally {
      setProcessingId(null);
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
    <div className="space-y-6">
      
      {/* Technician Profile & Quick Stats Banner */}
      <div className="relative rounded-[32px] overflow-hidden glass-card border border-white/20 p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Warm Ambient Glow */}
        <div 
          className="absolute -right-[10%] -top-[20%] w-[450px] h-[450px] rounded-full opacity-60 filter blur-[90px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(251,146,60,0.85) 0%, rgba(244,63,94,0.7) 45%, rgba(168,85,247,0.5) 75%)'
          }}
        />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-amber-300">
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Field Maintenance Crew Console</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {techName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {techTrade} • AI auto-routes reported campus defects to your queue for immediate inspection, repair, and proof uploads.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl glass-pill text-center font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Assigned</div>
            <div className="text-xl font-bold text-white">{assignedJobs.length}</div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl glass-pill text-center font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Open Pool</div>
            <div className="text-xl font-bold text-amber-300">{openQueue.length}</div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl glass-pill text-center font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Resolved</div>
            <div className="text-xl font-bold text-emerald-400">{completedJobs.length}</div>
          </div>
        </div>

      </div>

      {/* Segmented Filter Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-full glass-card border border-white/10 w-fit text-xs font-semibold overflow-x-auto max-w-full">
        <button
          onClick={() => setSubTab('assigned')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'assigned' 
              ? 'bg-white text-slate-900 shadow-md' 
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>My Work Orders ({assignedJobs.length})</span>
        </button>

        <button
          onClick={() => setSubTab('queue')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'queue' 
              ? 'bg-white text-slate-900 shadow-md' 
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Campus Open Pool ({openQueue.length})</span>
        </button>

        <button
          onClick={() => setSubTab('completed')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
            subTab === 'completed' 
              ? 'bg-white text-slate-900 shadow-md' 
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed History ({completedJobs.length})</span>
        </button>
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* ASSIGNED JOBS TAB */}
        {subTab === 'assigned' && (
          assignedJobs.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-slate-400 glass-card rounded-[28px] border border-white/10">
              No active jobs assigned. Browse the Open Pool to pick up an incident!
            </div>
          ) : (
            assignedJobs.map(job => (
              <div
                key={job._id || job.complaintId}
                onClick={() => onSelectComplaint(job)}
                className="p-6 rounded-[28px] glass-card glass-card-hover border border-white/15 space-y-4 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-fuchsia-300">
                        {job.complaintId}
                      </span>
                      {job.targetTrade && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <span>AI: {job.targetTrade}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location?.facilityName || job.location?.building} • {job.location?.room}</span>
                    </p>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${getPriorityStyle(job.priority)}`}>
                    {job.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {job.description}
                </p>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Status: <strong className="text-white">{job.status}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {job.status === 'Assigned' && (
                      <button
                        onClick={(e) => handleStartWork(job, e)}
                        disabled={processingId === (job._id || job.complaintId)}
                        className="px-3.5 py-1.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        {processingId === (job._id || job.complaintId) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wrench className="w-3.5 h-3.5" />
                        )}
                        <span>Start Work</span>
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(job);
                      }}
                      className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-950" />
                      <span>Resolve & Proof</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}

        {/* OPEN QUEUE TAB */}
        {subTab === 'queue' && (
          openQueue.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-slate-400 glass-card rounded-[28px] border border-white/10">
              Campus queue is clear! All current incidents have been assigned.
            </div>
          ) : (
            openQueue.map(job => (
              <div
                key={job._id || job.complaintId}
                onClick={() => onSelectComplaint(job)}
                className="p-6 rounded-[28px] glass-card glass-card-hover border border-white/15 space-y-4 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {job.complaintId}
                      </span>
                      {job.targetTrade && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-semibold">
                          <Zap className="w-3 h-3 text-fuchsia-400" />
                          <span>AI Auto-Dispatched to {job.targetTrade}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{job.location?.facilityName || job.location?.building} • {job.location?.room}</span>
                    </p>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${getPriorityStyle(job.priority)}`}>
                    {job.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2">
                  {job.description}
                </p>

                <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Category: <strong className="text-slate-200">{job.category}</strong>
                  </span>

                  <button
                    onClick={(e) => handleAcceptJob(job, e)}
                    disabled={processingId === (job._id || job.complaintId)}
                    className="px-4 py-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    {processingId === (job._id || job.complaintId) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-900" />
                    )}
                    <span>Opt In & Claim Task</span>
                  </button>
                </div>
              </div>
            ))
          )
        )}

        {/* COMPLETED TAB */}
        {subTab === 'completed' && (
          completedJobs.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-slate-400 glass-card rounded-[28px] border border-white/10">
              No resolved jobs logged yet.
            </div>
          ) : (
            completedJobs.map(job => (
              <div
                key={job._id || job.complaintId}
                onClick={() => onSelectComplaint(job)}
                className="p-6 rounded-[28px] glass-card border border-white/15 space-y-3 cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">
                      {job.complaintId} • Resolved
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {job.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Completed
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{job.location?.facilityName} ({job.location?.room})</span>
                </div>

                {job.feedback && (
                  <div className="pt-2 border-t border-white/[0.08] flex items-center gap-2 text-xs text-amber-300 font-medium">
                    <span>User Rating:</span>
                    <span>★ {job.feedback.rating}/5</span>
                    {job.feedback.comment && <span className="text-slate-400 italic font-normal">"{job.feedback.comment}"</span>}
                  </div>
                )}
              </div>
            ))
          )
        )}

      </div>

    </div>
  );
}
