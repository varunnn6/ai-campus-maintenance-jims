import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Cpu, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Wrench,
  Search
} from 'lucide-react';

export default function FacilityDirectoryView({ facilities = [] }) {
  const [filterBlock, setFilterBlock] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = facilities.filter(f => {
    if (filterBlock !== 'All' && f.block !== filterBlock) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return f.name.toLowerCase().includes(q) || f.roomNumber.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            JIMS Campus Facility & Asset Registry
          </h2>
          <p className="text-xs text-slate-400">Sector-5 Rohini campus infrastructure and monitored asset health</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility name..."
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="All">All Blocks</option>
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(f => (
          <div 
            key={f._id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors shadow-md space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {f.type}
                </span>
                <h3 className="text-sm font-bold text-white mt-1.5">{f.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {f.block} • {f.floor} • Room {f.roomNumber}
                </p>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  f.riskScore >= 75 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  f.riskScore >= 50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {f.riskScore}% Risk
                </span>
                <div className="text-[10px] text-slate-400 mt-1">
                  Active Backlog: <strong>{f.activeIssuesCount}</strong>
                </div>
              </div>
            </div>

            {/* Assets List */}
            {f.assets && f.assets.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Registered High-Value Assets:
                </span>
                <div className="space-y-1.5">
                  {f.assets.map((asset, i) => (
                    <div 
                      key={i}
                      className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <span className="font-semibold text-slate-200">{asset.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">[{asset.assetTag}]</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Health:</span>
                        <span className={`font-mono font-bold ${
                          asset.healthScore > 75 ? 'text-emerald-400' :
                          asset.healthScore > 50 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {asset.healthScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
