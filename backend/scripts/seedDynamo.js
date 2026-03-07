#!/usr/bin/env node
// ============================================
// seedDynamo.js — Seed all 7 DynamoDB tables
// Reads mock data from /backend/db/seed.js
// and batch-writes to DynamoDB.
//
// Run: node backend/scripts/seedDynamo.js
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// ─── AWS Client ────────────────────────────────────────────────────────────────
const client = DynamoDBDocumentClient.from(
    new DynamoDBClient({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sessionToken: process.env.AWS_SESSION_TOKEN  // Required for Learner Labs
        }
    }),
    {
        marshallOptions: { removeUndefinedValues: true, convertEmptyValues: true },
        unmarshallOptions: { wrapNumbers: false }
    }
);

// ─── Table names ───────────────────────────────────────────────────────────────
const TABLES = {
    users: process.env.DYNAMO_USERS_TABLE || 'ncie-users',
    grievances: process.env.DYNAMO_GRIEVANCES_TABLE || 'ncie-grievances',
    schemes: process.env.DYNAMO_SCHEMES_TABLE || 'ncie-schemes',
    officers: process.env.DYNAMO_OFFICERS_TABLE || 'ncie-officers',
    alerts: process.env.DYNAMO_ALERTS_TABLE || 'ncie-preseva-alerts',
    notifications: process.env.DYNAMO_NOTIFICATIONS_TABLE || 'ncie-notifications',
    community: process.env.DYNAMO_COMMUNITY_TABLE || 'ncie-community'
};

// ─── Batch write helper (handles 25-item limit) ────────────────────────────────
async function batchWrite(tableName, items) {
    const BATCH_SIZE = 25;
    let written = 0;

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const requestItems = {
            [tableName]: batch.map(item => ({ PutRequest: { Item: item } }))
        };
        await client.send(new BatchWriteCommand({ RequestItems: requestItems }));
        written += batch.length;
        process.stdout.write('.');
    }
    return written;
}

// ─── Count existing items in table ────────────────────────────────────────────
async function countItems(tableName) {
    try {
        const result = await client.send(new ScanCommand({ TableName: tableName, Select: 'COUNT' }));
        return result.Count || 0;
    } catch {
        return 0;
    }
}

// ─── All mock data inline (from backend/db/seed.js) ───────────────────────────

const SALT_ROUNDS = 10;

const grievanceCategories = ['Water Supply', 'Infrastructure', 'Healthcare', 'Education', 'Agriculture', 'Finance', 'Housing', 'Transport', 'Electricity', 'Sanitation'];
const states = ['Uttar Pradesh', 'Tamil Nadu', 'Maharashtra', 'Bihar', 'Rajasthan', 'West Bengal', 'Karnataka', 'Gujarat', 'Kerala', 'Punjab', 'Telangana', 'Madhya Pradesh'];
const districts = ['Lucknow', 'Kanpur', 'Chennai', 'Coimbatore', 'Mumbai', 'Pune', 'Patna', 'Jaipur', 'Kolkata', 'Bengaluru', 'Ahmedabad', 'Thiruvananthapuram', 'Amritsar', 'Hyderabad', 'Bhopal'];
const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed', 'Escalated'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const sentimentLabels = ['Positive', 'Neutral', 'Negative', 'Highly Negative'];

const grievanceTitles = [
    'No water supply for 3 days in our area', 'Road full of potholes causing accidents',
    'Primary health centre has no doctor', 'School has no teachers since 2 months',
    'Crop damaged due to flood, need compensation', 'Bank not releasing PM Kisan installment',
    'House allotted under PMAY but no key given', 'Bus service stopped in our village',
    'Power outage daily for 8+ hours', 'No toilets in school, girls dropouts increasing',
    'Sewage water mixing in drinking water supply', 'Borewell pump not working since 15 days',
    'Widow pension stopped without notice', 'MGNREGS payments pending for 3 months',
    'Ration card denied despite being BPL', 'Hospital charging extra for operations',
    'Teacher assaulted student, no action taken', 'Fertilizer not available at fair price shop',
    'PMAY house construction stopped midway', 'Street lights not working in entire ward',
    'Anganwadi closed, malnourishment rising', 'Bridge on village road collapsed',
    'Groundwater contaminated with arsenic', 'Corruption in NREGA job card issuance',
    'Aadhar linking issues blocking scholarship', 'Public park occupied by encroachment',
    'Ambulance service not functional in district', 'Students not receiving mid-day meals',
    'Electricity bill error showing 10x amount', 'PM Kisan benefit not received since 2025',
    'Local dam not maintained, flood risk high', 'No social security for construction workers',
    'Harassment by revenue officer for bribery', 'Flood relief funds not reached victims',
    'Public library building in dilapidated state', 'Animal shelter closed, stray dogs causing harm',
    'Child labour reported at brick kiln factory', 'Old age pensioner denied pension update',
    'Subsidized seeds not available this season', 'Water tank not cleaned for 6 months',
    'SHG loan not sanctioned despite approval', 'Voter ID correction pending since 2 years',
    'Hospital X-ray machine non-functional', 'Road construction funds embezzled',
    'Solar panels at school not working', 'Local government office very corrupt',
    'Crop insurance claim rejected unfairly', 'Late night factory noise causing health issues',
    'Child marriage happening openly in village', 'Piped water scheme laid but never connected'
];

