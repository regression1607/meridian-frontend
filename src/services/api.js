const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL
  }

  getToken() {
    return localStorage.getItem('meridian_token')
  }

  async request(endpoint, options = {}) {
    const token = this.getToken()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config)
      const data = await response.json()

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Something went wrong',
          errors: data.errors
        }
      }

      return data
    } catch (error) {
      if (error.status === 401) {
        localStorage.removeItem('meridian_token')
        localStorage.removeItem('meridian_user')
        window.location.href = '/login'
      }
      throw error
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'GET' })
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  delete(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url, { method: 'DELETE' })
  }

  async upload(endpoint, formData) {
    const token = this.getToken()
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Upload failed',
        errors: data.errors
      }
    }

    return data
  }
}

const api = new ApiService()

export default api

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (oldPassword, newPassword) => api.post('/auth/change-password', { oldPassword, newPassword })
}

// Users endpoints
export const usersApi = {
  getAll: (params) => api.get('/users', params),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getByRole: (role, params) => api.get(`/users/role/${role}`, params),
  bulkImport: (data) => api.post('/users/bulk-import', data),
  export: (params) => api.get('/users/export', params)
}

// Students endpoints
export const studentsApi = {
  getAll: (params) => api.get('/students', params),
  getById: (id) => api.get(`/students/${id}`),
  create: (studentData) => api.post('/students', studentData),
  update: (id, studentData) => api.put(`/students/${id}`, studentData),
  delete: (id) => api.delete(`/students/${id}`),
  getByClass: (classId) => api.get(`/students/class/${classId}`)
}

// Attendance endpoints
export const attendanceApi = {
  mark: (data) => api.post('/attendance', data),
  markBulk: (data) => api.post('/attendance/bulk', data),
  getAll: (params) => api.get('/attendance', params),
  getByClass: (classId, params) => api.get(`/attendance/class/${classId}`, params),
  getStats: (params) => api.get('/attendance/stats', params),
  getUserAttendance: (userId, params) => api.get(`/attendance/user/${userId}`, params),
  getMyAttendance: (params) => api.get('/attendance/me', params)
}

// Fees endpoints
export const feesApi = {
  // Fee Structures
  getStructures: (params) => api.get('/fees/structures', params),
  createStructure: (data) => api.post('/fees/structures', data),
  updateStructure: (id, data) => api.put(`/fees/structures/${id}`, data),
  // Fee Payments
  getPayments: (params) => api.get('/fees/payments', params),
  recordPayment: (data) => api.post('/fees/payments', data),
  getStudentFees: (studentId) => api.get(`/fees/student/${studentId}`),
  getMyFees: () => api.get('/fees/me'),
  // Stats & Reports
  getStats: (params) => api.get('/fees/stats', params),
  getDefaulters: (params) => api.get('/fees/defaulters', params)
}

// Classes endpoints
export const classesApi = {
  getAll: (params) => api.get('/classes', params),
  getPublic: (institutionId) => api.get(`/classes/public/${institutionId}`),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id, params) => api.delete(`/classes/${id}`, params),
  getStudents: (id, params) => api.get(`/classes/${id}/students`, params),
  getSections: (classId) => api.get(`/classes/${classId}/sections`),
  createSection: (classId, data) => api.post(`/classes/${classId}/sections`, data),
  updateSection: (sectionId, data) => api.put(`/classes/sections/${sectionId}`, data),
  deleteSection: (sectionId, params) => api.delete(`/classes/sections/${sectionId}`, params)
}

// Admissions endpoints
export const admissionsApi = {
  // Applications
  submitApplication: (data) => api.post('/admissions/apply', data),
  getApplications: (params) => api.get('/admissions/applications', params),
  getApplicationById: (id) => api.get(`/admissions/applications/${id}`),
  updateApplication: (id, data) => api.put(`/admissions/applications/${id}`, data),
  updateApplicationStatus: (id, data) => api.put(`/admissions/applications/${id}/status`, data),
  deleteApplication: (id) => api.delete(`/admissions/applications/${id}`),
  // Entrance Test
  scheduleEntranceTest: (id, data) => api.put(`/admissions/applications/${id}/entrance-test`, data),
  updateEntranceTestScore: (id, data) => api.put(`/admissions/applications/${id}/entrance-test/score`, data),
  // Enrollment
  enrollStudent: (applicationId, data) => api.post(`/admissions/enroll/${applicationId}`, data),
  getEnrollments: (params) => api.get('/admissions/enrollments', params),
  getEnrollmentById: (id) => api.get(`/admissions/enrollments/${id}`),
  // Stats
  getStats: (params) => api.get('/admissions/stats', params)
}

