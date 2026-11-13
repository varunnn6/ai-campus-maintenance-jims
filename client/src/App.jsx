import React, { useState, useEffect } from 'react';
import { apiRequest } from './api.js';
import Navbar from './components/Navbar.jsx';
import DashboardView from './components/DashboardView.jsx';
import ComplaintsListView from './components/ComplaintsListView.jsx';
import PredictiveMaintenanceHub from './components/PredictiveMaintenanceHub.jsx';
import FacilityDirectoryView from './components/FacilityDirectoryView.jsx';
import ReportIssueModal from './components/ReportIssueModal.jsx';
import ComplaintDetailModal from './components/ComplaintDetailModal.jsx';
import DocumentationModal from './components/DocumentationModal.jsx';
import { 
  Building2, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  Heart,
  Loader2 
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('admin');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data states
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [riskHeatmap, setRiskHeatmap] = useState([]);
  const [recurringClusters, setRecurringClusters] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        compData,
        sumData,
        trendResData,
        riskData,
        recurData,
        facData,
        techData
      ] = await Promise.all([
        apiRequest('/complaints'),
        apiRequest('/analytics/summary'),
        apiRequest('/analytics/trends'),
        apiRequest('/analytics/risk-heatmap'),
        apiRequest('/analytics/recurring'),
        apiRequest('/facilities'),
        apiRequest('/auth/technicians')
      ]);

      if (compData) setComplaints(compData);
      if (sumData) setSummary(sumData);
      if (trendResData) setTrendData(trendResData);
      if (riskData) setRiskHeatmap(riskData);
      if (recurData) setRecurringClusters(recurData);
      if (facData) setFacilities(facData);
      if (techData) setTechnicians(techData);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplaintCreated = (newComplaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
    showToast(`Complaint ${newComplaint.complaintId} created & dispatched successfully!`);
    fetchData();
  };

  const handleStatusUpdated = (updatedComplaint) => {
    setComplaints(prev => prev.map(c => 
      (c._id === updatedComplaint._id || c.complaintId === updatedComplaint.complaintId) ? updatedComplaint : c
    ));
    setSelectedComplaint(updatedComplaint);
    showToast(`Complaint status updated to ${updatedComplaint.status}!`);
    fetchData();
  };

  const handleGenerateWorkOrder = (cluster) => {
    setIsReportModalOpen(true);
    showToast(`Pre-emptive maintenance template loaded for ${cluster.building} ${cluster.room}!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={(role) => {
          setCurrentRole(role);
          if (role === 'technician') setActiveTab('complaints');
          showToast(`Switched active view role to ${role.toUpperCase()}`);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenDocsModal={() => setIsDocsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">
              Connecting to JIMS Campus Maintenance Engine & Neural Models...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                summary={summary}
                trendData={trendData}
                riskHeatmap={riskHeatmap}
                complaints={complaints}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
                onRefresh={fetchData}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {activeTab === 'complaints' && (
              <ComplaintsListView
                complaints={complaints}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {activeTab === 'predictive' && (
              <PredictiveMaintenanceHub
                riskHeatmap={riskHeatmap}
                recurringClusters={recurringClusters}
                onGenerateWorkOrder={handleGenerateWorkOrder}
              />
            )}

            {activeTab === 'facilities' && (
              <FacilityDirectoryView facilities={facilities} />
            )}

            {activeTab === 'technician' && (
              <ComplaintsListView
                complaints={complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed')}
                onSelectComplaint={(c) => setSelectedComplaint(c)}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 px-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-400">
          Jagan Institute of Management Studies (JIMS), Sector-5, Rohini, Delhi – 110085
        </p>
        <p className="text-[11px] text-slate-600">
          MCA Semester 3 Academic Project by <strong>Varun Malik, Shankar Sumar & Aditya</strong> • Affiliated to GGSIPU
        </p>
      </footer>

      {/* Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentRole={currentRole}
        onComplaintCreated={handleComplaintCreated}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        currentRole={currentRole}
        technicians={technicians}
        onStatusUpdated={handleStatusUpdated}
      />

      <DocumentationModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </div>
  );
}