const schemes = [
    { id: 'SCH-001', name: 'PM Kisan Samman Nidhi', description: 'Direct income support of ₹6,000/year to small and marginal farmers.', category: 'Agriculture', eligibility: { minAge: 18, maxAge: 99, maxIncome: 200000, states: ['All India'], gender: 'all', occupation: 'farmer' }, benefits: '₹6,000 per year', applicationUrl: 'https://pmkisan.gov.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-001' },
    { id: 'SCH-002', name: 'Ayushman Bharat PM-JAY', description: 'Health coverage of ₹5 lakh per family per year.', category: 'Healthcare', eligibility: { minAge: 0, maxAge: 99, maxIncome: 300000, states: ['All India'], gender: 'all' }, benefits: '₹5 lakh health insurance', applicationUrl: 'https://pmjay.gov.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-002' },
    { id: 'SCH-003', name: 'PM Awas Yojana (Urban)', description: 'Housing subsidy for urban poor.', category: 'Housing', eligibility: { minAge: 18, maxAge: 70, maxIncome: 1800000, states: ['All India'], gender: 'all' }, benefits: 'Interest subsidy 3-6.5%', applicationUrl: 'https://pmaymis.gov.in', deadline: '2026-12-31', state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-003' },
    { id: 'SCH-004', name: 'PM Awas Yojana (Rural)', description: 'Financial assistance for pucca houses.', category: 'Housing', eligibility: { minAge: 18, maxAge: 99, maxIncome: 100000, states: ['All India'], gender: 'all' }, benefits: '₹1.20–₹1.30 lakh', applicationUrl: 'https://pmayg.nic.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-004' },
    { id: 'SCH-005', name: 'Skill India Mission (PMKVY)', description: 'Free skill training for youth.', category: 'Employment', eligibility: { minAge: 15, maxAge: 45, maxIncome: 500000, states: ['All India'], gender: 'all' }, benefits: 'Free training + ₹8000 reward', applicationUrl: 'https://pmkvyofficial.org', deadline: '2026-12-31', state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-005' },
    { id: 'SCH-006', name: 'Pradhan Mantri Jan Dhan Yojana', description: 'Zero-balance savings account.', category: 'Finance', eligibility: { minAge: 10, maxAge: 99, maxIncome: 0, states: ['All India'], gender: 'all' }, benefits: 'Zero balance a/c + ₹1L accident insurance', applicationUrl: 'https://pmjdy.gov.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-006' },
    { id: 'SCH-007', name: 'Beti Bachao Beti Padhao', description: 'Program to promote girl child education.', category: 'Women & Child', eligibility: { minAge: 0, maxAge: 10, maxIncome: 0, states: ['All India'], gender: 'female' }, benefits: 'Sukanya Samriddhi 8.2% interest', applicationUrl: 'https://wcd.nic.in/bbbp-schemes', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-007' },
    { id: 'SCH-008', name: 'PM Mudra Yojana', description: 'Collateral-free micro loans.', category: 'Finance', eligibility: { minAge: 18, maxAge: 65, maxIncome: 0, states: ['All India'], gender: 'all' }, benefits: 'Loans ₹50K to ₹10L', applicationUrl: 'https://mudra.org.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-008' },
    { id: 'SCH-009', name: 'PM Ujjwala Yojana', description: 'Free LPG connections to BPL households.', category: 'Energy', eligibility: { minAge: 18, maxAge: 99, maxIncome: 100000, states: ['All India'], gender: 'female' }, benefits: 'Free LPG connection', applicationUrl: 'https://pmuy.gov.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-009' },
    { id: 'SCH-010', name: 'MGNREGS (Mahatma Gandhi NREGA)', description: '100 days guaranteed employment per year.', category: 'Employment', eligibility: { minAge: 18, maxAge: 99, maxIncome: 0, states: ['All India'], gender: 'all' }, benefits: '100 days employment per year', applicationUrl: 'https://nrega.nic.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-010' },
    { id: 'SCH-011', name: 'Sukanya Samriddhi Yojana', description: 'Small savings scheme for girls.', category: 'Finance', eligibility: { minAge: 0, maxAge: 10, maxIncome: 0, states: ['All India'], gender: 'female' }, benefits: '8.2% interest rate', applicationUrl: 'https://www.indiapost.gov.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-011' },
    { id: 'SCH-012', name: 'PM Fasal Bima Yojana', description: 'Crop insurance scheme.', category: 'Agriculture', eligibility: { minAge: 18, maxAge: 99, maxIncome: 0, states: ['All India'], gender: 'all', occupation: 'farmer' }, benefits: 'Crop insurance at 1.5-2% premium', applicationUrl: 'https://pmfby.gov.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-012' },
    { id: 'SCH-013', name: 'PM Vaya Vandana Yojana', description: 'Pension scheme for senior citizens.', category: 'Social Security', eligibility: { minAge: 60, maxAge: 99, maxIncome: 0, states: ['All India'], gender: 'all' }, benefits: '7.4% guaranteed pension for 10 years', applicationUrl: 'https://licindia.in', deadline: '2026-03-31', state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-013' },
    { id: 'SCH-014', name: 'Digital India Initiative', description: 'Digital skills training + broadband.', category: 'Education', eligibility: { minAge: 14, maxAge: 60, maxIncome: 0, states: ['All India'], gender: 'all' }, benefits: 'Free internet + digital literacy', applicationUrl: 'https://digitalindia.gov.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-014' },
    { id: 'SCH-015', name: 'Atal Pension Yojana', description: 'Guaranteed pension for unorganized sector.', category: 'Social Security', eligibility: { minAge: 18, maxAge: 40, maxIncome: 0, states: ['All India'], gender: 'all' }, benefits: 'Pension ₹1K-₹5K/month after 60', applicationUrl: 'https://npscra.nsdl.co.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-015' },
    { id: 'SCH-016', name: 'Kisan Credit Card', description: 'Revolving credit for farmers.', category: 'Agriculture', eligibility: { minAge: 18, maxAge: 70, maxIncome: 0, states: ['All India'], gender: 'all', occupation: 'farmer' }, benefits: '7% interest (4% after subsidy)', applicationUrl: 'https://www.nabard.org', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-016' },
    { id: 'SCH-017', name: 'Pradhan Mantri Scholarship Scheme', description: 'Scholarship for ex-servicemen wards.', category: 'Education', eligibility: { minAge: 17, maxAge: 25, maxIncome: 600000, states: ['All India'], gender: 'all' }, benefits: '₹2,500-₹3,000/month', applicationUrl: 'https://ksb.gov.in', deadline: '2026-10-31', state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-017' },
    { id: 'SCH-018', name: 'Tamil Nadu CM Insurance Scheme', description: 'Health insurance for TN families.', category: 'Healthcare', eligibility: { minAge: 0, maxAge: 99, maxIncome: 120000, states: ['Tamil Nadu'], gender: 'all' }, benefits: '₹5 lakh insurance at 1000+ hospitals', applicationUrl: 'https://www.cmchistn.com', deadline: null, state: 'Tamil Nadu', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-018' },
    { id: 'SCH-019', name: 'Kerala Smart Ration', description: 'Digitized PDS in Kerala.', category: 'Food Security', eligibility: { minAge: 0, maxAge: 99, maxIncome: 120000, states: ['Kerala'], gender: 'all' }, benefits: 'Subsidized rice ₹2/kg', applicationUrl: 'https://civilsupplieskerala.gov.in', deadline: null, state: 'Kerala', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-019' },
    { id: 'SCH-020', name: 'PM SVANidhi (Street Vendors)', description: 'Loans for street vendors.', category: 'Finance', eligibility: { minAge: 18, maxAge: 65, maxIncome: 200000, states: ['All India'], gender: 'all' }, benefits: 'Loans ₹10K→₹20K→₹50K', applicationUrl: 'https://pmsvanidhi.mohua.gov.in', deadline: null, state: 'All India', isActive: true, createdAt: '2026-01-01T00:00:00.000Z', schemeId: 'SCH-020' }
];

async function buildData() {
    const adminHash = await bcrypt.hash('Admin@123456', SALT_ROUNDS);
    const rameshHash = await bcrypt.hash('Ramesh@123456', SALT_ROUNDS);
    const citizenHash = await bcrypt.hash('Citizen@12345', SALT_ROUNDS);
    const officerHash = await bcrypt.hash('Officer@12345', SALT_ROUNDS);

    // ── Users (ncie-users PK: userId) ─────────────────────────────────────────
    const users = [
        { userId: 'USR-ADMIN-001', id: 'USR-ADMIN-001', name: 'Rajesh Kumar', email: 'admin@gov.in', password: adminHash, state: 'Delhi', district: 'New Delhi', age: 45, income: 0, role: 'admin', janShaktiScore: 95, createdAt: new Date().toISOString() },
        { userId: 'USR-CIT-001', id: 'USR-CIT-001', name: 'Ramesh Kumar', email: 'ramesh@citizen.in', password: rameshHash, state: 'Uttar Pradesh', district: 'Lucknow', age: 42, income: 180000, role: 'citizen', janShaktiScore: 62, phone: '+919876543210', createdAt: new Date().toISOString() },
        { userId: 'USR-CIT-002', id: 'USR-CIT-002', name: 'Priya Nair', email: 'priya@gmail.com', password: citizenHash, state: 'Kerala', district: 'Thiruvananthapuram', age: 29, income: 280000, role: 'citizen', janShaktiScore: 85, createdAt: '2026-01-20T10:00:00.000Z' },
        { userId: 'USR-CIT-003', id: 'USR-CIT-003', name: 'Suresh Patel', email: 'suresh@gmail.com', password: citizenHash, state: 'Gujarat', district: 'Ahmadabad', age: 52, income: 120000, role: 'citizen', janShaktiScore: 61, createdAt: '2026-01-25T09:15:00.000Z' },
        { userId: 'USR-CIT-004', id: 'USR-CIT-004', name: 'Ananya Sharma', email: 'ananya@gmail.com', password: citizenHash, state: 'Maharashtra', district: 'Mumbai', age: 34, income: 350000, role: 'citizen', janShaktiScore: 78, createdAt: '2026-01-28T11:00:00.000Z' }
    ];

    // ── Officers (ncie-officers PK: officerId) ───────────────────────────────
    const officers = [
        { officerId: 'OFC-001', id: 'OFC-001', name: 'Anita Singh', email: 'anita.singh@gov.in', password: officerHash, role: 'officer', department: 'Water & Sanitation', state: 'Uttar Pradesh', casesHandled: 142, avgResolutionDays: 3.2, slaCompliance: 94.3, satisfactionScore: 4.7, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-002', id: 'OFC-002', name: 'Mohan Reddy', email: 'mohan.reddy@gov.in', password: officerHash, role: 'officer', department: 'Infrastructure', state: 'Telangana', casesHandled: 98, avgResolutionDays: 5.8, slaCompliance: 78.1, satisfactionScore: 3.9, isBreachingSLA: true, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-003', id: 'OFC-003', name: 'Kavitha Rajan', email: 'kavitha.rajan@gov.in', password: officerHash, role: 'officer', department: 'Healthcare', state: 'Tamil Nadu', casesHandled: 213, avgResolutionDays: 2.1, slaCompliance: 97.8, satisfactionScore: 4.9, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-004', id: 'OFC-004', name: 'Rahul Gupta', email: 'rahul.gupta@gov.in', password: officerHash, role: 'officer', department: 'Education', state: 'Bihar', casesHandled: 67, avgResolutionDays: 8.3, slaCompliance: 62.4, satisfactionScore: 3.2, isBreachingSLA: true, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-005', id: 'OFC-005', name: 'Sunita Devi', email: 'sunita.devi@gov.in', password: officerHash, role: 'officer', department: 'Agriculture', state: 'Rajasthan', casesHandled: 189, avgResolutionDays: 4.0, slaCompliance: 88.6, satisfactionScore: 4.3, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-006', id: 'OFC-006', name: 'Arun Mehta', email: 'arun.mehta@gov.in', password: officerHash, role: 'officer', department: 'Finance & Banking', state: 'Maharashtra', casesHandled: 156, avgResolutionDays: 3.7, slaCompliance: 91.2, satisfactionScore: 4.5, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-007', id: 'OFC-007', name: 'Deepa Krishnan', email: 'deepa.krishnan@gov.in', password: officerHash, role: 'officer', department: 'Women & Child', state: 'Karnataka', casesHandled: 234, avgResolutionDays: 1.9, slaCompliance: 99.1, satisfactionScore: 4.95, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-008', id: 'OFC-008', name: 'Vikram Singh', email: 'vikram.singh@gov.in', password: officerHash, role: 'officer', department: 'Law & Order', state: 'Punjab', casesHandled: 44, avgResolutionDays: 12.1, slaCompliance: 48.7, satisfactionScore: 2.8, isBreachingSLA: true, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-009', id: 'OFC-009', name: 'Meena Pillai', email: 'meena.pillai@gov.in', password: officerHash, role: 'officer', department: 'Transport', state: 'Kerala', casesHandled: 178, avgResolutionDays: 3.4, slaCompliance: 92.5, satisfactionScore: 4.6, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { officerId: 'OFC-010', id: 'OFC-010', name: 'Hari Prasad', email: 'hari.prasad@gov.in', password: officerHash, role: 'officer', department: 'Housing', state: 'West Bengal', casesHandled: 112, avgResolutionDays: 6.2, slaCompliance: 73.8, satisfactionScore: 3.7, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' }
    ];

    // ── Grievances (ncie-grievances PK: grievanceId, SK: createdAt) ───────────
    const grievances = grievanceTitles.map((title, i) => {
        const state = states[i % states.length];
        const category = grievanceCategories[i % grievanceCategories.length];
        const status = statuses[i % statuses.length];
        const priority = priorities[i % priorities.length];
        const sentiment = sentimentLabels[Math.floor(i / 12) % sentimentLabels.length];
        const sentimentScore = sentiment === 'Positive' ? 0.75 + (i * 0.01 % 0.2)
            : sentiment === 'Neutral' ? 0.45 + (i * 0.01 % 0.1)
                : sentiment === 'Negative' ? 0.25 + (i * 0.01 % 0.15)
                    : 0.05 + (i * 0.01 % 0.15);

        const createdDate = new Date('2026-01-01T00:00:00.000Z');
        createdDate.setDate(createdDate.getDate() + i * 1.2);
        const updatedDate = new Date(createdDate);
        updatedDate.setDate(updatedDate.getDate() + 2);
        const resolvedDate = status === 'Resolved' ? new Date(updatedDate) : null;
        if (resolvedDate) resolvedDate.setDate(resolvedDate.getDate() + 3);

        const grievanceId = `GRV-${String(i + 1).padStart(3, '0')}`;
        return {
            grievanceId,
            id: grievanceId,
            userId: i === 0 ? 'USR-CIT-001' : i === 1 ? 'USR-CIT-002' : i === 2 ? 'USR-CIT-003' : 'USR-CIT-001',
            citizenName: i % 4 === 0 ? 'Ramesh Kumar' : i % 4 === 1 ? 'Priya Nair' : i % 4 === 2 ? 'Suresh Patel' : 'Ananya Sharma',
            title,
            description: `Detailed grievance report regarding ${title.toLowerCase()} in ${state}.`,
            category,
            state,
            district: districts[i % districts.length],
            status,
            sentiment,
            sentimentScore: parseFloat(sentimentScore.toFixed(3)),
            priority,
            assignedOfficer: `OFC-00${(i % 10) + 1}`,
            documents: [],
            isDuplicate: i % 15 === 0,
            fraudScore: i % 15 === 0 ? 0.72 : 0.08,
            adminNote: status === 'Resolved' ? 'Issue reviewed and resolved.' : null,
            createdAt: createdDate.toISOString(),
            updatedAt: updatedDate.toISOString(),
            resolvedAt: resolvedDate ? resolvedDate.toISOString() : null
        };
    });

    // ── PreSeva Alerts (ncie-preseva-alerts PK: alertId) ─────────────────────
    const alerts = [
        { alertId: 'PRESEVA-001', id: 'PRESEVA-001', type: 'spike_predicted', state: 'Bihar', district: 'Patna', category: 'Flooding', title: 'Predicted Flood Grievance Spike', probability: 87, daysUntil: 4, predictedDate: '2026-03-05', urgency: 'critical', basisGrievances: 1240, suggestedAction: 'Clear drainages in Ward 4, 7, and 12 immediately.', departmentAlerted: 'Water & Sanitation', description: 'AI model predicts 85%+ probability of flood-related grievance surge.', status: 'Department Notified', prevented: false, createdAt: '2026-02-20T00:00:00.000Z' },
        { alertId: 'PRESEVA-002', id: 'PRESEVA-002', type: 'crop_distress', state: 'Rajasthan', district: 'Jaisalmer', category: 'Agriculture', title: 'Drought Pattern Detected', probability: 79, daysUntil: 12, predictedDate: '2026-03-15', urgency: 'high', basisGrievances: 850, suggestedAction: 'Release canal water for agricultural use.', departmentAlerted: 'Agriculture', description: 'Unusual drought pattern detected with 300% grievance increase history.', status: 'Department Notified', prevented: false, createdAt: '2026-02-22T00:00:00.000Z' },
        { alertId: 'PRESEVA-003', id: 'PRESEVA-003', type: 'health_outbreak', state: 'West Bengal', district: 'Kolkata', category: 'Healthcare', title: 'Potential Dengue Outbreak', probability: 72, daysUntil: 7, predictedDate: '2026-03-08', urgency: 'high', basisGrievances: 2100, suggestedAction: 'Start intensive fogging and cleaning of stagnant water.', departmentAlerted: 'Healthcare', description: 'Vector disease pattern detected. Dengue outbreak probability high.', status: 'Department Notified', prevented: false, createdAt: '2026-02-24T00:00:00.000Z' },
        { alertId: 'PRESEVA-004', id: 'PRESEVA-004', type: 'infrastructure_failure', state: 'Uttar Pradesh', district: 'Kanpur', category: 'Infrastructure', title: 'Road Surface Deterioration', probability: 68, daysUntil: 2, predictedDate: '2026-03-03', urgency: 'medium', basisGrievances: 450, suggestedAction: 'Emergency road patching in the industrial zone.', departmentAlerted: 'Infrastructure', description: 'Systemic infrastructure failure predicted without intervention.', status: 'Department Notified', prevented: false, createdAt: '2026-02-25T00:00:00.000Z' },
        { alertId: 'PRESEVA-005', id: 'PRESEVA-005', type: 'water_scarcity', state: 'Maharashtra', district: 'Aurangabad', category: 'Water Supply', title: 'Summer Water Scarcity Warning', probability: 91, daysUntil: 20, predictedDate: '2026-03-25', urgency: 'critical', basisGrievances: 3200, suggestedAction: 'Deploy water tankers and increase reservoir allocation.', departmentAlerted: 'Water & Sanitation', description: 'Summer water crisis prediction based on rainfall deficit data.', status: 'Action Pending', prevented: false, createdAt: '2026-02-26T00:00:00.000Z' }
    ];

    // ── Notifications (ncie-notifications PK: notificationId, SK: userId) ────
    const notifications = [
        { id: 'NOTIF-001', notificationId: 'NOTIF-001', userId: 'USR-CIT-001', message: 'Your grievance GRV-001 has been filed. Tracking ID: GRV-001', type: 'success', grievanceId: 'GRV-001', isRead: false, createdAt: '2026-01-01T08:00:00.000Z' },
        { id: 'NOTIF-002', notificationId: 'NOTIF-002', userId: 'USR-CIT-001', message: 'Your grievance GRV-001 status updated to: In Progress', type: 'info', grievanceId: 'GRV-001', isRead: true, createdAt: '2026-01-03T10:00:00.000Z' },
        { id: 'NOTIF-003', notificationId: 'NOTIF-003', userId: 'USR-CIT-001', message: 'Your grievance GRV-001 has been resolved.', type: 'success', grievanceId: 'GRV-001', isRead: false, createdAt: '2026-01-06T14:00:00.000Z' },
        { id: 'NOTIF-004', notificationId: 'NOTIF-004', userId: 'USR-CIT-002', message: 'Your grievance GRV-002 has been filed. Tracking ID: GRV-002', type: 'success', grievanceId: 'GRV-002', isRead: false, createdAt: '2026-01-02T09:00:00.000Z' },
        { id: 'NOTIF-005', notificationId: 'NOTIF-005', userId: 'USR-CIT-002', message: 'New scheme PM Kisan Enhanced is available for you.', type: 'info', grievanceId: null, isRead: false, createdAt: '2026-02-25T12:00:00.000Z' },
        { id: 'NOTIF-006', notificationId: 'NOTIF-006', userId: 'USR-CIT-003', message: 'Your grievance GRV-003 has been filed. Tracking ID: GRV-003', type: 'success', grievanceId: 'GRV-003', isRead: true, createdAt: '2026-01-03T10:00:00.000Z' },
        { id: 'NOTIF-007', notificationId: 'NOTIF-007', userId: 'USR-CIT-001', message: 'Officer assigned to your grievance GRV-005.', type: 'info', grievanceId: 'GRV-005', isRead: false, createdAt: '2026-01-10T11:00:00.000Z' },
        { id: 'NOTIF-008', notificationId: 'NOTIF-008', userId: 'USR-CIT-001', message: 'Your Ayushman Bharat application is under review.', type: 'info', grievanceId: null, isRead: false, createdAt: '2026-02-01T09:00:00.000Z' },
        { id: 'NOTIF-009', notificationId: 'NOTIF-009', userId: 'USR-ADMIN-001', message: 'System alert: 5 grievances pending SLA breach.', type: 'warning', grievanceId: null, isRead: false, createdAt: '2026-03-01T08:00:00.000Z' },
        { id: 'NOTIF-010', notificationId: 'NOTIF-010', userId: 'USR-CIT-002', message: 'Community post PET-002 has reached 8000 signatures!', type: 'success', grievanceId: null, isRead: false, createdAt: '2026-02-28T16:00:00.000Z' },
        { id: 'NOTIF-011', notificationId: 'NOTIF-011', userId: 'USR-CIT-003', message: 'GRV-003 status: Resolved. Please verify the resolution.', type: 'success', grievanceId: 'GRV-003', isRead: false, createdAt: '2026-01-15T14:00:00.000Z' },
        { id: 'NOTIF-012', notificationId: 'NOTIF-012', userId: 'USR-CIT-001', message: 'New government scheme Skill India is now open for applications.', type: 'info', grievanceId: null, isRead: true, createdAt: '2026-02-10T10:00:00.000Z' },
        { id: 'NOTIF-013', notificationId: 'NOTIF-013', userId: 'USR-CIT-002', message: 'Your GRV-006 has been escalated to senior officer.', type: 'warning', grievanceId: 'GRV-006', isRead: false, createdAt: '2026-01-20T15:00:00.000Z' },
        { id: 'NOTIF-014', notificationId: 'NOTIF-014', userId: 'USR-CIT-004', message: 'Welcome to Project NCIE! Your account is ready.', type: 'success', grievanceId: null, isRead: false, createdAt: '2026-01-28T11:00:00.000Z' },
        { id: 'NOTIF-015', notificationId: 'NOTIF-015', userId: 'USR-ADMIN-001', message: 'PreSeva Alert: Flood spike predicted in Bihar. Action required.', type: 'warning', grievanceId: null, isRead: false, createdAt: '2026-02-28T10:00:00.000Z' }
    ];

    // ── Community Posts (ncie-community PK: postId, SK: createdAt) ────────────
    const community = [
        { postId: 'POST-001', id: 'POST-001', userId: 'USR-CIT-001', authorName: 'Ramesh Kumar', title: 'Online petition: Fix water supply in Lucknow East before summer', content: 'Summer is coming and water supply is already unreliable. Sign this petition.', category: 'Water Supply', state: 'Uttar Pradesh', votes: 1247, voters: ['USR-CIT-001'], isPetition: true, petitionCount: 4821, signers: ['USR-CIT-001'], targetSignatures: 5000, status: 'active', responses: [], createdAt: '2026-02-15T00:00:00.000Z' },
        { postId: 'POST-002', id: 'POST-002', userId: 'USR-CIT-002', authorName: 'Priya Nair', title: 'How I got my PM Kisan payment issue resolved in 3 days', content: 'Sharing my experience so others can benefit. File your complaint with the block-level agricultural officer directly.', category: 'Finance', state: 'Kerala', votes: 892, voters: ['USR-CIT-002'], isPetition: false, petitionCount: 0, signers: [], responses: [], createdAt: '2026-02-14T00:00:00.000Z' },
        { postId: 'PET-001', id: 'PET-001', userId: 'USR-CIT-003', authorName: 'Suresh Patel', title: 'Demand: Open a PHC in Ahmedabad East', content: 'Ward 14 of Ahmedabad East has a population of 50,000 but no Primary Health Centre within 10km.', category: 'Healthcare', state: 'Gujarat', votes: 512, voters: ['USR-CIT-003'], isPetition: true, petitionCount: 3412, signers: ['USR-CIT-003'], targetSignatures: 5000, status: 'active', responses: [], createdAt: '2026-02-20T00:00:00.000Z' },
        { postId: 'PET-002', id: 'PET-002', userId: 'USR-CIT-002', authorName: 'Priya Nair', title: 'Petition: Restore KSRTC bus routes to Wayanad tribal hamlets', content: 'KSRTC discontinued routes to 12 tribal hamlets in Wayanad. Children cannot reach school.', category: 'Transport', state: 'Kerala', votes: 2109, voters: ['USR-CIT-002'], isPetition: true, petitionCount: 8200, signers: ['USR-CIT-002'], targetSignatures: 10000, status: 'active', responses: [], createdAt: '2026-02-10T00:00:00.000Z' },
        { postId: 'POST-003', id: 'POST-003', userId: 'USR-CIT-001', authorName: 'Ramesh Kumar', title: 'Tip: How to track your MGNREGS wage payment status online', content: 'Step 1: Go to nrega.nic.in. Step 2: Select your state. Step 3: Enter your Job Card number.', category: 'Employment', state: 'Uttar Pradesh', votes: 345, voters: ['USR-CIT-001'], isPetition: false, petitionCount: 0, signers: [], responses: [], createdAt: '2026-02-25T00:00:00.000Z' },
        { postId: 'POST-004', id: 'POST-004', userId: 'USR-CIT-004', authorName: 'Ananya Sharma', title: 'Success: Got free cataract surgery via Ayushman Bharat', content: 'My father got his cataract surgery done for free at Bombay Hospital under PM-JAY. Here is how we did it.', category: 'Healthcare', state: 'Maharashtra', votes: 678, voters: ['USR-CIT-004'], isPetition: false, petitionCount: 0, signers: [], responses: [], createdAt: '2026-02-18T00:00:00.000Z' },
        { postId: 'PET-003', id: 'PET-003', userId: 'USR-CIT-004', authorName: 'Ananya Sharma', title: 'Mumbai pothole crisis: Demand emergency repair fund', content: 'Western suburbs of Mumbai have 1200+ dangerous potholes. We demand emergency repair.', category: 'Infrastructure', state: 'Maharashtra', votes: 3421, voters: ['USR-CIT-004'], isPetition: true, petitionCount: 12400, signers: ['USR-CIT-004'], targetSignatures: 15000, status: 'active', responses: [], createdAt: '2026-02-05T00:00:00.000Z' },
        { postId: 'POST-005', id: 'POST-005', userId: 'USR-CIT-003', authorName: 'Suresh Patel', title: 'How to apply for Kisan Credit Card online in 10 minutes', content: 'I applied online for KCC through my bank app. Here is a step-by-step guide for other farmers.', category: 'Agriculture', state: 'Gujarat', votes: 234, voters: ['USR-CIT-003'], isPetition: false, petitionCount: 0, signers: [], responses: [], createdAt: '2026-02-22T00:00:00.000Z' },
        { postId: 'POST-006', id: 'POST-006', userId: 'USR-CIT-001', authorName: 'Ramesh Kumar', title: 'Corruption at Lucknow tehsil: Officer demands bribe for birth certificate', content: 'The tehsildar demanded ₹500 for a birth certificate that is free. I recorded the conversation.', category: 'Finance', state: 'Uttar Pradesh', votes: 1892, voters: ['USR-CIT-001'], isPetition: false, petitionCount: 0, signers: [], responses: [], createdAt: '2026-02-12T00:00:00.000Z' },
        { postId: 'POST-007', id: 'POST-007', userId: 'USR-CIT-002', authorName: 'Priya Nair', title: 'Ayushman Bharat empanelled hospital list for Kerala', content: 'Sharing the complete list of PM-JAY empanelled hospitals in Kerala for easy reference.', category: 'Healthcare', state: 'Kerala', votes: 445, voters: ['USR-CIT-002'], isPetition: false, petitionCount: 0, signers: [], responses: [], createdAt: '2026-02-19T00:00:00.000Z' },
        { postId: 'PET-004', id: 'PET-004', userId: 'USR-CIT-002', authorName: 'Priya Nair', title: 'Save Vembanad Lake: Stop illegal sand mining', content: 'Illegal sand dredging is destroying Vembanad Lake ecosystem. We demand strict enforcement.', category: 'Agriculture', state: 'Kerala', votes: 5670, voters: ['USR-CIT-002'], isPetition: true, petitionCount: 23000, signers: ['USR-CIT-002'], targetSignatures: 25000, status: 'active', responses: [], createdAt: '2026-01-28T00:00:00.000Z' },
        { postId: 'POST-008', id: 'POST-008', userId: 'USR-CIT-003', authorName: 'Suresh Patel', title: 'Ahmedabad Metro Phase 2: Request stops in underserved areas', content: 'Phase 2 of Ahmedabad Metro skips densely populated Narol and Vatva areas. We need a review.', category: 'Transport', state: 'Gujarat', votes: 1123, voters: ['USR-CIT-003'], isPetition: false, petitionCount: 0, signers: [], responses: [], createdAt: '2026-02-08T00:00:00.000Z' }
    ];

    return { users, officers, schemes, grievances, alerts, notifications, community };
}

// ─── Main seeder ───────────────────────────────────────────────────────────────
async function seedDynamo() {
    console.log('\n🌱 NCIE DynamoDB Seeder');
    console.log('═══════════════════════════════════════');
    console.log('Region:', process.env.AWS_REGION);
    console.log('ENABLE_DYNAMO:', process.env.ENABLE_DYNAMO);
    console.log('');

    if (process.env.ENABLE_DYNAMO !== 'true') {
        console.error('❌ ENABLE_DYNAMO is not true. Set it in .env and retry.');
        process.exit(1);
    }

    console.log('⏳ Preparing seed data (hashing passwords)...');
    const data = await buildData();

    const tableData = [
        { name: 'ncie-users', table: TABLES.users, items: data.users },
        { name: 'ncie-schemes', table: TABLES.schemes, items: data.schemes },
        { name: 'ncie-grievances', table: TABLES.grievances, items: data.grievances },
        { name: 'ncie-officers', table: TABLES.officers, items: data.officers },
        { name: 'ncie-preseva-alerts', table: TABLES.alerts, items: data.alerts },
        { name: 'ncie-notifications', table: TABLES.notifications, items: data.notifications },
        { name: 'ncie-community', table: TABLES.community, items: data.community }
    ];

    console.log('\n📦 Writing to DynamoDB tables:\n');

    const results = {};
    for (const { name, table, items } of tableData) {
        process.stdout.write(`  ${name}: `);
        try {
            // Check existing count
            const existing = await countItems(table);
            if (existing > 0) {
                console.log(`⚠️  ${existing} items already exist. Overwriting...`);
            }
            const written = await batchWrite(table, items);
            results[name] = written;
            console.log(` ✅ ${written} items written`);
        } catch (err) {
            if (err.name === 'ResourceNotFoundException') {
                console.log(`\n  ⚠️  Table not found: ${name} — create it in AWS Console first, then re-run`);
            } else {
                console.log(`\n  ❌ Error: ${err.message}`);
            }
            results[name] = 0;
        }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('📊 Seeding Summary:');
    for (const [table, count] of Object.entries(results)) {
        const icon = count > 0 ? '✅' : '❌';
        console.log(`  ${icon} ${table}: ${count} items written`);
    }

    const total = Object.values(results).reduce((a, b) => a + b, 0);
    console.log(`\n🎉 Total: ${total} items seeded across ${tableData.length} tables`);
    console.log('\nVerify in AWS Console:');
    console.log('  DynamoDB → Tables → ncie-grievances → Explore items');
    console.log('═══════════════════════════════════════\n');
}

seedDynamo().then(() => process.exit(0)).catch(err => {
    console.error('\n❌ Seeding failed:', err.message);
    console.error(err);
    process.exit(1);
});
