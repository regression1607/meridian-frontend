import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  BookOpen, Plus, Search, Calendar, Clock,
  Users, CheckCircle, AlertCircle, Eye, Edit, Trash2, FileText, Send, X, Award
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { TableSkeleton } from '../../../components/ui/Loading'
import Pagination from '../../../components/ui/Pagination'
import { homeworkApi, classesApi, subjectsApi, institutionsApi } from '../../../services/api'

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  published: { label: 'Published', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Closed', color: 'bg-red-100 text-red-700' }
}

export default function HomeworkList() {
  const navigate = useNavigate()
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  
  const isStudent = user?.role === 'student'
  const isParent = user?.role === 'parent'
  const isStudentOrParent = isStudent || isParent
  const canManage = ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher'].includes(user?.role)
  const [loading, setLoading] = useState(true)
  const [homework, setHomework] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 0 })
  const [filters, setFilters] = useState({
    classId: '',
    subjectId: '',
    status: '',
    search: ''
  })
  const [stats, setStats] = useState({ totalHomework: 0, totalSubmissions: 0, byStatus: {} })
  const [viewingHomework, setViewingHomework] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

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
      fetchHomework()
      fetchStats()
    }
  }, [institutionId, pagination.page, filters.classId, filters.subjectId, filters.status])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [filters.classId, filters.subjectId, filters.status])

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

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const params = {
        institution: institutionId,
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.classId && { classId: filters.classId }),
        ...(filters.subjectId && { subjectId: filters.subjectId }),
        ...(filters.status && { status: filters.status }),
        // For students, only show published assignments for their class
        ...(isStudentOrParent && { status: 'published' })
      }
      const response = await homeworkApi.getAll(params)
      setHomework(response.data || [])
      if (response.meta) {
        setPagination(prev => ({
          ...prev,
          page: response.meta.page || prev.page,
          total: response.meta.total || 0,
          pages: response.meta.totalPages || Math.ceil((response.meta.total || 0) / prev.limit)
        }))
      }
    } catch (error) {
      console.error('Failed to fetch homework:', error)
      toast.error('Failed to fetch homework')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await homeworkApi.getStats({ institution: institutionId })
      setStats(response.data || { totalHomework: 0, totalSubmissions: 0, byStatus: {} })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this homework?')) return
    try {
      await homeworkApi.delete(id, { institution: institutionId })
      toast.success('Homework deleted successfully')
      fetchHomework()
      fetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to delete homework')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const isOverdue = (dueDate) => new Date() > new Date(dueDate)

  const filteredHomework = homework.filter(hw => {
    if (!filters.search) return true
    const search = filters.search.toLowerCase()
    return hw.title?.toLowerCase().includes(search) ||
           hw.subject?.name?.toLowerCase().includes(search)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isStudentOrParent ? 'My Assignments' : 'Homework & Assignments'}</h1>
          <p className="text-gray-500 mt-1">{isStudentOrParent ? 'View and submit your assignments' : 'Manage and track homework assignments'}</p>
        </div>
        {canManage && (
          <button
            onClick={() => navigate('/dashboard/homework/new')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Assignment
          </button>
        )}
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHomework}</p>
              <p className="text-xs text-gray-500">Total Assignments</p>
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
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
              <p className="text-xs text-gray-500">Total Submissions</p>
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.byStatus?.published || 0}</p>
              <p className="text-xs text-gray-500">Active Assignments</p>
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
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.byStatus?.draft || 0}</p>
              <p className="text-xs text-gray-500">Drafts</p>
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
              placeholder="Search by title or subject..."
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
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Homework Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No Homework Found</p>
            <p className="text-sm mt-1">{isStudentOrParent ? 'No assignments have been assigned yet' : 'Create your first assignment to get started'}</p>
            {canManage && (
              <button
                onClick={() => navigate('/dashboard/homework/new')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Assignment
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assignment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class / Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Submissions</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHomework.map((hw) => {
                  const statusConfig = STATUS_CONFIG[hw.status] || STATUS_CONFIG.draft
                  const overdue = isOverdue(hw.dueDate) && hw.status === 'published'
                  
                  return (
                    <tr key={hw._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{hw.title}</p>
                            <p className="text-xs text-gray-500">
                              By {hw.assignedBy?.profile?.firstName} {hw.assignedBy?.profile?.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {hw.class?.name} {hw.section?.name ? `- ${hw.section.name}` : ''}
                          </p>
                          <p className="text-xs text-gray-500">{hw.subject?.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1.5 ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(hw.dueDate)}</span>
                          {overdue && <AlertCircle className="w-4 h-4" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {hw.submissions?.length || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => { 
                              e.preventDefault()
                              e.stopPropagation()
                              setViewingHomework(hw)
                              setShowViewModal(true) 
                            }}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {isStudent && hw.status === 'published' && (
                            <button
                              onClick={() => navigate(`/dashboard/homework/${hw._id}?submit=true`)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Submit Assignment"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {canManage && (
                            <>
                              <button
                                onClick={() => navigate(`/dashboard/homework/${hw._id}/edit`)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(hw._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          itemName="assignments"
        />
      </motion.div>

      {/* View Homework Modal */}
      {showViewModal && viewingHomework && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Assignment Details</h2>
              <button 
                onClick={() => { setShowViewModal(false); setViewingHomework(null) }} 
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
              {/* Title & Class */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewingHomework.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {viewingHomework.class?.name} {viewingHomework.section?.name ? `- ${viewingHomework.section.name}` : ''} • {viewingHomework.subject?.name}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-600">Due Date</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(viewingHomework.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">Submissions</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{viewingHomework.submissions?.length || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-purple-600">Max Score</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{viewingHomework.maxScore} points</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-amber-600">Status</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">{viewingHomework.status}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingHomework.description || 'No instructions provided'}</p>
                </div>
              </div>

              {/* Assigned By */}
              <div className="text-sm text-gray-500">
                <p>Assigned by: {viewingHomework.assignedBy?.profile?.firstName} {viewingHomework.assignedBy?.profile?.lastName}</p>
                <p>Created: {new Date(viewingHomework.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => { setShowViewModal(false); setViewingHomework(null) }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {isStudent && viewingHomework.status === 'published' && (
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setViewingHomework(null)
                    navigate(`/dashboard/homework/${viewingHomework._id}?submit=true`)
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Submit Assignment
                </button>
              )}
              {canManage && (
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setViewingHomework(null)
                    navigate(`/dashboard/homework/${viewingHomework._id}`)
                  }}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  View Submissions
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
