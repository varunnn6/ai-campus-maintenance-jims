import express from 'express';
import * as authCtrl from '../controllers/authController.js';
import * as complaintsCtrl from '../controllers/complaintsController.js';
import * as facilitiesCtrl from '../controllers/facilitiesController.js';
import * as maintenanceCtrl from '../controllers/maintenanceController.js';
import * as analyticsCtrl from '../controllers/analyticsController.js';
import * as aiCtrl from '../controllers/aiBridgeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// --- Auth Routes ---
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticateToken, authCtrl.getCurrentUser);
router.get('/auth/technicians', authCtrl.getTechnicians);

// --- AI / ML & Computer Vision Routes ---
router.post('/ai/classify', aiCtrl.classifyText);
router.post('/ai/priority', aiCtrl.scorePriority);
router.post('/ai/cv-inspect', aiCtrl.cvInspect);
router.post('/ai/predictive-maintenance', aiCtrl.getPredictiveInsights);

// --- Complaints Routes ---
router.get('/complaints', complaintsCtrl.getComplaints);
router.get('/complaints/:id', complaintsCtrl.getComplaintById);
router.post('/complaints', complaintsCtrl.createComplaint);
router.patch('/complaints/:id/status', complaintsCtrl.updateStatus);
router.patch('/complaints/:id/assign', complaintsCtrl.assignTechnician);
router.post('/complaints/:id/feedback', complaintsCtrl.submitFeedback);

// --- Facilities Routes ---
router.get('/facilities', facilitiesCtrl.getAllFacilities);
router.get('/facilities/:id', facilitiesCtrl.getFacilityById);
router.post('/facilities', facilitiesCtrl.createFacility);

// --- Maintenance Actions Routes ---
router.get('/maintenance', maintenanceCtrl.getAllActions);
router.get('/maintenance/complaint/:complaintId', maintenanceCtrl.getActionsByComplaint);
router.post('/maintenance/action', maintenanceCtrl.logAction);

// --- Predictive Analytics & Dashboard Routes ---
router.get('/analytics/summary', analyticsCtrl.getDashboardSummary);
router.get('/analytics/trends', analyticsCtrl.getTrendAnalytics);
router.get('/analytics/risk-heatmap', analyticsCtrl.getCampusRiskHeatmap);
router.get('/analytics/recurring', analyticsCtrl.getRecurringIssuesCluster);

export default router;
