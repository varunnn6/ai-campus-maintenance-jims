import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ChevronRight,
  Plus
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
      case 'Critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'High': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Resolved':
      case 'Closed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'In Progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Assigned': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#111622] border border-white/[0.08]">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search issues, IDs, locations..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-[#111622] text-slate-200">{cat}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/[0.06] text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p} className="bg-[#111622] text-slate-200">{p}</option>
            ))}
          </select>

          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

        </div>
      </div>

      {/* Status Segmented Control */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-1 text-xs">
        {STATUSES.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusTab(tab)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              statusTab === tab 
                ? 'bg-white/[0.08] text-white' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-slate-500 font-mono">
          {filtered.length} issues found
        </span>
      </div>

      {/* Clean Table */}
      <div className="rounded-xl bg-[#111622] border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-black/20 text-slate-400 text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">ID</th>
                <th className="py-2.5 px-4 font-semibold">Title & Details</th>
                <th className="py-2.5 px-4 font-semibold">Category</th>
                <th className="py-2.5 px-4 font-semibold">Priority</th>
                <th className="py-2.5 px-4 font-semibold">Location</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching issues.
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr
                    key={c._id || c.complaintId}
                    onClick={() => onSelectComplaint && onSelectComplaint(c)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 font-medium">
                      {c.complaintId}
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {c.description}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {c.category}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border ${getPriorityStyle(c.priority)}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[160px]">
                      {c.location?.facilityName || c.location?.building || 'Main Campus'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border ${getStatusStyle(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 group-hover:text-slate-300 transition-colors">
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
