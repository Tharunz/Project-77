import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';
import './App.css';

// Layouts — lazy loaded so they don't block the homepage
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const CitizenLayout = lazy(() => import('./layouts/CitizenLayout'));

// Emergency reset on any navigation (failsafe for stuck loading states)
window.addEventListener('popstate', () => {
  // Clear any stuck loading states from the DOM
  document.querySelectorAll('[data-loading]').forEach(el => el.removeAttribute('data-loading'));
  document.querySelectorAll('button:disabled').forEach(el => el.disabled = false);
});

// Admin Pages — all lazy
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const GrievanceManagement = lazy(() => import('./pages/admin/GrievanceManagement'));
const SentimentPanel = lazy(() => import('./pages/admin/SentimentPanel'));
const IndiaHeatmap = lazy(() => import('./pages/admin/IndiaHeatmap'));
const SchemeManagement = lazy(() => import('./pages/admin/SchemeManagement'));
const NotificationsPanel = lazy(() => import('./pages/admin/NotificationsPanel'));
const FraudDetection = lazy(() => import('./pages/admin/FraudDetection'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const DistressIndex = lazy(() => import('./pages/admin/DistressIndex'));
const SLATracker = lazy(() => import('./pages/admin/SLATracker'));
const PreSeva = lazy(() => import('./pages/admin/PreSeva'));
const EscrowManagement = lazy(() => import('./pages/admin/EscrowManagement'));
const GhostAudits = lazy(() => import('./pages/admin/GhostAudits'));
const ConfigPanel = lazy(() => import('./pages/admin/ConfigPanel'));

// Citizen Pages — all lazy
const HomePage = lazy(() => import('./pages/citizen/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const SchemeDiscovery = lazy(() => import('./pages/citizen/SchemeDiscovery'));
const GrievanceFiling = lazy(() => import('./pages/citizen/GrievanceFiling'));
const GrievanceTracking = lazy(() => import('./pages/citizen/GrievanceTracking'));
const AIChatbot = lazy(() => import('./pages/citizen/AIChatbot'));
const ProfilePage = lazy(() => import('./pages/citizen/ProfilePage'));
const BenefitRoadmap = lazy(() => import('./pages/citizen/BenefitRoadmap'));
const Community = lazy(() => import('./pages/citizen/Community'));
const SevaNews = lazy(() => import('./pages/citizen/SevaNews'));
const EngagementDashboard = lazy(() => import('./pages/citizen/EngagementDashboard'));
const MySchemeApplications = lazy(() => import('./pages/citizen/MySchemeApplications'));
const OnboardingPage = lazy(() => import('./pages/auth/OnboardingPage'));

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
    <Suspense fallback={<Loader />}>
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
          <Route path="config" element={<ConfigPanel />} />
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
          <Route path="engagement" element={<EngagementDashboard />} />
          <Route path="schemes/applications" element={<MySchemeApplications />} />
        </Route>

        {/* Onboarding — after registration */}
        <Route path="/onboarding" element={<ProtectedCitizenRoute><OnboardingPage /></ProtectedCitizenRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
