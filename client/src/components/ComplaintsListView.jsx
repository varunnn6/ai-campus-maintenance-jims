import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  MapPin, 
  Tag, 
  User, 
  Calendar,
  Sparkles,
  ChevronRight,
  Flame,
  Camera
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electrical & Power',
  'Plumbing & Water Supply',
  'HVAC & Climate Control',
  'IT & Computer Labs',
  'Civil & Furniture',
  'Sanitation & Hygiene',
  'Fire & Safety Equipment'
];

export default function ComplaintsListView({ 
  complaints = [], 
  onSelectComplaint, 
  onOpenReportModal 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [statusTab, setStatusTab] = useState('All');

  // Filter logic
  const filtered = complaints.filter(c => {
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.complaintId && c.complaintId.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.location && c.location.room && c.location.room.toLowerCase().includes(q)) ||
        (c.reportedBy && c.reportedBy.name && c.reportedBy.name.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category
    if (selectedCategory !== 'All' && c.category !== selectedCategory) {
      return false;
    }

    // Priority
    if (selectedPriority !== 'All' && c.priority !== selectedPriority) {
      return false;
    }

    // Status Tab
    if (statusTab === 'Active') {
      return c.status !== 'Resolved' && c.status !== 'Closed';
    } else if (statusTab === 'Critical') {
      return c.priority === 'Critical';
    } else if (statusTab === 'Resolved') {
      return c.status === 'Resolved' || c.status === 'Closed';
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, room or student..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category & Priority Selectors */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto text-xs">
          {[
            { id: 'All', label: 'All Complaints', count: complaints.length },
            { id: 'Active', label: 'Active / In Progress', count: complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length },
            { id: 'Critical', label: 'Critical Emergencies', count: complaints.filter(c => c.priority === 'Critical').length },
            { id: 'Resolved', label: 'Resolved & Closed', count: complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusTab === tab.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">No complaints matching filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting search terms or clear category filters to view other maintenance issues.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map(c => {
            const hasCv = c.cvAnalysis && c.cvAnalysis.detectedFault;
            const hasAi = c.aiClassification && c.aiClassification.category;

            return (
              <div
                key={c._id || c.complaintId}
                onClick={() => onSelectComplaint(c)}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-850 transition-all cursor-pointer shadow-md group relative overflow-hidden"
              >
                {/* Left priority accent stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  c.priority === 'Critical' ? 'bg-rose-500' :
                  c.priority === 'High' ? 'bg-amber-500' :
                  c.priority === 'Medium' ? 'bg-yellow-500' :
                  'bg-slate-600'
                }`} />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pl-2">
                  <div className="space-y-1.5">
                    {/* Header meta */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-400 group-hover:text-blue-300">
                        {c.complaintId}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {c.category}
                      </span>

                      {/* AI tags */}
                      {hasAi && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          AI Classified ({Math.round((c.aiClassification.confidence || 0.9) * 100)}%)
                        </span>
                      )}

                      {hasCv && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                          <Camera className="w-2.5 h-2.5" />
                          CV Verified
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {c.title}
                    </h3>

                    {/* Snippet */}
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-2xl">
                      {c.description}
                    </p>

                    {/* Location & Reporter details */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        {c.location?.building} • {c.location?.room || 'General Area'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        {c.reportedBy?.name || 'Campus Student'}
                      </span>
                      {c.assignedTo?.name && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-300 font-medium">
                            <Wrench className="w-3 h-3" />
                            Assigned to: {c.assignedTo.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Status & Badges */}
                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    {/* Priority badge */}
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      c.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      c.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      c.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {c.priority === 'Critical' && <Flame className="w-3 h-3" />}
                      {c.priority}
                    </span>

                    {/* Status badge */}
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      c.status === 'Resolved' || c.status === 'Closed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      c.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      c.status === 'Assigned' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {c.status}
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
