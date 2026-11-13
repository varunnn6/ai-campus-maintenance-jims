import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api.js';
import { 
  X, 
  Sparkles, 
  Camera, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Clock, 
  Building2, 
  Layers, 
  Tag, 
  HelpCircle,
  FileImage,
  Loader2
} from 'lucide-react';

const SAMPLE_PRESETS = [
  {
    label: 'Water Leakage',
    title: 'Severe water leak under washbasin in Block B 2nd floor restroom',
    desc: 'Continuous stream of water escaping from flex hose pipe under sink. Puddle spreading to floor causing slipping hazard.',
    category: 'Plumbing & Water Supply',
    building: 'Block B',
    floor: '2nd Floor',
    room: 'WR-B2-01',
    // Base64 simulated image (300x200 blue/puddle tone)
    imagePreset: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" style="background:%23253746"><ellipse cx="150" cy="120" rx="90" ry="40" fill="%232563eb" opacity="0.8"/><circle cx="150" cy="60" r="10" fill="%2360a5fa"/><path d="M150 70 L150 110" stroke="%2393c5fd" stroke-width="3"/></svg>'
  },
  {
    label: 'Burnt Switchboard',
    title: 'Switchboard sparking and burnt plastic odor near Lab 2 entrance',
    desc: 'Noticed bright spark and sizzling sound when turning on main lab lights. Burnt smell and scorch mark on switch plate.',
    category: 'Electrical & Power',
    building: 'Block B',
    floor: '2nd Floor',
    room: 'Lab 202',
    imagePreset: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" style="background:%231f242d"><rect x="100" y="50" width="100" height="100" fill="%23374151" rx="8"/><circle cx="150" cy="100" r="14" fill="%23f59e0b"/><polygon points="150,70 156,90 175,90 160,102 166,122 150,110 134,122 140,102 125,90 144,90" fill="%23ef4444"/></svg>'
  },
  {
    label: 'AC Cooling Failure',
    title: 'Air conditioner in Seminar Hall making loud grinding noise and not cooling',
    desc: 'Split AC compressor unit rattling violently and blowing warm air. High temperature in room during session.',
    category: 'HVAC & Climate Control',
    building: 'Block B',
    floor: '3rd Floor',
    room: 'Room 301',
    imagePreset: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" style="background:%232a323d"><rect x="40" y="60" width="220" height="70" fill="%23cbd5e1" rx="4"/><line x1="60" y1="100" x2="240" y2="100" stroke="%2364748b" stroke-width="4"/><path d="M120 130 Q150 160 180 130" stroke="%23ef4444" stroke-width="3" fill="none"/></svg>'
  },
  {
    label: 'Cracked Tile / Floor',
    title: 'Broken ceramic floor tile causing trip hazard near Library entrance',
    desc: 'Sharp fractured floor tiles loose right at the threshold of the central library entrance hall.',
    category: 'Civil & Furniture',
    building: 'Block A',
    floor: '1st Floor',
    room: 'Lib-Main',
    imagePreset: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" style="background:%23334155"><polygon points="50,50 180,70 140,150 40,130" fill="%2364748b"/><line x1="90" y1="50" x2="160" y2="140" stroke="%230f172a" stroke-width="4"/><line x1="160" y1="70" x2="60" y2="120" stroke="%230f172a" stroke-width="3"/></svg>'
  }
];

const CATEGORIES = [
  'Electrical & Power',
  'Plumbing & Water Supply',
  'HVAC & Climate Control',
  'IT & Computer Labs',
  'Civil & Furniture',
  'Sanitation & Hygiene',
  'Fire & Safety Equipment'
];

