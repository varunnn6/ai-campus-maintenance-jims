import React, { useState } from 'react';
import { apiRequest } from '../api.js';
import { 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles, 
  Cpu, 
  Send,
  Loader2,
  FileText
} from 'lucide-react';

export default function PredictiveMaintenanceHub({ 
  riskHeatmap = [], 
  recurringClusters = [], 
  onGenerateWorkOrder 
}) {
  // AI Sandbox Playground state
  const [sandboxText, setSandboxText] = useState('MCB circuit breaker sparking with burning odor in lab 2');
  const [sandboxResult, setSandboxResult] = useState(null);
  const [isSandboxTesting, setIsSandboxTesting] = useState(false);

  const testSandboxNLP = async (e) => {
    e.preventDefault();
    if (!sandboxText.trim()) return;
    setIsSandboxTesting(true);
    try {
      const data = await apiRequest('/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sandboxText })
      });
      if (data) {
        setSandboxResult(data);
      }
    } catch (err) {
      console.error('NLP test error:', err);
    } finally {
      setIsSandboxTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/60 border border-purple-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Zap className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                AI Predictive Maintenance & Recurrence Analytics Center
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Powered by Mean Time Between Failures (MTBF), Exponential/Poisson CDF Models, and NLP Pattern Clustering
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
              Poisson Failure Hazard Rate λ = 1/MTBF
            </span>
          </div>
        </div>
      </div>

      {/* 1. CAMPUS FAILURE RISK HEATMAP */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Campus Infrastructure Vulnerability Heatmap
            </h3>
            <p className="text-xs text-slate-400">
              Real-time failure probability index calculated from historical maintenance cycles and critical report density
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {riskHeatmap.length} Monitored Facilities
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {riskHeatmap.map(f => {
            const isHigh = f.riskScore >= 75;
            const isMed = f.riskScore >= 50 && f.riskScore < 75;

            return (
              <div 
                key={f._id}
                className={`p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
                  isHigh 
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-900/10' 
                    : isMed 
                    ? 'bg-amber-950/20 border-amber-500/40' 
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isHigh ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    isMed ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {f.riskTier}
                  </span>
                  <span className="font-mono text-xs text-slate-400">{f.roomNumber}</span>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{f.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{f.block} • {f.floor}</p>
                </div>

                {/* Progress bar of risk */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Failure Risk Index</span>
                    <span className={`font-mono font-bold ${
                      isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {f.riskScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? 'bg-rose-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${f.riskScore}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Forecast Failure:</span>
                    <strong className="text-slate-200">{f.predictedFailureWindow}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Active Backlog:</span>
                    <strong className="text-slate-200">{f.activeIssuesCount} issues</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RECURRING ISSUES CLUSTER TABLE */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              Recurring Failure Clusters & Preventive Action Orders
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated repeated breakdown patterns across campus assets with statistical MTBF calculations
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Location & Equipment Zone</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Occurrences</th>
                <th className="py-3 px-3">MTBF (Days)</th>
                <th className="py-3 px-3">Failure Prob (15d)</th>
                <th className="py-3 px-3">AI Preventive Action Recommendation</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recurringClusters.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white">
                    {item.building} • {item.room}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">
                    {item.occurrences}x Reports
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {item.mtbfDays} Days
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-bold border border-rose-500/20">
                      {Math.round(item.failureProbabilityNext15Days * 100)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs">
                    {item.recommendedAction}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onGenerateWorkOrder && onGenerateWorkOrder(item)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 font-medium transition-colors cursor-pointer"
                    >
                      Issue Order
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. INTERACTIVE AI / ML SANDBOX PLAYGROUND */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-base font-bold text-white">Interactive AI Model Inspector</h3>
            <p className="text-xs text-slate-400">
              Test custom maintenance complaints directly against the Python scikit-learn NLP engine in real-time
            </p>
          </div>
        </div>

        <form onSubmit={testSandboxNLP} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              placeholder="Type any hypothetical campus issue description to test classifier..."
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isSandboxTesting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSandboxTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Test NLP Classifier</span>
            </button>
          </div>
        </form>

        {sandboxResult && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Classified Category</span>
                <div className="text-sm font-bold text-white mt-0.5">
                  {sandboxResult.category}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Confidence Score</span>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {Math.round(sandboxResult.confidence * 100)}% Match
                </div>
              </div>
            </div>

            {sandboxResult.all_probabilities && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Class Probability Distribution:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(sandboxResult.all_probabilities).map(([cat, prob]) => (
                    <div key={cat} className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-300 truncate">{cat}</span>
                      <span className="font-mono text-blue-400">{Math.round(prob * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
