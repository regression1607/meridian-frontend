import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  BookOpen, Search, Filter, Calendar, Clock,
  CheckCircle, AlertCircle, Eye, Award, User,
  ChevronLeft, ChevronRight, FileText, XCircle, Download
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { TableSkeleton } from '../../../components/ui/Loading'
import { homeworkApi, classesApi, subjectsApi, institutionsApi } from '../../../services/api'
import { generateCSV, downloadCSV, CSV_TEMPLATES } from '../../../utils/csvUtils'

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  late: { label: 'Late', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  graded: { label: 'Graded', color: 'bg-green-100 text-green-700', icon: Award },
  returned: { label: 'Returned', color: 'bg-purple-100 text-purple-700', icon: FileText }
}

export default function HomeworkSubmissions() {
  const navigate = useNavigate()
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [loading, setLoading] = useState(true)
  const [homework, setHomework] = useState([])
  const [allSubmissions, setAllSubmissions] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  const [filters, setFilters] = useState({
    classId: '',
    subjectId: '',
    status: '',
    search: ''
  })

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
  }, [institutionId, isPlatformAdmin])

  useEffect(() => {
    if (institutionId) {
      fetchClasses()
      fetchSubjects()
    }
  }, [institutionId])

  useEffect(() => {
    if (institutionId) {
      fetchHomeworkWithSubmissions()
    }
  }, [institutionId, filters.classId, filters.subjectId])

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getAll({ institution: institutionId })
      setClasses(response.data || [])
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectsApi.getAll({ institution: institutionId })
      setSubjects(response.data || [])
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchHomeworkWithSubmissions = async () => {
    try {
      setLoading(true)
      const params = {
        institution: institutionId,
        limit: 100,
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.subjectId && { subjectId: filters.subjectId })
      }
      const response = await homeworkApi.getAll(params)
      const homeworkList = response.data || []
      setHomework(homeworkList)

      // Flatten all submissions from all homework
      const submissions = []
      homeworkList.forEach(hw => {
        if (hw.submissions && hw.submissions.length > 0) {
          hw.submissions.forEach(sub => {
            submissions.push({
              ...sub,
              homework: {
                _id: hw._id,
                title: hw.title,
                dueDate: hw.dueDate,
                maxScore: hw.maxScore,
                class: hw.class,
                section: hw.section,
                subject: hw.subject
              }
            })
          })
        }
      })

      // Sort by submission date (newest first)
      submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      setAllSubmissions(submissions)
      setPagination(prev => ({
        ...prev,
        total: submissions.length,
        pages: Math.ceil(submissions.length / prev.limit)
      }))
    } catch (error) {
      console.error('Failed to fetch homework:', error)
      toast.error('Failed to fetch submissions')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter and paginate submissions
  const filteredSubmissions = allSubmissions.filter(sub => {
    if (filters.status && sub.status !== filters.status) return false
    if (filters.search) {
      const search = filters.search.toLowerCase()
      const studentName = `${sub.student?.profile?.firstName || ''} ${sub.student?.profile?.lastName || ''}`.toLowerCase()
      const homeworkTitle = sub.homework?.title?.toLowerCase() || ''
      if (!studentName.includes(search) && !homeworkTitle.includes(search)) return false
    }
    return true
  })

  const paginatedSubmissions = filteredSubmissions.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  const totalFiltered = filteredSubmissions.length
  const totalPages = Math.ceil(totalFiltered / pagination.limit)

  // Stats
  const stats = {
    total: allSubmissions.length,
    graded: allSubmissions.filter(s => s.status === 'graded').length,
    pending: allSubmissions.filter(s => s.status === 'submitted').length,
    late: allSubmissions.filter(s => s.status === 'late').length
  }

  // Export handler
  const [exporting, setExporting] = useState(false)
  const handleExport = () => {
    if (allSubmissions.length === 0) {
      toast.warning('No submissions to export')
      return
    }
    setExporting(true)
    try {
      const exportData = allSubmissions.map(sub => ({
        studentName: `${sub.student?.profile?.firstName || ''} ${sub.student?.profile?.lastName || ''}`.trim(),
        rollNumber: sub.student?.studentData?.rollNumber || sub.student?.studentData?.admissionNumber || '',
        homeworkTitle: sub.homework?.title || '',
        subject: sub.homework?.subject?.name || '',
        submittedAt: sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '',
        status: sub.status || '',
        score: sub.score || '',
        maxScore: sub.homework?.maxScore || '',
        feedback: sub.feedback || ''
      }))
      const headers = CSV_TEMPLATES.homework.headers
      const csvContent = generateCSV(exportData, headers)
      downloadCSV(csvContent, `homework_submissions_${new Date().toISOString().split('T')[0]}`)
      toast.success('Submissions exported successfully')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homework Submissions</h1>
          <p className="text-gray-500 mt-1">View and grade all student submissions</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || allSubmissions.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {exporting ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
          Export
        </button>
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Submissions</p>
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
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">Pending Review</p>
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
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
              <p className="text-xs text-gray-500">Graded</p>
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
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
              <p className="text-xs text-gray-500">Late Submissions</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or homework title..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filters.classId}
            onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
          >
            <option value="">All Classes</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
          <select
            value={filters.subjectId}
            onChange={(e) => setFilters(prev => ({ ...prev, subjectId: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
          >
            <option value="">All Subjects</option>
            {subjects.map(sub => (
              <option key={sub._id} value={sub._id}>{sub.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="late">Late</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : paginatedSubmissions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No Submissions Found</p>
            <p className="text-sm mt-1">
              {filters.search || filters.status ? 'Try adjusting your filters' : 'No students have submitted homework yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Homework</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted At</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSubmissions.map((submission, index) => {
                  const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.submitted
                  const StatusIcon = statusConfig.icon

                  return (
                    <tr key={`${submission.homework?._id}-${submission.student?._id}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                            {submission.student?.profile?.firstName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {submission.student?.profile?.firstName} {submission.student?.profile?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Roll: {submission.student?.studentData?.rollNumber || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{submission.homework?.title}</p>
                          <p className="text-xs text-gray-500">
                            {submission.homework?.class?.name} • {submission.homework?.subject?.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{formatDate(submission.submittedAt)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {submission.grade ? (
                          <span className="text-sm font-medium text-gray-900">
                            {submission.grade.score}/{submission.grade.maxScore}
                            <span className="text-xs text-gray-500 ml-1">
                              ({submission.grade.percentage?.toFixed(1)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => navigate(`/dashboard/homework/${submission.homework?._id}`)}
                          className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, totalFiltered)}</span> of{' '}
              <span className="font-medium">{totalFiltered}</span> submissions
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.page} of {totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
