import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, ChevronLeft, ChevronRight, CheckCircle, XCircle, 
  Clock, AlertCircle, TrendingUp, TrendingDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { attendanceApi } from '../../services/api'
import { toast } from 'react-toastify'

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-100', icon: CheckCircle },
  absent: { label: 'Absent', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100', icon: XCircle },
  late: { label: 'Late', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-100', icon: Clock },
  half_day: { label: 'Half Day', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-100', icon: AlertCircle },
  leave: { label: 'Leave', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-100', icon: Calendar }
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function StudentAttendance() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [attendanceData, setAttendanceData] = useState([])
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 0 })

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  useEffect(() => {
    fetchMonthlyAttendance()
  }, [currentMonth, currentYear])

  const fetchMonthlyAttendance = async () => {
    try {
      setLoading(true)
      const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0]
      const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
      
      const response = await attendanceApi.getMyAttendance({ startDate, endDate })
      const data = response.data || []
      setAttendanceData(data.records || data)
      
      // Calculate stats
      const records = data.records || data
      const presentCount = records.filter(r => r.status === 'present').length
      const absentCount = records.filter(r => r.status === 'absent').length
      const lateCount = records.filter(r => r.status === 'late').length
      const total = records.length
      
      setStats({
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        total,
        percentage: total > 0 ? ((presentCount + lateCount) / total * 100).toFixed(1) : 0
      })
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
      toast.error('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentYear, currentMonth + delta, 1))
  }

  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getAttendanceForDay = (day) => {
    if (!day) return null
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return attendanceData.find(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0]
      return recordDate === dateStr
    })
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const isFutureDate = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    return date > new Date()
  }

  const isWeekend = (day) => {
    if (!day) return false
    const date = new Date(currentYear, currentMonth, day)
    return date.getDay() === 0 || date.getDay() === 6
  }

  const days = getDaysInMonth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 mt-1">View your monthly attendance record</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
              <p className="text-2xl font-bold text-gray-900">{stats.present}</p>
              <p className="text-xs text-gray-500">Present</p>
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
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.absent}</p>
              <p className="text-xs text-gray-500">Absent</p>
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
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
              <p className="text-xs text-gray-500">Late</p>
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
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Days</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stats.percentage >= 75 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {stats.percentage >= 75 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.percentage}%</p>
              <p className="text-xs text-gray-500">Attendance Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days - Events Style */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const attendance = getAttendanceForDay(day)
                  const statusConfig = attendance ? STATUS_CONFIG[attendance.status] : null
                  const today = isToday(day)
                  const future = isFutureDate(day)
                  const weekend = isWeekend(day)

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg ${
                        !day ? 'bg-gray-50' : 
                        weekend ? 'bg-gray-50' :
                        'bg-white'
                      } ${today ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      {day && (
                        <>
                          <span className={`text-sm font-medium ${
                            today ? 'bg-primary-500 text-white px-1.5 py-0.5 rounded-full' :
                            future ? 'text-gray-300' :
                            weekend ? 'text-gray-400' :
                            'text-gray-700'
                          }`}>
                            {day}
                          </span>
                          <div className="mt-2">
                            {!future && weekend && (
                              <span className="text-xs text-gray-400 block">Weekend</span>
                            )}
                            {!future && !weekend && statusConfig && (
                              <div className={`text-xs px-2 py-1 rounded ${statusConfig.bgLight} ${statusConfig.textColor} font-medium`}>
                                {statusConfig.label}
                              </div>
                            )}
                            {!future && !weekend && !statusConfig && (
                              <span className="text-xs text-gray-400 block">No record</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-500 font-medium">Legend:</span>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${config.color}`} />
                <span className="text-gray-600">{config.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-200" />
              <span className="text-gray-600">No Record</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Attendance List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Attendance</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {attendanceData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No attendance records for this month</p>
            </div>
          ) : (
            attendanceData.slice(0, 10).map((record, index) => {
              const statusConfig = STATUS_CONFIG[record.status]
              const StatusIcon = statusConfig?.icon || Calendar
              const date = new Date(record.date)
              
              return (
                <div key={index} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${statusConfig?.bgLight || 'bg-gray-100'} flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${statusConfig?.textColor || 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </p>
                      {record.remarks && (
                        <p className="text-sm text-gray-500">{record.remarks}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig?.bgLight} ${statusConfig?.textColor}`}>
                    {statusConfig?.label || record.status}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </div>
  )
}
