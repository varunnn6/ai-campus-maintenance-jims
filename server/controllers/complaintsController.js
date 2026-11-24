import { Complaint, Facility, ActivityLog, User } from '../models/index.js';

// Trade mapping for automated AI dispatch
const mapCategoryToTrade = (category = '') => {
  const cat = category.toLowerCase();
  if (cat.includes('electrical') || cat.includes('power') || cat.includes('hvac') || cat.includes('ac')) {
    return 'Electrical & HVAC';
  }
  if (cat.includes('plumb') || cat.includes('water') || cat.includes('sanitat') || cat.includes('washroom') || cat.includes('hygiene')) {
    return 'Plumbing & Sanitation';
  }
  if (cat.includes('civil') || cat.includes('furniture') || cat.includes('door') || cat.includes('window') || cat.includes('carpentry')) {
    return 'Civil & Carpentry';
  }
  if (cat.includes('it') || cat.includes('computer') || cat.includes('lab') || cat.includes('network') || cat.includes('hardware') || cat.includes('projector')) {
    return 'IT & Networking';
  }
  return 'General Maintenance';
};

// Sequential complaint ID generator
const generateComplaintId = async () => {
  const count = await Complaint.countDocuments();
  const num = String(count + 101).padStart(4, '0');
  return `JIMS-2026-${num}`;
};

export const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      location,
      images = [],
      aiClassification,
      aiPriority,
      cvAnalysis,
      // Explicit reporter fields sent from frontend when no JWT token
      reporterName,
      reporterEmail,
      reporterEnrollment,
      reporterId
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const complaintId = await generateComplaintId();
    const finalCategory = category || aiClassification?.category || 'Civil & Furniture';
    const targetTrade = mapCategoryToTrade(finalCategory);

    // Build reporter: prefer JWT-verified user, then explicit body fields, then guest fallback
    const reporter = req.user && req.user.name && req.user.name !== 'Campus User'
      ? req.user
      : {
          _id: reporterId || req.user?._id || 'guest',
          name: reporterName || req.user?.name || 'Campus User',
          email: reporterEmail || req.user?.email || 'user@jims.edu',
          role: req.user?.role || 'student',
          enrollmentNumber: reporterEnrollment || req.user?.enrollmentNumber || null
        };

    const newComplaint = await Complaint.create({
      complaintId,
      title,
      description,
      category: finalCategory,
      priority: priority || aiPriority?.priority || 'Medium',
      status: 'Submitted',
      targetTrade,
      aiAutoDispatched: true,
      optInAvailable: true,
      location: {
        facilityId: location?.facilityId || '',
        facilityName: location?.facilityName || location?.building || 'Main Campus',
        building: location?.building || 'Building B',
        floor: location?.floor || '1st Floor',
        room: location?.room || 'Room 101',
        specificAsset: location?.specificAsset || ''
      },
      reportedBy: {
        id: reporter._id || reporter.id,
        name: reporter.name,
        email: reporter.email,
        role: reporter.role,
        enrollmentNumber: reporter.enrollmentNumber || null
      },
      images: images || [],
      aiClassification: aiClassification || null,
      aiPriority: aiPriority || null,
      cvAnalysis: cvAnalysis || null,
      history: [{
        status: 'Submitted',
        note: `Issue reported and AI auto-routed to ${targetTrade} technicians`,
        updatedBy: reporter.name,
        timestamp: new Date()
      }]
    });

    // Update facility active issues counter
    if (location?.facilityId) {
      const facility = await Facility.findById(location.facilityId);
      if (facility) {
        await Facility.findByIdAndUpdate(location.facilityId, {
          $set: { activeIssuesCount: (facility.activeIssuesCount || 0) + 1 }
        });
      }
    }

    await ActivityLog.create({
      action: 'COMPLAINT_CREATED',
      userId: reporter._id,
      userName: reporter.name,
      details: { complaintId, title, category: newComplaint.category, priority: newComplaint.priority }
    });

    return res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: newComplaint
    });
  } catch (err) {
    console.error('Create complaint error:', err);
    return res.status(500).json({ message: 'Error submitting complaint', error: err.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const { status, category, priority, building, reportedBy, search } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (category && category !== 'All') filter.category = category;
    if (priority && priority !== 'All') filter.priority = priority;

    let complaints = await Complaint.find(filter);

    // Filter in-memory for nested properties & search
    if (building && building !== 'All') {
      complaints = complaints.filter(c => c.location && c.location.building === building);
    }

    if (reportedBy) {
      complaints = complaints.filter(c => c.reportedBy && (c.reportedBy.id === reportedBy || c.reportedBy.email === reportedBy));
    }

    if (search) {
      const q = search.toLowerCase();
      complaints = complaints.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.complaintId && c.complaintId.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.location && c.location.room && c.location.room.toLowerCase().includes(q))
      );
    }

    return res.json(complaints);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving complaints', error: err.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id) || await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Check for repeat / recurring breakdowns in the same location
    const allComplaints = await Complaint.find();
    const room = complaint.location?.room;
    const cat = complaint.category;
    const repeatCount = allComplaints.filter(c => 
      c.location?.room && room && c.location.room.toLowerCase() === room.toLowerCase() &&
      c.category === cat
    ).length;

    let recurrenceAlert = null;
    if (repeatCount >= 2) {
      recurrenceAlert = {
        isRecurring: true,
        occurrences: repeatCount,
        actionRecommendation: repeatCount >= 3 ? 'REPLACE_EQUIPMENT' : 'ROOT_CAUSE_INSPECTION',
        badge: repeatCount >= 3 ? 'Replacement Recommended (Stop Quick Patching)' : 'Repeat Issue Warning',
        title: repeatCount >= 3 ? 'Frequent Breakdown — Equipment Replacement Advised' : 'Recurring Issue in this Space',
        message: repeatCount >= 3
          ? `This equipment in ${complaint.location?.building} ${complaint.location?.room} has broken down ${repeatCount} times. Repeated patch repairs are costing more than replacement. Administrator is advised to issue a full replacement order.`
          : `This is the ${repeatCount}nd time an issue has been reported in this room. Technician should check for root-cause issues to avoid continuous breakdowns.`
      };
    }

    return res.json({ ...complaint, recurrenceAlert });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving complaint', error: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      note, 
      resolutionPhotos, 
      resolutionNotes, 
      partsReplaced, 
      timeSpent, 
      technicianName, 
      technicianId 
    } = req.body;
    const updater = req.user ? req.user.name : (technicianName || 'System Administrator');

    const validStatuses = ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const historyEntry = {
      status,
      note: note || resolutionNotes || `Status updated to ${status}`,
      updatedBy: updater,
      timestamp: new Date()
    };

    const updateFields = {
      status,
      updatedAt: new Date()
    };

    if (resolutionNotes) updateFields.resolutionNotes = resolutionNotes;
    if (resolutionPhotos && Array.isArray(resolutionPhotos) && resolutionPhotos.length > 0) {
      updateFields.resolutionPhotos = resolutionPhotos;
    }
    if (partsReplaced) updateFields.partsReplaced = partsReplaced;
    if (timeSpent) updateFields.timeSpent = timeSpent;

    if (technicianName && (status === 'In Progress' || status === 'Assigned' || status === 'Resolved')) {
      updateFields.assignedTo = {
        id: technicianId || (req.user ? req.user._id : 'tech'),
        name: technicianName,
        assignedAt: new Date()
      };
      updateFields.optInAvailable = false;
    }

    if (status === 'Resolved' || status === 'Closed') {
      updateFields.resolvedAt = new Date();
      updateFields.resolvedBy = updater;
    }

    const updated = await Complaint.findByIdAndUpdate(id, {
      $set: updateFields,
      $push: { history: historyEntry }
    });

    // If resolved or closed, decrement facility active issue counter
    if ((status === 'Resolved' || status === 'Closed') && complaint.location?.facilityId) {
      const facility = await Facility.findById(complaint.location.facilityId);
      if (facility && facility.activeIssuesCount > 0) {
        await Facility.findByIdAndUpdate(complaint.location.facilityId, {
          $set: { activeIssuesCount: Math.max(0, facility.activeIssuesCount - 1) }
        });
      }
    }

    await ActivityLog.create({
      action: 'STATUS_UPDATED',
      userId: req.user?._id,
      userName: updater,
      details: { complaintId: complaint.complaintId, from: complaint.status, to: status }
    });

    return res.json({ message: `Status updated to ${status}`, complaint: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating status', error: err.message });
  }
};

