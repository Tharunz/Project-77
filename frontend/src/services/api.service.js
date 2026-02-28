// =============================================
// API SERVICE LAYER — Project-77
// All API calls go here. Replace mock data with real endpoints.
// =============================================

import {
    mockGrievances, mockSchemes, mockDashboardStats,
    mockActivityFeed, mockNotifications, mockFraudDuplicates,
    mockHeatmapData, mockCategoryBreakdown, mockMonthlyTrend,
    mockStateAnalytics, mockSentimentTrend,
    mockAdminUsers, mockCitizenUsers,
    mockPreSevaAlerts, mockPreSevaStats, mockDistressIndex,
    mockSLAData, mockOfficerSLA, mockCommunityPosts, mockSevaNews, mockBenefitRoadmap,
    mockEscrowProjects, mockGhostAuditAlerts
} from '../mock/mockData';

// Simulate async delay
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

// ==============================
//  AUTH
// ==============================
export const apiLogin = async (email, password) => {
    await delay(600);
    const admin = mockAdminUsers.find(u => u.email === email && u.password === password);
    if (admin) return { success: true, user: { ...admin, role: 'admin' }, token: 'mock-admin-token' };
    const citizen = mockCitizenUsers.find(u => u.email === email && u.password === password);
    if (citizen) return { success: true, user: { ...citizen, role: 'citizen' }, token: 'mock-citizen-token' };
    return { success: false, error: 'Invalid email or password' };
};

export const apiRegister = async (data) => {
    await delay(800);
    return {
        success: true,
        user: { id: `CIT${Date.now()}`, ...data, role: 'citizen' },
        token: 'mock-citizen-token'
    };
};

// ==============================
//  DASHBOARD
// ==============================
export const apiGetDashboardStats = async () => {
    await delay();
    return { success: true, data: mockDashboardStats };
};

export const apiGetActivityFeed = async () => {
    await delay(300);
    return { success: true, data: mockActivityFeed };
};

export const apiGetMonthlyTrend = async () => {
    await delay(300);
    return { success: true, data: mockMonthlyTrend };
};

export const apiGetCategoryBreakdown = async () => {
    await delay(300);
    return { success: true, data: mockCategoryBreakdown };
};

export const apiGetSentimentTrend = async () => {
    await delay(300);
    return { success: true, data: mockSentimentTrend };
};

// ==============================
//  GRIEVANCES
// ==============================
export const apiGetGrievances = async (filters = {}) => {
    await delay(500);
    let data = [...mockGrievances];
    if (filters.state) data = data.filter(g => g.state === filters.state);
    if (filters.category) data = data.filter(g => g.category === filters.category);
    if (filters.status) data = data.filter(g => g.status === filters.status);
    if (filters.priority) data = data.filter(g => g.priority === filters.priority);
    if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(g =>
            g.citizenName.toLowerCase().includes(q) ||
            g.id.toLowerCase().includes(q) ||
            g.description.toLowerCase().includes(q) ||
            g.title.toLowerCase().includes(q)
        );
    }
    return { success: true, data, total: data.length };
};

export const apiGetGrievanceById = async (id) => {
    await delay(300);
    const grievance = mockGrievances.find(g => g.id === id);
    return grievance
        ? { success: true, data: grievance }
        : { success: false, error: 'Grievance not found' };
};

export const apiUpdateGrievance = async (id, updates) => {
    await delay(400);
    return { success: true, data: { id, ...updates } };
};

