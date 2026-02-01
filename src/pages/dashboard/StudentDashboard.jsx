import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BookOpen, Calendar, Clock, FileText, Award, Bell,
  CheckCircle, AlertCircle, TrendingUp, Target
} from 'lucide-react'

const todayClasses = [
  { id: 1, subject: 'Mathematics', teacher: 'Mr. Sharma', time: '9:00 AM', room: 'Room 101', status: 'completed' },
  { id: 2, subject: 'English', teacher: 'Ms. Patel', time: '10:00 AM', room: 'Room 102', status: 'ongoing' },
  { id: 3, subject: 'Physics', teacher: 'Dr. Kumar', time: '11:00 AM', room: 'Lab 1', status: 'upcoming' },
  { id: 4, subject: 'Chemistry', teacher: 'Mrs. Singh', time: '12:00 PM', room: 'Lab 2', status: 'upcoming' },
  { id: 5, subject: 'Computer Science', teacher: 'Mr. Verma', time: '2:00 PM', room: 'Computer Lab', status: 'upcoming' }
]

const pendingAssignments = [
  { id: 1, subject: 'Mathematics', title: 'Algebra Practice Set 5', deadline: 'Today, 5:00 PM', urgent: true },
  { id: 2, subject: 'Physics', title: 'Lab Report - Optics', deadline: 'Tomorrow', urgent: false },
  { id: 3, subject: 'English', title: 'Essay on Climate Change', deadline: 'Jan 25', urgent: false },
  { id: 4, subject: 'Chemistry', title: 'Periodic Table Quiz Prep', deadline: 'Jan 26', urgent: false }
]

const recentGrades = [
  { id: 1, subject: 'Mathematics', exam: 'Unit Test 3', score: '45/50', percentage: 90, grade: 'A+' },
  { id: 2, subject: 'English', exam: 'Essay Writing', score: '38/50', percentage: 76, grade: 'B+' },
  { id: 3, subject: 'Physics', exam: 'Lab Practical', score: '28/30', percentage: 93, grade: 'A+' },
  { id: 4, subject: 'Chemistry', exam: 'Chapter Test', score: '42/50', percentage: 84, grade: 'A' }
]

const announcements = [
  { id: 1, title: 'Annual Sports Day Registration Open', date: 'Jan 20', type: 'event' },
  { id: 2, title: 'Mid-term Exams Schedule Released', date: 'Jan 18', type: 'exam' },
  { id: 3, title: 'Science Exhibition Participation', date: 'Jan 15', type: 'event' }
]

export default function StudentDashboard() {
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
            Hello, Student! 🎓
          </motion.h1>
          <p className="text-gray-500 mt-1">{currentDate} • Class 10-A</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-full flex items-center gap-1">
            <Target className="w-4 h-4" /> Attendance: 94%
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Today's Classes</p>
              <p className="text-2xl font-bold mt-1">5</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Pending Tasks</p>
              <p className="text-2xl font-bold mt-1">4</p>
            </div>
            <FileText className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Current GPA</p>
              <p className="text-2xl font-bold mt-1">3.8</p>
            </div>
            <Award className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Class Rank</p>
              <p className="text-2xl font-bold mt-1">#5</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
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
            <h3 className="text-lg font-semibold text-gray-900">Today's Classes</h3>
            <Link to="/dashboard/academics/timetable" className="text-sm text-primary-600 hover:text-primary-700">
              Full Timetable
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
                <div className="text-center min-w-[60px]">
                  <p className="text-sm font-bold text-gray-900">{cls.time}</p>
                </div>
                <div className={`w-1 h-10 rounded-full ${
                  cls.status === 'ongoing' ? 'bg-primary-500' :
                  cls.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{cls.subject}</p>
                  <p className="text-xs text-gray-500">{cls.teacher} • {cls.room}</p>
                </div>
                {cls.status === 'ongoing' && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                    Now
                  </span>
                )}
                {cls.status === 'completed' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pending Assignments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pending Work</h3>
            <Link to="/dashboard/homework/assignments" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {pendingAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className={`p-3 rounded-lg border ${
                  assignment.urgent ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-500">{assignment.subject}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{assignment.title}</p>
                  </div>
                  {assignment.urgent && (
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${assignment.urgent ? 'text-red-600' : 'text-gray-500'}`}>
                    Due: {assignment.deadline}
                  </span>
                  <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                    Submit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Grades</h3>
            <Link to="/dashboard/exams/results" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentGrades.map((grade) => (
              <div key={grade.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{grade.subject}</p>
                  <p className="text-xs text-gray-500">{grade.exam}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{grade.score}</p>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          grade.percentage >= 90 ? 'bg-green-500' :
                          grade.percentage >= 75 ? 'bg-blue-500' :
                          grade.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${grade.percentage}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      grade.percentage >= 90 ? 'text-green-600' :
                      grade.percentage >= 75 ? 'text-blue-600' :
                      grade.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {grade.grade}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
            <Link to="/dashboard/notifications" className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  ann.type === 'event' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {ann.type === 'event' ? <Calendar className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{ann.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ann.date}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
