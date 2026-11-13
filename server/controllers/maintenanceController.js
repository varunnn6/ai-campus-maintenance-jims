import { MaintenanceAction, Complaint, ActivityLog } from '../models/index.js';

export const logAction = async (req, res) => {
  try {
    const {
      complaintId,
      actionTaken,
      partsReplaced = [],
      costEstimated = 0,
      statusResult = 'Resolved',
      remarks
    } = req.body;

    if (!complaintId || !actionTaken) {
      return res.status(400).json({ message: 'Complaint ID and action taken are required' });
    }

    const technician = req.user || { name: 'Campus Technician', _id: 'tech-1' };

    const newAction = await MaintenanceAction.create({
      complaintId,
      technicianId: technician._id,
      technicianName: technician.name,
      actionTaken,
      partsReplaced: Array.isArray(partsReplaced) ? partsReplaced : [partsReplaced],
      costEstimated: Number(costEstimated) || 0,
      statusResult,
      remarks: remarks || '',
      completedAt: new Date()
    });

    // Automatically advance complaint status if requested
    if (statusResult) {
      const complaint = await Complaint.findOne({ complaintId }) || await Complaint.findById(complaintId);
      if (complaint) {
        await Complaint.findByIdAndUpdate(complaint._id, {
          $set: { status: statusResult, updatedAt: new Date() },
          $push: {
            history: {
              status: statusResult,
              note: `Maintenance action performed by ${technician.name}: ${actionTaken}`,
              updatedBy: technician.name,
              timestamp: new Date()
            }
          }
        });
      }
    }

    await ActivityLog.create({
      action: 'MAINTENANCE_ACTION_LOGGED',
      userId: technician._id,
      userName: technician.name,
      details: { complaintId, actionTaken, statusResult }
    });

    return res.status(201).json({
      message: 'Maintenance action recorded successfully',
      action: newAction
    });
  } catch (err) {
    console.error('Log action error:', err);
    return res.status(500).json({ message: 'Error logging maintenance action', error: err.message });
  }
};

export const getActionsByComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const actions = await MaintenanceAction.find({ complaintId });
    return res.json(actions);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching actions', error: err.message });
  }
};

export const getAllActions = async (req, res) => {
  try {
    const actions = await MaintenanceAction.find();
    return res.json(actions);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching maintenance records', error: err.message });
  }
};
