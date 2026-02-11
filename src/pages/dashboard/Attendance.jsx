import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, Users, Check, X, Clock, UserCheck, 
  ChevronLeft, ChevronRight, Download, Filter, Search,
  CheckCircle, XCircle, AlertCircle, Save, Upload, FileText, FileDown
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { TableSkeleton } from '../../components/ui/Loading'
import { attendanceApi, institutionsApi, classesApi } from '../../services/api'
import { toast } from 'react-toastify'
import {
  parseCSV, validateCSVFormat, downloadCSVTemplate, readCSVFile,
  generateCSV, downloadCSV, CSV_TEMPLATES
} from '../../utils/csvUtils'

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'bg-green-100 text-green-700', icon: CheckCircle, iconColor: 'text-green-600' },
  absent: { label: 'Absent', color: 'bg-red-100 text-red-700', icon: XCircle, iconColor: 'text-red-600' },
  late: { label: 'Late', color: 'bg-amber-100 text-amber-700', icon: Clock, iconColor: 'text-amber-600' },
  half_day: { label: 'Half Day', color: 'bg-blue-100 text-blue-700', icon: AlertCircle, iconColor: 'text-blue-600' },
  leave: { label: 'Leave', color: 'bg-purple-100 text-purple-700', icon: Calendar, iconColor: 'text-purple-600' },
  unmarked: { label: 'Unmarked', color: 'bg-gray-100 text-gray-500', icon: Clock, iconColor: 'text-gray-400' }
}

