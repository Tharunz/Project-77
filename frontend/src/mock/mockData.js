// =============================================
// PROJECT-77 MOCK DATA
// All mock data lives here for easy API swap
// =============================================

// --- Indian States ---
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry'
];

// --- Grievance Categories ---
export const GRIEVANCE_CATEGORIES = [
  'Roads & Infrastructure', 'Water Supply', 'Electricity',
  'Healthcare', 'Education', 'Pension & Social Security',
  'Land & Property', 'Ration & Food Security', 'Agriculture',
  'Police & Law', 'Sanitation & Waste', 'Housing',
  'Labour & Employment', 'Transport', 'Environment'
];

// --- Government Schemes ---
export const mockSchemes = [
  {
    id: 'SC001', name: 'PM Kisan Samman Nidhi', category: 'Agriculture',
    state: 'All India', beneficiaries: '12 Crore Farmers',
    benefit: '₹6,000/year direct transfer', eligibility: 'Small & marginal farmers with <2 hectare land',
    minAge: 18, maxAge: 65, maxIncome: 200000,
    description: 'Financial support to farmer families with income up to ₹2 lakh per annum.',
    status: 'Active', applicants: 12400000, resolved: 11800000
  },
  {
    id: 'SC002', name: 'Ayushman Bharat PM-JAY', category: 'Healthcare',
    state: 'All India', beneficiaries: '50 Crore Citizens',
    benefit: '₹5 lakh health cover/family/year', eligibility: 'BPL families as per SECC 2011',
    minAge: 0, maxAge: 100, maxIncome: 100000,
    description: 'World\'s largest health assurance scheme providing cashless healthcare.',
    status: 'Active', applicants: 27000000, resolved: 20000000
  },
  {
    id: 'SC003', name: 'PM Ujjwala Yojana', category: 'Housing',
    state: 'All India', beneficiaries: '9.6 Crore Women',
    benefit: 'Free LPG connection + cylinder', eligibility: 'Women from BPL household',
    minAge: 18, maxAge: 60, maxIncome: 120000,
    description: 'Provides clean cooking fuel to women from below poverty line households.',
    status: 'Active', applicants: 9200000, resolved: 8900000
  },
  {
    id: 'SC004', name: 'Pradhan Mantri Awas Yojana', category: 'Housing',
    state: 'All India', beneficiaries: '2.95 Crore Families',
    benefit: '₹1.2 lakh - ₹2.5 lakh subsidy', eligibility: 'Families without pucca house',
    minAge: 18, maxAge: 70, maxIncome: 300000,
    description: 'Housing for all — affordable pucca houses for EWS/LIG/MIG categories.',
    status: 'Active', applicants: 18000000, resolved: 12000000
  },
  {
    id: 'SC005', name: 'National Scholarship Portal', category: 'Education',
    state: 'All India', beneficiaries: '40 Lakh Students',
    benefit: '₹5,000 - ₹50,000/year', eligibility: 'SC/ST/OBC/Minority students with >50% marks',
    minAge: 14, maxAge: 30, maxIncome: 250000,
    description: 'One-stop platform for all central government scholarships.',
    status: 'Active', applicants: 3200000, resolved: 2800000
  },
  {
    id: 'SC006', name: 'MGNREGS', category: 'Labour & Employment',
    state: 'All India', beneficiaries: '15 Crore Rural Households',
    benefit: '100 days guaranteed employment at ₹220/day', eligibility: 'Rural households willing to do unskilled manual work',
    minAge: 18, maxAge: 60, maxIncome: 0,
    description: 'Guarantees 100 days of wage employment per year to rural households.',
    status: 'Active', applicants: 78000000, resolved: 71000000
  },
  {
    id: 'SC007', name: 'Sukanya Samriddhi Yojana', category: 'Pension & Social Security',
    state: 'All India', beneficiaries: 'Girls under 10',
    benefit: '8.2% interest rate on deposits', eligibility: 'Girl child below 10 years, resident Indian',
    minAge: 0, maxAge: 10, maxIncome: 0,
    description: 'Savings scheme for girl child education and marriage expenses.',
    status: 'Active', applicants: 28000000, resolved: 28000000
  },
  {
    id: 'SC008', name: 'Kisan Credit Card', category: 'Agriculture',
    state: 'All India', beneficiaries: '7 Crore Farmers',
    benefit: 'Credit up to ₹3 lakh at 4% interest', eligibility: 'Landholding farmers, share croppers, oral lessees',
    minAge: 18, maxAge: 75, maxIncome: 0,
    description: 'Short-term credit requirements for cultivation, post-harvest expenses, maintenance of farm assets.',
    status: 'Active', applicants: 42000000, resolved: 38000000
  },
  {
    id: 'SC009', name: 'Janani Suraksha Yojana', category: 'Healthcare',
    state: 'All India', beneficiaries: 'Pregnant Women',
    benefit: '₹1,400 rural / ₹1,000 urban cash assistance', eligibility: 'BPL pregnant women aged 19+, up to 2 live births',
    minAge: 19, maxAge: 45, maxIncome: 100000,
    description: 'Safe motherhood intervention — cash incentive for institutional delivery.',
    status: 'Active', applicants: 11000000, resolved: 10800000
  },
  {
    id: 'SC010', name: 'PM SVANidhi - Street Vendor', category: 'Labour & Employment',
    state: 'All India', beneficiaries: '50 Lakh Vendors',
    benefit: '₹10,000 collateral free loan', eligibility: 'Street vendors vending before Mar 24, 2020',
    minAge: 18, maxAge: 65, maxIncome: 150000,
    description: 'Micro-credit for street vendors to resume livelihoods after COVID-19.',
    status: 'Active', applicants: 3100000, resolved: 2800000
  },
  {
    id: 'SC011', name: 'Beti Bachao Beti Padhao', category: 'Education',
    state: 'All India', beneficiaries: 'Girl Children',
    benefit: 'Awareness + education support', eligibility: 'Girl children in select districts',
    minAge: 0, maxAge: 18, maxIncome: 0,
    description: 'Campaign to generate awareness and improve welfare of girl children.',
    status: 'Active', applicants: 0, resolved: 0
  },
  {
    id: 'SC012', name: 'Atal Pension Yojana', category: 'Pension & Social Security',
    state: 'All India', beneficiaries: 'Unorganised Sector Workers',
    benefit: 'Guaranteed pension ₹1,000 to ₹5,000/month at 60', eligibility: 'Unorganised sector workers aged 18-40',
    minAge: 18, maxAge: 40, maxIncome: 0,
    description: 'Retirement income security for workers in the unorganised sector.',
    status: 'Active', applicants: 52000000, resolved: 52000000
  },
];

