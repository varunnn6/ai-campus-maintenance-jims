import React, { useState } from 'react';
import { 
  Building2, 
  Search,
  CheckCircle2,
  AlertCircle
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
      <div className="p-4 sm:p-5 rounded-[28px] glass-card border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-2xl">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            Campus Infrastructure Registry
          </h2>
          <p className="text-xs text-slate-400">Monitored academic labs, facilities, and physical assets</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms or spaces..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-black/30 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-fuchsia-400 transition-colors"
            />
          </div>
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-4 py-2 rounded-full glass-pill text-xs text-slate-200 focus:outline-none focus:border-fuchsia-400 cursor-pointer font-medium"
          >
            <option value="All" className="bg-[#111622] text-white">All Blocks</option>
            <option value="Block A" className="bg-[#111622] text-white">Block A</option>
            <option value="Block B" className="bg-[#111622] text-white">Block B</option>
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(f => {
          const score = f.riskScore || 20;
          const hasIssues = (f.activeIssuesCount || 0) > 0;
          return (
            <div 
              key={f._id || f.name}
              className="p-6 rounded-[28px] glass-card glass-card-hover border border-white/15 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{f.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {f.block} • {f.floor} • {f.roomNumber}
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${
                  hasIssues
                    ? 'text-rose-300 bg-rose-500/20 border-rose-400/30'
                    : 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30'
                }`}>
                  {hasIssues ? `${f.activeIssuesCount} Active Issues` : 'Optimal'}
                </span>
              </div>

              {/* Assets list */}
              {f.assets && f.assets.length > 0 && (
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Monitored Equipment
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {f.assets.map(asset => (
                      <div key={asset.assetTag || asset.name} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <span className="text-slate-200 truncate max-w-[210px] font-medium">{asset.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{asset.assetTag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