export default function ReportIssueModal({ isOpen, onClose, currentRole, onComplaintCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electrical & Power');
  const [building, setBuilding] = useState('Block B');
  const [floor, setFloor] = useState('2nd Floor');
  const [room, setRoom] = useState('Lab 202');
  const [assetTag, setAssetTag] = useState('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [priorityData, setPriorityData] = useState(null);
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  
  // CV / Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [cvResult, setCvResult] = useState(null);
  const [isCvScanning, setIsCvScanning] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live NLP categorization triggered as user writes
  useEffect(() => {
    if (!description || description.trim().length < 8) {
      setAiAnalysis(null);
      setPriorityData(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiClassifying(true);
      try {
        // Call AI Classification API
        const textToAnalyze = `${title} ${description}`;
        const classData = await apiRequest('/ai/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToAnalyze })
        });
        if (classData) {
          setAiAnalysis(classData);
          if (classData.category) {
            setCategory(classData.category);
          }
        }

        // Call Priority Scoring API
        const pData = await apiRequest('/ai/priority', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: textToAnalyze,
            category: category,
            location: { building, floor, room }
          })
        });
        if (pData) {
          setPriorityData(pData);
        }
      } catch (err) {
        console.warn('AI preview error:', err);
      } finally {
        setIsAiClassifying(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [description, title, building, room]);

  // Handle Preset Selector
  const applyPreset = (preset) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setCategory(preset.category);
    setBuilding(preset.building);
    setFloor(preset.floor);
    setRoom(preset.room);
    setSelectedImage(preset.imagePreset);
    runCvInspection(preset.imagePreset);
  };

  // Run Computer Vision inspection
  const runCvInspection = async (b64Image) => {
    setIsCvScanning(true);
    setCvResult(null);
    try {
      const data = await apiRequest('/ai/cv-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: b64Image })
      });
      if (data) {
        setCvResult(data);
        if (data.category && (!category || category === 'Civil & Furniture')) {
          setCategory(data.category);
        }
      }
    } catch (err) {
      console.warn('CV inspection failed:', err);
    } finally {
      setIsCvScanning(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result;
      setSelectedImage(b64);
      runCvInspection(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter complaint title and description.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        title,
        description,
        category,
        priority: priorityData ? priorityData.priority : 'Medium',
        location: {
          building,
          floor,
          room,
          specificAsset: assetTag
        },
        images: selectedImage ? [{ url: selectedImage, caption: 'Attached inspection photo' }] : [],
        aiClassification: aiAnalysis,
        aiPriority: priorityData,
        cvAnalysis: cvResult
      };

      const created = await apiRequest('/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': currentRole
        },
        body: JSON.stringify(payload)
      });

      if (onComplaintCreated) onComplaintCreated(created.complaint);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Report Campus Infrastructure Issue</h2>
              <p className="text-xs text-slate-400">Live AI NLP Categorization & Computer Vision Assisted Triage</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick preset selector for instant demonstration */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ Quick Demo Presets (Click to autofill with realistic test scenario):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-blue-600/20 hover:border-blue-500/40 border border-slate-700/60 text-slate-300 hover:text-blue-300 text-xs font-medium transition-all text-left truncate cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Issue Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Complaint Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Water dripping from split AC unit in Computer Lab 2"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Issue Description with live AI pill */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Detailed Description <span className="text-rose-400">*</span>
              </label>
              {isAiClassifying ? (
                <span className="text-[11px] text-blue-400 flex items-center gap-1 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  AI analyzing complaint text...
                </span>
              ) : aiAnalysis ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  AI Suggested: <strong>{aiAnalysis.category}</strong> ({Math.round(aiAnalysis.confidence * 100)}% match)
                </span>
              ) : null}
            </div>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you observed, visible hazards, and equipment affected..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Category & Location row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-400" />
                Maintenance Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Building / Block */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Campus Building / Block
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Block A">Block A (Management & Administration)</option>
                <option value="Block B">Block B (MCA & IT Labs)</option>
                <option value="Library Complex">Central Library Complex</option>
                <option value="Auditorium Wing">Auditorium & Cultural Hall</option>
                <option value="Courtyard & Canteen">Campus Cafeteria & Courtyard</option>
              </select>
            </div>
          </div>

          {/* Floor & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Floor</label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g., 2nd Floor"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Room / Area</label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g., Lab 202"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Asset Tag (Optional)</label>
              <input
                type="text"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                placeholder="e.g., AC-B2-02"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Image Upload & Computer Vision Scanner Card */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                Attach Issue Photo (Computer Vision Inspection)
              </span>
              <label className="text-xs px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-colors cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {selectedImage ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-40 flex items-center justify-center bg-black">
                  <img src={selectedImage} alt="Fault Inspection" className="max-h-36 object-contain" />
                  {isCvScanning && (
                    <div className="absolute inset-0 bg-blue-600/30 flex flex-col items-center justify-center">
                      <div className="w-full h-1 bg-cyan-300 animate-scan-line"></div>
                      <span className="text-[11px] font-mono text-cyan-200 mt-2 font-semibold">Running OpenCV / PIL Scanner...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Computer Vision Findings:
                  </span>
                  {cvResult ? (
                    <>
                      <div className="font-semibold text-white">{cvResult.detectedFault}</div>
                      <div className="text-slate-400 text-[11px]">{cvResult.visualFeatures}</div>
                      <div className="text-emerald-400 font-medium text-[11px]">
                        Match Confidence: {Math.round(cvResult.confidence * 100)}%
                      </div>
                      <div className="text-slate-400 text-[11px] italic">
                        Tip: {cvResult.suggestedAction}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-500 italic">Processing visual features...</div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Upload a photo or click one of the presets above to trigger image-based defect detection.
              </p>
            )}
          </div>

          {/* AI Calculated Urgency & SLA Card */}
          {priorityData && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  AI Prioritization Engine
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    priorityData.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    priorityData.priority === 'High' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    priorityData.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {priorityData.priority} Priority ({priorityData.urgencyScore}/100)
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    Target SLA: {priorityData.slaHours} Hours
                  </span>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400 max-w-xs">
                {priorityData.recommendedAction}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting & Dispatching...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Maintenance Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
