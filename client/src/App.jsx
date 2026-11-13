import React, { useState, useEffect } from 'react';
import { apiRequest } from './api.js';
import Navbar from './components/Navbar.jsx';
import LoginView from './components/LoginView.jsx';
import DashboardView from './components/DashboardView.jsx';
import ComplaintsListView from './components/ComplaintsListView.jsx';
import PredictiveMaintenanceHub from './components/PredictiveMaintenanceHub.jsx';
import FacilityDirectoryView from './components/FacilityDirectoryView.jsx';
import StudentPortalView from './components/StudentPortalView.jsx';
import TechnicianPortalView from './components/TechnicianPortalView.jsx';
import ReportIssueModal from './components/ReportIssueModal.jsx';
import ComplaintDetailModal from './components/ComplaintDetailModal.jsx';
import DocumentationModal from './components/DocumentationModal.jsx';
import { 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role || 'student';
      }
    } catch (e) {}
    return 'student';
  });

  const [activeTab, setActiveTab] = useState(() => {
    return (currentRole === 'technician') ? 'tech-assigned' : (currentRole === 'admin') ? 'dashboard' : 'my-requests';
  });

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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentRole(user.role || 'student');
    if (user.role === 'technician') setActiveTab('tech-assigned');
    else if (user.role === 'admin') setActiveTab('dashboard');
    else setActiveTab('my-requests');
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    localStorage.removeItem('campus_token');
    setCurrentUser(null);
    showToast('Signed out successfully');
  };

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    if (role === 'student' || role === 'staff') {
      setActiveTab('my-requests');
      showToast(`Switched to ${role === 'student' ? 'Varun Malik (Student)' : 'Prof. Shankar Sumar (Faculty)'}`);
    } else if (role === 'technician') {
      setActiveTab('tech-assigned');
      showToast(`Switched to Rajesh Kumar (Field Technician)`);
    } else {
      setActiveTab('dashboard');
      showToast(`Switched to Dr. R. K. Sharma (Administrator)`);
    }
  };

  const handleComplaintCreated = (newComplaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
    showToast(`Incident ${newComplaint.complaintId} created & dispatched successfully`);
    fetchData();
  };

  const handleFacilityAdded = (newFacility) => {
    setFacilities(prev => [newFacility, ...prev]);
    showToast(`New room ${newFacility.roomNumber} (${newFacility.block}) saved to directory!`);
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

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative min-h-screen bg-[#07080B] text-slate-100 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white overflow-hidden">
      
      {/* 🌟 Radiant Bold Ambient Gradient Mesh Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Giant Top-Right Aurora Orb */}
        <div 
          className="absolute -top-[10%] -right-[15%] w-[850px] h-[850px] rounded-full opacity-60 filter blur-[120px] animate-mesh-float"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.85) 0%, rgba(192,132,252,0.8) 35%, rgba(99,102,241,0.6) 65%, rgba(56,189,248,0) 80%)'
          }}
        />

        {/* Warm Peachy-Coral Center Glow */}
        <div 
          className="absolute top-[25%] left-[20%] w-[650px] h-[650px] rounded-full opacity-40 filter blur-[130px]"
          style={{
            background: 'radial-gradient(circle, rgba(251,146,60,0.6) 0%, rgba(244,63,94,0.5) 45%, rgba(168,85,247,0) 75%)'
          }}
        />

        {/* Deep Violet / Indigo Base Glow */}
        <div 
          className="absolute -bottom-[20%] -left-[10%] w-[750px] h-[750px] rounded-full opacity-50 filter blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.7) 0%, rgba(139,92,246,0.6) 40%, rgba(14,165,233,0) 80%)'
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full glass-card border border-white/20 text-white text-xs shadow-2xl backdrop-blur-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium tracking-wide">{toastMessage.msg}</span>
        </div>
      )}

      {/* Floating Glass Navigation Header */}
      <div className="relative z-40">
        <Navbar
          currentRole={currentRole}
          setCurrentRole={handleRoleChange}
          currentUser={currentUser}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenDocsModal={() => setIsDocsModalOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {loading ? (
          <div className="h-80 sm:h-96 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-fuchsia-400 animate-spin" />
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              Loading operational metrics...
            </p>
          </div>
        ) : (
          <>
            {/* 1. STUDENT & FACULTY SPECIFIC VIEWS */}
            {(currentRole === 'student' || currentRole === 'staff') && (
              <>
                {activeTab === 'my-requests' && (
                  <StudentPortalView
                    complaints={complaints}
                    currentRole={currentRole}
                    onSelectComplaint={(c) => setSelectedComplaint(c)}
                    onOpenReportModal={() => setIsReportModalOpen(true)}
                  />
                )}

                {activeTab === 'all-issues' && (
                  <ComplaintsListView
                    complaints={complaints}
                    onSelectComplaint={(c) => setSelectedComplaint(c)}
                    onOpenReportModal={() => setIsReportModalOpen(true)}
                  />
                )}

                {activeTab === 'facilities' && (
                  <FacilityDirectoryView facilities={facilities} />
                )}
              </>
            )}

            {/* 2. TECHNICIAN SPECIFIC VIEWS */}
            {currentRole === 'technician' && (
              <TechnicianPortalView
                complaints={complaints}
                activeSubTab={
                  activeTab === 'tech-queue' ? 'queue' : 
                  activeTab === 'tech-completed' ? 'completed' : 'assigned'
                }
                onSelectComplaint={(c) => setSelectedComplaint(c)}
                onRefresh={fetchData}
              />
            )}

            {/* 3. ADMINISTRATOR SPECIFIC VIEWS */}
            {currentRole === 'admin' && (
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
                    onOpenPredictive={() => setActiveTab('predictive')}
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
          </>
        )}
      </main>

      {/* Frosted Glass Minimal Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-black/20 backdrop-blur-xl py-5 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200 tracking-tight">CampusOps</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">JIMS Rohini Sector-5</span>
          </div>
          <div className="text-[11px] text-slate-400">
            MCA Semester 3 Academic Project • Varun Malik, Shankar Sumar & Aditya
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currentRole={currentRole}
        onComplaintCreated={handleComplaintCreated}
        onFacilityAdded={handleFacilityAdded}
        existingFacilities={facilities}
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
