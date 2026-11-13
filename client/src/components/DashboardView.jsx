import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Activity, 
  ArrowUpRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function DashboardView({ 
  summary, 
  trendData = [], 
  riskHeatmap = [], 
  complaints = [], 
  onSelectComplaint, 
  onRefresh,
  onOpenReportModal 
}) {
  const kpis = summary?.kpis || {
    totalComplaints: complaints.length || 0,
    resolvedComplaints: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length || 0,
    inProgress: complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length || 0,
    pendingTriage: complaints.filter(c => c.status === 'Submitted' || c.status === 'Verified').length || 0,
    criticalCount: complaints.filter(c => c.priority === 'Critical').length || 0,
    highCount: complaints.filter(c => c.priority === 'High').length || 0,
    resolutionRate: 75,
    mttrHours: '14.2'
  };

  const categoryCounts = summary?.categoryCounts || {};
  const priorityCounts = summary?.priorityCounts || { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const totalCatSum = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;

  // Filter high-risk items for the side widget
  const highRiskAreas = (riskHeatmap || [])
    .filter(item => (item.riskScore || 0) >= 40 || (item.activeIssuesCount || 0) > 0)
    .slice(0, 4);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'High':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Medium':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Assigned':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Active */}
        <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Issues</span>
            <AlertCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-white">
              {kpis.inProgress + kpis.pendingTriage}
            </span>
            <span className="text-[11px] text-slate-500">
              of {complaints.length} logged
            </span>
          </div>
        </div>

        {/* Critical SLA */}
        <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Critical / High Priority</span>
            <ShieldAlert className="w-4 h-4 text-rose-400/80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-rose-400">
              {kpis.criticalCount}
            </span>
            <span className="text-[11px] text-slate-500">
              +{kpis.highCount} elevated
            </span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-white">
              {kpis.resolutionRate}%
            </span>
            <span className="text-[11px] text-emerald-400/90 font-medium">
              {kpis.resolvedComplaints} resolved
            </span>
          </div>
        </div>

        {/* MTTR */}
        <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mean Time to Resolve</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-white">
              {kpis.mttrHours}h
            </span>
            <span className="text-[11px] text-slate-500">
              target &lt; 24h
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Activity & Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Issues List (2 Cols) */}
        <div className="lg:col-span-2 rounded-xl bg-[#111622] border border-white/[0.08] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Recent Issues</h2>
              <p className="text-xs text-slate-400">Latest reported facility incidents</p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium cursor-pointer"
            >
              + New Issue
            </button>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No issues reported yet.</div>
            ) : (
              complaints.slice(0, 6).map((c) => (
                <div
                  key={c._id || c.complaintId}
                  onClick={() => onSelectComplaint && onSelectComplaint(c)}
                  className="p-3.5 sm:px-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getPriorityBadge(c.priority)} shrink-0 mt-0.5`}>
                      {c.priority}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-200 truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-slate-400">{c.complaintId}</span>
                        <span>•</span>
                        <span>{c.location?.facilityName || c.location?.building || 'Campus'}</span>
                        {c.location?.room && <span>({c.location.room})</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Predictive Vulnerabilities & Distribution */}
        <div className="space-y-6">
          
          {/* Facility Risk Radar */}
          <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                  Vulnerability Index
                </h3>
              </div>
              <span className="text-[10px] text-slate-500">Real-time</span>
            </div>

            <div className="space-y-2.5 pt-1">
              {highRiskAreas.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">All zones operational.</div>
              ) : (
                highRiskAreas.map((f) => {
                  const score = f.riskScore || 20;
                  return (
                    <div key={f._id || f.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[170px]">{f.name}</span>
                        <span className={`text-[11px] font-mono ${score >= 60 ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                          Risk {score}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            score >= 60 ? 'bg-rose-500' : score >= 40 ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="p-4 rounded-xl bg-[#111622] border border-white/[0.08] space-y-3">
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
              Issue Classification
            </h3>
            <div className="space-y-2 pt-1">
              {Object.entries(categoryCounts).slice(0, 5).map(([cat, count]) => {
                const pct = Math.round((count / totalCatSum) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-400/80 rounded-full" 
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
