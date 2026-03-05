# Manual Testing Guide - Project-77

## Backend Status
✅ **Backend is running on http://localhost:5001**  
✅ **All 39+ APIs are functional**  
✅ **Groups 1-5 fully integrated**

## Quick Start Testing

### 1. Test Backend Health
```bash
curl http://localhost:5001/api/health
```
Expected: Success response with server info

### 2. Account Creation & Login

#### Create Citizen Account
- **Endpoint**: POST `/api/auth/register`
- **Body**:
```json
{
  "name": "Test Citizen",
  "email": "test@test.com",
  "password": "test123",
  "state": "Uttar Pradesh",
  "district": "Lucknow",
  "age": 30,
  "income": 200000
}
```

#### Login as Citizen
- **Endpoint**: POST `/api/auth/login`
- **Body**:
```json
{
  "email": "test@test.com",
  "password": "test123"
}
```

#### Login as Admin (Demo Account)
- **Email**: admin@gov.in
- **Password**: admin123

#### Login as Existing Citizen (Demo Account)
- **Email**: ramesh@gmail.com
- **Password**: ramesh123

### 3. Core Features Testing

#### File a Grievance
- **Endpoint**: POST `/api/grievance/file`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "title": "Water Supply Issue",
  "description": "No water supply in my area for 3 days",
  "category": "Water Supply",
  "priority": "High",
  "state": "Uttar Pradesh",
  "district": "Lucknow"
}
```

#### Get Available Schemes
- **Endpoint**: GET `/api/schemes`
- **Headers**: `Authorization: Bearer <token>`

#### Get Matched Schemes (Personalized)
- **Endpoint**: GET `/api/schemes/recommend`
- **Headers**: `Authorization: Bearer <token>`

### 4. Group 3 Features Testing

#### AI Chatbot
- **Endpoint**: POST `/api/chatbot/message`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "message": "How do I apply for PM Kisan Samman?",
  "lang": "en"
}
```

#### Translation
- **Endpoint**: POST `/api/translate`
- **Body**:
```json
{
  "text": "Hello, how are you?",
  "targetLang": "hi"
}
```

#### Community Posts
- **Get Posts**: GET `/api/community/posts`
- **Create Post**: POST `/api/community/posts`
- **Vote on Post**: POST `/api/community/posts/:id/vote`

### 5. Group 4 & 5 Features Testing

#### Jan Shakti Score
- **Endpoint**: GET `/api/citizen/score`
- **Headers**: `Authorization: Bearer <token>`

#### Citizen Footprint (Activity Timeline)
- **Endpoint**: GET `/api/citizen/footprint`
- **Headers**: `Authorization: Bearer <token>`

#### AI Future Predictions
- **Endpoint**: GET `/api/citizen/predict-future`
- **Headers**: `Authorization: Bearer <token>`

#### Seva News Feed
- **Endpoint**: GET `/api/citizen/news`
- **Headers**: `Authorization: Bearer <token>`

#### Digital Budget Escrow
- **Get Projects**: GET `/api/citizen/escrow`
- **Verify Project**: POST `/api/citizen/escrow/:id/verify`
- **Admin View**: GET `/api/admin/escrow`

#### Officer Accountability Wall
- **Endpoint**: GET `/api/admin/officers/wall`
- **Headers**: `Authorization: Bearer <token>`

#### AI Ghost Audits
- **Endpoint**: GET `/api/admin/ghost-audits`
- **Headers**: `Authorization: Bearer <token>`

### 6. Admin Features Testing

#### Admin Dashboard
- **Endpoint**: GET `/api/admin/dashboard`
- **Headers**: `Authorization: Bearer <token>`

#### Manage Grievances
- **Get All**: GET `/api/admin/grievances`
- **Update**: PATCH `/api/grievance/update/:id`

#### Officer Leaderboard
- **Endpoint**: GET `/api/admin/officers/leaderboard`
- **Headers**: `Authorization: Bearer <token>`

#### SLA Tracking
- **Endpoint**: GET `/api/admin/sla-tracker`
- **Headers**: `Authorization: Bearer <token>`

#### Fraud Detection
- **Endpoint**: GET `/api/admin/fraud-alerts`
- **Headers**: `Authorization: Bearer <token>`

## Frontend Testing

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:5173

### Test Flow
1. **Registration Page**: Create new citizen account
2. **Login Page**: Use created credentials or demo accounts
3. **Citizen Dashboard**: 
   - View Jan Shakti Score
   - Check activity footprint
   - See AI predictions
   - Browse Seva News
4. **File Grievance**: Submit new complaint
5. **Browse Schemes**: View and filter government schemes
6. **Community**: Participate in discussions and petitions
7. **Admin Dashboard** (if admin login):
   - View analytics
   - Manage grievances
   - Check officer performance
   - Review escrow projects
   - Monitor ghost audits

## Important Notes

### Authentication
- All protected endpoints require `Authorization: Bearer <token>` header
- Token is returned in login response and stored in localStorage
- Frontend automatically handles token injection

### Error Handling
- All APIs return consistent format:
```json
{
  "success": true/false,
  "data": {...},
  "message": "Description",
  "timestamp": "2026-03-05T..."
}
```

### Database
- Uses LowDB with file-based storage
- Auto-seeded with demo data on first run
- Data persists between server restarts

### Port Configuration
- Backend: http://localhost:5001 (changed from 5000 due to port conflict)
- Frontend: http://localhost:5173
- API calls configured to use port 5001

## Troubleshooting

### Backend Issues
- Check if port 5001 is free
- Verify node_modules are installed: `npm install`
- Check .env file exists with proper configuration

### Frontend Issues
- Clear browser cache and localStorage
- Check console for API errors
- Verify backend is running on port 5001

### Authentication Issues
- Use demo accounts for quick testing
- Clear localStorage to reset authentication
- Verify token is being sent in API headers

## Success Indicators
✅ Backend starts without errors  
✅ All API endpoints return responses  
✅ Frontend loads and can make API calls  
✅ User registration and login work  
✅ Grievances can be filed and tracked  
✅ Schemes are displayed and searchable  
✅ Admin dashboard shows analytics  
✅ Group 4 & 5 features are accessible  

Happy Testing! 🇮🇳