// Homework endpoints
export const homeworkApi = {
  getAll: (params) => api.get('/homework', params),
  getById: (id, params) => api.get(`/homework/${id}`, params),
  create: (homeworkData) => api.post('/homework', homeworkData),
  update: (id, homeworkData) => api.put(`/homework/${id}`, homeworkData),
  delete: (id, params) => api.delete(`/homework/${id}`, params),
  submit: (id, submission) => api.post(`/homework/${id}/submit`, submission),
  grade: (id, studentId, gradeData) => api.post(`/homework/${id}/grade/${studentId}`, gradeData),
  getMyHomework: (params) => api.get('/homework/my-homework', params),
  getStats: (params) => api.get('/homework/stats', params)
}

// Examinations endpoints
export const examinationsApi = {
  // Exams
  getExams: (params) => api.get('/examinations/exams', params),
  getExamById: (id) => api.get(`/examinations/exams/${id}`),
  createExam: (data) => api.post('/examinations/exams', data),
  updateExam: (id, data) => api.put(`/examinations/exams/${id}`, data),
  deleteExam: (id) => api.delete(`/examinations/exams/${id}`),
  getExamStats: (params) => api.get('/examinations/exams/stats', params),
  // Results
  getResults: (params) => api.get('/examinations/results', params),
  getResultById: (id) => api.get(`/examinations/results/${id}`),
  getStudentResults: (studentId, params) => api.get(`/examinations/results/student/${studentId}`, params),
  createResult: (data) => api.post('/examinations/results', data),
  createBulkResults: (data) => api.post('/examinations/results/bulk', data),
  updateResult: (id, data) => api.put(`/examinations/results/${id}`, data),
  deleteResult: (id) => api.delete(`/examinations/results/${id}`),
  verifyResults: (resultIds) => api.post('/examinations/results/verify', { resultIds }),
  // Report Cards
  getReportCards: (params) => api.get('/examinations/report-cards', params),
  getReportCardById: (id) => api.get(`/examinations/report-cards/${id}`),
  getStudentReportCard: (studentId, params) => api.get(`/examinations/report-cards/student/${studentId}`, params),
  generateReportCard: (data) => api.post('/examinations/report-cards/generate', data),
  generateBulkReportCards: (data) => api.post('/examinations/report-cards/generate-bulk', data),
  updateReportCard: (id, data) => api.put(`/examinations/report-cards/${id}`, data),
  publishReportCards: (reportCardIds) => api.post('/examinations/report-cards/publish', { reportCardIds }),
  deleteReportCard: (id) => api.delete(`/examinations/report-cards/${id}`)
}

// Events endpoints
export const eventsApi = {
  getStats: () => api.get('/events/stats'),
  getUpcoming: (limit) => api.get('/events/upcoming', { limit }),
  getCalendar: (year, month) => api.get('/events/calendar', { year, month }),
  getAll: (params) => api.get('/events', params),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  register: (id) => api.post(`/events/${id}/register`),
  cancelRegistration: (id) => api.delete(`/events/${id}/register`)
}

