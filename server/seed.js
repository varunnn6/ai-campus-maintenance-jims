import bcrypt from 'bcryptjs';
import { User, Facility, Complaint, MaintenanceAction, ActivityLog } from './models/index.js';

export const seedDatabaseIfEmpty = async () => {
  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('[Seed] Database already contains records. Skipping seed.');
    return;
  }

  console.log('[Seed] Populating initial JIMS Campus Maintenance dataset...');

  // 1. Seed Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);
  const studentHash = await bcrypt.hash('student123', salt);
  const staffHash = await bcrypt.hash('staff123', salt);
  const techHash = await bcrypt.hash('tech123', salt);

  const users = [
    {
      _id: 'user-admin-1',
      name: 'Dr. R. K. Sharma (Facility Director)',
      email: 'admin@jims.edu',
      password: passwordHash,
      role: 'admin',
      department: 'Campus Administration & Infrastructure',
      phone: '+91 98110 12345'
    },
    {
      _id: 'user-student-1',
      name: 'Varun Malik',
      email: 'varun@jims.edu',
      password: studentHash,
      role: 'student',
      department: 'Master of Computer Applications (MCA)',
      phone: '+91 99580 54321'
    },
    {
      _id: 'user-staff-1',
      name: 'Prof. Shankar Sumar',
      email: 'shankar@jims.edu',
      password: staffHash,
      role: 'staff',
      department: 'Department of Computer Applications',
      phone: '+91 98711 67890'
    },
    {
      _id: 'user-student-2',
      name: 'Aditya',
      email: 'aditya@jims.edu',
      password: studentHash,
      role: 'student',
      department: 'Master of Computer Applications (MCA)',
      phone: '+91 98101 44556'
    },
    {
      _id: 'user-tech-1',
      name: 'Rajesh Kumar (Sr. Electrical & HVAC Tech)',
      email: 'tech@jims.edu',
      password: techHash,
      role: 'technician',
      department: 'Campus Electrical & Maintenance Team',
      phone: '+91 99100 88776'
    },
    {
      _id: 'user-tech-2',
      name: 'Manoj Verma (Plumbing & Civil Tech)',
      email: 'tech.civil@jims.edu',
      password: techHash,
      role: 'technician',
      department: 'Campus Civil & Sanitation Team',
      phone: '+91 98188 33221'
    }
  ];

  for (const u of users) {
    await User.create(u);
  }

  // 2. Seed Facilities
  const facilities = [
    {
      _id: 'fac-1',
      name: 'Computer Lab 2 (AI & Cloud Lab)',
      block: 'Block B',
      floor: '2nd Floor',
      roomNumber: 'Lab 202',
      type: 'Computer Laboratory',
      assets: [
        { name: 'Precision Split AC Unit 2-Ton', assetTag: 'AC-B2-02', type: 'HVAC', healthScore: 48 },
        { name: 'Core i7 Workstations (35 Units)', assetTag: 'PC-LAB2-SET', type: 'IT', healthScore: 92 },
        { name: 'Cisco 48-Port Gigabit Switch', assetTag: 'SW-LAB2-01', type: 'Networking', healthScore: 88 }
      ],
      riskScore: 78,
      activeIssuesCount: 2
    },
    {
      _id: 'fac-2',
      name: 'Computer Lab 1 (Programming Lab)',
      block: 'Block B',
      floor: '1st Floor',
      roomNumber: 'Lab 101',
      type: 'Computer Laboratory',
      assets: [
        { name: 'Epson Overhead Ceiling Projector', assetTag: 'PRJ-LAB1-01', type: 'AudioVisual', healthScore: 62 },
        { name: 'Central UPS 10kVA Inverter', assetTag: 'UPS-B1-10K', type: 'Electrical', healthScore: 84 }
      ],
      riskScore: 45,
      activeIssuesCount: 1
    },
    {
      _id: 'fac-3',
      name: 'Central Library & Reading Hall',
      block: 'Block A',
      floor: '1st Floor',
      roomNumber: 'Lib-Main',
      type: 'Library',
      assets: [
        { name: 'Central Air Handling Unit (AHU)', assetTag: 'AHU-LIB-01', type: 'HVAC', healthScore: 82 },
        { name: 'RFID Entrance Security Gate', assetTag: 'SEC-LIB-GATE', type: 'Electronics', healthScore: 95 }
      ],
      riskScore: 30,
      activeIssuesCount: 1
    },
    {
      _id: 'fac-4',
      name: 'JIMS Main Auditorium',
      block: 'Block A',
      floor: 'Ground Floor',
      roomNumber: 'AUD-GF',
      type: 'Auditorium',
      assets: [
        { name: 'Digital Sound Mixer Console', assetTag: 'AV-AUD-MIX', type: 'AudioVisual', healthScore: 75 },
        { name: 'Emergency Fire Exit Doors (Dual)', assetTag: 'CIV-AUD-EXIT', type: 'Safety', healthScore: 88 }
      ],
      riskScore: 35,
      activeIssuesCount: 1
    },
    {
      _id: 'fac-5',
      name: 'Block B 2nd Floor Washrooms',
      block: 'Block B',
      floor: '2nd Floor',
      roomNumber: 'WR-B2-01',
      type: 'Sanitation & Restroom',
      assets: [
        { name: 'Commercial RO Water Dispenser', assetTag: 'RO-B2-COOL', type: 'Plumbing', healthScore: 52 },
        { name: 'Automated Cistern Flush System', assetTag: 'PLM-B2-FLUSH', type: 'Plumbing', healthScore: 40 }
      ],
      riskScore: 82,
      activeIssuesCount: 3
    },
    {
      _id: 'fac-6',
      name: 'MCA Lecture Hall 301',
      block: 'Block B',
      floor: '3rd Floor',
      roomNumber: 'Room 301',
      type: 'Classroom',
      assets: [
        { name: 'Interactive Digital Whiteboard', assetTag: 'IFP-301-01', type: 'IT', healthScore: 85 },
        { name: 'Split AC 1.5 Ton', assetTag: 'AC-301-01', type: 'HVAC', healthScore: 78 }
      ],
      riskScore: 28,
      activeIssuesCount: 1
    },
    {
      _id: 'fac-7',
      name: 'Campus Cafeteria & Courtyard',
      block: 'Block A',
      floor: 'Ground Floor',
      roomNumber: 'CAN-GF',
      type: 'Cafeteria',
      assets: [
        { name: 'Commercial Grease Trap & Drainage', assetTag: 'PLM-CAN-DRN', type: 'Plumbing', healthScore: 60 }
      ],
      riskScore: 55,
      activeIssuesCount: 1
    },
    {
      _id: 'fac-8',
      name: 'Server & Network Control Room',
      block: 'Block B',
      floor: 'Basement',
      roomNumber: 'DC-B01',
      type: 'Data Center',
      assets: [
        { name: 'Emerson Liebert Precision Cooling', assetTag: 'HVAC-DC-01', type: 'HVAC', healthScore: 90 },
        { name: 'FM-200 Fire Suppression Gas Cylinder', assetTag: 'SAF-DC-FM200', type: 'Safety', healthScore: 98 }
      ],
      riskScore: 22,
      activeIssuesCount: 0
    }
  ];

  for (const f of facilities) {
    await Facility.create(f);
  }

  // 3. Seed Realistic Historical Complaints
  const sampleComplaints = [
    {
      complaintId: 'JIMS-2026-1001',
      title: 'Water continuously dripping from Split AC onto teacher desk in Lab 2',
      description: 'The split AC unit in Computer Lab 2 has water leaking onto desk row 1. Students could slip and there is risk of water entering computer power strips.',
      category: 'HVAC & Climate Control',
      priority: 'High',
      status: 'Assigned',
      location: {
        facilityId: 'fac-1',
        facilityName: 'Computer Lab 2 (AI & Cloud Lab)',
        building: 'Block B',
        floor: '2nd Floor',
        room: 'Lab 202',
        specificAsset: 'AC-B2-02'
      },
      reportedBy: { id: 'user-student-1', name: 'Varun Malik', email: 'varun@jims.edu', role: 'student' },
      assignedTo: { id: 'user-tech-1', name: 'Rajesh Kumar (Sr. Electrical & HVAC Tech)', role: 'technician', assignedAt: new Date(Date.now() - 3600000 * 4) },
      aiClassification: {
        category: 'HVAC & Climate Control',
        confidence: 0.94,
        keywords: ['ac', 'water', 'dripping', 'split ac', 'leaking']
      },
      aiPriority: {
        priority: 'High',
        urgencyScore: 78.5,
        slaHours: 6,
        rationale: ['High disruption keywords detected', 'Infrastructure impact baseline for HVAC', 'High student-density / Academic venue'],
        recommendedAction: 'Inspect AC condensate drain line and clean evaporator tray'
      },
      cvAnalysis: {
        detectedFault: 'Water Leakage & Fluid Accumulation',
        confidence: 0.92,
        visualFeatures: 'Condensate drip pattern detected along casing bottom seam',
        suggestedAction: 'Clear drain tray siphon and check indoor level'
      },
      history: [
        { status: 'Submitted', note: 'Issue reported with photo by Varun Malik', updatedBy: 'Varun Malik', timestamp: new Date(Date.now() - 3600000 * 8) },
        { status: 'Verified', note: 'Verified by Facility Admin. High priority confirmed.', updatedBy: 'Dr. R. K. Sharma', timestamp: new Date(Date.now() - 3600000 * 6) },
        { status: 'Assigned', note: 'Assigned to HVAC technician Rajesh Kumar', updatedBy: 'Dr. R. K. Sharma', timestamp: new Date(Date.now() - 3600000 * 4) }
      ],
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      complaintId: 'JIMS-2026-1002',
      title: 'Main MCB switchboard sparking and burning smell in Block B corridor',
      description: 'Loud buzzing and electrical spark noticed near the distribution board switch outside Room 204. Strong burnt plastic smell.',
      category: 'Electrical & Power',
      priority: 'Critical',
      status: 'In Progress',
      location: {
        facilityId: 'fac-5',
        facilityName: 'Block B 2nd Floor Washrooms',
        building: 'Block B',
        floor: '2nd Floor',
        room: 'Corridor DB-2',
        specificAsset: 'DB-B2-CORR'
      },
      reportedBy: { id: 'user-staff-1', name: 'Prof. Shankar Sumar', email: 'shankar@jims.edu', role: 'staff' },
      assignedTo: { id: 'user-tech-1', name: 'Rajesh Kumar (Sr. Electrical & HVAC Tech)', role: 'technician', assignedAt: new Date(Date.now() - 3600000 * 2) },
      aiClassification: {
        category: 'Electrical & Power',
        confidence: 0.98,
        keywords: ['switchboard', 'sparking', 'burning smell', 'mcb', 'switch']
      },
      aiPriority: {
        priority: 'Critical',
        urgencyScore: 96.0,
        slaHours: 2,
        rationale: ['Critical severity keywords (sparking / burning smell)', 'Elevated safety baseline for Electrical & Power'],
        recommendedAction: 'Immediate isolation of circuit breaker and thermal scan'
      },
      cvAnalysis: {
        detectedFault: 'Thermal Hotspot or Burnt Electrical Contact',
        confidence: 0.95,
        visualFeatures: 'High-intensity luminance flash and adjacent scorch mark',
        suggestedAction: 'De-energize main breaker before touching casing'
      },
      history: [
        { status: 'Submitted', note: 'Emergency report logged by faculty', updatedBy: 'Prof. Shankar Sumar', timestamp: new Date(Date.now() - 3600000 * 3) },
        { status: 'Verified', note: 'Automated AI Critical Alert triggered SMS to team', updatedBy: 'AI Triage Engine', timestamp: new Date(Date.now() - 3600000 * 2.8) },
        { status: 'Assigned', note: 'Dispatched Rajesh Kumar with insulated PPE kit', updatedBy: 'Dr. R. K. Sharma', timestamp: new Date(Date.now() - 3600000 * 2) },
        { status: 'In Progress', note: 'Technician on-site. Main busbar isolated, replacing 32A MCB breaker.', updatedBy: 'Rajesh Kumar', timestamp: new Date(Date.now() - 3600000 * 1) }
      ],
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      complaintId: 'JIMS-2026-1003',
      title: 'Water pipe joint leaking heavily under washroom sink on 2nd Floor',
      description: 'Continuous stream of water escaping from the flex hose pipe under the central washbasin in Block B boys washroom. Puddle spreading to walkway.',
      category: 'Plumbing & Water Supply',
      priority: 'High',
      status: 'Submitted',
      location: {
        facilityId: 'fac-5',
        facilityName: 'Block B 2nd Floor Washrooms',
        building: 'Block B',
        floor: '2nd Floor',
        room: 'WR-B2-01',
        specificAsset: 'PLM-B2-FLUSH'
      },
      reportedBy: { id: 'user-student-2', name: 'Aditya', email: 'aditya@jims.edu', role: 'student' },
      aiClassification: {
        category: 'Plumbing & Water Supply',
        confidence: 0.95,
        keywords: ['pipe', 'leaking', 'washroom', 'sink', 'puddle']
      },
      aiPriority: {
        priority: 'High',
        urgencyScore: 72.0,
        slaHours: 6,
        rationale: ['Disruption keywords detected (water escaping)', 'Public hygiene touchpoint'],
        recommendedAction: 'Turn off angle valve under sink and replace braided steel hose'
      },
      cvAnalysis: {
        detectedFault: 'Water Leakage & Fluid Accumulation',
        confidence: 0.94,
        visualFeatures: 'Wet surface specular reflection (88% fluid tone dominance)',
        suggestedAction: 'Isolate supply valve and inspect compression nut'
      },
      history: [
        { status: 'Submitted', note: 'Complaint submitted with visual scan', updatedBy: 'Aditya', timestamp: new Date(Date.now() - 3600000 * 2) }
      ],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      complaintId: 'JIMS-2026-1004',
      title: 'Projector in Room 201 showing blurry image and red lamp error',
      description: 'The ceiling projector lamp indicator is blinking red and the display turns off automatically after 5 minutes of class.',
      category: 'IT & Computer Labs',
      priority: 'Medium',
      status: 'Resolved',
      location: {
        facilityId: 'fac-2',
        facilityName: 'Computer Lab 1 (Programming Lab)',
        building: 'Block B',
        floor: '1st Floor',
        room: 'Room 201',
        specificAsset: 'PRJ-LAB1-01'
      },
      reportedBy: { id: 'user-staff-1', name: 'Prof. Shankar Sumar', email: 'shankar@jims.edu', role: 'staff' },
      assignedTo: { id: 'user-tech-1', name: 'Rajesh Kumar (Sr. Electrical & HVAC Tech)', role: 'technician' },
      aiClassification: {
        category: 'IT & Computer Labs',
        confidence: 0.91,
        keywords: ['projector', 'blurry', 'lamp error', 'display']
      },
      aiPriority: {
        priority: 'Medium',
        urgencyScore: 50.0,
        slaHours: 24,
        rationale: ['Academic facility impact', 'Medium urgency hardware fault'],
        recommendedAction: 'Clean intake air filter and reset lamp usage hour counter'
      },
      history: [
        { status: 'Submitted', note: 'Reported by Faculty', updatedBy: 'Prof. Shankar Sumar', timestamp: new Date(Date.now() - 86400000 * 2) },
        { status: 'Assigned', note: 'Assigned to IT technician', updatedBy: 'Dr. R. K. Sharma', timestamp: new Date(Date.now() - 86400000 * 1.8) },
        { status: 'In Progress', note: 'Inspecting lamp housing and thermal sensor', updatedBy: 'Rajesh Kumar', timestamp: new Date(Date.now() - 86400000 * 1.2) },
        { status: 'Resolved', note: 'Replaced projector lamp module (model ELPLP96) and vacuumed exhaust heat sink.', updatedBy: 'Rajesh Kumar', timestamp: new Date(Date.now() - 86400000 * 0.5) }
      ],
      feedback: {
        rating: 5,
        comment: 'Very swift resolution before our MCA project presentation! Thank you.',
        submittedAt: new Date(Date.now() - 86400000 * 0.2)
      },
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      complaintId: 'JIMS-2026-1005',
      title: 'Student bench desk leg loose and wobbling in Room 301',
      description: 'Row 3 bench has loose bolt at bottom metal frame, wobbling when students write during lectures.',
      category: 'Civil & Furniture',
      priority: 'Low',
      status: 'Resolved',
      location: {
        facilityId: 'fac-6',
        facilityName: 'MCA Lecture Hall 301',
        building: 'Block B',
        floor: '3rd Floor',
        room: 'Room 301'
      },
      reportedBy: { id: 'user-student-1', name: 'Varun Malik', email: 'varun@jims.edu', role: 'student' },
      assignedTo: { id: 'user-tech-2', name: 'Manoj Verma (Plumbing & Civil Tech)', role: 'technician' },
      aiClassification: {
        category: 'Civil & Furniture',
        confidence: 0.92,
        keywords: ['bench', 'desk', 'leg', 'wobbling', 'frame']
      },
      aiPriority: {
        priority: 'Low',
        urgencyScore: 28.0,
        slaHours: 72,
        rationale: ['Minor physical furniture wear', 'No immediate life safety hazard'],
        recommendedAction: 'Tighten hex bolt assembly or weld joint'
      },
      history: [
        { status: 'Submitted', note: 'Submitted via student portal', updatedBy: 'Varun Malik', timestamp: new Date(Date.now() - 86400000 * 4) },
        { status: 'Resolved', note: 'Bolts tightened and rubber buffer cap replaced', updatedBy: 'Manoj Verma', timestamp: new Date(Date.now() - 86400000 * 3) }
      ],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      complaintId: 'JIMS-2026-1006',
      title: 'Dustbins overflowing outside ground floor cafeteria courtyard',
      description: 'Litter scattered near food stalls attracting flies and unpleasant odor.',
      category: 'Sanitation & Hygiene',
      priority: 'Medium',
      status: 'Closed',
      location: {
        facilityId: 'fac-7',
        facilityName: 'Campus Cafeteria & Courtyard',
        building: 'Block A',
        floor: 'Ground Floor',
        room: 'Courtyard'
      },
      reportedBy: { id: 'user-student-2', name: 'Aditya', email: 'aditya@jims.edu', role: 'student' },
      aiClassification: {
        category: 'Sanitation & Hygiene',
        confidence: 0.94,
        keywords: ['dustbins', 'overflowing', 'cafeteria', 'litter', 'odor']
      },
      aiPriority: {
        priority: 'Medium',
        urgencyScore: 48.0,
        slaHours: 24,
        rationale: ['Food court hygiene area', 'Sanitation backlog'],
        recommendedAction: 'Empty bins and sanitize surrounding floor'
      },
      history: [
        { status: 'Submitted', note: 'Complaint submitted', updatedBy: 'Aditya', timestamp: new Date(Date.now() - 86400000 * 5) },
        { status: 'Resolved', note: 'Housekeeping crew cleared and sanitized area', updatedBy: 'Manoj Verma', timestamp: new Date(Date.now() - 86400000 * 4.8) },
        { status: 'Closed', note: 'Verified clean by facility supervisor', updatedBy: 'Dr. R. K. Sharma', timestamp: new Date(Date.now() - 86400000 * 4.5) }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ];

  for (const c of sampleComplaints) {
    await Complaint.create(c);
  }

  // 4. Seed Maintenance Actions
  const sampleActions = [
    {
      complaintId: 'JIMS-2026-1004',
      technicianId: 'user-tech-1',
      technicianName: 'Rajesh Kumar',
      actionTaken: 'Disassembled projector housing, vacuumed dust accumulated on thermal sensor, installed brand new 230W OEM halogen lamp module, and reset lamp timer.',
      partsReplaced: ['ELPLP96 Projector Lamp Module', 'Thermal Intake Dust Filter'],
      costEstimated: 3450,
      statusResult: 'Resolved',
      remarks: 'Projector brightness restored to 3500 ANSI lumens. Test projected for 45 minutes without heating alarm.',
      completedAt: new Date(Date.now() - 86400000 * 0.5)
    },
    {
      complaintId: 'JIMS-2026-1005',
      technicianId: 'user-tech-2',
      technicianName: 'Manoj Verma',
      actionTaken: 'Replaced rusted M8 hex bolts on desk leg structure and installed heavy-duty anti-skid rubber feet.',
      partsReplaced: ['M8x40mm Hex Screws (4 units)', 'Anti-skid rubber leveler pads'],
      costEstimated: 180,
      statusResult: 'Resolved',
      remarks: 'Desk now firm and stable.',
      completedAt: new Date(Date.now() - 86400000 * 3)
    }
  ];

  for (const a of sampleActions) {
    await MaintenanceAction.create(a);
  }

  // 5. Activity Logs
  await ActivityLog.create({
    action: 'SYSTEM_INITIALIZED',
    userId: 'system',
    userName: 'JIMS Maintenance Engine',
    details: { version: '2.4.0', status: 'Seeded successfully' }
  });

  console.log('[Seed] Database successfully populated with JIMS campus records!');
};
