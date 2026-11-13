import React, { useState } from 'react';
import { 
  Search, 
  ChevronRight,
  Plus,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electrical & Power',
  'Plumbing & Water Supply',
  'HVAC & Climate Control',
  'IT & Computer Labs',
  'Civil & Furniture',
  'Sanitation & Hygiene',
  'Fire & Safety Equipment'
];

const PRIORITIES = ['All Priorities', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Submitted', 'In Progress', 'Resolved', 'Closed'];

export default function ComplaintsListView({ 
  complaints = [], 
  onSelectComplaint, 
  onOpenReportModal 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState('All Priorities');
  const [statusTab, setStatusTab] = useState('All');

  const filtered = complaints.filter(c => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.complaintId && c.complaintId.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.location?.room && c.location.room.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (selectedCategory !== 'All Categories' && c.category !== selectedCategory) return false;
    if (selectedPriority !== 'All Priorities' && c.priority !== selectedPriority) return false;

    if (statusTab !== 'All') {
      if (statusTab === 'In Progress' && c.status !== 'In Progress' && c.status !== 'Assigned') return false;
      if (statusTab === 'Resolved' && c.status !== 'Resolved') return false;
      if (statusTab === 'Closed' && c.status !== 'Closed') return false;
      if (statusTab === 'Submitted' && c.status !== 'Submitted' && c.status !== 'Verified') return false;
    }

    return true;
  });

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical': return 'text-rose-300 bg-rose-500/20 border-rose-400/30';
      case 'High': return 'text-amber-300 bg-amber-500/20 border-amber-400/30';
      case 'Medium': return 'text-sky-300 bg-sky-500/20 border-sky-400/30';
      default: return 'text-slate-300 bg-white/10 border-white/15';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed': return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/30';
      case 'In Progress': return 'text-violet-300 bg-violet-500/20 border-violet-400/30';
      case 'Assigned': return 'text-fuchsia-300 bg-fuchsia-500/20 border-fuchsia-400/30';
      default: return 'text-amber-300 bg-amber-500/20 border-amber-400/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Control Pill Bar */}
      <div className="p-3 sm:p-4 rounded-[28px] glass-card border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xl backdrop-blur-2xl">
        
        {/* Search Input Pill */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incident titles, IDs, rooms..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-black/30 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-fuchsia-400 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-full glass-pill text-xs text-slate-200 focus:outline-none focus:border-fuchsia-400 cursor-pointer font-medium"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-[#111622] text-white">{cat}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 rounded-full glass-pill text-xs text-slate-200 focus:outline-none focus:border-fuchsia-400 cursor-pointer font-medium"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p} className="bg-[#111622] text-white">{p}</option>
            ))}
          </select>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-md shadow-white/20 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-900" />
            <span>Create</span>
          </button>

        </div>
      </div>

      {/* Status Segmented Pill Filter */}
      <div className="flex items-center gap-1.5 p-1 rounded-full glass-card border border-white/10 w-fit text-xs">
        {STATUSES.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
              statusTab === tab 
                ? 'bg-white text-slate-900 shadow-md' 
                : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {tab}
          </button>
        ))}
        <span className="px-3 text-[11px] text-slate-400 font-mono hidden sm:inline">
          {filtered.length} issues
        </span>
      </div>

      {/* Clean Frosted Glass Table */}
      <div className="rounded-[28px] glass-card border border-white/15 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/10 font-bold">
              <tr>
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Incident Details</th>
                <th className="py-3 px-5">Domain</th>
                <th className="py-3 px-5">Urgency</th>
                <th className="py-3 px-5">Location</th>
                <th className="py-3 px-5">Lifecycle</th>
                <th className="py-3 px-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 font-medium">
                    No matching incidents found.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr
                    key={c._id || c.complaintId}
                    onClick={() => onSelectComplaint && onSelectComplaint(c)}
                    className="hover:bg-white/[0.04] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5 font-mono text-[11px] text-fuchsia-300 font-semibold">
                      {c.complaintId}
                    </td>
                    <td className="py-4 px-5 max-w-sm">
                      <div className="font-semibold text-white group-hover:text-fuchsia-300 transition-colors truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {c.description}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-medium">
                      {c.category}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${getPriorityStyle(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-300 truncate max-w-[170px]">
                      {c.location?.facilityName || c.location?.building || 'Main Campus'}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${getStatusStyle(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-slate-500 group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
