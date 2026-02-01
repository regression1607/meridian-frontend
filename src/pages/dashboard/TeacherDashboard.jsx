import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Users, BookOpen, Calendar, ClipboardList, Clock, CheckCircle,
  AlertCircle, FileText, TrendingUp, MessageSquare
} from 'lucide-react'

const todayClasses = [
  { id: 1, subject: 'Mathematics', class: '10-A', time: '9:00 AM - 9:45 AM', room: 'Room 101', status: 'completed' },
  { id: 2, subject: 'Mathematics', class: '10-B', time: '10:00 AM - 10:45 AM', room: 'Room 102', status: 'ongoing' },
  { id: 3, subject: 'Physics', class: '11-A', time: '11:00 AM - 11:45 AM', room: 'Lab 1', status: 'upcoming' },
  { id: 4, subject: 'Mathematics', class: '9-A', time: '12:00 PM - 12:45 PM', room: 'Room 101', status: 'upcoming' },
  { id: 5, subject: 'Physics', class: '11-B', time: '2:00 PM - 2:45 PM', room: 'Lab 1', status: 'upcoming' }
]

const pendingTasks = [
  { id: 1, task: 'Grade Class 10-A Math Homework', deadline: 'Today', priority: 'high' },
  { id: 2, task: 'Prepare Unit Test for Class 11', deadline: 'Tomorrow', priority: 'medium' },
  { id: 3, task: 'Submit Monthly Report', deadline: 'Jan 25', priority: 'low' },
  { id: 4, task: 'Review Science Project Submissions', deadline: 'Jan 26', priority: 'medium' }
]

const recentSubmissions = [
  { id: 1, student: 'Rahul Sharma', class: '10-A', assignment: 'Algebra Practice', time: '10 min ago' },
  { id: 2, student: 'Priya Patel', class: '10-A', assignment: 'Algebra Practice', time: '25 min ago' },
  { id: 3, student: 'Amit Kumar', class: '11-A', assignment: 'Physics Lab Report', time: '1 hour ago' },
  { id: 4, student: 'Sneha Gupta', class: '10-B', assignment: 'Geometry Problems', time: '2 hours ago' }
]

export default function TeacherDashboard() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900"
          >
            Good Morning, Teacher! 📚
          </motion.h1>
          <p className="text-gray-500 mt-1">{currentDate}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/dashboard/attendance"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
          >
            Mark Attendance
          </Link>
          <Link
            to="/dashboard/homework/assignments/new"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
          >
            Create Assignment
          </Link>
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
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-xs text-gray-500">Classes Today</p>
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
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">186</p>
              <p className="text-xs text-gray-500">Total Students</p>
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
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-500">Pending Reviews</p>
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">92%</p>
              <p className="text-xs text-gray-500">Avg Attendance</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <Link to="/dashboard/academics/timetable" className="text-sm text-primary-600 hover:text-primary-700">
              View Full Timetable
            </Link>
          </div>

          <div className="space-y-3">
            {todayClasses.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  cls.status === 'ongoing' ? 'bg-primary-50 border border-primary-200' :
                  cls.status === 'completed' ? 'bg-gray-50' : 'bg-white border border-gray-100'
                }`}
              >
                <div className={`w-1 h-12 rounded-full ${
                  cls.status === 'ongoing' ? 'bg-primary-500' :
                  cls.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{cls.subject}</span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {cls.class}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {cls.time}
                    </span>
                    <span>{cls.room}</span>
                  </div>
                </div>
                <div>
                  {cls.status === 'completed' && (
                    <span className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="w-4 h-4" /> Done
                    </span>
                  )}
                  {cls.status === 'ongoing' && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                      In Progress
                    </span>
                  )}
                  {cls.status === 'upcoming' && (
                    <span className="text-gray-400 text-xs">Upcoming</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pending Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              >
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-primary-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{task.task}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Due: {task.deadline}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Submissions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
          <Link to="/dashboard/homework/submissions" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Student</th>
                <th className="pb-3 font-medium">Class</th>
                <th className="pb-3 font-medium">Assignment</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50">
                  <td className="py-3 text-sm font-medium text-gray-900">{sub.student}</td>
                  <td className="py-3 text-sm text-gray-600">{sub.class}</td>
                  <td className="py-3 text-sm text-gray-600">{sub.assignment}</td>
                  <td className="py-3 text-sm text-gray-500">{sub.time}</td>
                  <td className="py-3">
                    <button className="text-sm text-primary-600 hover:text-primary-700">
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
