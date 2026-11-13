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
    <div className="space-y-4">
      
      {/* Header & Filter */}
      <div className="p-3 rounded-xl bg-[#111622] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Facilities & Monitored Spaces
          </h2>
          <p className="text-xs text-slate-400">Campus directory and infrastructure asset health</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms or spaces..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={filterBlock}
            onChange={(e) => setFilterBlock(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="All" className="bg-[#111622]">All Blocks</option>
            <option value="Block A" className="bg-[#111622]">Block A</option>
            <option value="Block B" className="bg-[#111622]">Block B</option>
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(f => {
          const score = f.riskScore || 20;
          const hasIssues = (f.activeIssuesCount || 0) > 0;
          return (
            <div 
              key={f._id || f.name}
              className="p-4 rounded-xl bg-[#111622] border border-white/[0.08] space-y-3 hover:border-white/[0.15] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-100">{f.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {f.block} • {f.floor} • {f.roomNumber}
                  </p>
                </div>
                <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                  hasIssues
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  {hasIssues ? `${f.activeIssuesCount} Active Issues` : 'Nominal'}
                </span>
              </div>

              {/* Assets list */}
              {f.assets && f.assets.length > 0 && (
                <div className="pt-2 border-t border-white/[0.04] space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
                    Monitored Equipment
                  </span>
                  <div className="grid grid-cols-1 gap-1">
                    {f.assets.map(asset => (
                      <div key={asset.assetTag || asset.name} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-black/20">
                        <span className="text-slate-300 truncate max-w-[200px]">{asset.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">{asset.assetTag}</span>
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
