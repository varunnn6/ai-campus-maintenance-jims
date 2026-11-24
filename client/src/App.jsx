import React, { useState, useEffect } from 'react';
import { apiRequest } from './api.js';
import Navbar from './components/Navbar.jsx';
import LoginView from './components/LoginView.jsx';
import DashboardView from './components/DashboardView.jsx';
import ComplaintsListView from './components/ComplaintsListView.jsx';
import PredictiveMaintenanceHub from './components/PredictiveMaintenanceHub.jsx';
import StudentPortalView from './components/StudentPortalView.jsx';
import TechnicianPortalView from './components/TechnicianPortalView.jsx';
import ReportIssueModal from './components/ReportIssueModal.jsx';
import ComplaintDetailModal from './components/ComplaintDetailModal.jsx';
import AdminUserManagementModal from './components/AdminUserManagementModal.jsx';
import ChangeCredentialsModal from './components/ChangeCredentialsModal.jsx';
import { 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campus_auth_user') || localStorage.getItem('campus_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

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
  const [reportModalInitialData, setReportModalInitialData] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isChangeCredentialsOpen, setIsChangeCredentialsOpen] = useState(false);
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
    setAuthenticatedUser(user);
    setCurrentUser(user);
    setCurrentRole(user.role || 'student');
    localStorage.setItem('campus_auth_user', JSON.stringify(user));
    if (user.role === 'technician') setActiveTab('tech-assigned');
    else if (user.role === 'admin') setActiveTab('dashboard');
    else setActiveTab('my-requests');
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('campus_user');
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_auth_user');
    setAuthenticatedUser(null);
    setCurrentUser(null);
    showToast('Signed out successfully');
  };

  const handleRoleChange = (role) => {
    setCurrentRole(role);
    
    // Switch active identity so non-student modes do not display student credentials
    if (role === 'student') {
      if (authenticatedUser && authenticatedUser.role === 'student') {
        setCurrentUser(authenticatedUser);
      } else {
        setCurrentUser({
          _id: 'student_ops',
          name: 'Student Member',
          role: 'student',
          department: 'MCA Department',
          email: 'student@jims.edu'
        });
      }
    } else if (role === 'technician') {
      if (authenticatedUser && authenticatedUser.role === 'technician') {
        setCurrentUser(authenticatedUser);
      } else {
        setCurrentUser({
          _id: 'tech_active',
          name: 'Field Technician',
          role: 'technician',
          trade: 'Electrical & Facility Repairs',
          email: 'technician@jims.edu'
        });
      }
    } else if (role === 'admin') {
      if (authenticatedUser && authenticatedUser.role === 'admin') {
        setCurrentUser(authenticatedUser);
      } else {
        setCurrentUser({
          _id: 'admin_active',
          name: 'Campus Administrator',
          role: 'admin',
          department: 'Facility Operations Directorate',
          email: 'admin@jims.edu'
        });
      }
    } else if (role === 'staff') {
      if (authenticatedUser && authenticatedUser.role === 'staff') {
        setCurrentUser(authenticatedUser);
      } else {
        setCurrentUser({
          _id: 'staff_active',
          name: 'Faculty & Department Staff',
          role: 'staff',
          department: 'Academic Block B',
          email: 'faculty@jims.edu'
        });
      }
    }

    if (role === 'student' || role === 'staff') {
      setActiveTab('my-requests');
    } else if (role === 'technician') {
      setActiveTab('tech-assigned');
    } else {
      setActiveTab('dashboard');
    }
    showToast(`Switched active mode to ${role.toUpperCase()}`);
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

  const handleUserAdded = (newUser) => {
    showToast(`${newUser.role.toUpperCase()} "${newUser.name}" saved to Firebase!`);
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
    setReportModalInitialData({
      title: `[REPLACEMENT ORDER] Complete Replacement for ${cluster.room || 'Facility'} ${cluster.domain || ''}`,
      description: `Frequent breakdown alert (${cluster.occurrences || 3} failures recorded). Routine patch repairs are no longer cost-effective.\n\nRecommended Action: ${cluster.replacementAdvice?.suggestedSolution || 'Authorize complete replacement and new installation.'}\n\nCost-Benefit Justification: ${cluster.replacementAdvice?.whyReplace || 'Ongoing repairs exceed replacement lifecycle value.'}`,
      building: cluster.building || 'Building B',
      roomNumber: cluster.room || 'B202',
      category: cluster.domain?.includes('HVAC') ? 'HVAC & Climate Control' :
                cluster.domain?.includes('Electrical') ? 'Electrical & Power' :
                cluster.domain?.includes('Plumbing') ? 'Plumbing & Water Supply' :
                cluster.domain?.includes('IT') ? 'IT & Computer Labs' : 'Electrical & Power'
    });
    setIsReportModalOpen(true);
    showToast(`Replacement order form prepared for ${cluster.building} ${cluster.room}`);
  };

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative min-h-screen bg-[#07080B] text-slate-100 flex flex-col font-sans selection:bg-fuchsia-500 selection:text-white overflow-hidden">
      
      {/* 🌟 Radiant Soft Ambient Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Violet Orb */}
        <div 
          className="absolute -top-[10%] -right-[15%] w-[850px] h-[850px] rounded-full opacity-60 filter blur-[120px]"
          style={{
            background: 'radial-gradient(circle, rgba(244,114,182,0.85) 0%, rgba(192,132,252,0.8) 35%, rgba(99,102,241,0.6) 65%, transparent 85%)'
          }}
        />

        {/* Soft Peach Glow */}
        <div 
          className="absolute top-[25%] left-[20%] w-[650px] h-[650px] rounded-full opacity-40 filter blur-[130px]"
          style={{
            background: 'radial-gradient(circle, rgba(251,146,60,0.55) 0%, rgba(244,63,94,0.45) 45%, transparent 75%)'
          }}
        />

        {/* Deep Violet Base Glow */}
        <div 
          className="absolute -bottom-[20%] -left-[10%] w-[750px] h-[750px] rounded-full opacity-50 filter blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.65) 0%, rgba(139,92,246,0.55) 40%, transparent 80%)'
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-card border border-white/20 text-white text-xs font-semibold shadow-2xl animate-fade-in backdrop-blur-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAddUserModal={() => setIsAddUserModalOpen(true)}
        onOpenChangeCredentials={() => setIsChangeCredentialsOpen(true)}
      />

      {/* Main Content View Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {loading && complaints.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3 glass-card rounded-[32px] border border-white/10">
            <Loader2 className="w-8 h-8 animate-spin text-fuchsia-400" />
            <p className="text-xs text-slate-400 tracking-wide font-medium">
              Connecting to JIMS Campus Cloud...
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
                    currentUser={currentUser}
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
              </>
            )}

            {/* 2. TECHNICIAN SPECIFIC VIEWS */}
            {currentRole === 'technician' && (
              <TechnicianPortalView
                complaints={complaints}
                currentUser={currentUser}
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
                    recurringClusters={recurringClusters}
                    onSelectComplaint={(c) => setSelectedComplaint(c)}
                    onRefresh={fetchData}
                    onOpenReportModal={() => {
                      setReportModalInitialData(null);
                      setIsReportModalOpen(true);
                    }}
                    onOpenPredictive={() => setActiveTab('predictive')}
                    onGenerateWorkOrder={handleGenerateWorkOrder}
                  />
                )}

                {activeTab === 'complaints' && (
                  <ComplaintsListView
                    complaints={complaints}
                    onSelectComplaint={(c) => setSelectedComplaint(c)}
                    onOpenReportModal={() => {
                      setReportModalInitialData(null);
                      setIsReportModalOpen(true);
                    }}
                  />
                )}

                {activeTab === 'predictive' && (
                  <PredictiveMaintenanceHub
                    riskHeatmap={riskHeatmap}
                    recurringClusters={recurringClusters}
                    onGenerateWorkOrder={handleGenerateWorkOrder}
                  />
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
            Jagan Institute of Management Studies • Autonomous Facility Operations
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportModalInitialData(null);
        }}
        currentRole={currentRole}
        currentUser={currentUser}
        onComplaintCreated={handleComplaintCreated}
        onFacilityAdded={handleFacilityAdded}
        existingFacilities={facilities}
        initialData={reportModalInitialData}
      />

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        currentRole={currentRole}
        technicians={technicians}
        onStatusUpdated={handleStatusUpdated}
      />

      <AdminUserManagementModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      <ChangeCredentialsModal
        isOpen={isChangeCredentialsOpen}
        onClose={() => setIsChangeCredentialsOpen(false)}
        currentUser={currentUser}
        onCredentialsUpdated={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem('campus_user', JSON.stringify(updated));
          showToast('Credentials updated successfully!');
        }}
      />
    </div>
  );
}
