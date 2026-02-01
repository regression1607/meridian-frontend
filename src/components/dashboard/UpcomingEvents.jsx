import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'

const events = [
  {
    id: 1,
    title: 'Parent-Teacher Meeting',
    date: 'Jan 25, 2025',
    time: '10:00 AM - 2:00 PM',
    location: 'Main Auditorium',
    attendees: 156,
    color: 'border-l-blue-500'
  },
  {
    id: 2,
    title: 'Annual Sports Day',
    date: 'Jan 30, 2025',
    time: '8:00 AM - 5:00 PM',
    location: 'School Ground',
    attendees: 450,
    color: 'border-l-green-500'
  },
  {
    id: 3,
    title: 'Science Exhibition',
    date: 'Feb 5, 2025',
    time: '9:00 AM - 4:00 PM',
    location: 'Science Block',
    attendees: 200,
    color: 'border-l-purple-500'
  },
  {
    id: 4,
    title: 'Board Exam Begins',
    date: 'Feb 15, 2025',
    time: '9:00 AM',
    location: 'Examination Halls',
    attendees: 120,
    color: 'border-l-orange-500'
  }
]

export default function UpcomingEvents() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700">View calendar</button>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`p-4 bg-gray-50 rounded-lg border-l-4 ${event.color} hover:bg-gray-100 transition cursor-pointer`}
          >
            <h4 className="font-medium text-gray-900">{event.title}</h4>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {event.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {event.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.attendees}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
