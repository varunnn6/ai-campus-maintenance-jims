import React, { useState } from 'react';
import { apiRequest } from '../api.js';
import { 
  Activity, 
  ShieldAlert, 
  Clock, 
  Wrench, 
  Send,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function PredictiveMaintenanceHub({ 
  riskHeatmap = [], 
  recurringClusters = [], 
  onGenerateWorkOrder 
}) {
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
      if (data) setSandboxResult(data);
    } catch (err) {
      console.error('NLP test error:', err);
    } finally {
      setIsSandboxTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Summary */}
      <div className="p-5 rounded-xl bg-[#111622] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Equipment Reliability & MTBF Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical failure forecasting and Mean Time Between Failures modeling across campus facilities.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] font-mono">
            Model: <span className="text-slate-200">Poisson-CDF</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] font-mono">
            SLA: <span className="text-emerald-400">95.8%</span>
          </div>
        </div>
      </div>

      {/* Grid: Campus Space Vulnerabilities & Interactive NLP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Space Vulnerabilities List (2 cols) */}
        <div className="lg:col-span-2 rounded-xl bg-[#111622] border border-white/[0.08] overflow-hidden">
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Campus Facility Risk Heatmap</h3>
              <p className="text-xs text-slate-400">Continuous risk scoring based on active defects and asset age</p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {riskHeatmap.length} spaces tracked
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {riskHeatmap.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No facility data available.</div>
            ) : (
              riskHeatmap.map(space => {
                const score = space.riskScore || 20;
                const isCritical = score >= 60;
                return (
                  <div key={space._id || space.name} className="p-4 hover:bg-white/[0.02] transition-colors space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-medium text-slate-200 flex items-center gap-2">
                          <span>{space.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {space.block} • {space.roomNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {space.activeIssuesCount > 0 ? (
                            <span className="text-rose-400 font-medium">
                              {space.activeIssuesCount} unresolved defect{space.activeIssuesCount > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-medium">All equipment nominal</span>
                          )}
                          {' '}• {space.assets?.length || 0} registered assets
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                          isCritical 
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
                            : score >= 40 
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
                            : 'text-slate-300 bg-slate-800 border-slate-700'
                        }`}>
                          Score {score}/100
                        </span>
                      </div>
                    </div>

                    {/* Risk Bar */}
                    <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCritical ? 'bg-rose-500' : score >= 40 ? 'bg-amber-500' : 'bg-blue-500'
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

        {/* NLP Interactive Sandbox (1 col) */}
        <div className="rounded-xl bg-[#111622] border border-white/[0.08] p-4 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-100">Live NLP Classifier</h3>
            <p className="text-xs text-slate-400">
              Test real-time defect domain inference via the trained classification pipeline.
            </p>
          </div>

          <form onSubmit={testSandboxNLP} className="space-y-3">
            <textarea
              value={sandboxText}
              onChange={(e) => setSandboxText(e.target.value)}
              rows={3}
              placeholder="Describe a defect or hazard..."
              className="w-full p-2.5 rounded-lg bg-black/30 border border-white/[0.08] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={isSandboxTesting}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              {isSandboxTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating text...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Classify Description</span>
                </>
              )}
            </button>
          </form>

          {sandboxResult && (
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-blue-400">{sandboxResult.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-mono text-emerald-400">
                  {Math.round((sandboxResult.confidence || 0.95) * 100)}%
                </span>
              </div>
              {sandboxResult.keywords && (
                <div className="pt-1 flex flex-wrap gap-1">
                  {sandboxResult.keywords.map((k, i) => (
                    <span key={i} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      #{k}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
