import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, GraduationCap, DollarSign, Calendar, Activity, Bell, Cake,
  BookOpen, Bus, FileText, ClipboardList, Wallet, Building, UserPlus,
  TrendingUp, BarChart3, Clock, CheckCircle, XCircle
} from 'lucide-react'

const ICON_MAP = {
  Users, GraduationCap, DollarSign, Calendar, Activity, Bell, Cake,
  BookOpen, Bus, FileText, ClipboardList, Wallet, Building, UserPlus,
  TrendingUp, BarChart3, Clock, CheckCircle, XCircle
}

export function StatsWidget({ data }) {
  const stats = [
    { label: 'Students', value: data?.students || 0, icon: GraduationCap, color: 'blue' },
    { label: 'Teachers', value: data?.teachers || 0, icon: Users, color: 'purple' },
    { label: 'Staff', value: data?.staff || 0, icon: Users, color: 'green' },
    { label: 'Parents', value: data?.parents || 0, icon: Users, color: 'orange' }
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white rounded-lg p-3 border shadow-sm">
          <div className={`w-8 h-8 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-2`}>
            <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
          </div>
          <p className="text-xl font-bold">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

export function AttendanceWidget({ data }) {
  const percentage = data?.percentage || 0
  const present = data?.present || 0
  const absent = data?.absent || 0
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="8" 
            strokeDasharray={`${percentage * 2.51} 251`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{percentage}%</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span>Present</span>
          <span className="font-semibold">{present}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span>Absent</span>
          <span className="font-semibold">{absent}</span>
        </div>
      </div>
    </div>
  )
}

export function FeesWidget({ data }) {
  const collected = data?.collected || 0
  const pending = data?.pending || 0
  const target = data?.target || 500000
  const percentage = target ? (collected / target * 100).toFixed(1) : 0
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold text-green-600">₹{collected.toLocaleString()}</p>
        <p className="text-xs text-gray-500">Collected This Month</p>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs"><span>Progress</span><span>{percentage}%</span></div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
        </div>
      </div>
      <div className="flex justify-between text-sm pt-2 border-t">
        <span className="text-gray-500">Pending</span>
        <span className="font-semibold text-red-500">₹{pending.toLocaleString()}</span>
      </div>
    </div>
  )
}

export function EventsWidget({ data }) {
  const events = data?.events || []
  return (
    <div className="space-y-3">
      {events.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No upcoming events</p>
      ) : (
        events.slice(0, 4).map((event, i) => (
          <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
              event.type === 'holiday' ? 'bg-red-100 text-red-600' :
              event.type === 'exam' ? 'bg-orange-100 text-orange-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {new Date(event.startDate).getDate()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{event.title}</p>
              <p className="text-xs text-gray-500">{new Date(event.startDate).toLocaleDateString()}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export function ActivitiesWidget({ data }) {
  const activities = data?.activities || []
  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No recent activities</p>
      ) : (
        activities.slice(0, 5).map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
            <div className="flex-1">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export function CalendarWidget({ data }) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  
  return (
    <div>
      <p className="text-sm font-medium text-center mb-3">
        {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="font-medium text-gray-500 p-1">{d}</div>
        ))}
        {days.map((day, i) => (
          <div key={i} className={`p-1 rounded ${day === today.getDate() ? 'bg-primary-500 text-white' : day ? 'hover:bg-gray-100' : ''}`}>
            {day}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnnouncementsWidget({ data }) {
  const announcements = data?.announcements || []
  return (
    <div className="space-y-3">
      {announcements.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No announcements</p>
      ) : (
        announcements.slice(0, 3).map((ann, i) => (
          <div key={i} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="font-medium text-sm">{ann.title}</p>
            <p className="text-xs text-gray-600 mt-1">{ann.message}</p>
          </div>
        ))
      )}
    </div>
  )
}

export function BirthdaysWidget({ data }) {
  const birthdays = data?.birthdays || []
  return (
    <div className="space-y-2">
      {birthdays.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No birthdays today 🎂</p>
      ) : (
        birthdays.map((person, i) => (
          <div key={i} className="flex items-center gap-3 p-2 bg-pink-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-pink-200 flex items-center justify-center">
              <Cake className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <p className="font-medium text-sm">{person.name}</p>
              <p className="text-xs text-gray-500">{person.role}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export function LibraryWidget({ data }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xl font-bold text-blue-600">{data?.totalBooks || 0}</p>
          <p className="text-xs text-gray-500">Total Books</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-xl font-bold text-orange-600">{data?.issued || 0}</p>
          <p className="text-xs text-gray-500">Issued</p>
        </div>
      </div>
      <div className="flex justify-between text-sm pt-2 border-t">
        <span className="text-gray-500">Overdue</span>
        <span className="font-semibold text-red-500">{data?.overdue || 0}</span>
      </div>
    </div>
  )
}

export function TransportWidget({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Active Vehicles</span>
        <span className="font-semibold text-green-600">{data?.active || 0}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Total Routes</span>
        <span className="font-semibold">{data?.routes || 0}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Students Using</span>
        <span className="font-semibold">{data?.students || 0}</span>
      </div>
    </div>
  )
}

export function HomeworkWidget({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
        <span className="text-sm">Pending Review</span>
        <span className="font-bold text-yellow-600">{data?.pending || 0}</span>
      </div>
      <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
        <span className="text-sm">Submitted Today</span>
        <span className="font-bold text-green-600">{data?.submitted || 0}</span>
      </div>
    </div>
  )
}

export function ExamsWidget({ data }) {
  const exams = data?.upcoming || []
  return (
    <div className="space-y-2">
      {exams.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No upcoming exams</p>
      ) : (
        exams.slice(0, 3).map((exam, i) => (
          <div key={i} className="flex items-center justify-between p-2 border rounded-lg">
            <div>
              <p className="font-medium text-sm">{exam.name}</p>
              <p className="text-xs text-gray-500">{exam.class}</p>
            </div>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">{exam.date}</span>
          </div>
        ))
      )}
    </div>
  )
}

export function PayrollWidget({ data }) {
  return (
    <div className="space-y-3">
      <div className="text-center p-3 bg-green-50 rounded-lg">
        <p className="text-xl font-bold text-green-600">₹{(data?.monthlyNet || 0).toLocaleString()}</p>
        <p className="text-xs text-gray-500">Monthly Payroll</p>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Employees</span>
        <span className="font-semibold">{data?.employees || 0}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Pending Payslips</span>
        <span className="font-semibold text-orange-500">{data?.pending || 0}</span>
      </div>
    </div>
  )
}

export function HostelWidget({ data }) {
  const occupancy = data?.occupancy || 0
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="8" 
              strokeDasharray={`${occupancy * 2.51} 251`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{occupancy}%</span>
          </div>
        </div>
        <div>
          <p className="font-semibold">Occupancy</p>
          <p className="text-xs text-gray-500">{data?.occupied || 0} / {data?.total || 0} beds</p>
        </div>
      </div>
    </div>
  )
}

export function AdmissionsWidget({ data }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xl font-bold text-blue-600">{data?.applications || 0}</p>
          <p className="text-xs text-gray-500">Applications</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xl font-bold text-green-600">{data?.enrolled || 0}</p>
          <p className="text-xs text-gray-500">Enrolled</p>
        </div>
      </div>
      <div className="flex justify-between text-sm pt-2 border-t">
        <span className="text-gray-500">Pending Review</span>
        <span className="font-semibold text-orange-500">{data?.pending || 0}</span>
      </div>
    </div>
  )
}

export function PerformanceWidget({ data }) {
  const subjects = data?.subjects || []
  return (
    <div className="space-y-2">
      {subjects.slice(0, 4).map((sub, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{sub.name}</span>
            <span className="font-medium">{sub.avg}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${sub.avg >= 75 ? 'bg-green-500' : sub.avg >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
              style={{ width: `${sub.avg}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export const WIDGET_COMPONENTS = {
  stats: StatsWidget,
  attendance: AttendanceWidget,
  fees: FeesWidget,
  events: EventsWidget,
  activities: ActivitiesWidget,
  calendar: CalendarWidget,
  announcements: AnnouncementsWidget,
  birthdays: BirthdaysWidget,
  library: LibraryWidget,
  transport: TransportWidget,
  homework: HomeworkWidget,
  exams: ExamsWidget,
  payroll: PayrollWidget,
  hostel: HostelWidget,
  admissions: AdmissionsWidget,
  performance: PerformanceWidget
}

export { ICON_MAP }
