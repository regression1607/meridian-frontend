import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  User, Calendar, CreditCard, BookOpen, Bell, Clock,
  CheckCircle, AlertCircle, TrendingUp, Bus, MessageSquare, FileText
} from 'lucide-react'

const children = [
  { id: 1, name: 'Rahul Kumar', class: '10-A', rollNo: '15', photo: null, attendance: 94, selected: true },
  { id: 2, name: 'Priya Kumar', class: '7-B', rollNo: '22', photo: null, attendance: 97, selected: false }
]

const todayAttendance = [
  { subject: 'Mathematics', time: '9:00 AM', status: 'present' },
  { subject: 'English', time: '10:00 AM', status: 'present' },
  { subject: 'Physics', time: '11:00 AM', status: 'present' },
  { subject: 'Chemistry', time: '12:00 PM', status: 'upcoming' },
  { subject: 'Computer Science', time: '2:00 PM', status: 'upcoming' }
]

const recentGrades = [
  { subject: 'Mathematics', exam: 'Unit Test 3', score: '45/50', grade: 'A+', date: 'Jan 18' },
  { subject: 'English', exam: 'Essay Writing', score: '38/50', grade: 'B+', date: 'Jan 15' },
  { subject: 'Physics', exam: 'Lab Practical', score: '28/30', grade: 'A+', date: 'Jan 12' }
]

const feeStatus = {
  totalFee: 85000,
  paid: 60000,
  pending: 25000,
  dueDate: 'Jan 31, 2025',
  lastPayment: { amount: 30000, date: 'Dec 15, 2024' }
}

const upcomingEvents = [
  { id: 1, title: 'Parent-Teacher Meeting', date: 'Jan 25', time: '10:00 AM' },
  { id: 2, title: 'Annual Sports Day', date: 'Jan 30', time: '8:00 AM' },
  { id: 3, title: 'Mid-term Exams Begin', date: 'Feb 15', time: '9:00 AM' }
]

export default function ParentDashboard() {
  const selectedChild = children.find(c => c.selected)

  return (
    <div className="space-y-6">
      {/* Header with Child Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900"
          >
            Welcome, Parent! 👨‍👩‍👧‍👦
          </motion.h1>
          <p className="text-gray-500 mt-1">Track your child's academic progress</p>
        </div>

        {/* Child Selector */}
        <div className="flex items-center gap-3">
          {children.map((child) => (
            <button
              key={child.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                child.selected 
                  ? 'bg-primary-50 border-primary-300 text-primary-700' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                {child.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">{child.name}</p>
                <p className="text-xs opacity-75">Class {child.class}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{selectedChild?.attendance}%</p>
              <p className="text-xs text-gray-500">Attendance</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">A+</p>
              <p className="text-xs text-gray-500">Current Grade</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">#5</p>
              <p className="text-xs text-gray-500">Class Rank</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{(feeStatus.pending / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500">Fee Due</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Classes</h3>
            <Link to="/dashboard/attendance" className="text-sm text-primary-600 hover:text-primary-700">
              View History
            </Link>
          </div>

          <div className="space-y-3">
            {todayAttendance.map((cls, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cls.subject}</p>
                    <p className="text-xs text-gray-500">{cls.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  cls.status === 'present' ? 'bg-green-100 text-green-700' :
                  cls.status === 'absent' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {cls.status === 'present' ? 'Present' : 
                   cls.status === 'absent' ? 'Absent' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fee Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Fee Status</h3>
            <Link to="/dashboard/fees/payments" className="text-sm text-primary-600 hover:text-primary-700">
              View Details
            </Link>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Payment Progress</span>
              <span className="font-medium text-gray-900">
                {Math.round((feeStatus.paid / feeStatus.totalFee) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                style={{ width: `${(feeStatus.paid / feeStatus.totalFee) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">Paid</span>
              <span className="text-sm font-bold text-green-700">₹{feeStatus.paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-orange-700">Pending</span>
              <span className="text-sm font-bold text-orange-700">₹{feeStatus.pending.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Due Date:</span>
              <span className="font-medium text-red-600">{feeStatus.dueDate}</span>
            </div>
          </div>

          <Link
            to="/dashboard/fees/payments/new"
            className="mt-4 w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Pay Now
          </Link>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <Link to="/dashboard/events" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{event.date} • {event.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Grades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Academic Performance</h3>
          <Link to="/dashboard/exams/results" className="text-sm text-primary-600 hover:text-primary-700">
            View All Results
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Subject</th>
                <th className="pb-3 font-medium">Exam</th>
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Grade</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentGrades.map((grade, index) => (
                <tr key={index} className="border-b border-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">{grade.subject}</td>
                  <td className="py-3 text-sm text-gray-600">{grade.exam}</td>
                  <td className="py-3 text-sm text-gray-900 font-medium">{grade.score}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      grade.grade.includes('A') ? 'bg-green-100 text-green-700' :
                      grade.grade.includes('B') ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {grade.grade}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-500">{grade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link
          to="/dashboard/transport"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Transport</p>
            <p className="text-xs text-gray-500">Track bus</p>
          </div>
        </Link>

        <Link
          to="/dashboard/homework/assignments"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Homework</p>
            <p className="text-xs text-gray-500">View tasks</p>
          </div>
        </Link>

        <Link
          to="/dashboard/notifications"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Notices</p>
            <p className="text-xs text-gray-500">3 new</p>
          </div>
        </Link>

        <Link
          to="/dashboard/contact-teacher"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition"
        >
          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Message</p>
            <p className="text-xs text-gray-500">Teacher</p>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
