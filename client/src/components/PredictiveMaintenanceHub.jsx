import React from 'react';
import { 
  Wrench, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Plus, 
  ShieldCheck 
} from 'lucide-react';

export default function PredictiveMaintenanceHub({ 
  riskHeatmap = [], 
  recurringClusters = [], 
  onGenerateWorkOrder 
}) {
  // Pre-configured watchlist for frequent breakdown points on campus
  const DEFAULT_WATCHLIST = [
    {
      building: 'Building B',
      room: 'Computer Lab 2 (Basement)',
      issue: 'AC Cooling & Power Trip',
      frequency: 'Reported 3 times this month',
      recommendation: 'Clean condenser coils & check circuit breaker load',
      severity: 'High Attention'
    },
    {
      building: 'Building A',
      room: 'Indoor Canteen',
      issue: 'Commercial Water Purifier & Cooler',
      frequency: 'Reported 2 times this month',
      recommendation: 'Replace RO water filter cartridge and inspect pipeline pressure',
      severity: 'Medium'
    },
    {
      building: 'Building A',
      room: 'Main Auditorium',
      issue: 'Ceiling Projector & Audio System',
      frequency: 'Reported 2 times this month',
      recommendation: 'Replace projector lamp and tighten HDMI wall-socket connectors',
      severity: 'Medium'
    },
    {
      building: 'Building B',
      room: 'Table Tennis (TT) Room',
      issue: 'Fluorescent Tube Lights Flickering',
      frequency: 'Reported 1 time this month',
      recommendation: 'Upgrade to energy-saving LED batten fixtures',
      severity: 'Low'
    }
  ];

  const watchlist = recurringClusters.length > 0 ? recurringClusters : DEFAULT_WATCHLIST;

  return (
    <div className="space-y-8">
      
      {/* Friendly Top Header */}
      <div className="relative rounded-[32px] overflow-hidden glass-card border border-white/20 p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Soft Ambient Aurora Glow */}
        <div 
          className="absolute -right-[10%] -top-[20%] w-[450px] h-[450px] rounded-full opacity-60 filter blur-[90px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.8) 0%, rgba(192,132,252,0.7) 45%, rgba(99,102,241,0.5) 75%)'
          }}
        />

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-fuchsia-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preventive Maintenance & Alerts</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Campus Equipment Watch. <br />
            <span className="gradient-text-aura">Preventive Care.</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Keep track of campus facilities and equipment that break down frequently. Schedule routine maintenance before major problems disrupt classes or students.
          </p>
        </div>

        {/* Practical Operational Stats */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-2xl glass-pill text-center font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Avg. Fix Time</div>
            <div className="text-lg font-bold text-emerald-400">&lt; 24h</div>
          </div>
          <div className="px-4 py-2.5 rounded-2xl glass-pill text-center font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Routine Checks</div>
            <div className="text-lg font-bold text-fuchsia-300">Weekly</div>
          </div>
        </div>

      </div>

      {/* Main Grid: Campus Facilities Health & Frequent Breakdown Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Campus Facilities Health List (2 cols) */}
        <div className="lg:col-span-2 rounded-[28px] glass-card border border-white/15 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Campus Rooms & Facility Status</h3>
              <p className="text-xs text-slate-400">Condition of campus spaces based on reported defects</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {riskHeatmap.length} spaces logged
            </span>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {riskHeatmap.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No facility records found.</div>
            ) : (
              riskHeatmap.map(space => {
                const hasIssues = space.activeIssuesCount > 0;
                const score = space.riskScore || 20;
                const isUrgent = score >= 50 || space.activeIssuesCount >= 2;

                return (
                  <div key={space._id || space.name} className="p-4 sm:px-5 hover:bg-white/[0.04] transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{space.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {space.block} • {space.roomNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          {hasIssues ? (
                            <span className="text-rose-400 font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{space.activeIssuesCount} active issue{space.activeIssuesCount > 1 ? 's' : ''} reported</span>
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>In good working order</span>
                            </span>
                          )}
                          <span>•</span>
                          <span>{space.assets?.length || 0} fixtures/equipment</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isUrgent 
                            ? 'text-rose-300 bg-rose-500/20 border-rose-400/30' 
                            : hasIssues 
                            ? 'text-amber-300 bg-amber-500/20 border-amber-400/30' 
                            : 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30'
                        }`}>
                          {isUrgent ? 'Needs Inspection' : hasIssues ? 'Minor Issue' : 'All Clear'}
                        </span>

                        {onGenerateWorkOrder && (
                          <button
                            onClick={() => onGenerateWorkOrder({ building: space.block, room: space.roomNumber })}
                            className="px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            Service
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Simple visual health bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isUrgent 
                            ? 'bg-rose-400' 
                            : hasIssues 
                            ? 'bg-amber-400' 
                            : 'bg-emerald-400'
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

        {/* Frequent Breakdown Watchlist (Replaced NLP debug sandbox) */}
        <div className="rounded-[28px] glass-card border border-white/15 p-6 space-y-4 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Frequent Breakdown Watch</h3>
            </div>
            <p className="text-xs text-slate-400">
              Equipment reported repeatedly that needs preventive maintenance checkups.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {watchlist.map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.room || item.location}</h4>
                    <p className="text-[11px] text-fuchsia-300 font-semibold mt-0.5">{item.issue || item.category}</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {item.severity || 'Attention'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>{item.frequency || 'Recurring issues logged'}</span>
                </div>

                {item.recommendation && (
                  <p className="text-[11px] text-slate-300 bg-black/20 p-2 rounded-xl">
                    💡 <span className="text-slate-400">Action:</span> {item.recommendation}
                  </p>
                )}

                {onGenerateWorkOrder && (
                  <button
                    onClick={() => onGenerateWorkOrder(item)}
                    className="w-full mt-2 py-1.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-[11px] font-bold transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 text-slate-900" />
                    <span>Schedule Preventive Service</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
