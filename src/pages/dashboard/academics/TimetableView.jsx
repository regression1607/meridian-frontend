import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  Calendar, Clock, Plus, Edit, Trash2, Settings, RefreshCw, X
} from 'lucide-react'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import { timetablesApi, classesApi, subjectsApi, usersApi } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import { TableSkeleton } from '../../../components/ui/Loading'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', 
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat'
}

// Convert 24hr to 12hr format
const formatTime12hr = (time24) => {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export default function TimetableView() {
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [timetable, setTimetable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState(null)
  const [periodForm, setPeriodForm] = useState({ subject: '', teacher: '', room: '' })
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [timetableSettings, setTimetableSettings] = useState({ periodsPerDay: 8, dayStartTime: '08:00', periodDuration: 45 })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, timetable: null })
  const [deleting, setDeleting] = useState(false)
  const [draggedBreak, setDraggedBreak] = useState(null)

  // For platform admins without institution, fetch first institution
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!institutionId && isPlatformAdmin()) {
        try {
          const token = localStorage.getItem('meridian_token')
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/institutions?limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success && data.data?.length > 0) {
            setInstitutionId(data.data[0]._id)
          }
        } catch (error) {
          console.error('Failed to fetch institution:', error)
        }
      }
    }
    fetchInstitution()
  }, [isPlatformAdmin])

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (institutionId) {
      fetchInitialData()
    }
  }, [institutionId])

  useEffect(() => {
    if (selectedClass) {
      fetchTimetable()
    }
  }, [selectedClass, selectedSection])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        classesApi.getAll({ institution: institutionId }),
        subjectsApi.getAll({ limit: 100, institution: institutionId }),
        usersApi.getAll({ role: 'teacher', limit: 100 })
      ])
      setClasses(classesRes.data || [])
      setSubjects(subjectsRes.data || [])
      setTeachers(teachersRes.data || [])
      
      if (classesRes.data?.length > 0) {
        setSelectedClass(classesRes.data[0]._id)
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTimetable = async () => {
    try {
      setLoading(true)
      const params = { institution: institutionId }
      if (selectedSection) params.section = selectedSection
      const response = await timetablesApi.getByClass(selectedClass, params)
      setTimetable(response.data)
    } catch (error) {
      setTimetable(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTimetable = async () => {
    try {
      setSaving(true)
      const selectedClassData = classes.find(c => c._id === selectedClass)
      const defaultSchedule = await timetablesApi.generateSchedule({
        periodsPerDay: timetableSettings.periodsPerDay,
        dayStartTime: timetableSettings.dayStartTime,
        periodDuration: timetableSettings.periodDuration
      })
      
      await timetablesApi.create({
        class: selectedClass,
        section: selectedSection || undefined,
        academicYear: selectedClassData?.academicYear || '2025-2026',
        schedule: defaultSchedule.data,
        periodsPerDay: timetableSettings.periodsPerDay,
        periodDuration: timetableSettings.periodDuration,
        dayStartTime: timetableSettings.dayStartTime,
        institution: institutionId
      })
      
      toast.success('Timetable created successfully')
      setShowSettingsModal(false)
      fetchTimetable()
    } catch (error) {
      toast.error(error.message || 'Failed to create timetable')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTimetable = async () => {
    if (!deleteDialog.timetable) return
    setDeleting(true)
    try {
      await timetablesApi.delete(deleteDialog.timetable._id)
      toast.success('Timetable deleted successfully')
      setDeleteDialog({ open: false, timetable: null })
      setTimetable(null)
    } catch (error) {
      toast.error(error.message || 'Failed to delete timetable')
    } finally {
      setDeleting(false)
    }
  }

  const handleClearPeriod = async () => {
    if (!timetable || !editingPeriod) return
    
    setSaving(true)
    try {
      const updatedSchedule = timetable.schedule.map(daySchedule => {
        if (daySchedule.day === editingPeriod.day) {
          const updatedPeriods = [...daySchedule.periods]
          updatedPeriods[editingPeriod.periodIndex] = {
            ...updatedPeriods[editingPeriod.periodIndex],
            subject: null,
            teacher: null,
            room: ''
          }
          return { ...daySchedule, periods: updatedPeriods }
        }
        return daySchedule
      })

      await timetablesApi.update(timetable._id, { schedule: updatedSchedule, institution: institutionId })
      toast.success('Period cleared')
      setShowEditModal(false)
      setEditingPeriod(null)
      fetchTimetable()
    } catch (error) {
      toast.error(error.message || 'Failed to clear period')
    } finally {
      setSaving(false)
    }
  }

  const handleEditPeriod = (day, periodIndex, period) => {
    setEditingPeriod({ day, periodIndex, period })
    setPeriodForm({
      subject: period.subject?._id || '',
      teacher: period.teacher?._id || '',
      room: period.room || ''
    })
    setShowEditModal(true)
  }

  const handleSavePeriod = async () => {
    if (!timetable || !editingPeriod) return
    
    setSaving(true)
    try {
      const updatedSchedule = timetable.schedule.map(daySchedule => {
        if (daySchedule.day === editingPeriod.day) {
          const updatedPeriods = [...daySchedule.periods]
          updatedPeriods[editingPeriod.periodIndex] = {
            ...updatedPeriods[editingPeriod.periodIndex],
            subject: periodForm.subject || null,
            teacher: periodForm.teacher || null,
            room: periodForm.room
          }
          return { ...daySchedule, periods: updatedPeriods }
        }
        return daySchedule
      })

      await timetablesApi.update(timetable._id, { schedule: updatedSchedule, institution: institutionId })
      toast.success('Period updated successfully')
      setShowEditModal(false)
      setEditingPeriod(null)
      fetchTimetable()
    } catch (error) {
      toast.error(error.message || 'Failed to update period')
    } finally {
      setSaving(false)
    }
  }

  const selectedClassData = classes.find(c => c._id === selectedClass)
  const sections = selectedClassData?.sections || []

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s._id === subjectId)
    return subject?.name || ''
  }

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t._id === teacherId)
    return teacher?.profile ? `${teacher.profile.firstName} ${teacher.profile.lastName}` : ''
  }

  // Drag and drop handlers for breaks
  const handleDragStart = (periodIndex, breakType) => {
    setDraggedBreak({ periodIndex, breakType })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (targetPeriodIndex) => {
    if (!draggedBreak || !timetable || draggedBreak.periodIndex === targetPeriodIndex) {
      setDraggedBreak(null)
      return
    }

    setSaving(true)
    try {
      // Swap the break with the target period across all days
      const updatedSchedule = timetable.schedule.map(daySchedule => {
        const newPeriods = [...daySchedule.periods]
        const sourceBreak = { ...newPeriods[draggedBreak.periodIndex] }
        const targetPeriod = { ...newPeriods[targetPeriodIndex] }
        
        // Preserve timing but swap content
        newPeriods[draggedBreak.periodIndex] = {
          ...sourceBreak,
          subject: targetPeriod.subject,
          teacher: targetPeriod.teacher,
          room: targetPeriod.room,
          isBreak: targetPeriod.isBreak || false,
          breakType: targetPeriod.breakType
        }
        newPeriods[targetPeriodIndex] = {
          ...targetPeriod,
          subject: null,
          teacher: null,
          room: '',
          isBreak: true,
          breakType: sourceBreak.breakType
        }
        
        return { ...daySchedule, periods: newPeriods }
      })

      await timetablesApi.update(timetable._id, { schedule: updatedSchedule, institution: institutionId })
      toast.success('Break moved successfully')
      fetchTimetable()
    } catch (error) {
      toast.error(error.message || 'Failed to move break')
    } finally {
      setSaving(false)
      setDraggedBreak(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 mt-1">View and manage class schedules</p>
        </div>
      </div>

      {/* Class/Section Selector */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value)
                setSelectedSection('')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a class</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          {sections.length > 0 && (
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Sections</option>
                {sections.map(s => (
                  <option key={s._id} value={s._id}>Section {s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Timetable Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : !selectedClass ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a class</h3>
            <p className="text-gray-500">Choose a class to view its timetable</p>
          </div>
        ) : !timetable ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timetable found</h3>
            <p className="text-gray-500 mb-4">Create a timetable for this class</p>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              Create Timetable
            </button>
          </div>
        ) : (
          <>
          {/* Timetable Actions Bar */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span><Clock className="w-4 h-4 inline mr-1" />{timetable.periodsPerDay} periods/day</span>
              <span>{timetable.periodDuration} min each</span>
              <span>Starts at {timetable.dayStartTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchTimetable}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteDialog({ open: true, timetable })}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete Timetable"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Time</th>
                  {DAYS.map(day => (
                    <th key={day} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {DAY_LABELS[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timetable.schedule[0]?.periods.map((_, periodIndex) => {
                  const firstDayPeriod = timetable.schedule[0].periods[periodIndex]
                  const isBreakRow = firstDayPeriod?.isBreak
                  return (
                    <tr 
                      key={periodIndex} 
                      className={`${isBreakRow ? 'bg-amber-50' : ''} ${draggedBreak && !isBreakRow ? 'hover:bg-primary-50' : ''}`}
                      onDragOver={!isBreakRow ? handleDragOver : undefined}
                      onDrop={!isBreakRow ? () => handleDrop(periodIndex) : undefined}
                    >
                      <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                        <div className="font-medium">{formatTime12hr(firstDayPeriod?.startTime)}</div>
                        <div>{formatTime12hr(firstDayPeriod?.endTime)}</div>
                      </td>
                      {DAYS.map(day => {
                        const daySchedule = timetable.schedule.find(d => d.day === day)
                        const period = daySchedule?.periods[periodIndex]
                        
                        if (period?.isBreak) {
                          return (
                            <td key={day} className="px-2 py-2 text-center">
                              <div 
                                draggable
                                onDragStart={() => handleDragStart(periodIndex, period.breakType)}
                                className="text-xs font-medium text-amber-700 cursor-grab active:cursor-grabbing p-2 rounded hover:bg-amber-100 transition"
                                title="Drag to move break"
                              >
                                {period.breakType === 'lunch' ? '🍽️ Lunch' : '☕ Break'}
                              </div>
                            </td>
                          )
                        }

                        return (
                          <td key={day} className="px-2 py-2">
                            <div
                              onClick={() => handleEditPeriod(day, periodIndex, period || {})}
                              className={`min-h-[60px] p-2 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition ${draggedBreak ? 'border-dashed border-primary-300' : ''}`}
                            >
                              {period?.subject ? (
                                <>
                                  <div className="text-xs font-medium text-gray-900 truncate">
                                    {period.subject.name || getSubjectName(period.subject)}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    {period.teacher?.profile?.firstName || getTeacherName(period.teacher)}
                                  </div>
                                  {period.room && (
                                    <div className="text-xs text-gray-400">Room: {period.room}</div>
                                  )}
                                </>
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-300">
                                  <Plus className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </motion.div>

      {/* Edit Period Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Period</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  value={periodForm.subject}
                  onChange={(e) => setPeriodForm({ ...periodForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  value={periodForm.teacher}
                  onChange={(e) => setPeriodForm({ ...periodForm, teacher: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.profile?.firstName} {t.profile?.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <input
                  type="text"
                  value={periodForm.room}
                  onChange={(e) => setPeriodForm({ ...periodForm, room: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 101"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingPeriod(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {editingPeriod?.period?.subject && (
                  <button
                    onClick={handleClearPeriod}
                    disabled={saving}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={handleSavePeriod}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Timetable Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Timetable</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Configure the timetable settings for {selectedClassData?.name}
              {selectedSection && sections.find(s => s._id === selectedSection) && 
                ` - Section ${sections.find(s => s._id === selectedSection).name}`}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Periods Per Day</label>
                <input
                  type="number"
                  value={timetableSettings.periodsPerDay}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, periodsPerDay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="4"
                  max="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day Start Time</label>
                <input
                  type="time"
                  value={timetableSettings.dayStartTime}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, dayStartTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Duration (minutes)</label>
                <input
                  type="number"
                  value={timetableSettings.periodDuration}
                  onChange={(e) => setTimetableSettings({ ...timetableSettings, periodDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="30"
                  max="60"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTimetable}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Timetable'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, timetable: null })}
        onConfirm={handleDeleteTimetable}
        title="Delete Timetable"
        message="Are you sure you want to delete this timetable? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  )
}
