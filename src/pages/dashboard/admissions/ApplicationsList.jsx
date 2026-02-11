import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Users, Search, Filter, Eye, CheckCircle, XCircle, Clock,
  ChevronLeft, ChevronRight, FileText, UserPlus, Download,
  Calendar, Phone, Mail, Trash2, Edit
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { TableSkeleton } from '../../../components/ui/Loading'
import Pagination from '../../../components/ui/Pagination'
import { admissionsApi, classesApi } from '../../../services/api'
import { generateCSV, downloadCSV, CSV_TEMPLATES } from '../../../utils/csvUtils'

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: FileText },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  document_pending: { label: 'Docs Pending', color: 'bg-orange-100 text-orange-700', icon: FileText },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
  enrolled: { label: 'Enrolled', color: 'bg-purple-100 text-purple-700', icon: UserPlus },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-700', icon: XCircle }
}

export default function ApplicationsList() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState([])
  const [classes, setClasses] = useState([])
  const [stats, setStats] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 0 })

  useEffect(() => {
    fetchClasses()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [statusFilter, classFilter, pagination.page])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [statusFilter, classFilter, searchQuery])

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getAll()
      if (response.success) setClasses(response.data || [])
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await admissionsApi.getStats()
      if (response.success) setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(classFilter !== 'all' && { classId: classFilter }),
        ...(searchQuery && { search: searchQuery })
      }
      const response = await admissionsApi.getApplications(params)
      if (response.success) {
        setApplications(response.data || [])
        if (response.meta) {
          setPagination(prev => ({ ...prev, total: response.meta.total, pages: response.meta.totalPages }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const response = await admissionsApi.updateApplicationStatus(applicationId, { status: newStatus })
      if (response.success) {
        toast.success(`Application ${newStatus.replace('_', ' ')}`)
        fetchApplications()
        fetchStats()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
    }
  }

  const handleDelete = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return
    try {
      const response = await admissionsApi.deleteApplication(applicationId)
      if (response.success) {
        toast.success('Application deleted')
        fetchApplications()
        fetchStats()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete application')
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const calculateAge = (dob) => {
    if (!dob) return '-'
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
    return `${age} yrs`
  }

  // Export handler
  const [exporting, setExporting] = useState(false)
  const handleExport = () => {
    if (applications.length === 0) {
      toast.warning('No applications to export')
      return
    }
    setExporting(true)
    try {
      const exportData = applications.map(app => ({
        firstName: app.studentDetails?.firstName || '',
        lastName: app.studentDetails?.lastName || '',
        email: app.studentDetails?.email || '',
        phone: app.studentDetails?.phone || app.parentDetails?.phone || '',
        dateOfBirth: app.studentDetails?.dateOfBirth ? new Date(app.studentDetails.dateOfBirth).toISOString().split('T')[0] : '',
        gender: app.studentDetails?.gender || '',
        applyingForClass: app.applyingForClass?.name || '',
        previousSchool: app.studentDetails?.previousSchool || '',
        parentName: app.parentDetails?.fatherName || app.parentDetails?.motherName || '',
        parentPhone: app.parentDetails?.phone || '',
        parentEmail: app.parentDetails?.email || '',
        address: app.address?.street || '',
        city: app.address?.city || '',
        state: app.address?.state || '',
        status: app.status || ''
      }))
      const headers = CSV_TEMPLATES.admissions.headers
      const csvContent = generateCSV(exportData, headers)
      downloadCSV(csvContent, `admissions_${new Date().toISOString().split('T')[0]}`)
      toast.success('Applications exported successfully')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admission Applications</h1>
          <p className="text-gray-600">Manage student admission applications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || applications.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Export
          </button>
          <button
            onClick={() => navigate('/dashboard/admissions/apply')}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            New Application
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const StatusIcon = config.icon
            // Map frontend keys to backend keys (camelCase)
            const keyMap = {
              'under_review': 'underReview',
              'document_pending': 'documentPending'
            }
            const backendKey = keyMap[key] || key
            const count = stats.byStatus?.[backendKey] || 0
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl ${config.color} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => setStatusFilter(key)}
              >
                <div className="flex items-center justify-between">
                  <StatusIcon className="w-5 h-5" />
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-sm mt-1 font-medium">{config.label}</p>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, application number, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Classes</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSkeleton rows={10} columns={8} />
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No applications found</h3>
            <p className="text-gray-500 mt-1">Applications will appear here when submitted</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Application</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Parent</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => {
                  const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted
                  const StatusIcon = statusConfig.icon
                  return (
                    <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-indigo-600">{app.applicationNumber}</div>
                        <div className="text-xs text-gray-500">{app.academicYear}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {app.studentInfo?.photo ? (
                            <img src={app.studentInfo.photo} alt="" className="w-8 h-8 rounded-full mr-3" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                              <span className="text-indigo-600 font-medium text-sm">
                                {app.studentInfo?.firstName?.charAt(0)}{app.studentInfo?.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {app.studentInfo?.firstName} {app.studentInfo?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {app.studentInfo?.gender} • {calculateAge(app.studentInfo?.dateOfBirth)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {app.applyingForClass?.name || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* Show Father > Mother > Guardian based on availability */}
                        {app.fatherInfo?.name && !app.fatherInfo?.isDeceased ? (
                          <>
                            <div className="text-sm text-gray-900">{app.fatherInfo.name}</div>
                            <div className="text-xs text-gray-500">{app.fatherInfo?.occupation}</div>
                          </>
                        ) : app.motherInfo?.name && !app.motherInfo?.isDeceased ? (
                          <>
                            <div className="text-sm text-gray-900">{app.motherInfo.name}</div>
                            <div className="text-xs text-gray-500">{app.motherInfo?.occupation}</div>
                          </>
                        ) : app.guardianInfo?.name ? (
                          <>
                            <div className="text-sm text-gray-900">{app.guardianInfo.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{app.guardianInfo?.relation || 'Guardian'}</div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {/* Show contact based on available parent/guardian */}
                        {app.fatherInfo?.phone && !app.fatherInfo?.isDeceased ? (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {app.fatherInfo.phone}
                            </div>
                            {app.fatherInfo?.email && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {app.fatherInfo.email}
                              </div>
                            )}
                          </>
                        ) : app.motherInfo?.phone && !app.motherInfo?.isDeceased ? (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {app.motherInfo.phone}
                            </div>
                            {app.motherInfo?.email && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {app.motherInfo.email}
                              </div>
                            )}
                          </>
                        ) : app.guardianInfo?.phone ? (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-1" />
                              {app.guardianInfo.phone}
                            </div>
                            {app.guardianInfo?.email && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {app.guardianInfo.email}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-sm text-gray-400">-</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(app.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => navigate(`/dashboard/admissions/applications/${app._id}`)}
                            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!['enrolled', 'rejected'].includes(app.status) && (
                            <button
                              onClick={() => navigate(`/dashboard/admissions/applications/${app._id}/edit`)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Application"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {app.status === 'submitted' && (
                            <button
                              onClick={() => handleStatusChange(app._id, 'under_review')}
                              className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Start Review"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}
                          {app.status === 'under_review' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(app._id, 'approved')}
                                className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusChange(app._id, 'rejected')}
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {app.status === 'approved' && (
                            <button
                              onClick={() => navigate(`/dashboard/admissions/enroll/${app._id}`)}
                              className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Enroll Student"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          {!['enrolled', 'rejected'].includes(app.status) && isAdmin && (
                            <button
                              onClick={() => handleDelete(app._id)}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          itemName="applications"
        />
      </div>
    </div>
  )
}
