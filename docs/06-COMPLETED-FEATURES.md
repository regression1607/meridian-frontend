# Meridian EMS - Frontend Completed Features

## Quick Start

```bash
cd meridian-frontend
npm run dev
# Frontend runs on http://localhost:3001
```

---

## Demo Accounts for Testing

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Institution Admin | `principal@demo.meridian-ems.com` | `Principal@123` | Full dashboard access |
| Teacher | `teacher@demo.meridian-ems.com` | `Teacher@123` | Teaching features |
| Student | `student@demo.meridian-ems.com` | `Student@123` | Student portal |
| Parent | `parent@demo.meridian-ems.com` | `Parent@123` | Parent portal |

---

## Completed Pages

### Public Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing Page | `/` | Marketing homepage with features |
| Login | `/login` | Authentication page |
| Privacy Policy | `/privacy` | Legal page |
| Terms of Service | `/terms` | Legal page |
| Contact Us | `/contact` | Contact form |
| About Us | `/about` | Company info |

### Dashboard Pages

| Page | Route | Roles | Status |
|------|-------|-------|--------|
| Dashboard Home | `/dashboard` | All | ✅ Real API data |
| User Management | `/dashboard/users` | Admin | ✅ Real API data |
| Add User | `/dashboard/users/new` | Admin | ✅ Connected to API |
| Attendance | `/dashboard/attendance` | Admin, Teacher | ✅ Connected to API |
| Fee Management | `/dashboard/fees` | Admin, Staff | ✅ Connected to API |
| Profile | `/dashboard/profile` | All | ✅ Working |
| Settings | `/dashboard/settings` | Admin | ✅ Working |
| Teacher Dashboard | `/dashboard/teacher` | Teacher | ✅ UI only |
| Student Dashboard | `/dashboard/student` | Student | ✅ UI only |
| Parent Dashboard | `/dashboard/parent` | Parent | ✅ UI only |

---

## Components Connected to Backend

### Dashboard Home (`/dashboard`)
- ✅ Welcome message with user's name
- ✅ Institution name display
- ✅ Total Students count (real)
- ✅ Total Teachers count (real)
- ✅ Total Parents count (real)
- ✅ Total Users count (real)
- ✅ Recent activity (new students/teachers in last 7 days)

### User Management (`/dashboard/users`)
- ✅ User list with pagination
- ✅ Search by name/email
- ✅ Filter by role
- ✅ Stats (total users, students, teachers, parents)
- ✅ Loading states

### Add User (`/dashboard/users/new`)
- ✅ Role selection
- ✅ Basic info form (name, email, phone)
- ✅ Password generation
- ✅ Role-specific fields (teacher/student/staff)
- ✅ Address form
- ✅ Connected to POST `/api/v1/users`

### Attendance (`/dashboard/attendance`)
- ✅ Date selector with navigation
- ✅ Class/Section selector
- ✅ Student list with attendance status
- ✅ Quick actions (Mark all present/absent)
- ✅ Status buttons (Present, Absent, Late, Half Day, Leave)
- ✅ Save attendance (bulk API)
- ✅ Stats display (total, present, absent, percentage)

### Fee Management (`/dashboard/fees`)
- ✅ Fee statistics (collected, pending, overdue)
- ✅ Payments list with filters
- ✅ Search by student/receipt
- ✅ Status filter
- ✅ Payment details display

### Dashboard Charts
- ✅ Attendance Chart - fetches real stats from `/api/v1/attendance/stats`
- ✅ Fee Collection Chart - fetches real stats from `/api/v1/fees/stats`

---

## Authentication Flow

### Login Process
1. User enters email/password on `/login`
2. Frontend calls `POST /api/v1/auth/login`
3. On success, stores `accessToken` and `refreshToken` in localStorage
4. Redirects to `/dashboard`
5. `AuthContext` manages user state globally

### Session Check
1. On app load, `AuthContext.checkAuth()` runs
2. Calls `GET /api/v1/auth/me` with stored token
3. If valid, sets user state
4. If invalid, clears storage and redirects to login

### Logout
1. Calls `POST /api/v1/auth/logout`
2. Clears localStorage
3. Redirects to `/login`

---

## Role-Based Access

### Route Protection
```jsx
<ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
  <Component />
</ProtectedRoute>
```

### Sidebar Menu Visibility
Each menu item has `roles` array that controls visibility:
```javascript
{
  title: 'User Management',
  roles: ['super_admin', 'admin', 'institution_admin'],
  ...
}
```

### Available Roles
- `super_admin` - Platform owner
- `admin` - Platform administrator
- `institution_admin` - School/college admin
- `coordinator` - Academic coordinator
- `teacher` - Teaching staff
- `student` - Student
- `parent` - Parent/Guardian
- `staff` - Administrative staff

---

## Context & State Management

### AuthContext (`src/context/AuthContext.jsx`)
```javascript
const { 
  user,           // Current user object
  loading,        // Auth loading state
  login,          // Login function
  logout,         // Logout function
  isAuthenticated,// Boolean
  isAdmin,        // Check admin roles
  isPlatformAdmin,// Check super_admin/admin
  hasRole,        // Check specific role
  hasMinRole      // Check minimum role level
} = useAuth()
```

---

## API Service (`src/services/api.js`)

Base URL: `http://localhost:5000/api/v1`

### Usage Pattern
```javascript
const token = localStorage.getItem('meridian_token')
const response = await fetch(`${API_BASE_URL}/endpoint`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## UI Components

### Loading Components (`src/components/ui/Loading.jsx`)
- `PageLoader` - Full page loader
- `Spinner` - Inline spinner
- `ButtonLoader` - Button loading state
- `Skeleton` - Content placeholder
- `TableSkeleton` - Table loading state
- `StatsSkeleton` - Stats cards loading
- `CardSkeleton` - Card loading state

### Layout Components
- `DashboardLayout` - Main dashboard wrapper
- `Sidebar` - Navigation sidebar with role-based menu
- `Header` - Top header with user menu

---

## Testing Checklist

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error message)
- [ ] Logout functionality
- [ ] Session persistence on page refresh
- [ ] Protected route redirect when not logged in

### Dashboard
- [ ] Stats display correct counts
- [ ] Welcome message shows user name
- [ ] Institution name displays
- [ ] Charts load without errors

### User Management
- [ ] Users list loads
- [ ] Pagination works
- [ ] Search filters users
- [ ] Role filter works
- [ ] Add User form submits

### Attendance
- [ ] Class selector populates
- [ ] Students list loads for class
- [ ] Mark attendance buttons work
- [ ] Save attendance works
- [ ] Stats update after save

### Fees
- [ ] Fee stats display
- [ ] Payments list loads
- [ ] Search and filter work

---

## Pending Frontend Work

- [ ] User edit/view pages
- [ ] Class management pages
- [ ] Homework module
- [ ] Exam results pages
- [ ] Library module
- [ ] Transport module
- [ ] Events module
- [ ] Notifications
- [ ] Settings pages
- [ ] Reports/Analytics
- [ ] AI Assistant integration
- [ ] Responsive mobile optimization
- [ ] Dark mode
- [ ] i18n translations