export const apiFileGrievance = async (data) => {
    await delay(800);
    const id = `GRV-26${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    return {
        success: true,
        data: { ...data, id, status: 'Pending', createdAt: new Date().toISOString(), trackingId: id }
    };
};

// ==============================
//  SCHEMES
// ==============================
export const apiGetSchemes = async (filters = {}) => {
    await delay(400);
    let data = [...mockSchemes];
    if (filters.category) data = data.filter(s => s.category === filters.category);
    if (filters.state && filters.state !== 'All India') {
        data = data.filter(s => s.state === 'All India' || s.state === filters.state);
    }
    if (filters.search) {
        const q = filters.search.toLowerCase();
        data = data.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return { success: true, data, total: data.length };
};

export const apiGetSchemeById = async (id) => {
    await delay(300);
    const scheme = mockSchemes.find(s => s.id === id);
    return scheme ? { success: true, data: scheme } : { success: false, error: 'Scheme not found' };
};

export const apiAddScheme = async (data) => {
    await delay(600);
    return { success: true, data: { ...data, id: `SC${Date.now()}`, status: 'Active' } };
};

export const apiUpdateScheme = async (id, data) => {
    await delay(400);
    return { success: true, data: { id, ...data } };
};

// ==============================
//  NOTIFICATIONS
// ==============================
export const apiGetNotifications = async () => {
    await delay(300);
    return { success: true, data: mockNotifications };
};

export const apiMarkNotificationRead = async (id) => {
    await delay(200);
    return { success: true };
};

// ==============================
//  FRAUD & DUPLICATES
// ==============================
export const apiGetFraudDuplicates = async () => {
    await delay(400);
    return { success: true, data: mockFraudDuplicates };
};

export const apiReviewFraud = async (id, action) => {
    await delay(400);
    return { success: true, data: { id, action } };
};

// ==============================
//  HEATMAP
// ==============================
export const apiGetHeatmapData = async () => {
    await delay(400);
    return { success: true, data: mockHeatmapData };
};

// ==============================
//  ANALYTICS
// ==============================
export const apiGetStateAnalytics = async () => {
    await delay(400);
    return { success: true, data: mockStateAnalytics };
};

// ==============================
//  SENTIMENT
// ==============================
export const apiGetCriticalGrievances = async () => {
    await delay(400);
    const data = mockGrievances
        .filter(g => g.sentimentScore < 0.3 || g.status === 'Critical')
        .sort((a, b) => a.sentimentScore - b.sentimentScore);
    return { success: true, data };
};

// ==============================
//  CITIZEN SPECIFICS
// ==============================
export const apiGetMyGrievances = async (userId) => {
    await delay(400);
    // Return a few mock grievances as "my" grievances
    return { success: true, data: mockGrievances.slice(0, 5) };
};

export const apiGetMatchedSchemes = async (citizenProfile) => {
    await delay(500);
    const { age = 30, income = 200000, state } = citizenProfile || {};
    const matched = mockSchemes.filter(s =>
        age >= s.minAge && age <= s.maxAge &&
        (s.maxIncome === 0 || income <= s.maxIncome) &&
        (s.state === 'All India' || s.state === state)
    );
    return { success: true, data: matched };
};

export const apiTrackGrievance = async (trackingId) => {
    await delay(500);
    const grievance = mockGrievances.find(g => g.id === trackingId || g.trackingId === trackingId);
    if (!grievance) return { success: false, error: 'Grievance not found. Please check your tracking ID.' };
    return {
        success: true, data: {
            ...grievance,
            timeline: [
                { status: 'Filed', date: grievance.createdAt, note: 'Grievance received and assigned ID.' },
                { status: 'Under Review', date: grievance.updatedAt, note: 'Your grievance is being reviewed by the concerned officer.' },
                ...(grievance.status === 'Resolved' ? [{ status: 'Resolved', date: grievance.updatedAt, note: grievance.resolutionNote }] : []),
            ]
        }
    };
};

// ==============================
//  NEW FEATURE APIs
// ==============================

// Feature 21: PreSeva — AI Grievance Prevention
export const apiGetPreSevaAlerts = async () => { await delay(500); return { success: true, data: mockPreSevaAlerts }; };
export const apiGetPreSevaStats = async () => { await delay(300); return { success: true, data: mockPreSevaStats }; };
export const apiMarkPrevented = async (id) => { await delay(300); return { success: true }; };

// Feature 15: Bharat Distress Index
export const apiGetDistressIndex = async () => { await delay(400); return { success: true, data: mockDistressIndex }; };

// Feature 18: SLA Tracker
export const apiGetSLAData = async () => { await delay(400); return { success: true, data: mockSLAData }; };
export const apiGetOfficerSLA = async () => { await delay(300); return { success: true, data: mockOfficerSLA }; };

// Feature 17: SchemePath / Benefit Roadmap
export const apiGetBenefitRoadmap = async (userId) => { await delay(600); return { success: true, data: mockBenefitRoadmap }; };

// Feature 16: JanConnect Community
export const apiGetCommunityPosts = async () => { await delay(400); return { success: true, data: mockCommunityPosts }; };
export const apiUpvotePost = async (id) => { await delay(200); return { success: true }; };

// Feature 19: Seva News
export const apiGetSevaNews = async () => { await delay(400); return { success: true, data: mockSevaNews }; };

// Feature 27 & 20: Digital Budget Escrow
export const apiGetEscrowProjects = async () => { await delay(500); return { success: true, data: mockEscrowProjects }; };
export const apiVerifyEscrow = async (id, rating, photo) => { await delay(800); return { success: true }; };

// Feature 28: AI Ghost Audits
export const apiGetGhostAuditAlerts = async () => { await delay(400); return { success: true, data: mockGhostAuditAlerts }; };
