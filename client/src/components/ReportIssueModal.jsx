import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api.js';
import { 
  X, 
  Sparkles, 
  Camera, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Tag, 
  Loader2,
  Video,
  PlusCircle,
  MapPin,
  Lightbulb,
  ChevronDown
} from 'lucide-react';

// Pre-configured Campus Hierarchy matching JIMS Rohini infrastructure
const PRESET_LOCATIONS = {
  'Building A': {
    'Basement': [
      { name: 'Server & Network Rack Room', code: 'A-B-SRV' },
      { name: 'Archive & Electrical Distribution', code: 'A-B-ELEC' }
    ],
    'Ground Floor': [
      { name: 'Computer Lab 1 (Ground Floor)', code: 'A-G-LAB1' },
      { name: 'Computer Lab 2 (Ground Floor)', code: 'A-G-LAB2' },
      { name: 'JIMS Main Auditorium', code: 'A-G-AUD' },
      { name: 'Indoor Canteen (Main Cafeteria)', code: 'CANTEEN-IN' },
      { name: 'Outdoor Canteen (Courtyard)', code: 'CANTEEN-OUT' }
    ],
    '1st Floor': [
      { name: 'Central Library & Reading Hall', code: 'A1-LIB' },
      { name: 'A101 (Lecture Hall)', code: 'A101' },
      { name: 'A102 (Lecture Hall)', code: 'A102' }
    ],
    '2nd Floor': [
      { name: 'A201 (Lecture Hall)', code: 'A201' },
      { name: 'A202 (Lecture Hall)', code: 'A202' },
      { name: 'Administrative Office & Director Cabin', code: 'A2-ADMIN' }
    ],
    '3rd Floor': [
      { name: 'A301 (Conference Hall)', code: 'A301' },
      { name: 'A302 (Faculty Research Lounge)', code: 'A302' },
      { name: 'A303 (Seminar Room)', code: 'A303' }
    ]
  },
  'Building B': {
    'Basement': [
      { name: 'Table Tennis (TT) Room', code: 'B-B-TT' },
      { name: 'Hardware & IoT Lab (Basement Lab)', code: 'B-B-LAB' }
    ],
    'Ground Floor': [
      { name: 'B-G01 (Classroom)', code: 'B-G01' },
      { name: 'B-G02 (Classroom)', code: 'B-G02' },
      { name: 'Ground Floor Restrooms', code: 'WR-BG-01' }
    ],
    '1st Floor': [
      { name: 'B101 (Programming Lab 1)', code: 'B101' },
      { name: 'B102 (Classroom 102)', code: 'B102' },
      { name: 'B103 (Classroom 103)', code: 'B103' }
    ],
    '2nd Floor': [
      { name: 'B201 (Classroom 201)', code: 'B201' },
      { name: 'B202 (Computer Lab 2 - AI & Cloud Lab)', code: 'B202' },
      { name: 'B2-Restrooms (2nd Floor Washrooms)', code: 'WR-B2-01' }
    ],
    '3rd Floor': [
      { name: 'B301 (MCA Lecture Hall 301)', code: 'B301' },
      { name: 'B302 (MCA Lecture Hall 302)', code: 'B302' },
      { name: 'B303 (Faculty Cabins)', code: 'B303' }
    ]
  },
  'Building C': {
    'Basement': [
      { name: 'C-Basement Multipurpose Activity Area', code: 'C-B-ACT' }
    ],
    'Ground Floor': [
      { name: 'C-G01 (Management Classroom)', code: 'C-G01' },
      { name: 'C-G02 (Management Classroom)', code: 'C-G02' }
    ],
    '1st Floor': [
      { name: 'C101 (Classroom 101)', code: 'C101' },
      { name: 'C102 (Classroom 102)', code: 'C102' }
    ],
    '2nd Floor': [
      { name: 'C201 (Tutorial Room)', code: 'C201' },
      { name: 'C202 (Tutorial Room)', code: 'C202' }
    ],
    '3rd Floor': [
      { name: 'C301 (PGDM Seminar Hall)', code: 'C301' },
      { name: 'C302 (Executive Meeting Room)', code: 'C302' }
    ]
  }
};

const CATEGORIES = [
  'Electrical & Power',
  'Plumbing & Water Supply',
  'HVAC & Climate Control',
  'IT & Computer Labs',
  'Civil & Furniture',
  'Sanitation & Hygiene',
  'Fire & Safety Equipment'
];

