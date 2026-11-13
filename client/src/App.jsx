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
  CheckCircle2, 
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
        apiRequest('/complaints').catch(() => []),
        apiRequest('/analytics/summary').catch(() => null),
        apiRequest('/analytics/trends').catch(() => []),
        apiRequest('/analytics/risk-heatmap').catch(() => []),
        apiRequest('/analytics/recurring').catch(() => []),
        apiRequest('/facilities').catch(() => []),
        apiRequest('/auth/technicians').catch(() => [])
      ]);

      if (compData && Array.isArray(compData)) setComplaints(compData);
      if (sumData) setSummary(sumData);
      if (trendResData && Array.isArray(trendResData)) setTrendData(trendResData);
      if (riskData && Array.isArray(riskData)) setRiskHeatmap(riskData);
      if (recurData && Array.isArray(recurData)) setRecurringClusters(recurData);
      if (facData && Array.isArray(facData)) setFacilities(facData);
      if (techData && Array.isArray(techData)) setTechnicians(techData);
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
    showToast(`Issue ${newComplaint.complaintId} created & dispatched successfully`);
    fetchData();
  };

  const handleStatusUpdated = (updatedComplaint) => {
    setComplaints(prev => prev.map(c => 
      (c._id === updatedComplaint._id || c.complaintId === updatedComplaint.complaintId) ? updatedComplaint : c
    ));
    setSelectedComplaint(updatedComplaint);
    showToast(`Status updated to ${updatedComplaint.status}`);
    fetchData();
  };

  const handleGenerateWorkOrder = (cluster) => {
    setIsReportModalOpen(true);
    showToast(`Pre-emptive order template loaded for ${cluster.building} ${cluster.room}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#111622] border border-white/[0.1] text-slate-200 text-xs shadow-2xl">
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
          showToast(`Switched view to ${role.toUpperCase()}`);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenDocsModal={() => setIsDocsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="h-80 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-xs text-slate-500">
              Loading operational metrics...
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
          </>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.06] bg-[#090D14] py-4 px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <div className="text-[11px] text-slate-400 font-medium">
          CampusOps • Facility & Infrastructure Intelligence
        </div>
        <div className="text-[11px] text-slate-600 mt-1 sm:mt-0">
          Jagan Institute of Management Studies (JIMS Rohini) • Varun Malik, Shankar Sumar & Aditya
        </div>
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
