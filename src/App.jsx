import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LandingPage from './pages/public/LandingPage'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import TermsOfService from './pages/public/TermsOfService'
import ContactUs from './pages/public/ContactUs'
import AboutUs from './pages/public/AboutUs'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import DashboardLayout from './components/layout/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import ParentDashboard from './pages/dashboard/ParentDashboard'
import UsersList from './pages/dashboard/users/UsersList'
import AddUser from './pages/dashboard/users/AddUser'
import EditUser from './pages/dashboard/users/EditUser'
import RoleUsersList from './pages/dashboard/users/RoleUsersList'
import NotFound from './pages/errors/NotFound'
import ErrorPage from './pages/errors/ErrorPage'
import InstitutionsList from './pages/dashboard/institutions/InstitutionsList'
import AddInstitution from './pages/dashboard/institutions/AddInstitution'
import InstitutionDetails from './pages/dashboard/institutions/InstitutionDetails'
import Attendance from './pages/dashboard/Attendance'
import Profile from './pages/dashboard/Profile'
import Settings from './pages/dashboard/Settings'
import ClassesList from './pages/dashboard/academics/ClassesList'
import SubjectsList from './pages/dashboard/academics/SubjectsList'
import TimetableView from './pages/dashboard/academics/TimetableView'
import HomeworkList from './pages/dashboard/homework/HomeworkList'
import HomeworkForm from './pages/dashboard/homework/HomeworkForm'
import HomeworkDetail from './pages/dashboard/homework/HomeworkDetail'
import HomeworkSubmissions from './pages/dashboard/homework/HomeworkSubmissions'
import FeePayments from './pages/dashboard/fees/FeePayments'
import FeeStructures from './pages/dashboard/fees/FeeStructures'
import ApplicationsList from './pages/dashboard/admissions/ApplicationsList'
import ApplicationForm from './pages/dashboard/admissions/ApplicationForm'
import ApplicationDetail from './pages/dashboard/admissions/ApplicationDetail'
import EnrollmentProcess from './pages/dashboard/admissions/EnrollmentProcess'
import EnrollmentsList from './pages/dashboard/admissions/EnrollmentsList'
import PublicApplicationForm from './pages/admissions/PublicApplicationForm'
import TransportManagement from './pages/dashboard/transport/TransportManagement'
import BooksList from './pages/dashboard/library/BooksList'
import IssuedBooks from './pages/dashboard/library/IssuedBooks'
import { HostelManagement } from './pages/dashboard/hostel'
import { PayrollManagement } from './pages/dashboard/payroll'
import { EventsManagement } from './pages/dashboard/events'
import { ReportsManagement } from './pages/dashboard/reports'
import { AIAssistant } from './pages/dashboard/ai'
import { ExamManagement, Results, ReportCards, QuestionGenerator } from './pages/dashboard/examinations'
import Notifications from './pages/dashboard/Notifications'
import Help from './pages/dashboard/Help'

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admissions/apply" element={<PublicApplicationForm />} />

          {/* Dashboard Routes - Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="teacher" element={<TeacherDashboard />} />
            <Route path="student" element={<StudentDashboard />} />
            <Route path="parent" element={<ParentDashboard />} />
            <Route path="users" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <UsersList />
              </ProtectedRoute>
            } />
            <Route path="users/new" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <AddUser />
              </ProtectedRoute>
            } />
            <Route path="users/:id/edit" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <EditUser />
              </ProtectedRoute>
            } />
            <Route path="users/teachers" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <RoleUsersList role="teacher" />
              </ProtectedRoute>
            } />
            <Route path="users/students" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <RoleUsersList role="student" />
              </ProtectedRoute>
            } />
            <Route path="users/parents" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <RoleUsersList role="parent" />
              </ProtectedRoute>
            } />
            <Route path="users/staff" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <RoleUsersList role="staff" />
              </ProtectedRoute>
            } />
            <Route path="institutions" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <InstitutionsList />
              </ProtectedRoute>
            } />
            <Route path="institutions/add" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <AddInstitution />
              </ProtectedRoute>
            } />
            <Route path="institutions/:id" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <InstitutionDetails />
              </ProtectedRoute>
            } />
            {/* Academic Management */}
            <Route path="classes" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator']}>
                <ClassesList />
              </ProtectedRoute>
            } />
            <Route path="subjects" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator']}>
                <SubjectsList />
              </ProtectedRoute>
            } />
            <Route path="timetable" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <TimetableView />
              </ProtectedRoute>
            } />
            <Route path="attendance" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="fees" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff']}>
                <FeePayments />
              </ProtectedRoute>
            } />
            <Route path="fees/structures" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <FeeStructures />
              </ProtectedRoute>
            } />
            {/* Homework Management */}
            <Route path="homework/assignments" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <HomeworkList />
              </ProtectedRoute>
            } />
            <Route path="homework/new" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <HomeworkForm />
              </ProtectedRoute>
            } />
            <Route path="homework/submissions" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <HomeworkSubmissions />
              </ProtectedRoute>
            } />
            <Route path="homework/:id" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <HomeworkDetail />
              </ProtectedRoute>
            } />
            <Route path="homework/:id/edit" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <HomeworkForm />
              </ProtectedRoute>
            } />
            {/* Admissions Management */}
            <Route path="admissions/applications" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff']}>
                <ApplicationsList />
              </ProtectedRoute>
            } />
            <Route path="admissions/apply" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff']}>
                <ApplicationForm />
              </ProtectedRoute>
            } />
            <Route path="admissions/applications/:id" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff']}>
                <ApplicationDetail />
              </ProtectedRoute>
            } />
            <Route path="admissions/applications/:id/edit" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff']}>
                <ApplicationForm />
              </ProtectedRoute>
            } />
            <Route path="admissions/enroll/:id" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <EnrollmentProcess />
              </ProtectedRoute>
            } />
            <Route path="admissions/enrolled" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff']}>
                <EnrollmentsList />
              </ProtectedRoute>
            } />
            {/* Transport */}
            <Route path="transport" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff', 'parent']}>
                <TransportManagement />
              </ProtectedRoute>
            } />
            {/* Library */}
            <Route path="library/books" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff', 'coordinator', 'teacher', 'student']}>
                <BooksList />
              </ProtectedRoute>
            } />
            <Route path="library/issued" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff', 'coordinator', 'teacher', 'student']}>
                <IssuedBooks />
              </ProtectedRoute>
            } />
            {/* Hostel */}
            <Route path="hostel" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff', 'coordinator']}>
                <HostelManagement />
              </ProtectedRoute>
            } />
            {/* Payroll */}
            <Route path="payroll/*" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'staff']}>
                <PayrollManagement />
              </ProtectedRoute>
            } />
            {/* Events */}
            <Route path="events/*" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'parent', 'staff']}>
                <EventsManagement />
              </ProtectedRoute>
            } />
            {/* Reports */}
            <Route path="reports/*" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <ReportsManagement />
              </ProtectedRoute>
            } />
            {/* Examinations */}
            <Route path="exams" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <ExamManagement />
              </ProtectedRoute>
            } />
            <Route path="exams/results" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'parent']}>
                <Results />
              </ProtectedRoute>
            } />
            <Route path="exams/reports" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'parent']}>
                <ReportCards />
              </ProtectedRoute>
            } />
            <Route path="exams/question-generator" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']}>
                <QuestionGenerator />
              </ProtectedRoute>
            } />
            {/* AI Assistant */}
            <Route path="ai-assistant" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'staff']}>
                <AIAssistant />
              </ProtectedRoute>
            } />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin', 'institution_admin']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="help" element={<Help />} />
            {/* 404 for dashboard routes */}
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Global 404 */}
          <Route path="*" element={<NotFound />} />
          {/* Error Page */}
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
