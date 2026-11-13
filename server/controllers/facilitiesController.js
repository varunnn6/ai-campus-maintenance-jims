import { Facility, Complaint } from '../models/index.js';

export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    return res.json(facilities);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving facilities', error: err.message });
  }
};

export const getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    const complaints = await Complaint.find();
    const facilityComplaints = complaints.filter(c => c.location?.facilityId === facility._id || c.location?.building === facility.block);
    
    return res.json({
      facility,
      complaints: facilityComplaints
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving facility', error: err.message });
  }
};

export const createFacility = async (req, res) => {
  try {
    const { name, block, floor, roomNumber, type, assets = [] } = req.body;
    if (!name || !block) {
      return res.status(400).json({ message: 'Facility name and block are required' });
    }
    const newFacility = await Facility.create({
      name,
      block,
      floor: floor || 'Ground Floor',
      roomNumber: roomNumber || '101',
      type: type || 'Classroom',
      assets,
      riskScore: 25,
      activeIssuesCount: 0
    });
    return res.status(201).json(newFacility);
  } catch (err) {
    return res.status(500).json({ message: 'Error creating facility', error: err.message });
  }
};
