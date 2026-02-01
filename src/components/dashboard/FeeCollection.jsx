import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, IndianRupee } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const defaultMonthlyData = [
  { month: 'Jul', collected: 0 },
  { month: 'Aug', collected: 0 },
  { month: 'Sep', collected: 0 },
  { month: 'Oct', collected: 0 },
  { month: 'Nov', collected: 0 },
  { month: 'Dec', collected: 0 },
  { month: 'Jan', collected: 0 }
]

export default function FeeCollection() {
  const [monthlyData] = useState(defaultMonthlyData)
  const [stats, setStats] = useState({ collected: 0, pending: 0 })
  const maxValue = 100

  useEffect(() => {
    fetchFeeStats()
  }, [])

  const fetchFeeStats = async () => {
    try {
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/fees/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats({
            collected: data.data.totalCollected || 0,
            pending: data.data.totalPending + (data.data.totalOverdue || 0)
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch fee stats:', error)
    }
  }

  const formatAmount = (amount) => {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Fee Collection</h3>
          <p className="text-sm text-gray-500">Monthly collection rate</p>
        </div>
        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
          <TrendingUp className="w-4 h-4" />
          <span>+12%</span>
        </div>
      </div>

      {/* Line Chart Visualization */}
      <div className="relative h-40 mb-4">
        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
          {/* Grid Lines */}
          <line x1="0" y1="25" x2="300" y2="25" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="0" y1="50" x2="300" y2="50" stroke="#f3f4f6" strokeWidth="1" />
          <line x1="0" y1="75" x2="300" y2="75" stroke="#f3f4f6" strokeWidth="1" />
          
          {/* Area */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            d={`M 0,${100 - monthlyData[0].collected} 
                ${monthlyData.map((d, i) => `L ${(i / (monthlyData.length - 1)) * 300},${100 - d.collected}`).join(' ')} 
                L 300,100 L 0,100 Z`}
            fill="url(#gradient)"
            fillOpacity="0.3"
          />
          
          {/* Line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            d={`M ${monthlyData.map((d, i) => `${(i / (monthlyData.length - 1)) * 300},${100 - d.collected}`).join(' L ')}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          
          {/* Points */}
          {monthlyData.map((d, i) => (
            <motion.circle
              key={d.month}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              cx={(i / (monthlyData.length - 1)) * 300}
              cy={100 - d.collected}
              r="4"
              fill="#3b82f6"
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* X-axis Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        {monthlyData.map((d) => (
          <span key={d.month}>{d.month}</span>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-green-700">
            <IndianRupee className="w-4 h-4" />
            <span className="text-lg font-bold">{formatAmount(stats.collected)}</span>
          </div>
          <p className="text-xs text-green-600">Collected this month</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-1 text-orange-700">
            <IndianRupee className="w-4 h-4" />
            <span className="text-lg font-bold">{formatAmount(stats.pending)}</span>
          </div>
          <p className="text-xs text-orange-600">Pending dues</p>
        </div>
      </div>
    </motion.div>
  )
}
