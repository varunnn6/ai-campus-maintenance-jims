import { Complaint, Facility, ActivityLog, User } from '../models/index.js';

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
      cvAnalysis
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const complaintId = await generateComplaintId();
    const reporter = req.user || {
      _id: 'guest',
      name: 'Campus User',
      email: 'user@jims.edu',
      role: 'student'
    };

    const newComplaint = await Complaint.create({
      complaintId,
      title,
      description,
      category: category || aiClassification?.category || 'Civil & Furniture',
      priority: priority || aiPriority?.priority || 'Medium',
      status: 'Submitted',
      location: {
        facilityId: location?.facilityId || '',
        facilityName: location?.facilityName || location?.building || 'Main Campus',
        building: location?.building || 'Block B',
        floor: location?.floor || '1st Floor',
        room: location?.room || 'Room 101',
        specificAsset: location?.specificAsset || ''
      },
      reportedBy: {
        id: reporter._id || reporter.id,
        name: reporter.name,
        email: reporter.email,
        role: reporter.role
      },
      images: images || [],
      aiClassification: aiClassification || null,
      aiPriority: aiPriority || null,
      cvAnalysis: cvAnalysis || null,
      history: [{
        status: 'Submitted',
        note: 'Complaint submitted by user via web portal',
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
    return res.json(complaint);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving complaint', error: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const updater = req.user ? req.user.name : 'System Administrator';

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
      note: note || `Status transitioned to ${status}`,
      updatedBy: updater,
      timestamp: new Date()
    };

    const updated = await Complaint.findByIdAndUpdate(id, {
      $set: { status, updatedAt: new Date() },
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
