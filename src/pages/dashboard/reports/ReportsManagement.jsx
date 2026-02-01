import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Users, GraduationCap, Calendar, DollarSign, BookOpen, Wallet,
  TrendingUp, TrendingDown, PieChart, BarChart3, Download, RefreshCw,
  Filter, FileText, Printer, ChevronDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { reportsApi } from '../../../services/api'

const REPORT_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: PieChart },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'staff', label: 'Staff', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'fees', label: 'Fees', icon: DollarSign },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'payroll', label: 'Payroll', icon: Wallet }
]

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Custom', value: 'custom' }
]

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [datePreset, setDatePreset] = useState('month')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const reportRef = useRef(null)

  useEffect(() => {
    fetchReport()
  }, [activeTab, datePreset, dateRange, year])

  const getDateRange = () => {
    const today = new Date()
    let start, end = today
    switch (datePreset) {
      case 'today': start = today; break
      case 'yesterday': start = end = new Date(today.setDate(today.getDate() - 1)); break
      case 'week': start = new Date(today.setDate(today.getDate() - 7)); break
      case 'month': start = new Date(today.setDate(today.getDate() - 30)); break
      case 'thisMonth': start = new Date(today.getFullYear(), today.getMonth(), 1); break
      case 'lastMonth': start = new Date(today.getFullYear(), today.getMonth() - 1, 1); end = new Date(today.getFullYear(), today.getMonth(), 0); break
      case 'thisYear': start = new Date(today.getFullYear(), 0, 1); break
      case 'custom': return { startDate: dateRange.start, endDate: dateRange.end }
      default: start = new Date(today.setDate(today.getDate() - 30))
    }
    return { startDate: start?.toISOString().split('T')[0], endDate: end?.toISOString?.().split('T')[0] || new Date().toISOString().split('T')[0] }
  }

  const fetchReport = async () => {
    setLoading(true)
    try {
      const dates = getDateRange()
      let res
      if (activeTab === 'dashboard') res = await reportsApi.getDashboard()
      else if (activeTab === 'students') res = await reportsApi.getStudents()
      else if (activeTab === 'staff') res = await reportsApi.getStaff()
      else if (activeTab === 'attendance') res = await reportsApi.getAttendance(dates)
      else if (activeTab === 'fees') res = await reportsApi.getFees(dates)
      else if (activeTab === 'library') res = await reportsApi.getLibrary()
      else if (activeTab === 'payroll') res = await reportsApi.getPayroll({ year })
      if (res?.success) setData(res.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleExport = (format) => {
    if (format === 'print') {
      const content = reportRef.current
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html><head><title>Report - ${activeTab}</title>
        <style>body{font-family:Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.metric{display:inline-block;margin:10px;padding:15px;border:1px solid #ddd;border-radius:8px;min-width:150px}.metric-value{font-size:24px;font-weight:bold}.metric-label{color:#666;font-size:14px}</style>
        </head><body><h1>${REPORT_TABS.find(t => t.id === activeTab)?.label} Report</h1><p>Generated: ${new Date().toLocaleString()}</p><hr/>${content?.innerHTML || ''}</body></html>
      `)
      printWindow.document.close()
      printWindow.print()
    } else if (format === 'csv') {
      exportToCSV()
    }
  }

  const exportToCSV = () => {
    if (!data) return
    let csvContent = ''
    const tab = activeTab
    
    if (tab === 'students' && data.byClass) {
      csvContent = 'Class,Count\n' + data.byClass.map(c => `${c.class || 'Unassigned'},${c.count}`).join('\n')
    } else if (tab === 'fees' && data.byMonth) {
      csvContent = 'Month,Amount,Transactions\n' + data.byMonth.map(m => `${m.month},${m.total},${m.count}`).join('\n')
    } else if (tab === 'payroll' && data.monthlyPayroll) {
      csvContent = 'Month,Amount,Count\n' + data.monthlyPayroll.map(m => `${m.month},${m.total},${m.count}`).join('\n')
    } else {
      csvContent = Object.entries(data).map(([k, v]) => `${k},${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n')
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeTab}-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Advanced reporting with filters and export</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />Filters
          </button>
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Download className="w-4 h-4" />Export<ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={() => handleExport('print')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"><Printer className="w-4 h-4" />Print / PDF</button>
              <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"><FileText className="w-4 h-4" />Export CSV</button>
            </div>
          </div>
          <button onClick={fetchReport} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date Range</label>
              <select value={datePreset} onChange={(e) => setDatePreset(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
                {DATE_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            {datePreset === 'custom' && (
              <>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input type="date" value={dateRange.start} onChange={(e) => setDateRange(r => ({ ...r, start: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input type="date" value={dateRange.end} onChange={(e) => setDateRange(r => ({ ...r, end: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
                </div>
              </>
            )}
            {activeTab === 'payroll' && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year</label>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg text-sm">
                  {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b flex overflow-x-auto">
          {REPORT_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6" ref={reportRef}>
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardReport data={data} />}
              {activeTab === 'students' && <StudentReport data={data} />}
              {activeTab === 'staff' && <StaffReport data={data} />}
              {activeTab === 'attendance' && <AttendanceReport data={data} />}
              {activeTab === 'fees' && <FeeReport data={data} />}
              {activeTab === 'library' && <LibraryReport data={data} />}
              {activeTab === 'payroll' && <PayrollReport data={data} year={year} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardReport({ data }) {
  if (!data) return <p className="text-gray-500">No data available</p>
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={GraduationCap} label="Total Students" value={data.students || 0} color="blue" change="+12%" positive />
        <MetricCard icon={Users} label="Total Teachers" value={data.teachers || 0} color="green" />
        <MetricCard icon={DollarSign} label="Fee This Month" value={`₹${(data.feeCollectedThisMonth || 0).toLocaleString()}`} color="purple" change="+8%" positive />
        <MetricCard icon={Calendar} label="Attendance Today" value={`${data.todayAttendance?.percentage || 0}%`} color="orange" trend={data.todayAttendance?.percentage >= 80 ? 'up' : 'down'} />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Attendance Donut */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-500" />Today's Attendance</h3>
          <div className="flex items-center justify-center">
            <DonutChart percentage={data.todayAttendance?.percentage || 0} size={140} strokeWidth={14} color="#22c55e" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg"><span className="w-3 h-3 rounded-full bg-green-500"></span>Present: <strong>{data.todayAttendance?.present || 0}</strong></div>
            <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg"><span className="w-3 h-3 rounded-full bg-red-500"></span>Absent: <strong>{data.todayAttendance?.absent || 0}</strong></div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary-500" />Institution Overview</h3>
          <div className="space-y-4">
            <StatRow label="Students" value={data.students || 0} total={500} color="blue" />
            <StatRow label="Teachers" value={data.teachers || 0} total={50} color="green" />
            <StatRow label="Staff" value={15} total={30} color="purple" />
          </div>
        </div>

        {/* Fee Overview */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary-500" />Fee Collection</h3>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-green-600">₹{(data.feeCollectedThisMonth || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Collected This Month</p>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Target</span><span className="font-medium">₹5,00,000</span></div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((data.feeCollectedThisMonth || 0) / 500000 * 100, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-500 text-right">{((data.feeCollectedThisMonth || 0) / 500000 * 100).toFixed(1)}% of target</p>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-5 border border-primary-100">
        <h3 className="font-semibold mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Attendance Rate" value="92%" target="95%" status="warning" />
          <KPICard label="Fee Collection" value="78%" target="100%" status="warning" />
          <KPICard label="Student Satisfaction" value="4.5/5" target="4.0/5" status="success" />
          <KPICard label="Teacher Retention" value="98%" target="90%" status="success" />
        </div>
      </div>
    </div>
  )
}

function DonutChart({ percentage, size = 120, strokeWidth = 12, color = '#3b82f6' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-2xl font-bold">{percentage}%</span>
      </div>
    </div>
  )
}

function StatRow({ label, value, total, color }) {
  const colors = { blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500', orange: 'bg-orange-500' }
  const percentage = total ? (value / total) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1"><span className="text-gray-600">{label}</span><span className="font-semibold">{value}</span></div>
      <div className="w-full bg-gray-200 rounded-full h-2"><div className={`${colors[color]} h-2 rounded-full transition-all`} style={{ width: `${Math.min(percentage, 100)}%` }}></div></div>
    </div>
  )
}

function KPICard({ label, value, target, status }) {
  const statusColors = { success: 'bg-green-100 text-green-700 border-green-200', warning: 'bg-yellow-100 text-yellow-700 border-yellow-200', danger: 'bg-red-100 text-red-700 border-red-200' }
  return (
    <div className={`p-3 rounded-lg border ${statusColors[status]}`}>
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs mt-1">Target: {target}</p>
    </div>
  )
}

function StudentReport({ data }) {
  if (!data) return <p className="text-gray-500">No data available</p>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={GraduationCap} label="Total Students" value={data.total || 0} color="blue" />
        <MetricCard icon={Users} label="New This Month" value={data.newThisMonth || 0} color="green" />
        <MetricCard icon={Users} label="Male" value={data.byGender?.male || 0} color="cyan" />
        <MetricCard icon={Users} label="Female" value={data.byGender?.female || 0} color="pink" />
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold mb-4">Students by Class</h3>
        <div className="space-y-2">
          {data.byClass?.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-600">{c.class || 'Unassigned'}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div className="bg-primary-500 h-4 rounded-full" style={{ width: `${Math.min((c.count / data.total) * 100, 100)}%` }}></div>
              </div>
              <span className="w-12 text-sm font-medium text-right">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StaffReport({ data }) {
  if (!data) return <p className="text-gray-500">No data available</p>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Total Staff" value={data.total || 0} color="blue" />
        <MetricCard icon={GraduationCap} label="Teachers" value={data.teachers || 0} color="green" />
        <MetricCard icon={Users} label="Staff" value={data.staff || 0} color="purple" />
        <MetricCard icon={Users} label="Coordinators" value={data.coordinators || 0} color="orange" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Staff Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm">Teachers</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: `${data.total ? (data.teachers / data.total) * 100 : 0}%` }}></div></div>
              <span className="w-8 text-sm font-medium">{data.teachers}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm">Staff</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3"><div className="bg-purple-500 h-3 rounded-full" style={{ width: `${data.total ? (data.staff / data.total) * 100 : 0}%` }}></div></div>
              <span className="w-8 text-sm font-medium">{data.staff}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm">Coordinators</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3"><div className="bg-orange-500 h-3 rounded-full" style={{ width: `${data.total ? (data.coordinators / data.total) * 100 : 0}%` }}></div></div>
              <span className="w-8 text-sm font-medium">{data.coordinators}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AttendanceReport({ data }) {
  if (!data) return <p className="text-gray-500">No data available</p>
  const total = data.total || 1
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Calendar} label="Present" value={data.summary?.present || 0} color="green" />
        <MetricCard icon={Calendar} label="Absent" value={data.summary?.absent || 0} color="red" />
        <MetricCard icon={Calendar} label="Late" value={data.summary?.late || 0} color="yellow" />
        <MetricCard icon={TrendingUp} label="Attendance %" value={`${data.presentPercentage || 0}%`} color="blue" trend={data.presentPercentage >= 80 ? 'up' : 'down'} />
      </div>
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-semibold mb-4">Attendance Summary</h3>
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#22c55e" strokeWidth="10" strokeDasharray={`${(data.presentPercentage || 0) * 2.83} 283`} strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{data.presentPercentage || 0}%</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span>Present: {data.summary?.present || 0} ({((data.summary?.present || 0) / total * 100).toFixed(1)}%)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span>Absent: {data.summary?.absent || 0} ({((data.summary?.absent || 0) / total * 100).toFixed(1)}%)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span>Late: {data.summary?.late || 0} ({((data.summary?.late || 0) / total * 100).toFixed(1)}%)</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeeReport({ data }) {
  if (!data) return <p className="text-gray-500">No data available</p>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={DollarSign} label="Total Collected" value={`₹${(data.totalCollected || 0).toLocaleString()}`} color="green" />
        <MetricCard icon={DollarSign} label="Pending" value={`₹${(data.pendingAmount || 0).toLocaleString()}`} color="red" />
        <MetricCard icon={BarChart3} label="Transactions" value={data.totalTransactions || 0} color="blue" />
        <MetricCard icon={Users} label="Pending Count" value={data.pendingCount || 0} color="orange" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Monthly Collection</h3>
          <div className="space-y-2">
            {data.byMonth?.slice(-6).map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-20 text-sm text-gray-600">{m.month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${Math.min((m.total / (data.totalCollected || 1)) * 100 * 6, 100)}%` }}></div>
                </div>
                <span className="w-20 text-sm font-medium text-right">₹{m.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Payment Modes</h3>
          <div className="space-y-2">
            {Object.entries(data.byPaymentMode || {}).map(([mode, info]) => (
              <div key={mode} className="flex justify-between items-center p-2 bg-white rounded">
                <span className="capitalize">{mode}</span>
                <span className="font-semibold">₹{info.total?.toLocaleString()} ({info.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LibraryReport({ data }) {
  if (!data) return <p className="text-gray-500">No data available</p>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={BookOpen} label="Total Books" value={data.totalBooks || 0} color="blue" />
        <MetricCard icon={BookOpen} label="Total Copies" value={data.totalCopies || 0} color="green" />
        <MetricCard icon={BookOpen} label="Available" value={data.availableCopies || 0} color="cyan" />
        <MetricCard icon={BookOpen} label="Issued" value={data.issued || 0} color="purple" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Library Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span>Currently Issued</span><span className="font-semibold">{data.issued}</span></div>
            <div className="flex justify-between"><span>Overdue</span><span className="font-semibold text-red-600">{data.overdue}</span></div>
            <div className="flex justify-between"><span>Available</span><span className="font-semibold text-green-600">{data.availableCopies}</span></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Popular Books</h3>
          <div className="space-y-2">
            {data.popularBooks?.slice(0, 5).map((book, i) => (
              <div key={i} className="flex justify-between items-center p-2 bg-white rounded">
                <div><p className="font-medium text-sm">{book.title}</p><p className="text-xs text-gray-500">{book.author}</p></div>
                <span className="text-sm font-semibold">{book.count} issues</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PayrollReport({ data }) {
  if (!data) return <p className="text-gray-500">No data available</p>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Employees" value={data.employeeCount || 0} color="blue" />
        <MetricCard icon={Wallet} label="Monthly Gross" value={`₹${(data.monthlyGross || 0).toLocaleString()}`} color="green" />
        <MetricCard icon={Wallet} label="Monthly Net" value={`₹${(data.monthlyNet || 0).toLocaleString()}`} color="purple" />
        <MetricCard icon={DollarSign} label="Yearly Paid" value={`₹${(data.yearlyPaid || 0).toLocaleString()}`} color="orange" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Monthly Payroll ({new Date().getFullYear()})</h3>
          <div className="space-y-2">
            {data.monthlyPayroll?.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 text-sm text-gray-600">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m.month - 1]}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div className="bg-primary-500 h-3 rounded-full" style={{ width: `${Math.min((m.total / (data.monthlyNet || 1)) * 100, 100)}%` }}></div>
                </div>
                <span className="w-24 text-sm font-medium text-right">₹{m.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Payslip Status</h3>
          <div className="space-y-2">
            {Object.entries(data.byStatus || {}).map(([status, info]) => (
              <div key={status} className="flex justify-between items-center p-2 bg-white rounded">
                <span className="capitalize">{status}</span>
                <span className="font-semibold">{info.count} (₹{info.total?.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, color, trend, change, positive }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600', cyan: 'bg-cyan-50 text-cyan-600', pink: 'bg-pink-50 text-pink-600', red: 'bg-red-50 text-red-600', yellow: 'bg-yellow-50 text-yellow-600' }
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
        {trend && (trend === 'up' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />)}
        {change && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