export const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId, note } = req.body;
    const assigner = req.user ? req.user.name : 'Administrator';

    const technician = await User.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    const updated = await Complaint.findByIdAndUpdate(id, {
      $set: {
        status: 'Assigned',
        assignedTo: {
          id: technician._id,
          name: technician.name,
          role: technician.role,
          assignedAt: new Date()
        },
        updatedAt: new Date()
      },
      $push: {
        history: {
          status: 'Assigned',
          note: note || `Assigned to technician ${technician.name}`,
          updatedBy: assigner,
          timestamp: new Date()
        }
      }
    });

    return res.json({ message: `Assigned to ${technician.name}`, complaint: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Error assigning technician', error: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    const updated = await Complaint.findByIdAndUpdate(id, {
      $set: {
        feedback: {
          rating: Number(rating),
          comment: comment || '',
          submittedAt: new Date()
        }
      }
    });

    return res.json({ message: 'Feedback recorded successfully', complaint: updated });
  } catch (err) {
    return res.status(500).json({ message: 'Error submitting feedback', error: err.message });
  }
};

// Smart location-based recommendation system
// Returns the top frequently-reported problems for a given building/floor/room
export const getRecommendations = async (req, res) => {
  try {
    const { building, floor, room } = req.query;

    if (!building) {
      return res.json([]);
    }

    // Build a progressive location filter: narrow as more info is provided
    const filter = { 'location.building': building };
    if (floor) filter['location.floor'] = floor;
    if (room) filter['location.room'] = room;

    // Fetch matching complaints (limit to recent 500 for performance)
    const complaints = await Complaint.find(filter)
      .select('title description category location')
      .limit(500)
      .lean();

    if (!complaints.length) return res.json([]);

    // Group by title+category and count frequency
    const freqMap = {};
    complaints.forEach(c => {
      const key = `${c.title?.trim()}||${c.category?.trim()}`;
      if (!freqMap[key]) {
        freqMap[key] = {
          title: c.title,
          description: c.description,
          category: c.category,
          building: c.location?.building,
          floor: c.location?.floor,
          room: c.location?.room,
          count: 0
        };
      }
      freqMap[key].count++;
    });

    // Sort by frequency descending, return top 5
    const sorted = Object.values(freqMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json(sorted);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching recommendations', error: err.message });
  }
};
