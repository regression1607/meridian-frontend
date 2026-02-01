import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserPlus, FileText, Calendar, CreditCard,
  ClipboardList, MessageSquare, Upload, Bell
} from 'lucide-react'

const actions = [
  { icon: UserPlus, label: 'Add Student', path: '/dashboard/users/students/new', color: 'bg-blue-500' },
  { icon: FileText, label: 'Create Assignment', path: '/dashboard/homework/assignments/new', color: 'bg-purple-500' },
  { icon: Calendar, label: 'Mark Attendance', path: '/dashboard/attendance', color: 'bg-green-500' },
  { icon: CreditCard, label: 'Record Payment', path: '/dashboard/fees/payments/new', color: 'bg-orange-500' },
  { icon: ClipboardList, label: 'Schedule Exam', path: '/dashboard/exams/new', color: 'bg-pink-500' },
  { icon: MessageSquare, label: 'Send Notice', path: '/dashboard/notices/new', color: 'bg-cyan-500' },
  { icon: Upload, label: 'Upload Results', path: '/dashboard/exams/results/upload', color: 'bg-indigo-500' },
  { icon: Bell, label: 'Announcements', path: '/dashboard/announcements', color: 'bg-amber-500' }
]

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => (
          <Link
            key={action.label}
            to={action.path}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition group"
          >
            <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-600 text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