// --- Grievances (500+, simplified as array) ---
const grievanceNames = [
  'Ramesh Kumar', 'Priya Sharma', 'Mohammed Aslam', 'Lakshmi Devi', 'Suresh Patel',
  'Anita Singh', 'Rajesh Yadav', 'Kavitha Nair', 'Arvind Mishra', 'Deepa Reddy',
  'Santosh Gupta', 'Meena Joshi', 'Vikram Singh', 'Usha Rani', 'Mohan Das',
  'Rekha Pillai', 'Arun Kumar', 'Savita Devi', 'Harish Choudhary', 'Geeta Bai',
  'Prakash Tiwari', 'Nirmala Devi', 'Sunil Varma', 'Radha Krishna', 'Amitesh Roy'
];

const descriptions = [
  'Road in our village has been broken for 3 months causing accidents and flooding during rains.',
  'Water supply has been cut for 2 weeks. We are dependent on contaminated river water.',
  'Electricity outage lasting 12-18 hours daily for the past month. No response from department.',
  'Primary health centre has no doctor for 6 months. Children and elderly have no access to care.',
  'Ration shop distributing inferior quality rice and pulses. Beneficiaries receiving less than quota.',
  'My pension was stopped without any reason 3 months ago. I have no income source.',
  'Land records show wrong ownership after mutation. I have been illegally dispossessed.',
  'School building is crumbling and dangerous. Windows broken, no toilets, leaking roof.',
  'Borewell installed under scheme is not working since day one. No one has come to fix it.',
  'Crop insurance claim pending for 8 months after flood damage. No compensation received.',
  'Sewage overflows daily on our street. Municipal corporation has not responded to 5 complaints.',
  'Employer not paying wages for 4 months. Labour department has not intervened.',
  'PM Awas application approved 2 years ago but construction not started. Money not released.',
  'Hospital denied treatment saying Ayushman card is invalid even though I am eligible.',
  'Scholarship money not credited for 2 semesters despite all documents submitted.',
];

