const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('./database');

async function patchDb() {
    const db_instance = db.getDb();

    // Check if empty, then add
    const currentNews = db_instance.get('sevaNews').value() || [];
    if (currentNews.length === 0) {
        db_instance.set('sevaNews', [
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
            }
        ]).write();
    }

    const currentEscrow = db_instance.get('escrowProjects').value() || [];
    if (currentEscrow.length === 0) {
        db_instance.set('escrowProjects', [
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
        ]).write();
    }

    const currentGhost = db_instance.get('ghostAuditAlerts').value() || [];
    if (currentGhost.length === 0) {
        db_instance.set('ghostAuditAlerts', [
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
        ]).write();
    }
    console.log('✅ Patched new data into DB!');
}

patchDb();
