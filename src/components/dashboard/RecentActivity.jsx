import { motion } from 'framer-motion'
import { 
  UserPlus, FileText, CreditCard, Calendar, 
  CheckCircle, AlertCircle, Clock
} from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'student_added',
    title: 'New student enrolled',
    description: 'Rahul Sharma was added to Class 10-A',
    time: '5 minutes ago',
    icon: UserPlus,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 2,
    type: 'assignment',
    title: 'Assignment submitted',
    description: 'Priya Patel submitted Math homework',
    time: '15 minutes ago',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 3,
    type: 'payment',
    title: 'Fee payment received',
    description: '₹25,000 received from Amit Kumar',
    time: '1 hour ago',
    icon: CreditCard,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 4,
    type: 'attendance',
    title: 'Attendance marked',
    description: 'Class 8-B attendance completed',
    time: '2 hours ago',
    icon: Calendar,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 5,
    type: 'exam',
    title: 'Results published',
    description: 'Mid-term results for Class 9 published',
    time: '3 hours ago',
    icon: CheckCircle,
    color: 'bg-emerald-100 text-emerald-600'
  }
]

export default function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700">View all</button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="flex items-start gap-3"
          >
            <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{activity.description}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