const statuses = ['Pending', 'In Progress', 'Resolved', 'Critical', 'Escalated'];
const priorities = ['High', 'Medium', 'Low'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomSentiment() { return Math.round((Math.random() * 0.85 + 0.1) * 100) / 100; }

function generateGrievanceId(index) {
  return `GRV-${String(2026).slice(-2)}${String(index + 1001).padStart(5, '0')}`;
}

function generateDate(daysAgo) {
  const d = new Date('2026-02-27');
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export const mockGrievances = Array.from({ length: 120 }, (_, i) => {
  const sentiment = randomSentiment();
  const statusesWithEscrow = [...statuses, 'Resolved (Pending Verification)'];
  const status = sentiment < 0.25 ? 'Critical' : (i % 8 === 0 ? 'Resolved (Pending Verification)' : randomItem(statuses.filter(s => s !== 'Critical')));
  const priority = sentiment < 0.3 ? 'High' : sentiment < 0.65 ? 'Medium' : 'Low';
  return {
    id: generateGrievanceId(i),
    citizenName: randomItem(grievanceNames),
    state: randomItem(INDIAN_STATES),
    category: randomItem(GRIEVANCE_CATEGORIES),
    title: randomItem([
      'Road repair urgent', 'No water supply', 'Power outage', 'Medical facility closed',
      'Ration shop issue', 'Pension stopped', 'Land dispute', 'School no teacher',
      'Borewell not working', 'Crop insurance pending', 'Sewage overflow', 'Wage theft',
      'Housing scheme delayed', 'Ayushman card rejected', 'Scholarship pending'
    ]),
    description: randomItem(descriptions),
    sentimentScore: sentiment,
    priority,
    status,
    assignedTo: randomItem(['Officer Mehta', 'Officer Rao', 'Officer Sharma', 'Officer Bose', null, null]),
    createdAt: generateDate(randomInt(0, 90)),
    updatedAt: generateDate(randomInt(0, 30)),
    trackingId: generateGrievanceId(i),
    attachments: Math.random() > 0.7 ? ['document.pdf'] : [],
    isDuplicate: Math.random() > 0.85,
    isFraud: Math.random() > 0.9,
    duplicateOf: null,
    resolutionNote: status === 'Resolved' ? 'Issue has been addressed by the concerned department.' : null,
  };
});

// --- Heatmap Data (State-wise grievance count) ---
export const mockHeatmapData = {
  'Uttar Pradesh': { count: 2847, resolved: 1203, pending: 1644 },
  'Maharashtra': { count: 2134, resolved: 1456, pending: 678 },
  'Bihar': { count: 1923, resolved: 678, pending: 1245 },
  'West Bengal': { count: 1654, resolved: 890, pending: 764 },
  'Madhya Pradesh': { count: 1543, resolved: 879, pending: 664 },
  'Rajasthan': { count: 1432, resolved: 756, pending: 676 },
  'Tamil Nadu': { count: 1287, resolved: 987, pending: 300 },
  'Karnataka': { count: 1187, resolved: 876, pending: 311 },
  'Gujarat': { count: 1054, resolved: 789, pending: 265 },
  'Andhra Pradesh': { count: 987, resolved: 654, pending: 333 },
  'Odisha': { count: 876, resolved: 456, pending: 420 },
  'Telangana': { count: 765, resolved: 543, pending: 222 },
  'Jharkhand': { count: 743, resolved: 312, pending: 431 },
  'Assam': { count: 654, resolved: 321, pending: 333 },
  'Punjab': { count: 543, resolved: 423, pending: 120 },
  'Chhattisgarh': { count: 521, resolved: 256, pending: 265 },
  'Haryana': { count: 487, resolved: 345, pending: 142 },
  'Kerala': { count: 432, resolved: 398, pending: 34 },
  'Uttarakhand': { count: 312, resolved: 198, pending: 114 },
  'Himachal Pradesh': { count: 234, resolved: 189, pending: 45 },
  'Delhi': { count: 876, resolved: 654, pending: 222 },
  'Jammu & Kashmir': { count: 456, resolved: 234, pending: 222 },
};

// --- Dashboard KPIs ---
export const mockDashboardStats = {
  totalGrievances: 18742,
  resolved: 11234,
  pending: 5219,
  critical: 2289,
  inProgress: 4108,
  escalated: 891,
  avgResponseTime: '3.2 days',
  resolutionRate: 59.9,
  citizensServed: 142000000,
  schemesAvailable: 500,
  statesCovered: 28,
  languagesSupported: 22,
  todayFiled: 347,
  todayResolved: 289,
  highSentiment: 2289,
};

// --- Live Activity Feed ---
export const mockActivityFeed = [
  { id: 1, type: 'new', message: 'New critical grievance filed in Uttar Pradesh — Road collapse', time: '2 min ago', icon: '🚨', state: 'UP' },
  { id: 2, type: 'resolved', message: 'Grievance GRV-2600089 resolved by Officer Mehta', time: '5 min ago', icon: '✅', state: 'MH' },
  { id: 3, type: 'escalated', message: 'Water supply in Bihar escalated to District Collector', time: '8 min ago', icon: '⬆️', state: 'BR' },
  { id: 4, type: 'new', message: 'New grievance filed in Tamil Nadu — Pension delay', time: '12 min ago', icon: '📋', state: 'TN' },
  { id: 5, type: 'assigned', message: 'GRV-2600156 assigned to Officer Rao', time: '15 min ago', icon: '👤', state: 'KA' },
  { id: 6, type: 'resolved', message: 'Electricity grievance resolved in Gujarat', time: '18 min ago', icon: '✅', state: 'GJ' },
  { id: 7, type: 'new', message: 'Duplicate grievance detected — Sewage overflow, West Bengal', time: '21 min ago', icon: '🔁', state: 'WB' },
  { id: 8, type: 'new', message: 'High distress grievance filed in Rajasthan — No doctor at PHC', time: '24 min ago', icon: '🚨', state: 'RJ' },
  { id: 9, type: 'resolved', message: 'Scholarship disbursement confirmed — Karnataka', time: '28 min ago', icon: '✅', state: 'KA' },
  { id: 10, type: 'escalated', message: 'Land dispute case in MP escalated to High Court', time: '32 min ago', icon: '⬆️', state: 'MP' },
];

// --- Monthly Trend Data ---
export const mockMonthlyTrend = [
  { month: 'Aug', filed: 1240, resolved: 780 },
  { month: 'Sep', filed: 1480, resolved: 980 },
  { month: 'Oct', filed: 1320, resolved: 1100 },
  { month: 'Nov', filed: 1650, resolved: 1240 },
  { month: 'Dec', filed: 1890, resolved: 1450 },
  { month: 'Jan', filed: 2100, resolved: 1680 },
  { month: 'Feb', filed: 1847, resolved: 1423 },
];

// --- Category Breakdown ---
export const mockCategoryBreakdown = [
  { category: 'Infrastructure', count: 3240, color: '#FF6B2C' },
  { category: 'Water & Sanitation', count: 2870, color: '#3B82F6' },
  { category: 'Healthcare', count: 2340, color: '#EF4444' },
  { category: 'Agriculture', count: 1980, color: '#10B981' },
  { category: 'Education', count: 1650, color: '#8B5CF6' },
  { category: 'Pension', count: 1420, color: '#F59E0B' },
  { category: 'Land & Property', count: 1230, color: '#EC4899' },
  { category: 'Others', count: 2012, color: '#6B7280' },
];

// --- Notifications ---
export const mockNotifications = [
  { id: 1, type: 'resolution', title: 'Grievance Resolved', message: 'GRV-2600089 — Road repair in Uttar Pradesh has been resolved.', citizen: 'Ramesh Kumar', time: '2026-02-27 09:14', read: false, priority: 'normal' },
  { id: 2, type: 'critical', title: 'Critical Alert', message: 'High distress grievance filed — No water supply, Bihar for 2 weeks.', citizen: 'Priya Sharma', time: '2026-02-27 08:52', read: false, priority: 'critical' },
  { id: 3, type: 'escalation', title: 'Escalation Notice', message: 'GRV-2600078 has been escalated to District Collector, Madhya Pradesh.', citizen: 'Arvind Mishra', time: '2026-02-27 08:30', read: true, priority: 'high' },
  { id: 4, type: 'duplicate', title: 'Duplicate Detected', message: 'GRV-2600112 flagged as potential duplicate of GRV-2600098.', citizen: 'Meena Joshi', time: '2026-02-27 07:45', read: true, priority: 'medium' },
  { id: 5, type: 'resolution', title: 'Grievance Resolved', message: 'GRV-2600067 — Electricity outage in Karnataka resolved.', citizen: 'Kavitha Nair', time: '2026-02-26 18:30', read: true, priority: 'normal' },
  { id: 6, type: 'new_scheme', title: 'New Scheme Added', message: 'PM Garib Kalyan Ann Yojana updated with new eligibility for FY2026.', citizen: null, time: '2026-02-26 16:00', read: true, priority: 'normal' },
  { id: 7, type: 'critical', title: 'Critical Alert', message: 'Cluster of grievances from Rajasthan about PHC closures — possible systemic issue.', citizen: null, time: '2026-02-26 14:20', read: true, priority: 'critical' },
  { id: 8, type: 'resolution', title: 'Batch Resolution', message: '47 irrigation-related grievances in Gujarat resolved via collective order.', citizen: null, time: '2026-02-26 11:00', read: true, priority: 'normal' },
  { id: 9, type: 'fraud', title: 'Fraud Alert', message: 'GRV-2600134 flagged by AI as potentially fraudulent — same phone, different names.', citizen: 'Multiple', time: '2026-02-25 22:10', read: true, priority: 'high' },
  { id: 10, type: 'escalation', title: 'Escaled to State Level', message: 'GRV-2600045 — Land dispute TB case escalated to State Revenue Board.', citizen: 'Vikram Singh', time: '2026-02-25 15:30', read: true, priority: 'high' },
];

// --- Duplicate/Fraud Grievances ---
export const mockFraudDuplicates = [
  {
    id: 'FRD-001', type: 'duplicate',
    primary: { id: 'GRV-2600089', citizen: 'Ramesh Kumar', description: 'Road broken in village for 3 months', state: 'Uttar Pradesh', date: '2026-02-15' },
    secondary: { id: 'GRV-2600112', citizen: 'Suresh Kumar', description: 'Village road damaged since December, no repairs', state: 'Uttar Pradesh', date: '2026-02-20' },
    similarity: 94, status: 'Pending Review', aiReason: 'Same location, same issue, 6-day gap. Likely duplicate filing.'
  },
  {
    id: 'FRD-002', type: 'fraud',
    primary: { id: 'GRV-2600134', citizen: 'Priya M', description: 'No ration supply for 2 months, family starving', state: 'Bihar', date: '2026-02-10' },
    secondary: { id: 'GRV-2600135', citizen: 'Priya Mali', description: 'Ration shop closed, not distributing grain', state: 'Bihar', date: '2026-02-10' },
    similarity: 87, status: 'Pending Review', aiReason: 'Same phone number, same district, filed within minutes. Possible coordinated fraud.'
  },
  {
    id: 'FRD-003', type: 'duplicate',
    primary: { id: 'GRV-2600098', citizen: 'Lakshmi Devi', description: 'Electricity outage for 12 hours daily', state: 'Maharashtra', date: '2026-02-18' },
    secondary: { id: 'GRV-2600103', citizen: 'Lakshmi D', description: 'No power supply whole day in our area', state: 'Maharashtra', date: '2026-02-19' },
    similarity: 91, status: 'Confirmed Duplicate', aiReason: 'Same person, slight name variation. Confirmed duplicate after manual review.'
  },
  {
    id: 'FRD-004', type: 'fraud',
    primary: { id: 'GRV-2600145', citizen: 'Officer A', description: 'Claiming pension under 3 different names and addresses', state: 'Rajasthan', date: '2026-02-22' },
    secondary: null,
    similarity: null, status: 'Under Investigation', aiReason: 'AI detected same beneficiary claiming identical pension from 3 state offices using different Aadhaar numbers.'
  },
];

// --- Admin Users ---
export const mockAdminUsers = [
  { id: 'ADM001', name: 'Admin Mehta', email: 'admin@gov.in', role: 'Super Admin', state: 'All India', password: 'admin123' },
  { id: 'ADM002', name: 'Officer Rao', email: 'rao@gov.in', role: 'State Admin', state: 'Karnataka', password: 'rao123' },
];

// --- Citizen Users ---
export const mockCitizenUsers = [
  { id: 'CIT001', name: 'Ramesh Kumar', email: 'ramesh@gmail.com', state: 'Uttar Pradesh', age: 45, income: 80000, password: 'ramesh123' },
  { id: 'CIT002', name: 'Priya Sharma', email: 'priya@gmail.com', state: 'Maharashtra', age: 32, income: 150000, password: 'priya123' },
];

// State-wise resolution analytics
export const mockStateAnalytics = [
  { state: 'Kerala', resolutionRate: 92, filed: 432, resolved: 398 },
  { state: 'Tamil Nadu', resolutionRate: 77, filed: 1287, resolved: 987 },
  { state: 'Gujarat', resolutionRate: 75, filed: 1054, resolved: 789 },
  { state: 'Karnataka', resolutionRate: 74, filed: 1187, resolved: 876 },
  { state: 'Punjab', resolutionRate: 78, filed: 543, resolved: 423 },
  { state: 'Maharashtra', resolutionRate: 68, filed: 2134, resolved: 1456 },
  { state: 'Andhra Pradesh', resolutionRate: 66, filed: 987, resolved: 654 },
  { state: 'Rajasthan', resolutionRate: 53, filed: 1432, resolved: 756 },
  { state: 'Madhya Pradesh', resolutionRate: 57, filed: 1543, resolved: 879 },
  { state: 'Uttar Pradesh', resolutionRate: 42, filed: 2847, resolved: 1203 },
  { state: 'Bihar', resolutionRate: 35, filed: 1923, resolved: 678 },
  { state: 'Jharkhand', resolutionRate: 42, filed: 743, resolved: 312 },
];

// Sentiment trend
export const mockSentimentTrend = [
  { month: 'Aug', high: 340, medium: 560, low: 340 },
  { month: 'Sep', high: 410, medium: 620, low: 450 },
  { month: 'Oct', high: 380, medium: 590, low: 350 },
  { month: 'Nov', high: 450, medium: 680, low: 520 },
  { month: 'Dec', high: 520, medium: 780, low: 590 },
  { month: 'Jan', high: 610, medium: 820, low: 670 },
  { month: 'Feb', high: 540, medium: 750, low: 557 },
];

// ==============================================================
// NEW FEATURE MOCK DATA
// ==============================================================

// --- Feature 15: Bharat AI Distress Index ---
export const mockDistressIndex = [
  { state: 'Bihar', score: 91, rank: 1, trend: 'up', previous: 88, criticalGrievances: 312, topCategory: 'Water Supply', delta: '+3.2' },
  { state: 'Jharkhand', score: 87, rank: 2, trend: 'up', previous: 81, criticalGrievances: 198, topCategory: 'Healthcare', delta: '+6.1' },
  { state: 'Uttar Pradesh', score: 84, rank: 3, trend: 'down', previous: 87, criticalGrievances: 543, topCategory: 'Infrastructure', delta: '-3.0' },
  { state: 'Rajasthan', score: 78, rank: 4, trend: 'stable', previous: 77, criticalGrievances: 214, topCategory: 'Agriculture', delta: '+1.1' },
  { state: 'Madhya Pradesh', score: 72, rank: 5, trend: 'down', previous: 76, criticalGrievances: 187, topCategory: 'Education', delta: '-4.2' },
  { state: 'Odisha', score: 68, rank: 6, trend: 'up', previous: 62, criticalGrievances: 143, topCategory: 'Sanitation', delta: '+6.0' },
  { state: 'Assam', score: 65, rank: 7, trend: 'up', previous: 58, criticalGrievances: 121, topCategory: 'Healthcare', delta: '+7.0' },
  { state: 'Chhattisgarh', score: 61, rank: 8, trend: 'stable', previous: 60, criticalGrievances: 98, topCategory: 'Agriculture', delta: '+1.0' },
  { state: 'West Bengal', score: 55, rank: 9, trend: 'down', previous: 59, criticalGrievances: 89, topCategory: 'Infrastructure', delta: '-4.0' },
  { state: 'Maharashtra', score: 48, rank: 10, trend: 'down', previous: 52, criticalGrievances: 76, topCategory: 'Housing', delta: '-4.2' },
  { state: 'Gujarat', score: 31, rank: 11, trend: 'down', previous: 36, criticalGrievances: 42, topCategory: 'Labour', delta: '-5.1' },
  { state: 'Tamil Nadu', score: 27, rank: 12, trend: 'down', previous: 31, criticalGrievances: 34, topCategory: 'Education', delta: '-4.0' },
  { state: 'Karnataka', score: 24, rank: 13, trend: 'stable', previous: 24, criticalGrievances: 28, topCategory: 'Transport', delta: '0.0' },
  { state: 'Kerala', score: 12, rank: 14, trend: 'down', previous: 15, criticalGrievances: 11, topCategory: 'Healthcare', delta: '-3.0' },
];

// --- Feature 21: PreSeva — AI Grievance Prevention ---
export const mockPreSevaAlerts = [
  {
    id: 'PSV-001', title: 'Water Supply Failure Predicted',
    state: 'Bihar', district: 'Muzaffarpur', category: 'Water Supply',
    probability: 91, predictedDate: '2026-03-01', basisGrievances: 847,
    historicalPattern: '73% of similar seasonal patterns in this district across Feb-Mar 2022, 2023, 2024 led to 2-week supply failures.',
    urgency: 'critical', departmentAlerted: 'Bihar Jal Jeevan Mission',
    alertSentAt: '2026-02-27 06:14', status: 'Department Notified', daysUntil: 2,
    suggestedAction: 'Preemptive pipeline inspection and reserve tank filling before March 1.',
    prevented: false,
  },
  {
    id: 'PSV-002', title: 'Road Section Collapse Risk — NH-27',
    state: 'Uttar Pradesh', district: 'Varanasi', category: 'Roads & Infrastructure',
    probability: 84, predictedDate: '2026-03-03', basisGrievances: 614,
    historicalPattern: 'Post-rain season pothole clusters in this zone led to road collapse in 84% of years.',
    urgency: 'high', departmentAlerted: 'UP PWD Division 3',
    alertSentAt: '2026-02-27 07:30', status: 'Action Taken', daysUntil: 4,
    suggestedAction: 'Deploy repair crew to NH-27 km 45-67 to preemptively fill potholes and fix drainage.',
    prevented: true,
  },
  {
    id: 'PSV-003', title: 'PHC Doctor Coverage Gap Predicted',
    state: 'Jharkhand', district: 'Palamu', category: 'Healthcare',
    probability: 78, predictedDate: '2026-03-05', basisGrievances: 312,
    historicalPattern: 'Quarterly contract renewals historically lapse in Palamu PHC causing 3-5 week medical gaps.',
    urgency: 'high', departmentAlerted: 'Jharkhand NHM Office',
    alertSentAt: '2026-02-27 09:00', status: 'Department Notified', daysUntil: 6,
    suggestedAction: 'Renew doctor contracts proactively. Arrange locum coverage during transition.',
    prevented: false,
  },
  {
    id: 'PSV-004', title: 'Ration Shop Stock Depletion Predicted',
    state: 'Rajasthan', district: 'Barmer', category: 'Ration & Food Security',
    probability: 72, predictedDate: '2026-03-04', basisGrievances: 198,
    historicalPattern: 'Supply chain disruptions occur around month-end in remote districts — 4 instances in 2025 alone.',
    urgency: 'medium', departmentAlerted: 'Rajasthan Food & Civil Supplies',
    alertSentAt: '2026-02-27 10:15', status: 'Under Review', daysUntil: 5,
    suggestedAction: 'Pre-position additional grain stock at Barmer distribution center before March 3.',
    prevented: false,
  },
  {
    id: 'PSV-005', title: 'Grid Transformer Overload Risk',
    state: 'Maharashtra', district: 'Nagpur', category: 'Electricity',
    probability: 67, predictedDate: '2026-03-06', basisGrievances: 432,
    historicalPattern: 'Summer onset load spikes consistently cause transformer failures in Nagpur in early March.',
    urgency: 'medium', departmentAlerted: 'MSEDCL Nagpur Circle',
    alertSentAt: '2026-02-27 11:00', status: 'Department Notified', daysUntil: 7,
    suggestedAction: 'Schedule transformer maintenance and load balancing before peak demand.',
    prevented: false,
  },
];

export const mockPreSevaStats = {
  totalPredictions: 127, prevented: 43, preventionRate: 34,
  totalGrievancesAvoided: 8743, activePredictions: 12,
  citySaved: '₹2.3 Crore', topPredictionAccuracy: 91,
};

// --- Feature 18: SLA Tracker ---
export const mockSLAData = [
  { id: 'GRV-2601034', title: 'Road repair — Lucknow bypass', category: 'Infrastructure', state: 'UP', assignedTo: 'Officer Mehta', filedDate: '2026-02-18', slaDeadline: '2026-02-25', status: 'Breached', hoursLeft: -48, priority: 'High', breachCount: 1 },
  { id: 'GRV-2601067', title: 'No water supply — Sitapur district', category: 'Water Supply', state: 'UP', assignedTo: 'Officer Rao', filedDate: '2026-02-20', slaDeadline: '2026-02-27', status: 'Due Today', hoursLeft: 6, priority: 'Critical', breachCount: 0 },
  { id: 'GRV-2601089', title: 'PHC closed for 3 months', category: 'Healthcare', state: 'Bihar', assignedTo: 'Officer Sharma', filedDate: '2026-02-21', slaDeadline: '2026-02-28', status: 'At Risk', hoursLeft: 30, priority: 'High', breachCount: 0 },
  { id: 'GRV-2601012', title: 'Pension delayed — 6 months', category: 'Pension', state: 'Rajasthan', assignedTo: 'Unassigned', filedDate: '2026-02-15', slaDeadline: '2026-02-22', status: 'Breached', hoursLeft: -120, priority: 'High', breachCount: 2 },
  { id: 'GRV-2601098', title: 'School roof collapse risk', category: 'Education', state: 'Jharkhand', assignedTo: 'Officer Bose', filedDate: '2026-02-24', slaDeadline: '2026-03-02', status: 'On Track', hoursLeft: 84, priority: 'Critical', breachCount: 0 },
  { id: 'GRV-2601103', title: 'Sewage overflow — city center', category: 'Sanitation', state: 'Maharashtra', assignedTo: 'Officer Rao', filedDate: '2026-02-23', slaDeadline: '2026-03-01', status: 'At Risk', hoursLeft: 18, priority: 'Medium', breachCount: 0 },
  { id: 'GRV-2601114', title: 'Wage theft — construction workers', category: 'Labour', state: 'Gujarat', assignedTo: 'Officer Mehta', filedDate: '2026-02-25', slaDeadline: '2026-03-04', status: 'On Track', hoursLeft: 168, priority: 'Medium', breachCount: 0 },
  { id: 'GRV-2601122', title: 'Crop insurance unpaid — 8 months', category: 'Agriculture', state: 'MP', assignedTo: 'Unassigned', filedDate: '2026-02-10', slaDeadline: '2026-02-17', status: 'Breached', hoursLeft: -240, priority: 'High', breachCount: 3 },
];

export const mockOfficerSLA = [
  { officer: 'Officer Mehta', totalAssigned: 23, onTime: 19, breaches: 2, inProgress: 2, avgResolutionDays: 3.2, rating: 94 },
  { officer: 'Officer Rao', totalAssigned: 31, onTime: 24, breaches: 4, inProgress: 3, avgResolutionDays: 4.1, rating: 81 },
  { officer: 'Officer Sharma', totalAssigned: 18, onTime: 15, breaches: 1, inProgress: 2, avgResolutionDays: 2.8, rating: 96 },
  { officer: 'Officer Bose', totalAssigned: 27, onTime: 20, breaches: 5, inProgress: 2, avgResolutionDays: 5.3, rating: 74 },
];

// --- Feature 16: JanConnect Community Forum ---
export const mockCommunityPosts = [
  {
    id: 'POST-001', category: 'schemes',
    title: 'How to claim PM Kisan after father passed away?',
    body: 'My father was registered for PM Kisan scheme. He passed away last month. Can I continue claiming the benefit? What documents do I need?',
    author: 'Ramesh Kumar', state: 'Uttar Pradesh', time: '2 hours ago',
    upvotes: 47, replies: 12, officerResponse: true,
    officerResponseText: 'You can transfer the PM Kisan registration as heir. Visit your local Patwari with: Death certificate, your Aadhaar, bank account. Process takes 15-20 days.',
    tags: ['PM Kisan', 'inheritance'], verified: false,
  },
  {
    id: 'POST-002', category: 'grievance',
    title: 'Ayushman card kept getting rejected at hospital — what worked for you?',
    body: 'Hospital says Ayushman Bharat card is not working even though I am eligible. Anyone faced this? How did you resolve it?',
    author: 'Priya Sharma', state: 'Maharashtra', time: '5 hours ago',
    upvotes: 89, replies: 34, officerResponse: false, officerResponseText: null,
    tags: ['Ayushman', 'card rejection'], verified: false,
  },
  {
    id: 'POST-003', category: 'schemes',
    title: '✅ Got PMAY approval in 40 days — sharing my step-by-step process',
    body: 'I know many people are frustrated waiting for PMAY. I got mine approved in 40 days. Here is the exact process that worked for me...',
    author: 'Suresh Patel', state: 'Gujarat', time: '1 day ago',
    upvotes: 312, replies: 87, officerResponse: false, officerResponseText: null,
    tags: ['PMAY', 'success story'], verified: true,
  },
  {
    id: 'POST-004', category: 'general',
    title: 'Digital Jeevan Praman for elderly parent who cannot travel?',
    body: 'My grandfather is 82 and cannot visit the bank for annual pension verification. Is there a way to do it at home?',
    author: 'Ankit Tiwari', state: 'Bihar', time: '3 hours ago',
    upvotes: 156, replies: 23, officerResponse: true,
    officerResponseText: 'Use IPPB mobile app or call 8448446742. A banking agent will visit home for biometric verification. No bank visit needed.',
    tags: ['pension', 'elderly', 'jeevan praman'], verified: false,
  },
];

// --- Feature 19: Vernacular News Feed ---
export const mockSevaNews = [
  {
    id: 'NEWS-001', title: 'PM Kisan Enhanced: ₹8,000/year from April 2026',
    titleHi: 'पीएम किसान: अप्रैल 2026 से ₹8,000/वर्ष',
    body: 'The government has announced an increase in PM Kisan Samman Nidhi from ₹6,000 to ₹8,000 per year, effective April 2026. All registered farmers will automatically receive the enhanced amount.',
    category: 'Agriculture', date: '2026-02-25',
    tags: ['PM Kisan', 'farmers'], impact: 'high',
    affectedStates: ['All India'], beneficiaries: '12 Crore Farmers',
  },
  {
    id: 'NEWS-002', title: '500 New Mobile Health Clinics for Remote Villages',
    titleHi: 'दूरदराज के गांवों के लिए 500 नई मोबाइल स्वास्थ्य क्लीनिक',
    body: 'Ministry of Health has launched 500 mobile health clinics targeting the most remote 10,000 villages. Each clinic carries essential medicines and diagnostic equipment.',
    category: 'Healthcare', date: '2026-02-24',
    tags: ['health', 'rural', 'mobile clinic'], impact: 'high',
    affectedStates: ['Bihar', 'Jharkhand', 'Odisha', 'Rajasthan', 'UP'], beneficiaries: '4 Crore Rural Citizens',
  },
  {
    id: 'NEWS-003', title: 'MGNREGS Wages Increased to ₹267/day in Uttar Pradesh',
    titleHi: 'यूपी में मनरेगा मजदूरी ₹267/दिन हुई',
    body: 'The daily wage under MGNREGS has been revised upward in Uttar Pradesh from ₹220 to ₹267 per day.',
    category: 'Labour & Employment', date: '2026-02-23',
    tags: ['MGNREGS', 'wages'], impact: 'medium',
    affectedStates: ['Uttar Pradesh'], beneficiaries: '2.3 Crore Rural Households',
  },
  {
    id: 'NEWS-004', title: 'National Scholarship Portal Deadline Extended to March 15',
    titleHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल की समय सीमा 15 मार्च तक बढ़ी',
    body: 'The National Scholarship Portal deadline for all central scholarships has been extended to March 15, 2026.',
    category: 'Education', date: '2026-02-22',
    tags: ['scholarship', 'NSP'], impact: 'medium',
    affectedStates: ['All India'], beneficiaries: '40 Lakh Students',
  },
];

// --- Feature 17: SchemePath / Benefit Roadmap ---
export const mockBenefitRoadmap = {
  totalPotentialBenefit: 48600, completedSteps: 2, totalSteps: 7,
  steps: [
    { id: 1, title: 'Verify Aadhaar & Bank Linkage', done: true, benefit: '₹6,000/year', scheme: 'PM Kisan Samman Nidhi', dueDate: 'Completed', documents: ['Aadhaar', 'Bank passbook'], description: 'Your Aadhaar is linked — registered for PM Kisan.' },
    { id: 2, title: 'Apply for Ayushman Bharat Card', done: true, benefit: '₹5 lakh health cover', scheme: 'Ayushman Bharat PM-JAY', dueDate: 'Completed', documents: ['Aadhaar', 'SECC registration'], description: 'Health coverage is active.' },
    { id: 3, title: 'Register for Kisan Credit Card', done: false, benefit: 'Credit upto ₹3 lakh @ 4%', scheme: 'Kisan Credit Card', dueDate: '2026-03-10', documents: ['Land records', 'Aadhaar', 'Bank account'], description: 'Visit nearest cooperative bank or NABARD. Takes 7-10 days.' },
    { id: 4, title: 'Enroll in Atal Pension Yojana', done: false, benefit: '₹5,000/month pension at 60', scheme: 'Atal Pension Yojana', dueDate: '2026-03-15', documents: ['Aadhaar', 'Bank account', 'Age proof'], description: 'Open via your bank or Umang app. Monthly contribution: ₹376.' },
    { id: 5, title: 'Apply for PM Ujjwala Yojana', done: false, benefit: 'Free LPG connection + cylinder', scheme: 'PM Ujjwala Yojana', dueDate: '2026-03-20', documents: ['Aadhaar', 'BPL ration card', 'Bank account'], description: 'Apply at nearest LPG distributor.' },
    { id: 6, title: 'File MGNREGS Job Card Application', done: false, benefit: '100 days employment @ ₹267/day', scheme: 'MGNREGS', dueDate: '2026-03-25', documents: ['Aadhaar', 'Residence proof', 'Photograph'], description: 'Apply at Gram Panchayat office.' },
    { id: 7, title: 'Register Daughter for Sukanya Samriddhi', done: false, benefit: '8.2% interest savings scheme', scheme: 'Sukanya Samriddhi Yojana', dueDate: '2026-03-30', documents: ['Birth certificate', 'Aadhaar', 'Bank account'], description: 'Open at Post Office or major banks.' },
  ],
};

// --- Feature 27 & 20: Digital Budget Escrow ---
export const mockEscrowProjects = [
  {
    id: 'ESC-26001',
    title: 'Village Road Paving — Varanasi Ward 4',
    contractor: 'NH Infra Ltd',
    budget: 1250000,
    lockedAmount: 1250000,
    disbursedAmount: 0,
    status: 'Locked (Awaiting Citizen Verification)',
    grievanceId: 'GRV-2601001',
    progress: 100,
    verificationPhoto: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400&auto=format&fit=crop',
    completionDate: '2026-02-26',
    citizenVerified: false,
    rating: 0,
  },
  {
    id: 'ESC-26002',
    title: 'Water Pipeline Repair — Patna North',
    contractor: 'AquaSolutions Corp',
    budget: 450000,
    lockedAmount: 0,
    disbursedAmount: 450000,
    status: 'Disbursed (Verified by Citizens)',
    grievanceId: 'GRV-2601045',
    progress: 100,
    verificationPhoto: 'https://images.unsplash.com/photo-1541810270632-63321033485b?q=80&w=400&auto=format&fit=crop',
    completionDate: '2026-02-20',
    citizenVerified: true,
    rating: 5,
  },
  {
    id: 'ESC-26003',
    title: 'Primary School Building Extension — Ranchi',
    contractor: 'BuildWell Cooperatives',
    budget: 2800000,
    lockedAmount: 2800000,
    disbursedAmount: 0,
    status: 'Work In Progress',
    grievanceId: 'GRV-2601098',
    progress: 65,
    verificationPhoto: null,
    completionDate: null,
    citizenVerified: false,
    rating: 0,
  }
];

// --- Feature 28: AI Ghost Audits ---
export const mockGhostAuditAlerts = [
  {
    id: 'AUD-001',
    grievanceId: 'GRV-2605432',
    officer: 'Officer Bose',
    action: 'Ticket Closed (Suspicious)',
    aiReasoning: 'Officer closed the ticket within 2 hours of assignment without attaching a resolution photo or field notes. Historical average for this category is 48 hours.',
    consequence: 'Ticket Reopened (Bypassed Officer)',
    impact: 'Stopped fraudulent closure of road repair request.',
    timestamp: '2026-02-27 14:20',
    severity: 'high',
    verifiedByCitizen: false,
  },
  {
    id: 'AUD-002',
    grievanceId: 'GRV-2605488',
    officer: 'Officer Rao',
    action: 'Marked Resolved',
    aiReasoning: 'Sentiment analysis of citizen metadata indicates negative sentiment at closure site. GPS coordinates of officer dont match grievance location.',
    consequence: 'Pending Citizen Verification',
    impact: 'Ensuring worker presence for water supply maintenance.',
    timestamp: '2026-02-27 15:45',
    severity: 'medium',
    verifiedByCitizen: null,
  },
  {
    id: 'AUD-003',
    grievanceId: 'GRV-2605512',
    officer: 'Officer Mehta',
    action: 'Duplicate Closure Pattern',
    aiReasoning: 'Pattern matching reveals 5 identical closures with the same copy-pasted resolution text in 1 hour.',
    consequence: 'Manual Audit Triggered (Escrow Locked)',
    impact: 'Protected ₹5.4 Lakh in sanitation contract funds.',
    timestamp: '2026-02-27 11:30',
    severity: 'critical',
    verifiedByCitizen: false,
  }
];