// Presets for "Choose from Common Problems"
const COMMON_CAMPUS_PROBLEMS = [
  {
    title: 'AC / Air Conditioner Not Cooling or Tripping',
    description: 'The air conditioning unit is blowing ambient air, not cooling the room, or tripping the circuit breaker.',
    category: 'HVAC & Climate Control'
  },
  {
    title: 'Water Leakage / Tap Running Continuously',
    description: 'Water is continuously leaking from the plumbing line, wash basin tap, or ceiling pipe causing water pooling.',
    category: 'Plumbing & Water Supply'
  },
  {
    title: 'Washroom Toilet Flush Clogged / Not Functioning',
    description: 'Toilet flush valve or cistern is not flushing properly, causing blockage and hygiene issues.',
    category: 'Plumbing & Water Supply'
  },
  {
    title: 'Classroom Projector Not Displaying / No Signal',
    description: 'Ceiling projector lamp is off or shows HDMI No Signal when connected to faculty laptop.',
    category: 'IT & Computer Labs'
  },
  {
    title: 'Ceiling Fan Not Working or Making Noise',
    description: 'Ceiling fan regulator is not controlling speed or fan motor is vibrating loudly creating noise disturbance.',
    category: 'Electrical & Power'
  },
  {
    title: 'Campus WiFi / Internet Disconnected in this Room',
    description: 'Campus WiFi access point has no internet access or drops connection frequently.',
    category: 'IT & Computer Labs'
  },
  {
    title: 'Broken Student Desk / Chair Damaged',
    description: 'Student bench desk wood is cracked or chair frame is broken and unsafe to sit on.',
    category: 'Civil & Furniture'
  },
  {
    title: 'Tube Light / LED Panel Blinking or Fused',
    description: 'Overhead light fixture is flickering continuously or completely burnt out.',
    category: 'Electrical & Power'
  },
  {
    title: 'Door Handle / Lock Jammed or Broken',
    description: 'Room main door lock latch is jammed, cannot be locked, or door handle came off.',
    category: 'Civil & Furniture'
  },
  {
    title: 'Switchboard Sparking / Dead Power Socket',
    description: 'Wall power outlet is loose, sparking when plug is inserted, or has no voltage output.',
    category: 'Electrical & Power'
  },
  {
    title: 'Drinking Water Cooler Dispenser Warm or Leaking',
    description: 'Water cooler machine is dispensing warm water and drain pipe is leaking onto the floor.',
    category: 'Plumbing & Water Supply'
  },
  {
    title: 'Lab Desktop Computer Not Booting / System Crash',
    description: 'Computer system in lab fails to boot into Windows, hangs on startup, or displays error screen.',
    category: 'IT & Computer Labs'
  },
  {
    title: 'Dustbin Overflow & Corridor Sanitation Required',
    description: 'Trash bins are overflowing in the area and floor requires sweeping and mopping.',
    category: 'Sanitation & Hygiene'
  },
  {
    title: 'Window Glass Broken / Frame Stuck',
    description: 'Window pane glass is shattered or frame latch does not close, posing safety hazard.',
    category: 'Civil & Furniture'
  }
];