// Notifications endpoints
export const notificationsApi = {
  getAll: (params) => api.get('/notifications', params),
  getById: (id) => api.get(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAllRead: () => api.delete('/notifications/read'),
  create: (data) => api.post('/notifications', data),
  sendToRole: (data) => api.post('/notifications/send-to-role', data),
  sendToClass: (data) => api.post('/notifications/send-to-class', data)
}

// Institution endpoints (single institution - for logged in user)
export const institutionApi = {
  get: () => api.get('/institution'),
  update: (data) => api.put('/institution', data),
  getStats: () => api.get('/institution/stats')
}

// Institutions endpoints (admin - manage all institutions)
export const institutionsApi = {
  getAll: (params) => api.get('/institutions', params),
  getPublic: () => api.get('/institutions/public'),
  getById: (id) => api.get(`/institutions/${id}`),
  create: (data) => api.post('/institutions', data),
  update: (id, data) => api.put(`/institutions/${id}`, data),
  delete: (id) => api.delete(`/institutions/${id}`),
  getDashboard: (id) => api.get(`/institutions/${id}/dashboard`),
  updateSubscription: (id, data) => api.patch(`/institutions/${id}/subscription`, data)
}

// Subjects endpoints
export const subjectsApi = {
  getAll: (params) => api.get('/subjects', params),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  assignToClasses: (id, classIds) => api.put(`/subjects/${id}/classes`, { classIds }),
  assignTeachers: (id, teacherIds) => api.put(`/subjects/${id}/teachers`, { teacherIds })
}

// Timetables endpoints
export const timetablesApi = {
  getAll: (params) => api.get('/timetables', params),
  getById: (id) => api.get(`/timetables/${id}`),
  getByClass: (classId, params) => api.get(`/timetables/class/${classId}`, params),
  getTeacherTimetable: (teacherId) => api.get(`/timetables/teacher/${teacherId || ''}`),
  create: (data) => api.post('/timetables', data),
  update: (id, data) => api.put(`/timetables/${id}`, data),
  delete: (id) => api.delete(`/timetables/${id}`),
  generateSchedule: (data) => api.post('/timetables/generate-schedule', data)
}

// Transport endpoints
export const transportApi = {
  // Stats
  getStats: () => api.get('/transport/stats'),
  // Vehicles
  getVehicles: (params) => api.get('/transport/vehicles', params),
  getVehicleById: (id) => api.get(`/transport/vehicles/${id}`),
  createVehicle: (data) => api.post('/transport/vehicles', data),
  updateVehicle: (id, data) => api.put(`/transport/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/transport/vehicles/${id}`),
  // Routes
  getRoutes: (params) => api.get('/transport/routes', params),
  getRouteById: (id) => api.get(`/transport/routes/${id}`),
  createRoute: (data) => api.post('/transport/routes', data),
  updateRoute: (id, data) => api.put(`/transport/routes/${id}`, data),
  deleteRoute: (id) => api.delete(`/transport/routes/${id}`),
  // Allocations
  getAllocations: (params) => api.get('/transport/allocations', params),
  allocateTransport: (data) => api.post('/transport/allocations', data),
  updateAllocation: (id, data) => api.put(`/transport/allocations/${id}`, data),
  deleteAllocation: (id) => api.delete(`/transport/allocations/${id}`)
}

// Library endpoints
export const libraryApi = {
  // Stats
  getStats: () => api.get('/library/stats'),
  // Settings
  getSettings: () => api.get('/library/settings'),
  updateSettings: (data) => api.put('/library/settings', data),
  // Books
  getBooks: (params) => api.get('/library/books', params),
  getBookById: (id) => api.get(`/library/books/${id}`),
  createBook: (data) => api.post('/library/books', data),
  updateBook: (id, data) => api.put(`/library/books/${id}`, data),
  deleteBook: (id) => api.delete(`/library/books/${id}`),
  // Issues
  getIssues: (params) => api.get('/library/issues', params),
  issueBook: (data) => api.post('/library/issues', data),
  returnBook: (id, remarks) => api.put(`/library/issues/${id}/return`, { remarks }),
  renewBook: (id) => api.put(`/library/issues/${id}/renew`),
  markAsLost: (id) => api.put(`/library/issues/${id}/lost`)
}

// Hostel endpoints
export const hostelApi = {
  // Stats
  getStats: () => api.get('/hostel/stats'),
  // Blocks
  getBlocks: (params) => api.get('/hostel/blocks', params),
  getBlockById: (id) => api.get(`/hostel/blocks/${id}`),
  createBlock: (data) => api.post('/hostel/blocks', data),
  updateBlock: (id, data) => api.put(`/hostel/blocks/${id}`, data),
  deleteBlock: (id) => api.delete(`/hostel/blocks/${id}`),
  // Rooms
  getRooms: (params) => api.get('/hostel/rooms', params),
  getRoomById: (id) => api.get(`/hostel/rooms/${id}`),
  createRoom: (data) => api.post('/hostel/rooms', data),
  updateRoom: (id, data) => api.put(`/hostel/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/hostel/rooms/${id}`),
  // Allocations
  getAllocations: (params) => api.get('/hostel/allocations', params),
  allocateRoom: (data) => api.post('/hostel/allocations', data),
  vacateRoom: (id, remarks) => api.put(`/hostel/allocations/${id}/vacate`, { remarks }),
  // Mess Menu
  getMessMenu: (params) => api.get('/hostel/mess-menu', params),
  createMessMenu: (data) => api.post('/hostel/mess-menu', data),
  updateMessMenu: (id, data) => api.put(`/hostel/mess-menu/${id}`, data),
  deleteMessMenu: (id) => api.delete(`/hostel/mess-menu/${id}`),
  // Visitors
  getVisitors: (params) => api.get('/hostel/visitors', params),
  createVisitor: (data) => api.post('/hostel/visitors', data),
  checkOutVisitor: (id) => api.put(`/hostel/visitors/${id}/checkout`),
  // Complaints
  getComplaints: (params) => api.get('/hostel/complaints', params),
  createComplaint: (data) => api.post('/hostel/complaints', data),
  updateComplaint: (id, data) => api.put(`/hostel/complaints/${id}`, data),
  deleteComplaint: (id) => api.delete(`/hostel/complaints/${id}`)
}

// Payroll endpoints
export const payrollApi = {
  // Stats
  getStats: () => api.get('/payroll/stats'),
  // Salary Structures
  getStructures: (params) => api.get('/payroll/structures', params),
  getStructureById: (id) => api.get(`/payroll/structures/${id}`),
  createStructure: (data) => api.post('/payroll/structures', data),
  updateStructure: (id, data) => api.put(`/payroll/structures/${id}`, data),
  deleteStructure: (id) => api.delete(`/payroll/structures/${id}`),
  // Employee Salaries
  getSalaries: (params) => api.get('/payroll/salaries', params),
  getSalaryById: (id) => api.get(`/payroll/salaries/${id}`),
  getMySalary: () => api.get('/payroll/salaries/me'),
  assignSalary: (data) => api.post('/payroll/salaries', data),
  // Payslips
  getPayslips: (params) => api.get('/payroll/payslips', params),
  getPayslipById: (id) => api.get(`/payroll/payslips/${id}`),
  getMyPayslips: (params) => api.get('/payroll/payslips/me', params),
  generatePayslip: (data) => api.post('/payroll/payslips', data),
  bulkGeneratePayslips: (data) => api.post('/payroll/payslips/bulk', data),
  approvePayslip: (id) => api.put(`/payroll/payslips/${id}/approve`),
  markPayslipPaid: (id, data) => api.put(`/payroll/payslips/${id}/pay`, data),
  // Bonuses
  getBonuses: (params) => api.get('/payroll/bonuses', params),
  createBonus: (data) => api.post('/payroll/bonuses', data),
  approveBonus: (id, approved) => api.put(`/payroll/bonuses/${id}/approve`, { approved }),
  // Advances/Loans
  getAdvances: (params) => api.get('/payroll/advances', params),
  createAdvance: (data) => api.post('/payroll/advances', data),
  approveAdvance: (id, approved) => api.put(`/payroll/advances/${id}/approve`, { approved }),
  disburseAdvance: (id) => api.put(`/payroll/advances/${id}/disburse`)
}

// Reports endpoints
export const reportsApi = {
  getDashboard: () => api.get('/reports/dashboard'),
  getStudents: () => api.get('/reports/students'),
  getStaff: () => api.get('/reports/staff'),
  getAttendance: (params) => api.get('/reports/attendance', params),
  getFees: (params) => api.get('/reports/fees', params),
  getLibrary: () => api.get('/reports/library'),
  getPayroll: (params) => api.get('/reports/payroll', params)
}

// User Preferences endpoints
export const preferencesApi = {
  get: () => api.get('/preferences'),
  getAvailableWidgets: () => api.get('/preferences/widgets/available'),
  updateWidgets: (widgets) => api.put('/preferences/widgets', { widgets }),
  addWidget: (widget) => api.post('/preferences/widgets', widget),
  removeWidget: (widgetId) => api.delete(`/preferences/widgets/${widgetId}`),
  reorderWidgets: (order) => api.put('/preferences/widgets/reorder', { order }),
  updateWidgetSettings: (widgetId, settings) => api.put(`/preferences/widgets/${widgetId}/settings`, settings),
  resetToDefault: () => api.post('/preferences/reset')
}

// AI Assistant endpoints
export const aiApi = {
  createChat: (message) => api.post('/ai/chat', { message }),
  getChats: (limit) => api.get('/ai/chats', { limit }),
  getChatById: (id) => api.get(`/ai/chats/${id}`),
  sendMessage: (chatId, message) => api.post(`/ai/chats/${chatId}/message`, { message }),
  quickAsk: (message) => api.post('/ai/quick-ask', { message }),
  deleteChat: (id) => api.delete(`/ai/chats/${id}`),
  clearHistory: () => api.delete('/ai/history')
}

// Question Paper Generator endpoints
export const questionPaperApi = {
  getAll: (params) => api.get('/question-papers', params),
  getById: (id) => api.get(`/question-papers/${id}`),
  generate: async (formData) => {
    const token = localStorage.getItem('meridian_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/question-papers/generate`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    })
    const data = await response.json()
    if (!response.ok) throw data
    return data
  },
  regenerate: (id) => api.post(`/question-papers/${id}/regenerate`),
  update: (id, data) => api.put(`/question-papers/${id}`, data),
  delete: (id) => api.delete(`/question-papers/${id}`),
  extractPdf: async (formData) => {
    const token = localStorage.getItem('meridian_token')
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/question-papers/extract-pdf`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    })
    const data = await response.json()
    if (!response.ok) throw data
    return data
  }
}
