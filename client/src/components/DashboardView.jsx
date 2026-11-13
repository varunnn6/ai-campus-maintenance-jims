import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Flame, 
  TrendingUp, 
  Wrench, 
  ShieldAlert, 
  Activity, 
  Zap, 
  ArrowUpRight,
  Building,
  RefreshCw
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
    totalComplaints: 0,
    resolvedComplaints: 0,
    inProgress: 0,
    pendingTriage: 0,
    criticalCount: 0,
    highCount: 0,
    resolutionRate: 0,
    mttrHours: '14.2'
  };

  const categoryCounts = summary?.categoryCounts || {};
  const priorityCounts = summary?.priorityCounts || { Critical: 0, High: 0, Medium: 0, Low: 0 };
  const statusCounts = summary?.statusCounts || {};

  const totalCatSum = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for High Failure Probability Alerts */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/20 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
            <Zap className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                AI Predictive Maintenance Alert
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                High Risk Zone
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Recurrence model detected <strong>Computer Lab 2 AC Unit</strong> has a <strong>78% breakdown probability</strong> in the next 7 days based on 4 previous condensate overflow events.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live</span>
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            Pre-emptive Service Order
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Complaints */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Reported</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {kpis.totalComplaints}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">+{kpis.inProgress} active</span> across campus
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {kpis.resolutionRate}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${kpis.resolutionRate}%` }}
            />
          </div>
        </div>

        {/* MTTR */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Mean Time To Resolve</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {kpis.mttrHours} <span className="text-xs font-normal text-slate-400">hours</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-medium mt-1">
            Standard SLA: 24h average
          </div>
        </div>

        {/* Critical / High Risk */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Critical Hazards</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {kpis.criticalCount}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">
            {kpis.criticalCount > 0 ? 'Requires immediate response' : 'No critical emergencies'}
          </div>
        </div>

        {/* Pending Triage */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Triage</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {kpis.pendingTriage}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            New reports awaiting review
          </div>
        </div>
      </div>

      {/* Charts & Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Maintenance Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">6-Month Maintenance Trend (Reported vs Resolved)</h3>
              <p className="text-xs text-slate-400">Historical performance across JIMS campus blocks</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Reported
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Resolved
              </span>
            </div>
          </div>

          {/* SVG Bar / Trend visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-800">
            {trendData.map((item, idx) => {
              const maxH = 40;
              const repPct = (item.reported / maxH) * 100;
              const resPct = (item.resolved / maxH) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] font-mono text-slate-500 group-hover:text-white transition-colors">
                    {item.reported}
                  </div>
                  <div className="w-full flex items-end justify-center gap-1.5 h-40">
                    <div 
                      className="w-4 sm:w-5 bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${repPct}%` }}
                      title={`Reported: ${item.reported}`}
                    />
                    <div 
                      className="w-4 sm:w-5 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                      style={{ height: `${resPct}%` }}
                      title={`Resolved: ${item.resolved}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {item.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-1">
            <span>Average turnaround time decreased by <strong>35%</strong> over the past 4 months.</span>
            <span className="text-emerald-400 font-medium">System Operating at 94.2% Efficiency</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-white">Issue Distribution by Category</h3>
            <p className="text-xs text-slate-400">Classified automatically via NLP model</p>
          </div>

          <div className="space-y-2.5 pt-2">
            {Object.entries(categoryCounts).map(([cat, count], idx) => {
              const pct = Math.round((count / totalCatSum) * 100);
              const colors = [
                'bg-blue-500',
                'bg-cyan-500',
                'bg-amber-500',
                'bg-indigo-500',
                'bg-emerald-500',
                'bg-purple-500',
                'bg-rose-500'
              ];
              const barColor = colors[idx % colors.length];

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate">{cat}</span>
                    <span className="text-slate-400 font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Priority Distribution & Campus Risk Heatmap Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-1">Priority Triage Matrix</h3>
          <p className="text-xs text-slate-400 mb-4">Calculated from hazard severity and location density</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-xs font-bold text-rose-400 block">Critical</span>
              <span className="text-xl font-bold text-white mt-1 block">{priorityCounts.Critical || 0}</span>
              <span className="text-[10px] text-rose-300/80">SLA: 2 Hours</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs font-bold text-amber-400 block">High</span>
              <span className="text-xl font-bold text-white mt-1 block">{priorityCounts.High || 0}</span>
              <span className="text-[10px] text-amber-300/80">SLA: 6 Hours</span>
            </div>

            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-xs font-bold text-yellow-400 block">Medium</span>
              <span className="text-xl font-bold text-white mt-1 block">{priorityCounts.Medium || 0}</span>
              <span className="text-[10px] text-yellow-300/80">SLA: 24 Hours</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <span className="text-xs font-bold text-slate-400 block">Low</span>
              <span className="text-xl font-bold text-white mt-1 block">{priorityCounts.Low || 0}</span>
              <span className="text-[10px] text-slate-400">SLA: 72 Hours</span>
            </div>
          </div>
        </div>

        {/* High Risk Facility Radar */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Campus Facility Failure Risk Heatmap</h3>
              <p className="text-xs text-slate-400">Top areas with recurring maintenance vulnerability</p>
            </div>
            <span className="text-xs text-purple-400 font-medium">Predictive Ranking</span>
          </div>

          <div className="space-y-2 pt-1">
            {riskHeatmap.slice(0, 4).map((f) => (
              <div 
                key={f._id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-xs font-bold ${
                    f.riskScore >= 75 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    f.riskScore >= 50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {f.riskScore}% Risk
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{f.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {f.block} • {f.floor} • Primary Risk: <span className="text-slate-300">{f.primaryVulnerability}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    f.riskScore >= 75 ? 'bg-rose-500/10 text-rose-300' :
                    f.riskScore >= 50 ? 'bg-amber-500/10 text-amber-300' :
                    'bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {f.riskTier}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Predicted failure: <strong>{f.predictedFailureWindow}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Complaints Quick Queue */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Recent Complaints & Triage Queue</h3>
            <p className="text-xs text-slate-400">Click any complaint to inspect AI reasoning or update status</p>
          </div>
          <span className="text-xs text-blue-400 font-medium">Latest Submissions</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {complaints.slice(0, 5).map(c => (
            <div
              key={c._id || c.complaintId}
              onClick={() => onSelectComplaint(c)}
              className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-blue-400 group-hover:text-blue-300">
                  {c.complaintId}
                </span>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{c.category}</span>
                    <span>•</span>
                    <span>{c.location?.building} ({c.location?.room})</span>
                    <span>•</span>
                    <span>Reported by {c.reportedBy?.name}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  c.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  c.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  c.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-slate-700 text-slate-300'
                }`}>
                  {c.priority}
                </span>

                <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                  c.status === 'Resolved' || c.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  c.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  c.status === 'Assigned' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {c.status}
                </span>

                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
