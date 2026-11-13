import mongoose from 'mongoose';
import { jsonDb, isMongoConnected } from '../config/db.js';
import crypto from 'crypto';

// -------------------------------------------------------------
// MONGOOSE SCHEMAS (Used when MongoDB is connected)
// -------------------------------------------------------------
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'staff', 'admin', 'technician'], default: 'student' },
  department: { type: String, default: 'Computer Applications' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const FacilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  block: { type: String, required: true },
  floor: { type: String, required: true },
  roomNumber: { type: String, required: true },
  type: { type: String, required: true },
  assets: [{
    name: String,
    assetTag: String,
    type: String,
    installedDate: Date,
    healthScore: { type: Number, default: 90 },
    lastServiced: Date
  }],
  riskScore: { type: Number, default: 20 },
  activeIssuesCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const ComplaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  status: { 
    type: String, 
    enum: ['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Submitted' 
  },
  location: {
    facilityId: String,
    facilityName: String,
    building: String,
    floor: String,
    room: String,
    specificAsset: String
  },
  reportedBy: {
    id: String,
    name: String,
    email: String,
    role: String
  },
  assignedTo: {
    id: String,
    name: String,
    role: String,
    assignedAt: Date
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  aiClassification: {
    category: String,
    confidence: Number,
    keywords: [String],
    allProbabilities: Object
  },
  aiPriority: {
    priority: String,
    urgencyScore: Number,
    slaHours: Number,
    rationale: [String],
    recommendedAction: String
  },
  cvAnalysis: {
    detectedFault: String,
    confidence: Number,
    visualFeatures: String,
    suggestedAction: String
  },
  history: [{
    status: String,
    note: String,
    updatedBy: String,
    timestamp: { type: Date, default: Date.now }
  }],
  feedback: {
    rating: Number,
    comment: String,
    submittedAt: Date
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MaintenanceActionSchema = new mongoose.Schema({
  complaintId: { type: String, required: true },
  technicianId: String,
  technicianName: String,
  actionTaken: { type: String, required: true },
  partsReplaced: [String],
  costEstimated: { type: Number, default: 0 },
  statusResult: String,
  remarks: String,
  startedAt: Date,
  completedAt: { type: Date, default: Date.now }
});

const PredictionSchema = new mongoose.Schema({
  facilityName: String,
  assetType: String,
  healthScore: Number,
  riskLevel: String,
  meanTimeBetweenFailuresDays: Number,
  predictedFailureWindow: String,
  failureProbability15Days: Number,
  failureProbability30Days: Number,
  recurrenceScore: Number,
  recommendedAction: String,
  lastUpdated: { type: Date, default: Date.now }
});

const ActivityLogSchema = new mongoose.Schema({
  action: String,
  userId: String,
  userName: String,
  details: Object,
  timestamp: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', UserSchema);
const MongoFacility = mongoose.model('Facility', FacilitySchema);
const MongoComplaint = mongoose.model('Complaint', ComplaintSchema);
const MongoMaintenanceAction = mongoose.model('MaintenanceAction', MaintenanceActionSchema);
const MongoPrediction = mongoose.model('Prediction', PredictionSchema);
const MongoActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// -------------------------------------------------------------
// DUAL-MODE DATA ACCESS LAYER
// -------------------------------------------------------------
const createModelAdapter = (collectionName, MongoModel) => {
  return {
    async find(query = {}) {
      if (isMongoConnected) {
        return await MongoModel.find(query).sort({ createdAt: -1 });
      }
      const items = jsonDb.getCollection(collectionName);
      return items.filter(item => {
        for (const [k, v] of Object.entries(query)) {
          if (v && typeof v === 'object' && v.$ne !== undefined) {
            if (item[k] === v.$ne) return false;
          } else if (v !== undefined && item[k] !== v) {
            return false;
          }
        }
        return true;
      }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },

    async findById(id) {
      if (isMongoConnected) {
        return await MongoModel.findById(id);
      }
      const items = jsonDb.getCollection(collectionName);
      return items.find(item => item._id === id || item.id === id) || null;
    },

    async findOne(query = {}) {
      if (isMongoConnected) {
        return await MongoModel.findOne(query);
      }
      const items = jsonDb.getCollection(collectionName);
      return items.find(item => {
        for (const [k, v] of Object.entries(query)) {
          if (v !== undefined && item[k] !== v) return false;
        }
        return true;
      }) || null;
    },

    async create(doc) {
      if (isMongoConnected) {
        return await MongoModel.create(doc);
      }
      const items = jsonDb.getCollection(collectionName);
      const newDoc = {
        _id: doc._id || crypto.randomUUID(),
        ...doc,
        createdAt: doc.createdAt || new Date().toISOString(),
        updatedAt: doc.updatedAt || new Date().toISOString()
      };
      items.unshift(newDoc);
      jsonDb.save();
      return newDoc;
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (isMongoConnected) {
        return await MongoModel.findByIdAndUpdate(id, update, options);
      }
      const items = jsonDb.getCollection(collectionName);
      const idx = items.findIndex(item => item._id === id || item.id === id);
      if (idx === -1) return null;

      const current = items[idx];
      let updatedFields = update.$set ? { ...update.$set } : { ...update };
      if (update.$push) {
        for (const [arrKey, arrVal] of Object.entries(update.$push)) {
          current[arrKey] = current[arrKey] || [];
          current[arrKey].push(arrVal);
        }
      }
      items[idx] = { ...current, ...updatedFields, updatedAt: new Date().toISOString() };
      jsonDb.save();
      return items[idx];
    },

    async deleteOne(query) {
      if (isMongoConnected) {
        return await MongoModel.deleteOne(query);
      }
      const items = jsonDb.getCollection(collectionName);
      const idx = items.findIndex(item => {
        for (const [k, v] of Object.entries(query)) {
          if (item[k] !== v) return false;
        }
        return true;
      });
      if (idx !== -1) {
        items.splice(idx, 1);
        jsonDb.save();
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    },

    async countDocuments(query = {}) {
      if (isMongoConnected) {
        return await MongoModel.countDocuments(query);
      }
      const matches = await this.find(query);
      return matches.length;
    }
  };
};

export const User = createModelAdapter('users', MongoUser);
export const Facility = createModelAdapter('facilities', MongoFacility);
export const Complaint = createModelAdapter('complaints', MongoComplaint);
export const MaintenanceAction = createModelAdapter('maintenanceActions', MongoMaintenanceAction);
export const Prediction = createModelAdapter('predictions', MongoPrediction);
export const ActivityLog = createModelAdapter('activityLogs', MongoActivityLog);
