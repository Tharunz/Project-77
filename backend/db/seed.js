// ============================================
// seed.js — Populate DB with demo data
// Run via: node db/seed.js
// Also auto-runs from index.js on first start
// ============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const db = require('./database');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const seed = async (force = false) => {
    const db_instance = db.getDb();

    const existingUsers = db_instance.get('users').value();
    if (existingUsers.length > 0 && !force) {
        console.log('[SEED] Database already seeded. Skipping.');
        return;
    }

    if (force) {
        console.log('[SEED] Force seeding... clearing existing data.');
        db_instance.setState({
            users: [],
            grievances: [],
            schemes: [],
            officers: [],
            preSevaAlerts: [],
            notifications: [],
            communityPosts: [],
            chatHistory: []
        }).write();
    }

    console.log('[SEED] Starting database seed...');

    // ============================================
    // USERS
    // ============================================
    const adminPass = await bcrypt.hash('admin123', SALT_ROUNDS);
    const rameshPass = await bcrypt.hash('ramesh123', SALT_ROUNDS);
    const citizenPass = await bcrypt.hash('citizen123', SALT_ROUNDS);

    const users = [
        {
            id: 'USR-ADMIN-001',
            name: 'Rajiv Sharma',
            email: 'admin@gov.in',
            password: adminPass,
            state: 'Delhi',
            district: 'New Delhi',
            age: 45,
            income: 0,
            role: 'admin',
            janShaktiScore: 100,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'USR-CIT-001',
            name: 'Ramesh Kumar',
            email: 'ramesh@gmail.com',
            password: rameshPass,
            state: 'Uttar Pradesh',
            district: 'Lucknow',
            age: 38,
            income: 150000,
            role: 'citizen',
            janShaktiScore: 72,
            createdAt: '2026-01-15T08:30:00.000Z'
        },
        {
            id: 'USR-CIT-002',
            name: 'Priya Nair',
            email: 'priya@gmail.com',
            password: citizenPass,
            state: 'Kerala',
            district: 'Thiruvananthapuram',
            age: 29,
            income: 280000,
            role: 'citizen',
            janShaktiScore: 85,
            createdAt: '2026-01-20T10:00:00.000Z'
        },
        {
            id: 'USR-CIT-003',
            name: 'Suresh Patel',
            email: 'suresh@gmail.com',
            password: citizenPass,
            state: 'Gujarat',
            district: 'Ahmadabad',
            age: 52,
            income: 120000,
            role: 'citizen',
            janShaktiScore: 61,
            createdAt: '2026-01-25T09:15:00.000Z'
        }
    ];

    // ============================================
    // OFFICERS
    // ============================================
    const officerPass = await bcrypt.hash('officer123', SALT_ROUNDS);

    const officers = [
        { id: 'OFC-001', name: 'Anita Singh', email: 'anita.singh@gov.in', password: officerPass, role: 'officer', department: 'Water & Sanitation', state: 'Uttar Pradesh', casesHandled: 142, avgResolutionDays: 3.2, slaCompliance: 94.3, satisfactionScore: 4.7, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-002', name: 'Mohan Reddy', email: 'mohan.reddy@gov.in', password: officerPass, role: 'officer', department: 'Infrastructure', state: 'Telangana', casesHandled: 98, avgResolutionDays: 5.8, slaCompliance: 78.1, satisfactionScore: 3.9, isBreachingSLA: true, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-003', name: 'Kavitha Rajan', email: 'kavitha.rajan@gov.in', password: officerPass, role: 'officer', department: 'Healthcare', state: 'Tamil Nadu', casesHandled: 213, avgResolutionDays: 2.1, slaCompliance: 97.8, satisfactionScore: 4.9, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-004', name: 'Rahul Gupta', email: 'rahul.gupta@gov.in', password: officerPass, role: 'officer', department: 'Education', state: 'Bihar', casesHandled: 67, avgResolutionDays: 8.3, slaCompliance: 62.4, satisfactionScore: 3.2, isBreachingSLA: true, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-005', name: 'Sunita Devi', email: 'sunita.devi@gov.in', password: officerPass, role: 'officer', department: 'Agriculture', state: 'Rajasthan', casesHandled: 189, avgResolutionDays: 4.0, slaCompliance: 88.6, satisfactionScore: 4.3, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-006', name: 'Arun Mehta', email: 'arun.mehta@gov.in', password: officerPass, role: 'officer', department: 'Finance & Banking', state: 'Maharashtra', casesHandled: 156, avgResolutionDays: 3.7, slaCompliance: 91.2, satisfactionScore: 4.5, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-007', name: 'Deepa Krishnan', email: 'deepa.krishnan@gov.in', password: officerPass, role: 'officer', department: 'Women & Child', state: 'Karnataka', casesHandled: 234, avgResolutionDays: 1.9, slaCompliance: 99.1, satisfactionScore: 4.95, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-008', name: 'Vikram Singh', email: 'vikram.singh@gov.in', password: officerPass, role: 'officer', department: 'Law & Order', state: 'Punjab', casesHandled: 44, avgResolutionDays: 12.1, slaCompliance: 48.7, satisfactionScore: 2.8, isBreachingSLA: true, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-009', name: 'Meena Pillai', email: 'meena.pillai@gov.in', password: officerPass, role: 'officer', department: 'Transport', state: 'Kerala', casesHandled: 178, avgResolutionDays: 3.4, slaCompliance: 92.5, satisfactionScore: 4.6, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' },
        { id: 'OFC-010', name: 'Hari Prasad', email: 'hari.prasad@gov.in', password: officerPass, role: 'officer', department: 'Housing', state: 'West Bengal', casesHandled: 112, avgResolutionDays: 6.2, slaCompliance: 73.8, satisfactionScore: 3.7, isBreachingSLA: false, createdAt: '2026-01-01T00:00:00.000Z' }
    ];

    // ============================================
    // SCHEMES — 20 Real Indian Government Schemes
    // ============================================
    const schemes = [
        {
            id: 'SCH-001',
            name: 'PM Kisan Samman Nidhi',
            description: 'Direct income support of ₹6,000/year to small and marginal farmers. Amount transferred in 3 equal installments of ₹2,000 directly to bank accounts.',
            category: 'Agriculture',
            eligibility: { minAge: 18, maxAge: 99, maxIncome: 200000, states: ['All India'], gender: 'all', occupation: 'farmer' },
            benefits: '₹6,000 per year direct bank transfer in 3 installments',
            applicationUrl: 'https://pmkisan.gov.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-002',
            name: 'Ayushman Bharat PM-JAY',
            description: 'Health coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization across 25,000+ empanelled hospitals.',
            category: 'Healthcare',
            eligibility: { minAge: 0, maxAge: 99, maxIncome: 300000, states: ['All India'], gender: 'all' },
            benefits: '₹5 lakh health insurance coverage per family per year',
            applicationUrl: 'https://pmjay.gov.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-003',
            name: 'PM Awas Yojana (Urban)',
            description: 'Housing subsidy for urban poor under EWS/LIG/MIG categories. Interest subsidy on home loans up to ₹2.67 lakh per beneficiary.',
            category: 'Housing',
            eligibility: { minAge: 18, maxAge: 70, maxIncome: 1800000, states: ['All India'], gender: 'all' },
            benefits: 'Interest subsidy of 3-6.5% on home loans up to ₹20 lakh',
            applicationUrl: 'https://pmaymis.gov.in',
            deadline: '2026-12-31',
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-004',
            name: 'PM Awas Yojana (Rural)',
            description: 'Financial assistance to rural households for construction of pucca houses. ₹1.20 lakh in plains and ₹1.30 lakh in hilly/NE states.',
            category: 'Housing',
            eligibility: { minAge: 18, maxAge: 99, maxIncome: 100000, states: ['All India'], gender: 'all' },
            benefits: '₹1.20 – ₹1.30 lakh for house construction + MGNREGS convergence',
            applicationUrl: 'https://pmayg.nic.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-005',
            name: 'Skill India Mission (PMKVY)',
            description: 'Free skill training and NSQF-aligned certification for youth aged 15-45 under Pradhan Mantri Kaushal Vikas Yojana.',
            category: 'Employment',
            eligibility: { minAge: 15, maxAge: 45, maxIncome: 500000, states: ['All India'], gender: 'all' },
            benefits: 'Free skill training + Rs. 8000 monetary reward on certification + placement support',
            applicationUrl: 'https://pmkvyofficial.org',
            deadline: '2026-12-31',
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-006',
            name: 'Pradhan Mantri Jan Dhan Yojana',
            description: 'Zero-balance savings account with RuPay debit card, ₹1 lakh accident insurance, ₹30,000 life insurance, and overdraft facility.',
            category: 'Finance',
            eligibility: { minAge: 10, maxAge: 99, maxIncome: 0, states: ['All India'], gender: 'all' },
            benefits: 'Zero balance account + ₹1 lakh accident insurance + ₹30,000 life cover + OD facility',
            applicationUrl: 'https://pmjdy.gov.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-007',
            name: 'Beti Bachao Beti Padhao',
            description: 'Multi-sector program to address declining child sex ratio and promote education of girl child. Includes Sukanya Samriddhi account.',
            category: 'Women & Child',
            eligibility: { minAge: 0, maxAge: 10, maxIncome: 0, states: ['All India'], gender: 'female' },
            benefits: 'Sukanya Samriddhi Yojana: 8.2% interest on savings + tax exemption',
            applicationUrl: 'https://wcd.nic.in/bbbp-schemes',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-008',
            name: 'PM Mudra Yojana',
            description: 'Collateral-free micro loans for non-corporate, non-farm small/micro enterprises. Three tiers: Shishu (₹50K), Kishore (₹5L), Tarun (₹10L).',
            category: 'Finance',
            eligibility: { minAge: 18, maxAge: 65, maxIncome: 0, states: ['All India'], gender: 'all' },
            benefits: 'Loans from ₹50,000 to ₹10 lakh at low interest rates without collateral',
            applicationUrl: 'https://mudra.org.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-009',
            name: 'PM Ujjwala Yojana',
            description: 'Free LPG connections to BPL households to provide clean cooking fuel. Over 9 crore connections distributed across India.',
            category: 'Energy',
            eligibility: { minAge: 18, maxAge: 99, maxIncome: 100000, states: ['All India'], gender: 'female' },
            benefits: 'Free LPG connection + first refill cylinder + hotplate',
            applicationUrl: 'https://pmuy.gov.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-010',
            name: 'MGNREGS (Mahatma Gandhi NREGA)',
            description: '100 days guaranteed wage employment per year to rural households. Wage rates vary by state (₹204–₹357 per day).',
            category: 'Employment',
            eligibility: { minAge: 18, maxAge: 99, maxIncome: 0, states: ['All India'], gender: 'all' },
            benefits: '100 days guaranteed employment per year + unemployment allowance if work not provided',
            applicationUrl: 'https://nrega.nic.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-011',
            name: 'Sukanya Samriddhi Yojana',
            description: 'Small savings scheme for girls below 10 years. 8.2% interest rate, tax-free returns, and maturity at girl\'s age 21.',
            category: 'Finance',
            eligibility: { minAge: 0, maxAge: 10, maxIncome: 0, states: ['All India'], gender: 'female' },
            benefits: '8.2% interest rate + tax exemption under 80C + tax-free maturity amount',
            applicationUrl: 'https://www.indiapost.gov.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-012',
            name: 'PM Fasal Bima Yojana',
            description: 'Crop insurance scheme with premium as low as 1.5% for Rabi crops, 2% for Kharif crops. Coverage for losses due to natural calamities.',
            category: 'Agriculture',
            eligibility: { minAge: 18, maxAge: 99, maxIncome: 0, states: ['All India'], gender: 'all', occupation: 'farmer' },
            benefits: 'Crop insurance at 1.5-2% premium + web-based claim settlement',
            applicationUrl: 'https://pmfby.gov.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-013',
            name: 'PM Vaya Vandana Yojana',
            description: 'Pension scheme for senior citizens above 60 offering guaranteed 7.4% return for 10 years. Managed by LIC of India.',
            category: 'Social Security',
            eligibility: { minAge: 60, maxAge: 99, maxIncome: 0, states: ['All India'], gender: 'all' },
            benefits: '7.4% guaranteed pension for 10 years + loan facility + return of purchase price on death',
            applicationUrl: 'https://licindia.in',
            deadline: '2026-03-31',
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-014',
            name: 'Digital India Initiative',
            description: 'Digital skills training + broadband in villages + e-Governance services. Common Service Centres (CSC) in every panchayat.',
            category: 'Education',
            eligibility: { minAge: 14, maxAge: 60, maxIncome: 0, states: ['All India'], gender: 'all' },
            benefits: 'Free internet access + digital literacy training + e-services at CSC',
            applicationUrl: 'https://digitalindia.gov.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-015',
            name: 'Atal Pension Yojana',
            description: 'Guaranteed pension of ₹1,000–₹5,000/month after age 60 for unorganized sector workers. Government co-contributes 50% of premium.',
            category: 'Social Security',
            eligibility: { minAge: 18, maxAge: 40, maxIncome: 0, states: ['All India'], gender: 'all' },
            benefits: 'Guaranteed pension ₹1K-₹5K/month after 60 + govt co-contribution + family pension',
            applicationUrl: 'https://npscra.nsdl.co.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-016',
            name: 'Kisan Credit Card',
            description: 'Revolving credit for farmers to meet short-term credit requirements for crop cultivation, post-harvest expenses, and allied activities.',
            category: 'Agriculture',
            eligibility: { minAge: 18, maxAge: 70, maxIncome: 0, states: ['All India'], gender: 'all', occupation: 'farmer' },
            benefits: 'Credit limit based on land holding + 7% interest rate (4% after subsidy) + no collateral up to ₹1.6L',
            applicationUrl: 'https://www.nabard.org',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-017',
            name: 'Pradhan Mantri Scholarship Scheme',
            description: 'Scholarship for wards of ex-servicemen and ex-coast guard personnel for professional degree courses at ₹2,500–₹3,000/month.',
            category: 'Education',
            eligibility: { minAge: 17, maxAge: 25, maxIncome: 600000, states: ['All India'], gender: 'all' },
            benefits: 'Monthly scholarship ₹2,500 (girls) / ₹3,000 (boys) for duration of professional courses',
            applicationUrl: 'https://ksb.gov.in',
            deadline: '2026-10-31',
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-018',
            name: 'Tamil Nadu CM Insurance Scheme',
            description: 'Chief Minister\'s Comprehensive Health Insurance for families with annual income under ₹1.2 lakh. ₹5 lakh coverage at empanelled hospitals.',
            category: 'Healthcare',
            eligibility: { minAge: 0, maxAge: 99, maxIncome: 120000, states: ['Tamil Nadu'], gender: 'all' },
            benefits: '₹5 lakh health insurance at 1,000+ empanelled hospitals in TN',
            applicationUrl: 'https://www.cmchistn.com',
            deadline: null,
            state: 'Tamil Nadu',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-019',
            name: 'Kerala Smart Ration',
            description: 'Smart digitized Public Distribution System in Kerala with Aadhaar seeding, biometric authentication, and home delivery for elderly.',
            category: 'Food Security',
            eligibility: { minAge: 0, maxAge: 99, maxIncome: 120000, states: ['Kerala'], gender: 'all' },
            benefits: 'Subsidized rice ₹2/kg, wheat, sugar + home delivery for elderly/disabled',
            applicationUrl: 'https://civilsupplieskerala.gov.in',
            deadline: null,
            state: 'Kerala',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            id: 'SCH-020',
            name: 'PM SVANidhi (Street Vendors)',
            description: 'Collateral-free working capital loans of ₹10,000–₹50,000 for street vendors affected by COVID-19, with digital transaction rewards.',
            category: 'Finance',
            eligibility: { minAge: 18, maxAge: 65, maxIncome: 200000, states: ['All India'], gender: 'all' },
            benefits: 'Loans ₹10K→₹20K→₹50K + ₹1,200/year cashback on digital payments + credit score building',
            applicationUrl: 'https://pmsvanidhi.mohua.gov.in',
            deadline: null,
            state: 'All India',
            isActive: true,
            createdAt: '2026-01-01T00:00:00.000Z'
        }
    ];

    // ============================================
    // GRIEVANCES — 50 realistic grievances
    // ============================================
    const grievanceCategories = ['Water Supply', 'Infrastructure', 'Healthcare', 'Education', 'Agriculture', 'Finance', 'Housing', 'Transport', 'Electricity', 'Sanitation'];
    const states = ['Uttar Pradesh', 'Tamil Nadu', 'Maharashtra', 'Bihar', 'Rajasthan', 'West Bengal', 'Karnataka', 'Gujarat', 'Kerala', 'Punjab', 'Telangana', 'Madhya Pradesh'];
    const districts = ['Lucknow', 'Kanpur', 'Chennai', 'Coimbatore', 'Mumbai', 'Pune', 'Patna', 'Jaipur', 'Kolkata', 'Bengaluru', 'Ahmedabad', 'Thiruvananthapuram', 'Amritsar', 'Hyderabad', 'Bhopal'];
    const statuses = ['Pending', 'In Progress', 'Resolved', 'Closed', 'Escalated'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'];
    const sentimentLabels = ['Positive', 'Neutral', 'Negative', 'Highly Negative'];

    const grievanceTitles = [
        'No water supply for 3 days in our area',
        'Road full of potholes causing accidents',
        'Primary health centre has no doctor',
        'School has no teachers since 2 months',
        'Crop damaged due to flood, need compensation',
        'Bank not releasing PM Kisan installment',
        'House allotted under PMAY but no key given',
        'Bus service stopped in our village',
        'Power outage daily for 8+ hours',
        'No toilets in school, girls dropouts increasing',
        'Sewage water mixing in drinking water supply',
        'Borewell pump not working since 15 days',
        'Widow pension stopped without notice',
        'MGNREGS payments pending for 3 months',
        'Ration card denied despite being BPL',
        'Hospital charging extra for operations',
        'Teacher assaulted student, no action taken',
        'Fertilizer not available at fair price shop',
        'PMAY house construction stopped midway',
        'Street lights not working in entire ward',
        'Anganwadi closed, malnourishment rising',
        'Bridge on village road collapsed',
        'Groundwater contaminated with arsenic',
        'Corruption in NREGA job card issuance',
        'Aadhar linking issues blocking scholarship',
        'Public park occupied by encroachment',
        'Ambulance service not functional in district',
        'Students not receiving mid-day meals',
        'Electricity bill error showing 10x amount',
        'PM Kisan benefit not received since 2025',
        'Local dam not maintained, flood risk high',
        'No social security for construction workers',
        'Harassment by revenue officer for bribery',
        'Flood relief funds not reached victims',
        'Public library building in dilapidated state',
        'Animal shelter closed, stray dogs causing harm',
        'Child labour reported at brick kiln factory',
        'Old age pensioner denied pension update',
        'Subsidized seeds not available this season',
        'Water tank not cleaned for 6 months',
        'SHG loan not sanctioned despite approval',
        'Voter ID correction pending since 2 years',
        'Hospital X-ray machine non-functional',
        'Road construction funds embezzled',
        'Solar panels at school not working',
        'Local government office very corrupt',
        'Crop insurance claim rejected unfairly',
        'Late night factory noise causing health issues',
        'Child marriage happening openly in village',
        'Piped water scheme laid but never connected'
    ];

    const grievanceDescriptions = [
        'We have been without water supply for the past 3 days. The municipal tanker is not coming. Children and elderly are suffering. This is unacceptable in 2026.',
        'The main road connecting our colony to the highway has dangerous potholes. Two accidents have already happened. Please repair immediately.',
        'Our primary health centre does not have a doctor for 2 months. Patients have to travel 40km for basic treatment. People are dying due to negligence.',
        'The government school in our village has only 1 teacher for 6 classes. Children are sitting idle. Parents are withdrawing children.',
        'My kharif crop was completely destroyed by floods. I have submitted all documents but no compensation has come in 4 months. I have loan to repay.',
        'My PM Kisan installment of Rs 2000 has not come since March 2025. The bank says Aadhaar seeding is done. Please investigate.',
        'We were allotted house under PM Awas Yojana Rural scheme in 2024. Construction completed but we have not received the key. Officer is demanding bribe.',
        'The only bus route connecting our village (Rampur hamlet) to the district has been stopped for 40 days. Old people and students are badly affected.',
        'There is power outage for 8-10 hours daily in our ward. Inverters are costly. Food is getting spoiled. Please fix the transformer.',
        'The girls school in our panchayat has no toilet facility. Due to this, many parents are withdrawing their daughters. 34 girls dropped out this year.',
        'The sewage pipe is leaking directly into our drinking water supply pipe. Many families have diarrhea and typhoid. This is a health emergency.',
        'The borewell pump serving 5 villages has broken down 15 days ago. We are fetching water from 2km away. Please repair or replace the pump motor.',
        'My mother who is a widow was receiving ₹1000/month widow pension. It stopped coming from October without any intimation. Her ID and bank details are same.',
        'Wages under MGNREGS work done in June are still pending as of February. 120 workers have not been paid for 3 months of work. This is exploitation.',
        'Despite being a BPL family with annual income under ₹80,000, our ration card application has been rejected twice without valid reason given.',
        'Government hospital was charging ₹8000 for a delivery that should be free under Janani Suraksha Yojana. My wife had to pay. Please recover the money.',
        'The teacher at Govt Middle School hit my son badly and when we complained to the headmaster, he did nothing. The teacher continues to teach.',
        'DAP fertilizer is not available at any fair price shop in our mandal since October. Farmers are being forced to buy at black market price of ₹1800/bag.',
        'Housing construction under PM Awas Yojana stopped after 2nd installment. Contractor disappeared. Gram Panchayat ignoring our complaints.',
        'All 48 street lights in Ward 12 have not been working for 2 months. Crime has increased. Women feel very unsafe to go out after dark.',
        'The Anganwadi centre in Nandnagar has been closed for 3 months. 23 children aged 0-6 are not getting nutrition supplements. Malnutrition is rising.',
        'The cement bridge over the seasonal river collapsed during monsoon. 4 villages are now cut off. Farmers cannot bring produce to market.',
        'Well water in our basti has turned yellow and smells bad. 3 children have skin rashes. We suspect industrial effluent contamination.',
        'The local NREGA supervisor is forcing people to pay ₹200 bribe to get job cards issued. Poor villagers have no choice but to pay.',
        'My son\'s scholarship payment is blocked because Aadhaar linking to the scholarship portal is failing. He may drop out if fees are not paid.',
        'The public park in Sector 4 has been taken over by a builder for construction. No notice was given. This was the only green space for our children.',
        'The district ambulance service phone goes unanswered. We lost a neighbour because no ambulance came for 2 hours. This must be fixed urgently.',
        'Mid-day meal has not been served in Government Primary School for 3 weeks. Children are going hungry. We suspect corruption in supply chain.',
        'My electricity bill shows ₹45,000 for a house where only 3 bulbs and one fan run. BESCOM helpline keeps disconnecting. Please look into this.',
        'PM Kisan benefit has not been received since April 2025 installment. Other farmers in the same village received but mine is stuck.',
        'The local dam embankment has 3 large cracks. Engineers visited last year and filed reports but no repair work started. Monsoon is approaching.',
        'Construction labourers at our site have no BOCW registration, no PF, no accident insurance. The contractor is exploiting them under contract.',
        'The revenue officer at the tehsil office is asking ₹3000 bribe for mutation entries. I recorded the conversation. Please take action against him.',
        'Flood relief compensation of ₹6,000 per household announced by state govt has not reached any of the 300 flood-affected families in our village.',
        'The district public library building is in dangerous condition. Roof is leaking, walls have cracks. Students are afraid to enter but have no other option.',
        'Stray dog menace has increased after the shelter closed. 12 people bitten in the last 2 months. One child needed 14 injections.',
        'Child labour is openly happening at the brick kiln outside the village. I have reported to the police twice but they have done nothing.',
        'My father (78 years) is a registered beneficiary of Old Age Pension but his amount has not been updated since 2019 despite 2 applications.',
        'Subsidy seeds under PM Kisan scheme not available at the cooperative society this rabi season. Farmers forced to buy from private shops at double price.',
        'The overhead water tank serving our locality has not been cleaned for 6 months. Water is visibly dirty and smells. This is a health hazard.',
        'Our women SHG was sanctioned a loan of ₹2 lakh by the District Cooperative Bank 8 months ago. Bank is delaying disbursement on some pretext.',
        'My voter ID has wrong date of birth since 2 years. I have submitted Form 8 twice at the booth level officer. Still not corrected.',
        'The X-ray machine at District Government Hospital has been non-functional for 4 months. Patients are being referred to private labs at high cost.',
        'Road construction contractor diverted funds. Work done only 20% but 80% payment released. All villagers know this. Please investigate.',
        'Solar panels installed at the government school 2 years ago are not working. No maintenance has been done. Wires hanging loose dangerously.',
        'The taluk office is highly corrupt. Mid-level officers demand money for every service. Even for signature on applications, ₹100-500 demanded.',
        'Crop insurance claim was filed for pest-damaged paddy. The surveyor came but the final claim was rejected citing wrong land survey number.',
        'Factory near our residential area runs machinery and generators at night. Noise levels are 80+ decibels. Residents have headaches and sleep issues.',
        'Child marriage happens openly in our village. I know of 2 cases this year. Local police and gram panchayat turn a blind eye.',
        'Jal Jeevan Mission pipeline was laid 2 years ago. Valves installed. But connections never given to houses. Water never came through the pipe.'
    ];

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

        return {
            id: `GRV-${String(i + 1).padStart(3, '0')}`,
            userId: i === 0 ? 'USR-CIT-001' : i === 1 ? 'USR-CIT-002' : i === 2 ? 'USR-CIT-003' : 'USR-CIT-001',
            citizenName: i % 4 === 0 ? 'Ramesh Kumar' : i % 4 === 1 ? 'Priya Nair' : i % 4 === 2 ? 'Suresh Patel' : 'Ananya Sharma',
            title,
            description: grievanceDescriptions[i] || `Detailed grievance report regarding ${title.toLowerCase()} in ${state}.`,
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
            adminNote: status === 'Resolved' ? 'Issue reviewed and resolved by the concerned department.' : null,
            createdAt: createdDate.toISOString(),
            updatedAt: updatedDate.toISOString(),
            resolvedAt: resolvedDate ? resolvedDate.toISOString() : null
        };
    });

    // ============================================
    // PRESEVA ALERTS
    // ============================================
    const preSevaAlerts = [
        {
            id: 'PRESEVA-001',
            type: 'spike_predicted',
            state: 'Bihar',
            district: 'Patna',
            category: 'Flooding',
            title: 'Predicted Flood Grievance Spike',
            probability: 87,
            daysUntil: 4,
            predictedDate: '2026-03-05',
            urgency: 'critical',
            historicalPattern: 'Pattern detected in 2024 and 2025 during similar pre-monsoon showers.',
            basisGrievances: 1240,
            suggestedAction: 'Clear drainages in Ward 4, 7, and 12 immediately.',
            departmentAlerted: 'Water & Sanitation',
            alertSentAt: '2026-02-28 10:00 AM',
            description: 'AI model predicts 85%+ probability of flood-related grievance surge in next 14 days based on IMD data and historical patterns.',
            status: 'Department Notified',
            prevented: false,
            createdAt: '2026-02-20T00:00:00.000Z'
        },
        {
            id: 'PRESEVA-002',
            type: 'crop_distress',
            state: 'Rajasthan',
            district: 'Jaisalmer',
            category: 'Agriculture',
            title: 'Drought Pattern Detected',
            probability: 79,
            daysUntil: 12,
            predictedDate: '2026-03-15',
            urgency: 'high',
            historicalPattern: '300% grievance increase in this corridor during similar weather conditions.',
            basisGrievances: 850,
            suggestedAction: 'Release canal water for agricultural use and notify farmers.',
            departmentAlerted: 'Agriculture',
            alertSentAt: '2026-02-28 11:30 AM',
            description: 'Unusual drought pattern detected. Historical data shows 300% grievance increase in this corridor during similar weather conditions.',
            status: 'Department Notified',
            prevented: false,
            createdAt: '2026-02-22T00:00:00.000Z'
        },
        {
            id: 'PRESEVA-003',
            type: 'health_outbreak',
            state: 'West Bengal',
            district: 'Kolkata',
            category: 'Healthcare',
            title: 'Potential Dengue Outbreak',
            probability: 72,
            daysUntil: 7,
            predictedDate: '2026-03-08',
            urgency: 'high',
            historicalPattern: 'Vector disease pattern detected from health complaints.',
            basisGrievances: 2100,
            suggestedAction: 'Start intensive fogging and cleaning of stagnant water.',
            departmentAlerted: 'Healthcare',
            alertSentAt: '2026-02-28 09:15 AM',
            description: 'Vector disease pattern detected from health complaints. Dengue or malaria outbreak probability high in next 7-10 days.',
            status: 'Department Notified',
            prevented: false,
            createdAt: '2026-02-24T00:00:00.000Z'
        },
        {
            id: 'PRESEVA-004',
            type: 'infrastructure_failure',
            state: 'Uttar Pradesh',
            district: 'Kanpur',
            category: 'Infrastructure',
            title: 'Road Surface Deterioration',
            probability: 68,
            daysUntil: 2,
            predictedDate: '2026-03-03',
            urgency: 'medium',
            historicalPattern: 'Multiple bridge and road complaints in same corridor.',
            basisGrievances: 450,
            suggestedAction: 'Emergency road patching in the industrial zone.',
            departmentAlerted: 'Infrastructure',
            alertSentAt: '2026-02-28 02:45 PM',
            description: 'Multiple bridge and road complaints in same corridor. Systemic infrastructure failure predicted without intervention.',
            status: 'Department Notified',
            prevented: false,
            createdAt: '2026-02-25T00:00:00.000Z'
        }
    ];

    // ============================================
    // COMMUNITY POSTS
    // ============================================
    const communityPosts = [
        {
            id: 'POST-001',
            userId: 'USR-CIT-001',
            authorName: 'Ramesh Kumar',
            title: 'Online petition: Fix water supply in Lucknow East before summer',
            content: 'Summer is coming and water supply is already unreliable. Sign this petition to demand daily 6-hour supply for all wards in Lucknow East.',
            category: 'Water Supply',
            state: 'Uttar Pradesh',
            votes: 1247,
            voters: ['USR-CIT-001'],
            isPetition: true,
            petitionCount: 4821,
            signers: ['USR-CIT-001'],
            targetSignatures: 5000,
            status: 'active',
            responses: [],
            createdAt: '2026-02-15T00:00:00.000Z'
        },
        {
            id: 'POST-002',
            userId: 'USR-CIT-002',
            authorName: 'Priya Nair',
            title: 'How I got my PM Kisan payment issue resolved in 3 days',
            content: 'Sharing my experience so others can benefit. File your complaint with the block-level agricultural officer directly, not the call centre.',
            category: 'Finance',
            state: 'Kerala',
            votes: 892,
            voters: ['USR-CIT-002'],
            isPetition: false,
            petitionCount: 0,
            signers: [],
            responses: [{ id: 'RESP-001', userId: 'USR-CIT-003', authorName: 'Suresh Patel', content: 'Thank you for sharing! This worked for me too.', createdAt: '2026-02-16T00:00:00.000Z' }],
            createdAt: '2026-02-14T00:00:00.000Z'
        },
        {
            id: 'PET-001',
            userId: 'USR-CIT-003',
            authorName: 'Suresh Patel',
            title: 'Demand: Open a PHC in Ahmedabad East — 50,000 residents have no primary healthcare',
            content: 'Ward 14 of Ahmedabad East has a population of 50,000 but no Primary Health Centre within 10km. People are paying private hospital prices for basic healthcare. We demand the government open a PHC here immediately.',
            category: 'Healthcare',
            state: 'Gujarat',
            votes: 512,
            voters: ['USR-CIT-003'],
            isPetition: true,
            petitionCount: 3412,
            signers: ['USR-CIT-003'],
            targetSignatures: 5000,
            status: 'active',
            responses: [],
            createdAt: '2026-02-20T00:00:00.000Z'
        },
        {
            id: 'PET-002',
            userId: 'USR-CIT-002',
            authorName: 'Priya Nair',
            title: 'Petition: Restore KSRTC bus routes to Wayanad tribal hamlets',
            content: 'KSRTC discontinued routes to 12 tribal hamlets in Wayanad in January 2026, citing low occupancy. These communities have no other transport. Children cannot reach school, patients cannot reach hospitals. We demand immediate restoration.',
            category: 'Transport',
            state: 'Kerala',
            votes: 2109,
            voters: ['USR-CIT-002'],
            isPetition: true,
            petitionCount: 8200,
            signers: ['USR-CIT-002'],
            targetSignatures: 10000,
            status: 'active',
            responses: [],
            createdAt: '2026-02-10T00:00:00.000Z'
        },
        {
            id: 'POST-003',
            userId: 'USR-CIT-001',
            authorName: 'Ramesh Kumar',
            title: 'Tip: How to track your MGNREGS wage payment status online',
            content: 'Step 1: Go to nrega.nic.in. Step 2: Select your state. Step 3: Enter your Job Card number. Step 4: Click "Payment Transaction Details". Works without any login. Hope this helps fellow workers.',
            category: 'Employment',
            state: 'Uttar Pradesh',
            votes: 345,
            voters: ['USR-CIT-001'],
            isPetition: false,
            petitionCount: 0,
            signers: [],
            responses: [],
            createdAt: '2026-02-25T00:00:00.000Z'
        }
    ];

    // Write all data to database
    const db_final = db.getDb();

    [...users, ...officers].forEach(u => {
        db_final.get('users').push(u).write();
    });

    schemes.forEach(s => db_final.get('schemes').push(s).write());
    grievances.forEach(g => db_final.get('grievances').push(g).write());
    preSevaAlerts.forEach(a => db_final.get('preSevaAlerts').push(a).write());
    communityPosts.forEach(p => db_final.get('communityPosts').push(p).write());

    console.log('[SEED] ✅ Database seeded successfully!');
    console.log(`[SEED] → ${users.length + officers.length} users (${users.filter(u => u.role === 'admin').length} admin, ${users.filter(u => u.role === 'citizen').length} citizens, ${officers.length} officers)`);
    console.log(`[SEED] → ${schemes.length} government schemes`);
    console.log(`[SEED] → ${grievances.length} grievances`);
    console.log(`[SEED] → ${preSevaAlerts.length} PreSeva alerts`);
    console.log(`[SEED] → ${communityPosts.length} community posts`);
};

module.exports = { seed };

// Allow direct execution: node db/seed.js [--force]
if (require.main === module) {
    const force = process.argv.includes('--force');
    seed(force).then(() => process.exit(0)).catch(err => {
        console.error('[SEED] ❌ Seeding failed:', err.message);
        process.exit(1);
    });
}
