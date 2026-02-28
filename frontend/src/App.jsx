import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';
import './App.css';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import CitizenLayout from './layouts/CitizenLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import GrievanceManagement from './pages/admin/GrievanceManagement';
import SentimentPanel from './pages/admin/SentimentPanel';
import IndiaHeatmap from './pages/admin/IndiaHeatmap';
import SchemeManagement from './pages/admin/SchemeManagement';
import NotificationsPanel from './pages/admin/NotificationsPanel';
import FraudDetection from './pages/admin/FraudDetection';
import Analytics from './pages/admin/Analytics';
import DistressIndex from './pages/admin/DistressIndex';
import SLATracker from './pages/admin/SLATracker';
import PreSeva from './pages/admin/PreSeva';
import EscrowManagement from './pages/admin/EscrowManagement';
import GhostAudits from './pages/admin/GhostAudits';

// Citizen Pages
import HomePage from './pages/citizen/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import SchemeDiscovery from './pages/citizen/SchemeDiscovery';
import GrievanceFiling from './pages/citizen/GrievanceFiling';
import GrievanceTracking from './pages/citizen/GrievanceTracking';
import AIChatbot from './pages/citizen/AIChatbot';
import ProfilePage from './pages/citizen/ProfilePage';
import BenefitRoadmap from './pages/citizen/BenefitRoadmap';
import Community from './pages/citizen/Community';
import SevaNews from './pages/citizen/SevaNews';

// Loading Spinner
const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#050b1a' }}>
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: '3px solid rgba(255,107,44,0.2)',
      borderTopColor: '#FF6B2C',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

// Protected route
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const ProtectedCitizenRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user || user.role !== 'citizen') return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="grievances" element={<GrievanceManagement />} />
        <Route path="sentiment" element={<SentimentPanel />} />
        <Route path="heatmap" element={<IndiaHeatmap />} />
        <Route path="schemes" element={<SchemeManagement />} />
        <Route path="notifications" element={<NotificationsPanel />} />
        <Route path="fraud" element={<FraudDetection />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="distress" element={<DistressIndex />} />
        <Route path="sla" element={<SLATracker />} />
        <Route path="preseva" element={<PreSeva />} />
        <Route path="escrow" element={<EscrowManagement />} />
        <Route path="audits" element={<GhostAudits />} />
      </Route>

      {/* Citizen Routes */}
      <Route path="/citizen" element={<ProtectedCitizenRoute><CitizenLayout /></ProtectedCitizenRoute>}>
        <Route index element={<CitizenDashboard />} />
        <Route path="schemes" element={<SchemeDiscovery />} />
        <Route path="file-grievance" element={<GrievanceFiling />} />
        <Route path="track" element={<GrievanceTracking />} />
        <Route path="chatbot" element={<AIChatbot />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="roadmap" element={<BenefitRoadmap />} />
        <Route path="community" element={<Community />} />
        <Route path="news" element={<SevaNews />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
