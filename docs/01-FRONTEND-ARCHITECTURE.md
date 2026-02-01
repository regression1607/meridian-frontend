# Meridian EMS Frontend - Architecture Documentation

## 📋 Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [State Management](#state-management)
4. [Routing Strategy](#routing-strategy)
5. [Component Architecture](#component-architecture)
6. [API Integration](#api-integration)
7. [Authentication Flow](#authentication-flow)

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Library |
| Vite | 5.x | Build Tool & Dev Server |
| TypeScript | 5.x | Type Safety |
| React Router | 6.x | Client-side Routing |
| Redux Toolkit | 2.x | State Management |
| RTK Query | 2.x | API Data Fetching |
| TailwindCSS | 3.x | Utility-first CSS |
| shadcn/ui | latest | UI Component Library |
| React Hook Form | 7.x | Form Management |
| Zod | 3.x | Schema Validation |
| Axios | 1.x | HTTP Client |
| Socket.io Client | 4.x | Real-time Communication |
| Chart.js / Recharts | latest | Data Visualization |
| Lucide React | latest | Icons |
| date-fns | 2.x | Date Utilities |
| **Framer Motion** | 10.x | **Animations (Landing Page)** |
| **GSAP** | 3.x | **Advanced Animations** |
| **react-big-calendar** | latest | **Calendar Component** |
| **@fullcalendar/react** | 6.x | **Alternative Calendar** |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code Linting |
| Prettier | Code Formatting |
| Vitest | Unit Testing |
| Playwright | E2E Testing |
| Storybook | Component Documentation |

---

## Project Structure

```
Meridian EMS-frontend/
│
├── docs/                              # Documentation
│   ├── 01-FRONTEND-ARCHITECTURE.md
│   ├── 02-UI-UX-GUIDELINES.md
│   └── 03-COMPONENT-LIBRARY.md
│
├── public/                            # Static assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── manifest.json
│
├── src/
│   ├── assets/                        # Images, fonts, etc.
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   ├── components/                    # Reusable components
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── common/                    # Shared components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Notification.tsx
│   │   │   └── Calendar/                # Calendar components
│   │   │       ├── CalendarView.tsx     # Main calendar
│   │   │       ├── AttendanceCalendar.tsx
│   │   │       ├── HolidayCalendar.tsx
│   │   │       └── EventCalendar.tsx
│   │   │
│   │   ├── forms/                     # Form components
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   ├── FormTextarea.tsx
│   │   │   ├── FormDatePicker.tsx
│   │   │   ├── FormFileUpload.tsx
│   │   │   └── FormWrapper.tsx
│   │   │
│   │   ├── data-display/              # Data display components
│   │   │   ├── DataTable.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── Chart.tsx
│   │   │   ├── Timeline.tsx
│   │   │   └── Calendar.tsx
│   │   │
│   │   └── layouts/                   # Layout components
│   │       ├── MainLayout.tsx
│   │       ├── AuthLayout.tsx
│   │       ├── DashboardLayout.tsx
│   │       └── PublicLayout.tsx
│   │
│   ├── features/                      # Feature modules
│   │   ├── landing/                   # PUBLIC LANDING PAGE (Best Animations!)
│   │   │   ├── components/
│   │   │   │   ├── Hero.tsx           # Animated hero section
│   │   │   │   ├── Features.tsx       # Feature showcase with animations
│   │   │   │   ├── Pricing.tsx        # Pricing plans
│   │   │   │   ├── Testimonials.tsx   # Client testimonials
│   │   │   │   ├── Stats.tsx          # Animated statistics
│   │   │   │   ├── FAQ.tsx            # Frequently asked questions
│   │   │   │   ├── CTA.tsx            # Call-to-action sections
│   │   │   │   ├── Navbar.tsx         # Landing page navbar
│   │   │   │   └── Footer.tsx         # Landing page footer
│   │   │   ├── pages/
│   │   │   │   └── LandingPage.tsx    # Main landing page
│   │   │   └── animations/
│   │   │       ├── fadeIn.ts          # Framer Motion variants
│   │   │       ├── slideUp.ts
│   │   │       └── stagger.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── ResetPasswordForm.tsx
│   │   │   │   └── ChangePasswordForm.tsx  # First login password change
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   └── ChangePasswordPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── authApi.ts
│   │   │   └── authSlice.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── RecentActivity.tsx
│   │   │   │   ├── UpcomingEvents.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   └── AIInsights.tsx
│   │   │   ├── pages/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── TeacherDashboard.tsx
│   │   │   │   ├── StudentDashboard.tsx
│   │   │   │   └── ParentDashboard.tsx
│   │   │   └── dashboardSlice.ts
│   │   │
│   │   ├── users/
│   │   │   ├── components/
│   │   │   │   ├── UserList.tsx
│   │   │   │   ├── UserCard.tsx
│   │   │   │   ├── UserForm.tsx
│   │   │   │   ├── UserProfile.tsx
│   │   │   │   ├── TeacherForm.tsx
│   │   │   │   ├── StudentForm.tsx
│   │   │   │   └── BulkImport.tsx
│   │   │   ├── pages/
│   │   │   │   ├── UsersListPage.tsx
│   │   │   │   ├── UserDetailPage.tsx
│   │   │   │   ├── CreateUserPage.tsx
│   │   │   │   ├── TeachersPage.tsx
│   │   │   │   ├── StudentsPage.tsx
│   │   │   │   └── ProfilePage.tsx
│   │   │   ├── services/
│   │   │   │   └── usersApi.ts
│   │   │   └── usersSlice.ts
│   │   │
│   │   ├── classes/
│   │   │   ├── components/
│   │   │   │   ├── ClassList.tsx
│   │   │   │   ├── ClassCard.tsx
│   │   │   │   ├── ClassForm.tsx
│   │   │   │   ├── SectionList.tsx
│   │   │   │   └── SectionForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── ClassesPage.tsx
│   │   │   │   ├── ClassDetailPage.tsx
│   │   │   │   └── SectionsPage.tsx
│   │   │   └── classesSlice.ts
│   │   │
│   │   ├── subjects/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── subjectsSlice.ts
│   │   │
│   │   ├── homework/
│   │   │   ├── components/
│   │   │   │   ├── HomeworkList.tsx
│   │   │   │   ├── HomeworkCard.tsx
│   │   │   │   ├── HomeworkForm.tsx
│   │   │   │   ├── HomeworkDetail.tsx
│   │   │   │   ├── SubmissionForm.tsx
│   │   │   │   ├── SubmissionsList.tsx
│   │   │   │   ├── GradingPanel.tsx
│   │   │   │   └── AIGradingResult.tsx
│   │   │   ├── pages/
│   │   │   │   ├── HomeworkListPage.tsx
│   │   │   │   ├── HomeworkDetailPage.tsx
│   │   │   │   ├── CreateHomeworkPage.tsx
│   │   │   │   ├── SubmitHomeworkPage.tsx
│   │   │   │   └── GradeSubmissionsPage.tsx
│   │   │   └── homeworkSlice.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── components/
│   │   │   │   ├── AttendanceSheet.tsx
│   │   │   │   ├── AttendanceCalendar.tsx
│   │   │   │   ├── AttendanceStats.tsx
│   │   │   │   └── StudentAttendance.tsx
│   │   │   ├── pages/
│   │   │   │   ├── MarkAttendancePage.tsx
│   │   │   │   ├── AttendanceReportPage.tsx
│   │   │   │   └── MyAttendancePage.tsx
│   │   │   └── attendanceSlice.ts
│   │   │
│   │   ├── exams/
│   │   │   ├── components/
│   │   │   │   ├── ExamList.tsx
│   │   │   │   ├── ExamForm.tsx
│   │   │   │   ├── ExamSchedule.tsx
│   │   │   │   ├── GradeEntry.tsx
│   │   │   │   └── ReportCard.tsx
│   │   │   ├── pages/
│   │   │   │   ├── ExamsPage.tsx
│   │   │   │   ├── CreateExamPage.tsx
│   │   │   │   ├── GradesPage.tsx
│   │   │   │   └── ReportCardPage.tsx
│   │   │   └── examsSlice.ts
│   │   │
│   │   ├── timetable/
│   │   │   ├── components/
│   │   │   │   ├── TimetableGrid.tsx
│   │   │   │   ├── TimetableForm.tsx
│   │   │   │   └── AIScheduler.tsx
│   │   │   ├── pages/
│   │   │   │   ├── TimetablePage.tsx
│   │   │   │   └── CreateTimetablePage.tsx
│   │   │   └── timetableSlice.ts
│   │   │
│   │   ├── announcements/
│   │   │   ├── components/
│   │   │   │   ├── AnnouncementList.tsx
│   │   │   │   ├── AnnouncementCard.tsx
│   │   │   │   └── AnnouncementForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── AnnouncementsPage.tsx
│   │   │   │   └── CreateAnnouncementPage.tsx
│   │   │   └── announcementsSlice.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   ├── NotificationList.tsx
│   │   │   │   └── NotificationItem.tsx
│   │   │   └── notificationsSlice.ts
│   │   │
│   │   ├── calendar/                  # CALENDAR & LEAVE MANAGEMENT
│   │   │   ├── components/
│   │   │   │   ├── MainCalendar.tsx   # Full calendar view
│   │   │   │   ├── AttendanceView.tsx # Attendance in calendar format
│   │   │   │   ├── HolidayList.tsx    # Holiday listing
│   │   │   │   ├── LeaveRequestForm.tsx # Apply for leave
│   │   │   │   ├── LeaveRequestCard.tsx
│   │   │   │   ├── LeaveApproval.tsx  # Admin approval interface
│   │   │   │   └── EventModal.tsx     # Event details popup
│   │   │   ├── pages/
│   │   │   │   ├── CalendarPage.tsx   # Main calendar view
│   │   │   │   ├── HolidaysPage.tsx   # Institution holidays
│   │   │   │   ├── ApplyLeavePage.tsx # Leave application
│   │   │   │   ├── MyLeavesPage.tsx   # View my leave requests
│   │   │   │   └── LeaveApprovalsPage.tsx # Admin: approve leaves
│   │   │   ├── services/
│   │   │   │   ├── calendarApi.ts
│   │   │   │   ├── holidayApi.ts
│   │   │   │   └── leaveApi.ts
│   │   │   └── calendarSlice.ts
│   │   │
│   │   ├── questionPaper/             # AI QUESTION PAPER GENERATION
│   │   │   ├── components/
│   │   │   │   ├── TopicSelector.tsx  # Select topics for generation
│   │   │   │   ├── PaperConfig.tsx    # Configure paper settings
│   │   │   │   ├── PDFUploader.tsx    # Upload previous papers
│   │   │   │   ├── ExtractedPreview.tsx # Preview extracted content
│   │   │   │   ├── QuestionEditor.tsx # Edit generated questions
│   │   │   │   ├── PaperPreview.tsx   # Final paper preview
│   │   │   │   └── AnswerKeyView.tsx  # Answer key display
│   │   │   ├── pages/
│   │   │   │   ├── GeneratePaperPage.tsx
│   │   │   │   ├── MyPapersPage.tsx   # List of created papers
│   │   │   │   └── PaperDetailPage.tsx
│   │   │   └── questionPaperSlice.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── components/
│   │   │   │   ├── AIChatbot.tsx
│   │   │   │   ├── AIAnalytics.tsx
│   │   │   │   ├── AIGradingPanel.tsx
│   │   │   │   ├── QuestionGenerator.tsx
│   │   │   │   ├── PlagiarismReport.tsx
│   │   │   │   └── StudentInsights.tsx
│   │   │   ├── pages/
│   │   │   │   ├── AIAssistantPage.tsx
│   │   │   │   └── AIAnalyticsPage.tsx
│   │   │   └── aiSlice.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── components/
│   │   │   │   ├── ReportFilters.tsx
│   │   │   │   ├── AttendanceReport.tsx
│   │   │   │   ├── AcademicReport.tsx
│   │   │   │   └── ExportOptions.tsx
│   │   │   └── pages/
│   │   │       └── ReportsPage.tsx
│   │   │
│   │   └── settings/
│   │       ├── components/
│   │       │   ├── ProfileSettings.tsx
│   │       │   ├── InstitutionSettings.tsx
│   │       │   ├── NotificationSettings.tsx
│   │       │   └── SecuritySettings.tsx
│   │       └── pages/
│   │           └── SettingsPage.tsx
│   │
│   ├── hooks/                         # Custom hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useOnClickOutside.ts
│   │   ├── usePagination.ts
│   │   ├── useSocket.ts
│   │   └── useTheme.ts
│   │
│   ├── lib/                           # Utilities & configs
│   │   ├── utils.ts                   # cn() and utilities
│   │   ├── api.ts                     # Axios instance
│   │   ├── socket.ts                  # Socket.io client
│   │   └── constants.ts               # App constants
│   │
│   ├── store/                         # Redux store
│   │   ├── index.ts                   # Store configuration
│   │   ├── rootReducer.ts             # Combined reducers
│   │   └── api.ts                     # RTK Query base API
│   │
│   ├── types/                         # TypeScript types
│   │   ├── index.ts
│   │   ├── user.types.ts
│   │   ├── homework.types.ts
│   │   ├── attendance.types.ts
│   │   ├── exam.types.ts
│   │   └── api.types.ts
│   │
│   ├── styles/                        # Global styles
│   │   ├── globals.css                # Tailwind imports
│   │   └── themes.css                 # Theme variables
│   │
│   ├── App.tsx                        # Main App component
│   ├── main.tsx                       # Entry point
│   └── vite-env.d.ts                  # Vite types
│
├── .env.example                       # Environment template
├── .eslintrc.cjs                      # ESLint config
├── .prettierrc                        # Prettier config
├── components.json                    # shadcn/ui config
├── index.html                         # HTML template
├── package.json
├── postcss.config.js                  # PostCSS config
├── tailwind.config.js                 # Tailwind config
├── tsconfig.json                      # TypeScript config
├── vite.config.ts                     # Vite config
└── README.md
```

---

## State Management

### Redux Store Structure

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import usersReducer from '../features/users/usersSlice';
import homeworkReducer from '../features/homework/homeworkSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
    homework: homeworkReducer,
    notifications: notificationsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### RTK Query API Setup

```typescript
// src/store/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './index';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'User', 'Users', 
    'Class', 'Classes', 
    'Homework', 'Submissions',
    'Attendance', 
    'Exam', 'Grades',
    'Announcement', 'Notifications'
  ],
  endpoints: () => ({}),
});
```

### Feature Slice Example

```typescript
// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/user.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
```

---

## Routing Strategy

### Route Structure

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store';

// Layouts
import AuthLayout from './components/layouts/AuthLayout';
import DashboardLayout from './components/layouts/DashboardLayout';

// Auth Pages
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';

// Dashboard Pages
import AdminDashboard from './features/dashboard/pages/AdminDashboard';
import TeacherDashboard from './features/dashboard/pages/TeacherDashboard';
import StudentDashboard from './features/dashboard/pages/StudentDashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          {/* Dashboard - Role-based */}
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['super_admin', 'institution_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/teacher" element={
            <ProtectedRoute allowedRoles={['teacher', 'coordinator']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

          {/* Users */}
          <Route path="/users" element={<UsersListPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/students" element={<StudentsPage />} />

          {/* Classes */}
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:id" element={<ClassDetailPage />} />

          {/* Homework */}
          <Route path="/homework" element={<HomeworkListPage />} />
          <Route path="/homework/create" element={<CreateHomeworkPage />} />
          <Route path="/homework/:id" element={<HomeworkDetailPage />} />
          <Route path="/homework/:id/submit" element={<SubmitHomeworkPage />} />
          <Route path="/homework/:id/submissions" element={<GradeSubmissionsPage />} />

          {/* Attendance */}
          <Route path="/attendance" element={<AttendanceReportPage />} />
          <Route path="/attendance/mark" element={<MarkAttendancePage />} />
          <Route path="/attendance/my" element={<MyAttendancePage />} />

          {/* Exams & Grades */}
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/exams/create" element={<CreateExamPage />} />
          <Route path="/grades" element={<GradesPage />} />
          <Route path="/report-card/:studentId" element={<ReportCardPage />} />

          {/* Timetable */}
          <Route path="/timetable" element={<TimetablePage />} />

          {/* Announcements */}
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/announcements/create" element={<CreateAnnouncementPage />} />

          {/* AI Features */}
          <Route path="/ai/assistant" element={<AIAssistantPage />} />
          <Route path="/ai/analytics" element={<AIAnalyticsPage />} />

          {/* Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Component Architecture

### Component Categories

1. **UI Components** (`components/ui/`) - shadcn/ui primitives
2. **Common Components** (`components/common/`) - Shared, reusable
3. **Feature Components** (`features/*/components/`) - Feature-specific
4. **Page Components** (`features/*/pages/`) - Route-level pages

### Component Template

```typescript
// Example: HomeworkCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Homework } from '@/types/homework.types';
import { cn } from '@/lib/utils';

interface HomeworkCardProps {
  homework: Homework;
  onView?: () => void;
  onSubmit?: () => void;
  showSubmitButton?: boolean;
  className?: string;
}

export function HomeworkCard({
  homework,
  onView,
  onSubmit,
  showSubmitButton = false,
  className,
}: HomeworkCardProps) {
  const isOverdue = new Date(homework.dueDate) < new Date();
  
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{homework.title}</CardTitle>
          <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
            {homework.subject.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {homework.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(homework.dueDate), 'MMM d, yyyy')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {format(new Date(homework.dueDate), 'h:mm a')}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {homework.maxMarks} marks
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onView}>
            View Details
          </Button>
          {showSubmitButton && (
            <Button size="sm" onClick={onSubmit}>
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## API Integration

### RTK Query Endpoints

```typescript
// src/features/homework/services/homeworkApi.ts
import { api } from '@/store/api';
import { Homework, CreateHomeworkDto, Submission } from '@/types/homework.types';
import { PaginatedResponse } from '@/types/api.types';

export const homeworkApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHomework: builder.query<PaginatedResponse<Homework>, {
      page?: number;
      limit?: number;
      status?: string;
      subject?: string;
    }>({
      query: (params) => ({
        url: '/homework',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Homework' as const, id: _id })),
              { type: 'Homework', id: 'LIST' },
            ]
          : [{ type: 'Homework', id: 'LIST' }],
    }),

    getHomeworkById: builder.query<Homework, string>({
      query: (id) => `/homework/${id}`,
      providesTags: (result, error, id) => [{ type: 'Homework', id }],
    }),

    createHomework: builder.mutation<Homework, CreateHomeworkDto>({
      query: (body) => ({
        url: '/homework',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Homework', id: 'LIST' }],
    }),

    updateHomework: builder.mutation<Homework, { id: string; body: Partial<CreateHomeworkDto> }>({
      query: ({ id, body }) => ({
        url: `/homework/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Homework', id }],
    }),

    deleteHomework: builder.mutation<void, string>({
      query: (id) => ({
        url: `/homework/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Homework', id: 'LIST' }],
    }),

    submitHomework: builder.mutation<Submission, { homeworkId: string; body: FormData }>({
      query: ({ homeworkId, body }) => ({
        url: '/submissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { homeworkId }) => [
        { type: 'Homework', id: homeworkId },
        { type: 'Submissions', id: 'LIST' },
      ],
    }),

    getSubmissions: builder.query<Submission[], string>({
      query: (homeworkId) => `/homework/${homeworkId}/submissions`,
      providesTags: [{ type: 'Submissions', id: 'LIST' }],
    }),

    gradeSubmission: builder.mutation<Submission, { id: string; body: { marks: number; feedback: string } }>({
      query: ({ id, body }) => ({
        url: `/submissions/${id}/grade`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Submissions', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetHomeworkQuery,
  useGetHomeworkByIdQuery,
  useCreateHomeworkMutation,
  useUpdateHomeworkMutation,
  useDeleteHomeworkMutation,
  useSubmitHomeworkMutation,
  useGetSubmissionsQuery,
  useGradeSubmissionMutation,
} = homeworkApi;
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

1. LOGIN FLOW
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───▶│  Login  │───▶│   API   │───▶│  Store  │
│ submits │    │  Form   │    │ Request │    │ Tokens  │
│  creds  │    │         │    │         │    │         │
└─────────┘    └─────────┘    └─────────┘    └────┬────┘
                                                  │
                                                  ▼
                                          ┌─────────────┐
                                          │  Redirect   │
                                          │ to Dashboard│
                                          └─────────────┘

2. TOKEN REFRESH FLOW
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Request │───▶│  401    │───▶│ Refresh │───▶│  Retry  │
│  fails  │    │  Error  │    │  Token  │    │ Request │
└─────────┘    └─────────┘    └─────────┘    └─────────┘

3. LOGOUT FLOW
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Logout  │───▶│  Clear  │───▶│Redirect │
│ Action  │    │ Tokens  │    │to Login │
└─────────┘    └─────────┘    └─────────┘
```

### Auth Hook

```typescript
// src/features/auth/hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '@/store';
import { setCredentials, logout as logoutAction } from '../authSlice';
import { useLoginMutation, useLogoutMutation, useRefreshMutation } from '../services/authApi';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  const login = async (email: string, password: string) => {
    const result = await loginMutation({ email, password }).unwrap();
    dispatch(setCredentials(result.data));
    navigate('/dashboard');
  };

  const logout = async () => {
    await logoutMutation().unwrap();
    dispatch(logoutAction());
    navigate('/login');
  };

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return user.permissions?.[permission] === true;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    hasPermission,
  };
}
```

---

## Environment Variables

### .env.example

```env
# API
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000

# App
VITE_APP_NAME=Meridian EMS
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_SOCKET=true

# External Services (if any client-side keys needed)
VITE_GOOGLE_CLIENT_ID=
```

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Project: Meridian EMS*