export default function Attendance() {
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0, presentPercentage: 0 })
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [attendanceData, setAttendanceData] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  
  // Import/Export state
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [importErrors, setImportErrors] = useState([])
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = useRef(null)

  // For platform admins, fetch first institution
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!institutionId && isPlatformAdmin && isPlatformAdmin()) {
        try {
          const response = await institutionsApi.getAll({ limit: 1 })
          if (response.data?.length > 0) {
            setInstitutionId(response.data[0]._id)
          }
        } catch (error) {
          console.error('Failed to fetch institution:', error)
        }
      }
    }
    fetchInstitution()
  }, [isPlatformAdmin])

  useEffect(() => {
    if (institutionId) {
      fetchClasses()
    }
  }, [institutionId])

  useEffect(() => {
    if (selectedClass) {
      fetchClassAttendance()
    }
  }, [selectedClass, selectedSection, selectedDate])

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getAll({ institution: institutionId })
      setClasses(response.data || [])
      if (response.data?.length > 0) {
        setSelectedClass(response.data[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchClassAttendance = async () => {
    try {
      setLoading(true)
      const params = {
        date: selectedDate,
        institution: institutionId,
        ...(selectedSection && { sectionId: selectedSection })
      }
      const response = await attendanceApi.getByClass(selectedClass, params)
      setStudents(response.data || [])
      // Build attendance data map
      const attendanceMap = {}
      response.data?.forEach(student => {
        attendanceMap[student._id] = student.status || 'unmarked'
      })
      setAttendanceData(attendanceMap)
      calculateStats(attendanceMap)
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
      toast.error('Failed to fetch attendance')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data) => {
    const counts = { present: 0, absent: 0, late: 0, half_day: 0, leave: 0, unmarked: 0 }
    Object.values(data).forEach(status => {
      counts[status] = (counts[status] || 0) + 1
    })
    setStats({
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      total: Object.keys(data).length,
      presentPercentage: Object.keys(data).length > 0 
        ? ((counts.present + counts.late) / Object.keys(data).length * 100).toFixed(1)
        : 0
    })
  }

  const handleStatusChange = (studentId, status) => {
    const newData = { ...attendanceData, [studentId]: status }
    setAttendanceData(newData)
    calculateStats(newData)
  }

  const markAllAs = (status) => {
    const newData = {}
    students.forEach(student => {
      newData[student._id] = status
    })
    setAttendanceData(newData)
    calculateStats(newData)
  }

  const saveAttendance = async () => {
    try {
      setSaving(true)
      const attendanceRecords = Object.entries(attendanceData)
        .filter(([_, status]) => status !== 'unmarked')
        .map(([userId, status]) => ({ userId, status }))

      if (attendanceRecords.length === 0) {
        toast.error('Please mark attendance for at least one student')
        return
      }

      console.log('Saving attendance:', { date: selectedDate, institution: institutionId, classId: selectedClass, sectionId: selectedSection, records: attendanceRecords })
      
      const response = await attendanceApi.markBulk({
        date: selectedDate,
        institution: institutionId,
        classId: selectedClass,
        sectionId: selectedSection || undefined,
        attendanceData: attendanceRecords
      })
      
      console.log('Save response:', response)
      toast.success('Attendance saved successfully!')
      
      // Refresh attendance data after save
      await fetchClassAttendance()
    } catch (error) {
      console.error('Failed to save attendance:', error)
      toast.error(error.message || 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const changeDate = (days) => {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + days)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  const selectedClassData = classes.find(c => c._id === selectedClass)

  // Import handlers
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImportFile(file)
    setImportErrors([])
    setImportPreview(null)
    try {
      const csvContent = await readCSVFile(file)
      const { headers, data, errors: parseErrors } = parseCSV(csvContent)
      if (parseErrors.length > 0) {
        setImportErrors(parseErrors)
        return
      }
      // Basic validation for attendance CSV
      const requiredHeaders = ['rollnumber', 'status']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      if (missingHeaders.length > 0) {
        setImportErrors([`Missing required columns: ${missingHeaders.join(', ')}`])
        return
      }
      // Validate status values
      const validStatuses = ['present', 'absent', 'late', 'half_day', 'leave']
      const invalidRows = data.filter(row => !validStatuses.includes(row.status?.toLowerCase()))
      if (invalidRows.length > 0) {
        setImportErrors([`Invalid status values found. Use: ${validStatuses.join(', ')}`])
        return
      }
      setImportPreview({ headers, data, count: data.length })
    } catch (err) {
      setImportErrors([err.message])
    }
  }

  const handleImport = async () => {
    if (!importPreview || importErrors.length > 0) return
    setImporting(true)
    try {
      // Map CSV data to attendance records
      const attendanceRecords = importPreview.data.map(row => {
        const student = students.find(s => s.rollNumber === row.rollnumber)
        return {
          userId: student?._id,
          rollNumber: row.rollnumber,
          status: row.status?.toLowerCase()
        }
      }).filter(r => r.userId)

      if (attendanceRecords.length === 0) {
        toast.error('No matching students found for the roll numbers')
        setImporting(false)
        return
      }

      await attendanceApi.markBulk({
        date: selectedDate,
        institution: institutionId,
        classId: selectedClass,
        sectionId: selectedSection || undefined,
        attendanceData: attendanceRecords
      })
      toast.success(`Imported attendance for ${attendanceRecords.length} students`)
      setShowImportModal(false)
      resetImportModal()
      fetchClassAttendance()
    } catch (err) {
      toast.error(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const resetImportModal = () => {
    setImportFile(null)
    setImportPreview(null)
    setImportErrors([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Export handler
  const handleExport = async () => {
    if (students.length === 0) {
      toast.warning('No students to export')
      return
    }
    setExporting(true)
    try {
      const exportData = students.map(student => ({
        rollNumber: student.rollNumber || '',
        studentName: student.name || '',
        email: student.email || '',
        status: attendanceData[student._id] || 'unmarked',
        date: selectedDate,
        remarks: ''
      }))
      const headers = CSV_TEMPLATES.attendance.headers
      const csvContent = generateCSV(exportData, headers)
      const className = selectedClassData?.name || 'class'
      downloadCSV(csvContent, `attendance_${className}_${selectedDate}`)
      toast.success('Attendance exported successfully')
      setShowExportModal(false)
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  // Filter students by search query
  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true
    const name = student.name?.toLowerCase() || ''
    const rollNo = student.rollNumber?.toLowerCase() || ''
    return name.includes(searchQuery.toLowerCase()) || rollNo.includes(searchQuery.toLowerCase())
  })

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedClass, selectedSection])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500 mt-1">Mark and manage daily student attendance</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            disabled={!selectedClass}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> Import
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            disabled={students.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={saveAttendance}
            disabled={saving || students.length === 0}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Attendance
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Students</p>
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
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
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
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <X className="w-5 h-5" />
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
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.presentPercentage}%</p>
              <p className="text-xs text-gray-500">Attendance Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm font-medium w-32"
              />
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
          >
            <option value="">Select Class</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>

          {/* Section Filter */}
          {selectedClassData?.sections?.length > 0 && (
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
            >
              <option value="">All Sections</option>
              {selectedClassData.sections.map(sec => (
                <option key={sec._id} value={sec._id}>{sec.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Quick Actions */}
        {students.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600 mr-2 flex items-center">Quick Actions:</span>
            <button
              onClick={() => markAllAs('present')}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Mark All Present
            </button>
            <button
              onClick={() => markAllAs('absent')}
              className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" /> Mark All Absent
            </button>
            <button
              onClick={() => markAllAs('late')}
              className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> Mark All Late
            </button>
          </div>
        )}
      </div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={5} />
          </div>
        ) : !selectedClass ? (
          <div className="p-12 text-center text-gray-500">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Select a Class</p>
            <p className="text-sm mt-1">Please select a class to view and mark attendance</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No Students Found</p>
            <p className="text-sm mt-1">
              {searchQuery ? 'No students match your search criteria' : 'No students in this class/section'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          markAllAs('present')
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roll No</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedStudents.map((student, index) => {
                  const currentStatus = attendanceData[student._id] || 'unmarked'
                  const statusConfig = STATUS_CONFIG[currentStatus]
                  
                  return (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={currentStatus === 'present'}
                          onChange={() => handleStatusChange(student._id, currentStatus === 'present' ? 'unmarked' : 'present')}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {student.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {student.rollNumber || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          {(() => {
                            const StatusIcon = statusConfig.icon
                            return <StatusIcon className="w-3.5 h-3.5" />
                          })()}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {Object.entries(STATUS_CONFIG).filter(([key]) => key !== 'unmarked').map(([key, config]) => {
                            const Icon = config.icon
                            const isSelected = currentStatus === key
                            return (
                              <button
                                key={key}
                                onClick={() => handleStatusChange(student._id, key)}
                                title={config.label}
                                className={`p-2 rounded-lg transition-all ${
                                  isSelected 
                                    ? `${config.color} ring-2 ring-offset-1 ring-current` 
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination */}
        {filteredStudents.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredStudents.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                <span className="font-medium">{filteredStudents.length}</span> students
              </p>
              
              {totalPages > 1 && (
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded text-sm ${
                            currentPage === page 
                              ? 'bg-primary-600 text-white' 
                              : 'border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                  <button 
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Legend:</span>
                {Object.entries(STATUS_CONFIG).filter(([key]) => key !== 'unmarked').map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <span key={key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${config.color}`}>
                      <Icon className="w-3 h-3" /> {config.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Import Modal */}
      {showImportModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Import Attendance</h2>
                <p className="text-sm text-gray-500 mt-1">Upload CSV to mark attendance in bulk</p>
              </div>
              <button onClick={() => { setShowImportModal(false); resetImportModal(); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <button onClick={() => downloadCSVTemplate('attendance')} className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 text-sm flex items-center gap-2">
                  <FileDown className="w-4 h-4" /> Download Template
                </button>
                <p className="text-xs text-gray-500 mt-2">Required: rollNumber, status (present/absent/late/half_day/leave), date</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="attendance-csv" />
                <label htmlFor="attendance-csv" className="cursor-pointer">
                  <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">{importFile ? importFile.name : 'Click to select CSV file'}</p>
                </label>
              </div>
              {importErrors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Error</p>
                  <ul className="text-xs text-red-600 mt-1">{importErrors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
                </div>
              )}
              {importPreview && importErrors.length === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-700 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Ready to import {importPreview.count} records</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowImportModal(false); resetImportModal(); }} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleImport} disabled={!importPreview || importErrors.length > 0 || importing} className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                {importing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Importing...</> : <><Upload className="w-4 h-4" /> Import</>}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Export Modal */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Export Attendance</h2>
                <p className="text-sm text-gray-500 mt-1">Download attendance data as CSV</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600">Export attendance for <strong>{selectedClassData?.name || 'selected class'}</strong> on <strong>{selectedDate}</strong></p>
              <p className="text-sm text-gray-500 mt-2">{students.length} students will be exported</p>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowExportModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleExport} disabled={exporting} className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                {exporting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Exporting...</> : <><Download className="w-4 h-4" /> Export CSV</>}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  )
}
