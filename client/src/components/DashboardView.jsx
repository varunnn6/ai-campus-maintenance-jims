import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Activity, 
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Zap,
  Building
} from 'lucide-react';

export default function DashboardView({ 
  summary, 
  trendData = [], 
  riskHeatmap = [], 
  complaints = [], 
  onSelectComplaint, 
  onRefresh,
  onOpenReportModal,
  onOpenPredictive
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
      
      {/* 🌟 HERO SECTION: Matching the "Bold Gradients. Clean UI." Inspiration Style */}
      <div className="relative rounded-[32px] overflow-hidden glass-card border border-white/20 p-8 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.4)]">
        
        {/* Internal lush gradient orb inside the hero */}
        <div 
          className="absolute -right-[10%] -top-[20%] w-[550px] h-[550px] rounded-full opacity-70 filter blur-[90px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.9) 0%, rgba(192,132,252,0.85) 40%, rgba(99,102,241,0.6) 70%, transparent 85%)'
          }}
        />

        <div className="relative z-10 max-w-2xl space-y-4">
          
          {/* Subtle Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-white/25 text-[11px] font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>Autonomous Facility Intelligence</span>
          </div>

          {/* Intelligent Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
            Predictive Operations. <br />
            <span className="gradient-text-aura">Zero Downtime.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-lg">
            Transitioning campus facilities from reactive reporting to proactive, data-driven management through real-time ML risk scoring and automated defect triage.
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
              <span>Predictive Sandbox</span>
            </button>
          </div>

        </div>
      </div>

      {/* KPI Cards: Frosted Glass with delicate aura borders */}
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
              / {complaints.length} logged
            </span>
          </div>
        </div>

        {/* Critical SLA */}
        <div className="p-5 rounded-2xl glass-card glass-card-hover border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Critical Priority</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-rose-400">
              {kpis.criticalCount}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              +{kpis.highCount} elevated
            </span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-5 rounded-2xl glass-card glass-card-hover border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Resolution Rate</span>
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

        {/* MTTR */}
        <div className="p-5 rounded-2xl glass-card glass-card-hover border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Mean Time to Resolve</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {kpis.mttrHours}h
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              target &lt; 24h
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Activity & Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Issues List (2 Cols) */}
        <div className="lg:col-span-2 rounded-[24px] glass-card border border-white/15 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Recent Incidents</h2>
              <p className="text-xs text-slate-400">Real-time facility maintenance telemetry</p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1 rounded-full glass-pill text-xs text-fuchsia-300 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              + Create
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

        {/* Right Column: Predictive Vulnerabilities & Domain Breakdown */}
        <div className="space-y-6">
          
          {/* Facility Risk Radar */}
          <div className="p-5 rounded-[24px] glass-card border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-fuchsia-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Vulnerability Radar
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-semibold font-mono">
                Live
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {highRiskAreas.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">All monitored facilities optimal.</div>
              ) : (
                highRiskAreas.map((f) => {
                  const score = f.riskScore || 20;
                  return (
                    <div key={f._id || f.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-200 truncate max-w-[170px]">{f.name}</span>
                        <span className={`text-[11px] font-mono font-bold ${score >= 60 ? 'text-rose-400' : 'text-slate-300'}`}>
                          Risk {score}
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

          {/* Domain Category Distribution */}
          <div className="p-5 rounded-[24px] glass-card border border-white/15 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Domain Breakdown
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
