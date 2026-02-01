import { useState, useEffect, useCallback } from 'react'
import { motion, Reorder, useDragControls } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Users, GraduationCap, UserCheck, CreditCard, TrendingUp, Calendar, BookOpen, 
  AlertCircle, Plus, X, GripVertical, Settings, RotateCcw, Maximize2, Minimize2,
  BarChart3, DollarSign, Activity, Bell, Cake, Bus, FileText, ClipboardList,
  Wallet, Building, UserPlus, Check
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { preferencesApi, reportsApi, eventsApi, libraryApi, hostelApi, payrollApi, transportApi, admissionsApi } from '../../services/api'
import { WIDGET_COMPONENTS } from '../../components/dashboard/widgets'

const ICON_MAP = {
  BarChart3, Users, DollarSign, Calendar, Activity, Bell, Cake, BookOpen,
  Bus, FileText, ClipboardList, Wallet, Building, UserPlus, TrendingUp, GraduationCap
}

const SIZE_CLASSES = {
  small: 'col-span-1',
  medium: 'col-span-1 md:col-span-1',
  large: 'col-span-1 md:col-span-2',
  full: 'col-span-1 md:col-span-2 lg:col-span-4'
}

export default function DashboardHome() {
  const { user } = useAuth()
  const [widgets, setWidgets] = useState([])
  const [availableWidgets, setAvailableWidgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [widgetData, setWidgetData] = useState({})
  const [saving, setSaving] = useState(false)

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    loadPreferences()
    loadAvailableWidgets()
    loadWidgetData()
  }, [])

  const loadPreferences = async () => {
    try {
      const res = await preferencesApi.get()
      if (res.success && res.data?.dashboard?.widgets) {
        const visibleWidgets = res.data.dashboard.widgets
          .filter(w => w.visible)
          .sort((a, b) => a.position - b.position)
        setWidgets(visibleWidgets)
      }
    } catch (err) {
      console.error('Failed to load preferences:', err)
      setWidgets(getDefaultWidgets())
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableWidgets = async () => {
    try {
      const res = await preferencesApi.getAvailableWidgets()
      if (res.success) setAvailableWidgets(res.data || [])
    } catch (err) { console.error(err) }
  }

  const loadWidgetData = async () => {
    try {
      // Fetch all data in parallel
      const results = await Promise.allSettled([
        reportsApi.getDashboard(),
        eventsApi.getUpcoming(5),
        libraryApi.getStats(),
        hostelApi.getStats(),
        payrollApi.getStats(),
        transportApi.getStats(),
        admissionsApi.getStats()
      ])

      const [dashboardRes, eventsRes, libraryRes, hostelRes, payrollRes, transportRes, admissionsRes] = results

      const dashboardData = dashboardRes.status === 'fulfilled' ? dashboardRes.value?.data : {}
      const eventsData = eventsRes.status === 'fulfilled' ? eventsRes.value?.data : []
      const libraryData = libraryRes.status === 'fulfilled' ? libraryRes.value?.data : {}
      const hostelData = hostelRes.status === 'fulfilled' ? hostelRes.value?.data : {}
      const payrollData = payrollRes.status === 'fulfilled' ? payrollRes.value?.data : {}
      const transportData = transportRes.status === 'fulfilled' ? transportRes.value?.data : {}
      const admissionsData = admissionsRes.status === 'fulfilled' ? admissionsRes.value?.data : {}

      setWidgetData({
        stats: {
          students: dashboardData?.totalStudents || dashboardData?.students || 0,
          teachers: dashboardData?.totalTeachers || dashboardData?.teachers || 0,
          staff: dashboardData?.totalStaff || 0,
          parents: dashboardData?.totalParents || 0
        },
        attendance: {
          percentage: dashboardData?.todayAttendance?.percentage || dashboardData?.attendancePercentage || 0,
          present: dashboardData?.todayAttendance?.present || 0,
          absent: dashboardData?.todayAttendance?.absent || 0
        },
        fees: {
          collected: dashboardData?.feeCollectedThisMonth || dashboardData?.feeCollection?.thisMonth || 0,
          pending: dashboardData?.pendingFees || 0,
          target: 500000
        },
        events: { events: eventsData || [] },
        activities: { activities: dashboardData?.recentActivity?.activities || [] },
        announcements: { announcements: dashboardData?.announcements || [] },
        birthdays: { birthdays: dashboardData?.todayBirthdays || [] },
        library: {
          totalBooks: libraryData?.totalBooks || 0,
          issued: libraryData?.issuedBooks || libraryData?.issued || 0,
          overdue: libraryData?.overdueBooks || libraryData?.overdue || 0
        },
        transport: {
          active: transportData?.activeVehicles || transportData?.vehicles || 0,
          routes: transportData?.totalRoutes || transportData?.routes || 0,
          students: transportData?.studentsUsing || 0
        },
        homework: {
          pending: dashboardData?.homework?.pending || 0,
          submitted: dashboardData?.homework?.submitted || 0
        },
        exams: { upcoming: dashboardData?.upcomingExams || [] },
        payroll: {
          monthlyNet: payrollData?.currentMonth?.totalPaid || payrollData?.monthlyNet || 0,
          employees: payrollData?.totalEmployees || payrollData?.configuredSalaries || 0,
          pending: payrollData?.pendingPayslips || 0
        },
        hostel: {
          occupancy: hostelData?.occupancyRate || hostelData?.occupancy || 0,
          occupied: hostelData?.occupiedBeds || 0,
          total: hostelData?.totalBeds || hostelData?.totalCapacity || 0
        },
        admissions: {
          applications: admissionsData?.totalApplications || admissionsData?.applications || 0,
          enrolled: admissionsData?.enrolled || admissionsData?.approved || 0,
          pending: admissionsData?.pending || admissionsData?.pendingReview || 0
        },
        performance: { subjects: dashboardData?.subjectPerformance || [] }
      })
    } catch (err) { 
      console.error('Error loading widget data:', err) 
    }
  }

  const getDefaultWidgets = () => [
    { id: 'stats-overview', type: 'stats', title: 'Quick Stats', size: 'full', position: 0, visible: true },
    { id: 'attendance-today', type: 'attendance', title: "Today's Attendance", size: 'medium', position: 1, visible: true },
    { id: 'fee-collection', type: 'fees', title: 'Fee Collection', size: 'medium', position: 2, visible: true },
    { id: 'upcoming-events', type: 'events', title: 'Upcoming Events', size: 'medium', position: 3, visible: true },
    { id: 'recent-activities', type: 'activities', title: 'Recent Activities', size: 'medium', position: 4, visible: true }
  ]

  const handleReorder = (newOrder) => {
    const updated = newOrder.map((widget, index) => ({ ...widget, position: index }))
    setWidgets(updated)
  }

  const saveLayout = async () => {
    setSaving(true)
    try {
      await preferencesApi.updateWidgets(widgets)
      toast.success('Dashboard layout saved!')
      setEditMode(false)
    } catch (err) {
      toast.error('Failed to save layout')
    }
    setSaving(false)
  }

  const addWidget = async (widget) => {
    const newWidget = {
      id: widget.id,
      type: widget.type,
      title: widget.title,
      size: 'medium',
      position: widgets.length,
      visible: true
    }
    const updated = [...widgets, newWidget]
    setWidgets(updated)
    try {
      await preferencesApi.addWidget(newWidget)
      toast.success('Widget added!')
    } catch (err) { console.error(err) }
    setShowAddWidget(false)
  }

  const removeWidget = async (widgetId) => {
    const updated = widgets.filter(w => w.id !== widgetId)
    setWidgets(updated)
    try {
      await preferencesApi.removeWidget(widgetId)
      toast.success('Widget removed')
    } catch (err) { console.error(err) }
  }

  const changeWidgetSize = (widgetId, size) => {
    const updated = widgets.map(w => w.id === widgetId ? { ...w, size } : w)
    setWidgets(updated)
  }

  const resetDashboard = async () => {
    if (!confirm('Reset dashboard to default layout?')) return
    try {
      await preferencesApi.resetToDefault()
      setWidgets(getDefaultWidgets())
      toast.success('Dashboard reset to default')
      setEditMode(false)
    } catch (err) { toast.error('Failed to reset') }
  }

  const activeWidgetIds = widgets.map(w => w.id)
  const addableWidgets = availableWidgets.filter(w => !activeWidgetIds.includes(w.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.name?.split(' ')[0] || 'User'}! 👋
          </motion.h1>
          <p className="text-gray-500 mt-1">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <button onClick={resetDashboard} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <RotateCcw className="w-4 h-4" />Reset
              </button>
              <button onClick={() => setEditMode(false)} className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={saveLayout} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                <Check className="w-4 h-4" />{saving ? 'Saving...' : 'Save Layout'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowAddWidget(true)} className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4" />Add Widget
              </button>
              <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <Settings className="w-4 h-4" />Customize
              </button>
            </>
          )}
        </div>
      </div>

      {editMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-blue-700">Drag widgets to reorder. Click × to remove. Use resize buttons to change size.</p>
        </div>
      )}

      {/* Widgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <Reorder.Group axis="y" values={widgets} onReorder={handleReorder} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {widgets.map((widget) => (
            <Reorder.Item key={widget.id} value={widget} drag={editMode} className={SIZE_CLASSES[widget.size] || 'col-span-1'}>
              <WidgetCard
                widget={widget}
                data={widgetData[widget.type]}
                editMode={editMode}
                onRemove={() => removeWidget(widget.id)}
                onResize={(size) => changeWidgetSize(widget.id, size)}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {widgets.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
          <p className="text-gray-500 mb-4">No widgets on your dashboard</p>
          <button onClick={() => setShowAddWidget(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg">
            Add Your First Widget
          </button>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Add Widget</h2>
              <button onClick={() => setShowAddWidget(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {addableWidgets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">All widgets are already on your dashboard</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {addableWidgets.map((widget) => {
                    const IconComp = ICON_MAP[widget.icon] || BarChart3
                    return (
                      <button key={widget.id} onClick={() => addWidget(widget)} className="p-4 border rounded-xl hover:border-primary-500 hover:bg-primary-50 text-left transition-all">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mb-3">
                          <IconComp className="w-5 h-5 text-primary-600" />
                        </div>
                        <p className="font-medium text-sm">{widget.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{widget.description}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function WidgetCard({ widget, data, editMode, onRemove, onResize }) {
  const WidgetComponent = WIDGET_COMPONENTS[widget.type]
  const [showSizeMenu, setShowSizeMenu] = useState(false)

  return (
    <motion.div layout className={`bg-white rounded-xl border shadow-sm overflow-hidden ${editMode ? 'ring-2 ring-primary-200 cursor-move' : ''}`}>
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          {editMode && <GripVertical className="w-4 h-4 text-gray-400" />}
          <h3 className="font-medium text-sm">{widget.title}</h3>
        </div>
        {editMode && (
          <div className="flex items-center gap-1">
            <div className="relative">
              <button onClick={() => setShowSizeMenu(!showSizeMenu)} className="p-1 hover:bg-gray-200 rounded" title="Resize">
                <Maximize2 className="w-4 h-4 text-gray-500" />
              </button>
              {showSizeMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 w-28">
                  {['small', 'medium', 'large', 'full'].map(size => (
                    <button key={size} onClick={() => { onResize(size); setShowSizeMenu(false) }} className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 capitalize ${widget.size === size ? 'bg-primary-50 text-primary-600' : ''}`}>
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onRemove} className="p-1 hover:bg-red-100 rounded" title="Remove">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        {WidgetComponent ? <WidgetComponent data={data} /> : <p className="text-gray-500 text-sm">Widget not found</p>}
      </div>
    </motion.div>
  )
}