export default function ReportIssueModal({ 
  isOpen, 
  onClose, 
  currentRole, 
  currentUser,
  onComplaintCreated,
  onFacilityAdded,
  existingFacilities = [],
  initialData = null
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electrical & Power');
  const [showCommonProblems, setShowCommonProblems] = useState(false);
  
  // Location selectors
  const [building, setBuilding] = useState('Building B');
  const [floor, setFloor] = useState('2nd Floor');
  const [selectedRoomCode, setSelectedRoomCode] = useState('B202');
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [customRoomNumber, setCustomRoomNumber] = useState('');
  const [customRoomName, setCustomRoomName] = useState('');

  // AI & CV State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [priorityData, setPriorityData] = useState(null);
  const [isAiClassifying, setIsAiClassifying] = useState(false);
  
  // Location-based Recommendation System
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  
  // Media Attachment (Photos & Videos)
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState('image'); // 'image' or 'video'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill initialData when provided (e.g. from Recurring Replacement Advisor)
  useEffect(() => {
    if (initialData && isOpen) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.building) setBuilding(initialData.building);
      if (initialData.floor) setFloor(initialData.floor);
      if (initialData.roomNumber) setSelectedRoomCode(initialData.roomNumber);
    }
  }, [initialData, isOpen]);

  // Get available rooms for chosen building & floor
  const presetRooms = PRESET_LOCATIONS[building]?.[floor] || [];
  
  // Combine preset rooms with any custom rooms previously saved in this building & floor
  const dynamicRooms = (existingFacilities || [])
    .filter(f => (f.block === building || f.block === building.replace('Building', 'Block')) && f.floor === floor)
    .map(f => ({ name: f.name, code: f.roomNumber || f.code }));

  const allAvailableRooms = [...presetRooms];
  dynamicRooms.forEach(dr => {
    if (!allAvailableRooms.some(r => r.code === dr.code)) {
      allAvailableRooms.push(dr);
    }
  });

  // NLP Live Categorization as user types
  useEffect(() => {
    if (!description || description.trim().length < 8) {
      setAiAnalysis(null);
      setPriorityData(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiClassifying(true);
      try {
        const textToAnalyze = `${title} ${description}`;
        const classData = await apiRequest('/ai/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToAnalyze })
        });
        if (classData) {
          setAiAnalysis(classData);
          if (classData.category) setCategory(classData.category);
        }

        // Urgency priority calculation
        const prioData = await apiRequest('/ai/priority', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            category: classData?.category || category,
            location: { facilityName: selectedRoomCode, building, floor },
            description: textToAnalyze
          })
        });
        if (prioData) setPriorityData(prioData);
      } catch (err) {
        console.warn('AI Triage error:', err);
      } finally {
        setIsAiClassifying(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [description, title, selectedRoomCode, building, floor]);

  // Recommendation system: fetch past similar issues for chosen location
  useEffect(() => {
    if (!building) {
      setRecommendations([]);
      setShowRecommendations(false);
      return;
    }
    setShowRecommendations(false);
    const timer = setTimeout(async () => {
      setIsFetchingRecs(true);
      try {
        const params = new URLSearchParams({ building });
        if (floor) params.append('floor', floor);
        if (selectedRoomCode && !isCustomRoom) params.append('room', selectedRoomCode);
        const data = await apiRequest(`/complaints/recommendations?${params.toString()}`);
        if (Array.isArray(data) && data.length > 0) {
          setRecommendations(data);
          setShowRecommendations(true);
        } else {
          setRecommendations([]);
          setShowRecommendations(false);
        }
      } catch {
        setRecommendations([]);
        setShowRecommendations(false);
      } finally {
        setIsFetchingRecs(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [building, floor, selectedRoomCode, isCustomRoom]);

  // Handle Photo / Video Selection
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    setMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit Complaint with dynamic new room saving
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please describe the problem and title.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let finalRoomCode = selectedRoomCode;
      let finalRoomName = selectedRoomCode;

      // If user specified a custom room number (e.g. B301 or C204), persist it to database
      if (isCustomRoom && customRoomNumber.trim()) {
        finalRoomCode = customRoomNumber.trim().toUpperCase();
        finalRoomName = customRoomName.trim() 
          ? `${customRoomName.trim()} (${finalRoomCode})`
          : `${building} ${finalRoomCode}`;

        // Save new room permanently to facilities so it appears right away for everyone!
        try {
          const newFacility = await apiRequest('/facilities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: finalRoomName,
              block: building,
              floor: floor,
              roomNumber: finalRoomCode,
              type: 'Monitored Space'
            })
          });
          if (onFacilityAdded && newFacility) {
            onFacilityAdded(newFacility);
          }
        } catch (fErr) {
          console.warn('Facility save warning:', fErr);
        }
      } else {
        const found = allAvailableRooms.find(r => r.code === selectedRoomCode);
        if (found) finalRoomName = found.name;
      }

      // Package media attachment
      const imagesPayload = mediaFile ? [{
        url: mediaFile,
        caption: `${mediaType === 'video' ? 'Incident Video Clip' : 'Defect Photo Proof'} uploaded by ${currentRole}`,
        mediaType: mediaType
      }] : [];

      // Create Complaint in backend
      const token = localStorage.getItem('campus_token');
      const payload = {
        title,
        description,
        category,
        priority: priorityData?.priority || 'Medium',
        location: {
          facilityName: finalRoomName,
          building,
          floor,
          room: finalRoomCode
        },
        images: imagesPayload,
        aiClassification: aiAnalysis,
        aiPriority: priorityData,
        // Explicitly include reporter so the backend saves real identity
        reporterName: currentUser?.name || null,
        reporterEmail: currentUser?.email || null,
        reporterEnrollment: currentUser?.enrollmentNumber || null,
        reporterId: currentUser?._id || null,
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Fallback: send role + identity hints via headers
        headers['x-demo-role'] = currentRole;
        if (currentUser?.name) headers['x-demo-name'] = currentUser.name;
        if (currentUser?.email) headers['x-demo-email'] = currentUser.email;
        if (currentUser?.enrollmentNumber) headers['x-demo-enrollment'] = currentUser.enrollmentNumber;
      }

      const responseData = await apiRequest('/complaints', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      // Backend returns { message, complaint } — unwrap the actual complaint object
      const newComplaint = responseData?.complaint || responseData;

      if (onComplaintCreated && newComplaint && newComplaint.complaintId) {
        onComplaintCreated(newComplaint);
      }

      // Reset & Close
      setTitle('');
      setDescription('');
      setMediaFile(null);
      setIsCustomRoom(false);
      setCustomRoomNumber('');
      setCustomRoomName('');
      onClose();
    } catch (err) {
      console.error('Submit complaint error:', err);
      setErrorMsg(err.message || 'Failed to submit issue. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Radiant Floating Dialog */}
      <div className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-[32px] glass-card border border-white/20 p-5 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.6)] space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-semibold text-fuchsia-300">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Campus Incident Dispatch</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Report Campus Defect
            </h2>
            <p className="text-xs text-slate-400">
              Select building, floor, room, or add a new room number dynamically.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full glass-pill text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* 1. Location Selectors: Building & Floor & Space (Moved to top so recommendations activate immediately) */}
          <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/10">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-fuchsia-400" />
                <span>1. Select Campus Location</span>
              </div>
              <span className="text-[10px] text-fuchsia-400 font-mono font-normal">
                Recommendations update live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Building Select */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-semibold">Building *</label>
                <select
                  value={building}
                  onChange={(e) => {
                    setBuilding(e.target.value);
                    const defaultRoom = PRESET_LOCATIONS[e.target.value]?.[floor]?.[0]?.code || 'B202';
                    setSelectedRoomCode(defaultRoom);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#111622] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400 cursor-pointer"
                >
                  <option value="Building A">Building A</option>
                  <option value="Building B">Building B</option>
                  <option value="Building C">Building C</option>
                </select>
              </div>

              {/* Floor Select */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-semibold">Floor *</label>
                <select
                  value={floor}
                  onChange={(e) => {
                    setFloor(e.target.value);
                    const defaultRoom = PRESET_LOCATIONS[building]?.[e.target.value]?.[0]?.code || 'B202';
                    setSelectedRoomCode(defaultRoom);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#111622] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400 cursor-pointer"
                >
                  <option value="Basement">Basement</option>
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                </select>
              </div>
            </div>

            {/* Room / Space Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-400 block font-semibold">
                  Room / Space / Canteen
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomRoom(!isCustomRoom)}
                  className="text-[11px] text-fuchsia-300 hover:text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isCustomRoom ? 'Choose from list' : '+ Add New Room Number'}</span>
                </button>
              </div>

              {!isCustomRoom ? (
                <select
                  value={selectedRoomCode}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomRoom(true);
                    } else {
                      setSelectedRoomCode(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#111622] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400 cursor-pointer font-medium"
                >
                  {allAvailableRooms.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Add Custom Room Number (e.g. B301)...</option>
                </select>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-white/[0.04] border border-fuchsia-500/30">
                  <div className="text-[11px] text-slate-300">
                    Enter the new room code (e.g. <strong>B301</strong>). Saved permanently for everyone.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customRoomNumber}
                      onChange={(e) => setCustomRoomNumber(e.target.value)}
                      placeholder="Room Code (e.g. B301, C204)"
                      className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                      required={isCustomRoom}
                    />
                    <input
                      type="text"
                      value={customRoomName}
                      onChange={(e) => setCustomRoomName(e.target.value)}
                      placeholder="Optional Name (e.g. Robotics Lab)"
                      className="px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. 🔍 Smart Location Recommendation System (YouTube-like recommendations) */}
          {(showRecommendations || isFetchingRecs) && recommendations.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-fuchsia-500/[0.09] via-violet-500/[0.06] to-transparent border border-fuchsia-500/30 p-3.5 space-y-2.5 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-fuchsia-400 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-fuchsia-300 uppercase tracking-wider block">
                      Recommended for {building} • {floor}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Most reported in this area in past — tap any to auto-fill
                    </span>
                  </div>
                </div>
                {isFetchingRecs ? (
                  <Loader2 className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowRecommendations(false)}
                    className="text-slate-400 hover:text-white transition-colors text-[10px] px-2 py-0.5 rounded bg-white/[0.06]"
                  >
                    ✕ dismiss
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {recommendations.map((rec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTitle(rec.title);
                      setDescription(rec.description);
                      setCategory(rec.category);
                      setShowRecommendations(false);
                    }}
                    className="text-left p-3 rounded-xl bg-black/40 border border-fuchsia-500/25 hover:border-fuchsia-400 hover:bg-fuchsia-500/15 transition-all group flex flex-col justify-between cursor-pointer shadow-md"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white group-hover:text-fuchsia-200 line-clamp-1">
                        {rec.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">
                        {rec.category}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-white/[0.08] text-[10px]">
                      <span className="text-fuchsia-400 font-bold">
                        {rec.count}× reported
                      </span>
                      <span className="text-slate-300 group-hover:text-white font-medium">
                        tap to select →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Issue Title & "Choose from common problems" Dropdown */}
          <div className="space-y-1 relative">
            <div className="flex items-center justify-between pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                2. Issue Title *
              </label>
              <button
                type="button"
                onClick={() => setShowCommonProblems(!showCommonProblems)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-300 hover:bg-fuchsia-500/25 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-fuchsia-400" />
                <span>Choose from common problems</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showCommonProblems ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Floating Dropdown for Common Problems (100% Opaque & Solid) */}
            {showCommonProblems && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowCommonProblems(false)} 
                />
                <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-[#121622] border-2 border-fuchsia-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-2 max-h-72 overflow-y-auto divide-y divide-white/10 animate-fade-in">
                  <div className="px-3 py-2 text-[10px] uppercase font-bold text-fuchsia-400 tracking-wider bg-[#181d2c] rounded-xl mb-1 flex items-center justify-between">
                    <span>Select a common issue to auto-fill</span>
                    <span className="text-slate-400 font-normal">Click any item</span>
                  </div>
                  {COMMON_CAMPUS_PROBLEMS.map((prob, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTitle(prob.title);
                        setDescription(prob.description);
                        setCategory(prob.category);
                        setShowCommonProblems(false);
                      }}
                      className="w-full text-left p-3 rounded-xl hover:bg-fuchsia-500/20 bg-[#121622] transition-colors cursor-pointer group flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="text-xs font-bold text-white group-hover:text-fuchsia-200 transition-colors">
                          {prob.title}
                        </div>
                        <div className="text-[11px] text-slate-300 line-clamp-1">
                          {prob.description}
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-md bg-white/10 text-fuchsia-300 border border-fuchsia-500/30 font-medium">
                        {prob.category.split('&')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AC leaking water or switchboard sparking..."
              className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400 transition-colors"
              required
            />
          </div>

          {/* 4. Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Detailed Problem Description *
              </label>
              {isAiClassifying && (
                <span className="text-[10px] text-fuchsia-300 font-mono flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> AI Inferring Domain...
                </span>
              )}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe symptoms, exact location in room, and any safety hazards..."
              className="w-full p-3.5 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400 transition-colors resize-none"
              required
            />

            {/* AI Real-Time Feedback Pill */}
            {aiAnalysis && (
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs flex flex-wrap items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span className="text-slate-300">AI Suggested Category:</span>
                  <span className="font-bold text-fuchsia-300">{aiAnalysis.category}</span>
                </div>
                {priorityData && (
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    priorityData.priority === 'Critical' ? 'text-rose-300 bg-rose-500/20 border-rose-500/30' : 'text-amber-300 bg-amber-500/20 border-amber-500/30'
                  }`}>
                    {priorityData.priority} Priority ({priorityData.slaHours}h SLA)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Photo & Video Attachment */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Attach Defect Photo or Video Proof
            </label>
            <label className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-2xl border border-dashed border-white/20 hover:border-fuchsia-400/50 bg-black/20 cursor-pointer transition-all text-xs text-slate-300 group">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div className="text-center sm:text-left">
                <div className="font-semibold text-white">
                  {mediaFile ? 'File Attached (Click to change)' : 'Take Photo / Record Video or Browse Files'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Supports JPG, PNG, MP4, MOV from mobile camera or storage
                </div>
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>

            {/* Preview */}
            {mediaFile && (
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 h-36 flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video src={mediaFile} controls className="max-h-full max-w-full" />
                ) : (
                  <img src={mediaFile} alt="Attached Preview" className="max-h-full max-w-full object-contain" />
                )}
                <button
                  type="button"
                  onClick={() => setMediaFile(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Category Override */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111622] border border-white/15 text-xs text-white focus:outline-none focus:border-fuchsia-400 cursor-pointer"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full glass-pill text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-white/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Submitting & Dispatching...</span>
                </>
              ) : (
                <>
                  <span>Dispatch Incident</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
