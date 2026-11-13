import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Building,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';

export default function DashboardView({ 
  summary, 
  trendData = [], 
  riskHeatmap = [], 
  complaints = [], 
  recurringClusters = [],
  onSelectComplaint, 
  onRefresh,
  onOpenReportModal,
  onOpenPredictive,
  onGenerateWorkOrder
}) {
  const kpis = summary?.kpis || {
    totalComplaints: complaints.length || 0,
    resolvedComplaints: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length || 0,
    inProgress: complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length || 0,
    pendingTriage: complaints.filter(c => c.status === 'Submitted' || c.status === 'Verified').length || 0,
    criticalCount: complaints.filter(c => c.priority === 'Critical').length || 0,
    highCount: complaints.filter(c => c.priority === 'High').length || 0,
    resolutionRate: 78,
    mttrHours: '14.2'
  };

  const categoryCounts = summary?.categoryCounts || {};
  const totalCatSum = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;

  const highRiskAreas = (riskHeatmap || [])
    .filter(item => (item.riskScore || 0) >= 30 || (item.activeIssuesCount || 0) > 0)
    .slice(0, 4);

  // Default recurring problem advisor items if clusters list is empty
  const DEFAULT_RECURRING_ADVICE = [
    {
      clusterKey: 'Building B - Computer Lab 2 (2nd Floor) [HVAC & Climate Control]',
      building: 'Building B',
      room: 'Lab 202 (2nd Floor)',
      category: 'HVAC & Climate Control',
      occurrences: 3,
      isReplacementCandidate: true,
      actionBadge: 'Replace Unit (Stop Patch Repairs)',
      whyReplace: 'This AC unit in Building B Lab 202 has failed 3 times recently. Frequent refrigerant leaks and coil decay mean repeat repair visits are wasting campus funds. A full replacement will save ₹14,000+ in continuous emergency service calls.',
      suggestedSolution: 'Procure and install 2.0 Ton 5-Star Commercial Inverter AC with comprehensive warranty',
      estimatedSavings: 'Saves ~₹14,000/yr in recurring service visits',
      urgency: 'High Priority Replacement'
    },
    {
      clusterKey: 'Building A - Indoor Canteen [Plumbing & Water Supply]',
      building: 'Building A',
      room: 'Indoor Canteen',
      category: 'Plumbing & Water Supply',
      occurrences: 3,
      isReplacementCandidate: true,
      actionBadge: 'Replace Water Unit / Pipeline',
      whyReplace: 'Water dispenser fixture has leaked 3 times. Internal tank rust and stripped threading mean washer replacements only last days before leaking resumes. Continuous repair is unsafe and causes slippery dining floors.',
      suggestedSolution: 'Replace commercial stainless-steel water cooler unit and install reinforced braided lines',
      estimatedSavings: 'Saves 500+ Liters water daily and stops slip hazards',
      urgency: 'Urgent Replacement'
    },
    {
      clusterKey: 'Building B - Corridor 2nd Floor [Electrical & Power]',
      building: 'Building B',
      room: 'Corridor DB-2 (2nd Floor)',
      category: 'Electrical & Power',
      occurrences: 3,
      isReplacementCandidate: true,
      actionBadge: 'Full Rewire & Replace DB Box',
      whyReplace: 'Main switchboard has tripped and sparked 3 times. Replacing fuses repeatedly masks an overloaded circuit or deteriorating feeder wire. Immediate line replacement is necessary to prevent electrical fire hazard.',
      suggestedSolution: 'Replace with 63A 4-Pole MCB Distribution Box and new heavy-gauge copper wiring',
      estimatedSavings: 'Critical Fire Safety & Zero Power Blackouts',
      urgency: 'Critical Replacement'
    }
  ];

  const recurringAdviceItems = (recurringClusters && recurringClusters.length > 0) 
    ? recurringClusters 
    : DEFAULT_RECURRING_ADVICE;

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-300 bg-rose-500/20 border-rose-400/30';
      case 'High':
        return 'text-amber-300 bg-amber-500/20 border-amber-400/30';
      case 'Medium':
        return 'text-sky-300 bg-sky-500/20 border-sky-400/30';
      default:
        return 'text-slate-300 bg-white/10 border-white/15';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30';
      case 'In Progress':
        return 'text-violet-300 bg-violet-500/20 border-violet-400/30';
      case 'Assigned':
        return 'text-fuchsia-300 bg-fuchsia-500/20 border-fuchsia-400/30';
      default:
        return 'text-amber-300 bg-amber-500/20 border-amber-400/30';
    }
  };

  return (
    <div className="space-y-8">
      
      {/* 🌟 HERO EXECUTIVE BANNER */}
      <div className="relative rounded-[32px] overflow-hidden glass-card border border-white/20 p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
        
        {/* Soft Ambient Aurora Glow */}
        <div 
          className="absolute -right-[10%] -top-[20%] w-[550px] h-[550px] rounded-full opacity-70 filter blur-[90px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.85) 0%, rgba(192,132,252,0.8) 40%, rgba(99,102,241,0.55) 70%, transparent 85%)'
          }}
        />

        <div className="relative z-10 max-w-2xl space-y-4">
          
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-white/25 text-[11px] font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Campus Maintenance Overview</span>
          </div>

          {/* Simple, clear headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
            Campus Facility Operations. <br />
            <span className="gradient-text-aura">Fast & Reliable Repairs.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-lg">
            Quickly report campus issues, assign work to technicians, and track repairs to completion with before-and-after photo proof.
          </p>

          {/* Action Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReportModal}
              className="px-6 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/20 active:scale-95"
            >
              Report Incident
            </button>
            <button
              onClick={onOpenPredictive}
              className="px-5 py-2.5 rounded-full glass-pill text-xs font-semibold text-white hover:text-white transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Preventive Maintenance</span>
            </button>
          </div>

        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Active Issues */}
        <div className="p-5 rounded-2xl glass-card glass-card-hover border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active Issues</span>
            <AlertCircle className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {kpis.inProgress + kpis.pendingTriage}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              / {complaints.length} total logged
            </span>
          </div>
        </div>

        {/* Critical Attention */}
        <div className="p-5 rounded-2xl glass-card glass-card-hover border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Urgent Attention</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-rose-400">
              {kpis.criticalCount}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              +{kpis.highCount} high priority
            </span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-5 rounded-2xl glass-card glass-card-hover border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Resolved Successfully</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {kpis.resolutionRate}%
            </span>
            <span className="text-[11px] text-emerald-300 font-semibold">
              {kpis.resolvedComplaints} closed
            </span>
          </div>
        </div>

        {/* Average Repair Time */}
        <div className="p-5 rounded-2xl glass-card glass-card-hover border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Average Repair Time</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {kpis.mttrHours}h
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              target: under 24 hours
            </span>
          </div>
        </div>

      </div>

      {/* 🚨 RECURRING PROBLEM ALERTS & REPLACEMENT ADVISOR (FOR ADMIN) */}
      <div className="p-6 sm:p-8 rounded-[32px] glass-card border border-rose-500/25 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Soft Ambient Rose/Amber Glow */}
        <div 
          className="absolute -right-[5%] -top-[20%] w-[380px] h-[380px] rounded-full opacity-25 filter blur-[100px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244,63,94,0.8) 0%, rgba(251,146,60,0.6) 45%, transparent 75%)'
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Recurring Breakdown Advisor • Action Required for Admin</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Repeat Problem Alerts — Complete Replacement Recommended
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              When equipment breaks down multiple times in the same location, continuous patch repairs waste campus funds and cause repeated disruption. These items have failed repeatedly and require a complete replacement or permanent solution.
            </p>
          </div>

          <button
            onClick={onOpenPredictive}
            className="px-4 py-2 rounded-full glass-pill text-xs font-semibold text-white hover:text-fuchsia-300 transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>All Preventive Watch</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Replacement Recommendation Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurringAdviceItems.slice(0, 3).map((item, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-rose-400/40 transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Location & Occurrences Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-fuchsia-400 uppercase tracking-wider block">
                      {item.building}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {item.room}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                    Failed {item.occurrences} Times
                  </span>
                </div>

                {/* Replacement Recommendation Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
                  <RefreshCw className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{item.actionBadge || 'Complete Replacement Needed'}</span>
                </div>

                {/* Plain language explanation */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.whyReplace}
                </p>

                {/* Concrete Solution Proposed */}
                {item.suggestedSolution && (
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] space-y-1">
                    <span className="text-slate-400 block font-semibold">💡 Recommended Permanent Solution:</span>
                    <span className="text-slate-200 block font-medium">{item.suggestedSolution}</span>
                  </div>
                )}
              </div>

              {/* Action Button for Admin */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                <span className="text-[10px] text-emerald-400 font-mono font-medium">
                  {item.estimatedSavings || 'Stops repeated repair waste'}
                </span>

                <button
                  onClick={() => {
                    if (onGenerateWorkOrder) {
                      onGenerateWorkOrder({
                        building: item.building,
                        room: item.room,
                        title: `Procurement & Complete Replacement: ${item.category} in ${item.room}`
                      });
                    } else if (onOpenReportModal) {
                      onOpenReportModal();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-[11px] font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3 h-3 text-slate-900" />
                  <span>Order Replacement</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Main Grid: Recent Issues & Attention Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Issues List (2 Cols) */}
        <div className="lg:col-span-2 rounded-[24px] glass-card border border-white/15 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Recent Campus Issues</h2>
              <p className="text-xs text-slate-400">Live feed of reported maintenance complaints</p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="px-3.5 py-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              + Report Issue
            </button>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {complaints.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">No issues reported yet.</div>
            ) : (
              complaints.slice(0, 6).map((c) => (
                <div
                  key={c._id || c.complaintId}
                  onClick={() => onSelectComplaint && onSelectComplaint(c)}
                  className="p-4 sm:px-5 flex items-center justify-between gap-3 hover:bg-white/[0.04] cursor-pointer transition-colors group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(c.priority)} shrink-0 mt-0.5`}>
                      {c.priority}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-fuchsia-300 transition-colors truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-slate-300">{c.complaintId}</span>
                        <span>•</span>
                        <span>{c.location?.facilityName || c.location?.building || 'Main Campus'}</span>
                        {c.location?.room && <span>({c.location.room})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors hidden sm:block" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Attention Needed & Breakdown */}
        <div className="space-y-6">
          
          {/* Areas Needing Attention */}
          <div className="p-5 rounded-[24px] glass-card border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-fuchsia-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Areas Needing Attention
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-semibold font-mono">
                Live
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {highRiskAreas.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">All monitored facilities are in good condition.</div>
              ) : (
                highRiskAreas.map((f) => {
                  const score = f.riskScore || 20;
                  return (
                    <div key={f._id || f.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-200 truncate max-w-[170px]">{f.name}</span>
                        <span className={`text-[11px] font-mono font-bold ${score >= 60 ? 'text-rose-400' : 'text-slate-300'}`}>
                          {f.activeIssuesCount > 0 ? `${f.activeIssuesCount} issues` : 'Inspection suggested'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400"
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Issues by Category */}
          <div className="p-5 rounded-[24px] glass-card border border-white/15 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Issues by Category
            </h3>
            <div className="space-y-2.5 pt-1">
              {Object.entries(categoryCounts).slice(0, 5).map(([cat, count]) => {
                const pct = Math.round((count / totalCatSum) * 100);
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-400 rounded-full" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
