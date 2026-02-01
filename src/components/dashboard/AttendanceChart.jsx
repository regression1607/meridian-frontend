import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const defaultData = [
  { day: 'Mon', present: 0, absent: 0 },
  { day: 'Tue', present: 0, absent: 0 },
  { day: 'Wed', present: 0, absent: 0 },
  { day: 'Thu', present: 0, absent: 0 },
  { day: 'Fri', present: 0, absent: 0 },
  { day: 'Sat', present: 0, absent: 0 }
]

export default function AttendanceChart() {
  const [attendanceData, setAttendanceData] = useState(defaultData)
  const [stats, setStats] = useState({ avgAttendance: 0, presentToday: 0, absentToday: 0 })
  const maxValue = 100

  useEffect(() => {
    fetchAttendanceStats()
  }, [])

  const fetchAttendanceStats = async () => {
    try {
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/attendance/stats?date=${new Date().toISOString().split('T')[0]}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats({
            avgAttendance: data.data.presentPercentage || 0,
            presentToday: data.data.present || 0,
            absentToday: data.data.absent || 0
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch attendance stats:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
          <p className="text-sm text-gray-500">This week's attendance</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-gray-600">Absent</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-48">
        {attendanceData.map((data, index) => (
          <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col-reverse gap-0.5 h-40">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.present / maxValue) * 100}%` }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="w-full bg-green-500 rounded-t-md"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(data.absent / maxValue) * 100}%` }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                className="w-full bg-red-400 rounded-t-md"
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">{data.day}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgAttendance}%</p>
          <p className="text-xs text-gray-500">Avg. Attendance</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">{stats.presentToday.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Present Today</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-red-500">{stats.absentToday.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Absent Today</p>
        </div>
      </div>
    </motion.div>
  )
}
