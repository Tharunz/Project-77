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
import { apiVerifyResolution as apiVerifyResolutionImport } from './api.service'; // Self-import for name consistency if needed, but defining it is better.

// Simulate async delay (only used for pending mock features now)
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));

const API_BASE = 'http://localhost:5000/api';

// Helper: Setup auth headers using the user's localStorage JWT token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Helper: Generic Fetch Wrapper to process JSON and catch server errors
const apiFetch = async (endpoint, options = {}) => {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });
        const data = await res.json();
        // Even if status is 4xx or 5xx, the backend always responds with JSON `{ success: false, error: ... }`
        return data;
    } catch (err) {
        console.error(`API Error at ${endpoint}:`, err);
        return { success: false, error: err.message || 'Network request failed' };
    }
};

// ==============================
//  AUTH (Integrated)
// ==============================
export const apiLogin = async (email, password) => {
    const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        return { success: true, user: res.data.user, token: res.data.token };
    }
    return { success: false, error: res.message || res.error || 'Login failed' };
};

export const apiRegister = async (data) => {
    const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        return { success: true, user: res.data.user, token: res.data.token };
    }
    return { success: false, error: res.message || res.error || 'Registration failed' };
};

// ==============================
//  DASHBOARD (Integrated Core Admin)
// ==============================
export const apiGetDashboardStats = async () => {
    const res = await apiFetch('/admin/dashboard');
    if (res.success && res.data && res.data.stats) {
        const s = res.data.stats;
        return {
            success: true,
            data: {
                ...s,
                totalGrievances: s.totalGrievances || 0,
                resolved: s.resolvedGrievances || 0,
                pending: s.pendingGrievances || 0,
                critical: s.criticalGrievances || 0,
                inProgress: s.inProgressGrievances || 0,
                todayFiled: s.todayFiled || 0,
                todayResolved: s.todayResolved || 0,
                activeCitizens: s.totalCitizens || 0,
                schemesAvailable: s.activeSchemes || 0,
                statesCovered: 28,
                languagesSupported: 22,
                avgResponseTime: s.avgResolutionDays ? `${s.avgResolutionDays}d` : '4.2d'
            }
        };
    }
    return res;
};

export const apiGetOfficers = async () => {
    return await apiFetch('/admin/officers');
};

export const apiGetActivityFeed = async () => {
    const res = await apiFetch('/admin/dashboard');
    if (res.success && res.data && res.data.recentActivity) {
        // Map backend grievances to activity feed format
        const activity = res.data.recentActivity.map(g => ({
            id: g.id,
            type: g.status.toLowerCase() === 'pending' ? 'new' : g.status.toLowerCase(),
            message: `${g.citizenName} filed a new grievance: ${g.title}`,
            time: new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            state: g.state
        }));
        return { success: true, data: activity };
    }
    // Fallback to mock if backend empty
    await delay(300);
    return { success: true, data: mockActivityFeed };
};

export const apiGetMonthlyTrend = async () => {
    const res = await apiFetch('/admin/dashboard');
    if (res.success && res.data && res.data.monthlyTrend) {
        return { success: true, data: res.data.monthlyTrend };
    }
    await delay(300);
    return { success: true, data: mockMonthlyTrend };
};

export const apiGetCategoryBreakdown = async () => {
    const res = await apiFetch('/admin/dashboard');
    if (res.success && res.data && res.data.categoryBreakdown) {
        return { success: true, data: res.data.categoryBreakdown };
    }
    await delay(300);
    return { success: true, data: mockCategoryBreakdown };
};

export const apiGetSentimentTrend = async () => {
    await delay(300);
    return { success: true, data: mockSentimentTrend };
};

// ==============================
//  GRIEVANCES (Integrated)
// ==============================
export const apiGetGrievances = async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.state) queryParams.append('state', filters.state);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.search) queryParams.append('search', filters.search);

    const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiFetch(`/grievance/all${qs}`);
    if (res.success && res.data && Array.isArray(res.data)) {
        return { success: true, data: res.data, total: res.meta?.total || res.data.length };
    }
    return { success: false, data: [], total: 0, error: res.message || 'Failed to fetch grievances' };
};

export const apiGetGrievanceById = async (id) => {
    return await apiFetch(`/grievance/track/${id}`);
};

export const apiUpdateGrievance = async (id, updates) => {
    return await apiFetch(`/grievance/update/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
    });
};

export const apiVerifyResolution = async (id, action, citizenNote) => {
    return await apiFetch(`/grievance/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ action, citizenNote })
    });
};

export const apiFileGrievance = async (data) => {
    return await apiFetch('/grievance/file', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

// ==============================
//  SCHEMES (Integrated View)
// ==============================
export const apiGetSchemes = async (filters = {}) => {
    // Try fetching from backend first
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.state) queryParams.append('state', filters.state);
    if (filters.search) queryParams.append('search', filters.search);

    const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const res = await apiFetch(`/schemes${qs}`);

    if (res.success && Array.isArray(res.data)) {
        return { success: true, data: res.data, total: res.data.length };
    }

    // Fallback to mock data if API fails or backend is down
    await delay(300);
    let data = mockSchemes;

    if (filters.category) data = data.filter(s => s.category === filters.category);
    if (filters.state && filters.state !== 'All India') {
        data = data.filter(s => s.state === filters.state || s.state === 'All India');
    }
    if (filters.search) {
        const lowerSearch = filters.search.toLowerCase();
        data = data.filter(s => s.name.toLowerCase().includes(lowerSearch));
    }

    return { success: true, data, total: data.length };
};

export const apiGetSchemeById = async (id) => {
    return await apiFetch(`/schemes/${id}`);
};

export const apiAddScheme = async (data) => {
    return await apiFetch('/schemes', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const apiUpdateScheme = async (id, data) => {
    return await apiFetch(`/schemes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
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
export const apiGetMyGrievances = async () => {
    const res = await apiFetch('/grievance/my-grievances');
    if (res.success && res.data) return res;
    return { success: false, data: [] };
};

export const apiGetMatchedSchemes = async () => {
    // Fallback to mock data if API fails
    const res = await apiFetch('/schemes/recommend');
    if (res.success && res.data) return res;
    
    // Mock fallback
    await delay(400);
    return { success: true, data: mockSchemes.slice(0, 5) };
};

export const apiTrackGrievance = async (trackingId) => {
    return await apiFetch(`/grievance/track/${trackingId}`);
};

// ==============================
//  NEW FEATURE APIs
// ==============================

// Feature 21: PreSeva — AI Grievance Prevention
export const apiGetPreSevaAlerts = async () => {
    return await apiFetch('/preseva/alerts');
};
export const apiGetPreSevaStats = async () => {
    return await apiFetch('/preseva/stats');
};
export const apiMarkPrevented = async (id) => {
    return await apiFetch(`/preseva/alerts/${id}/resolve`, { method: 'PUT' });
};

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
