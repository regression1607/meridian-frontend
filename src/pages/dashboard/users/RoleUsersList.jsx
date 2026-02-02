import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Plus, Edit, Trash2, Eye,
  Download, Upload, Users, GraduationCap, UserCheck, ArrowLeft,
  X, FileText, AlertCircle, CheckCircle, FileDown
} from 'lucide-react'
import { TableSkeleton } from '../../../components/ui/Loading'
import { UserPreviewModal } from '../../../components/ui/PreviewModal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Pagination from '../../../components/ui/Pagination'
import SearchFilter from '../../../components/ui/SearchFilter'
import { usersApi } from '../../../services/api'
import {
  parseCSV,
  validateCSVFormat,
  downloadCSVTemplate,
  readCSVFile,
  transformCSVToUserData,
  transformUserDataToCSV,
  generateCSV,
  downloadCSV,
  CSV_TEMPLATES
} from '../../../utils/csvUtils'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const roleColors = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-pink-100 text-pink-700',
  institution_admin: 'bg-indigo-100 text-indigo-700',
  coordinator: 'bg-cyan-100 text-cyan-700',
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-purple-100 text-purple-700',
  parent: 'bg-green-100 text-green-700',
  staff: 'bg-orange-100 text-orange-700'
}

const roleConfig = {
  teacher: { title: 'Teachers', icon: Users, color: 'purple' },
  student: { title: 'Students', icon: GraduationCap, color: 'blue' },
  parent: { title: 'Parents', icon: UserCheck, color: 'green' },
  staff: { title: 'Staff', icon: Users, color: 'orange' }
}

export default function RoleUsersList({ role }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 })
  const [statusFilter, setStatusFilter] = useState('all')
  const [previewUser, setPreviewUser] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null })
  const [deleting, setDeleting] = useState(false)
  
  // Import/Export state
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [importErrors, setImportErrors] = useState([])
  const [importWarnings, setImportWarnings] = useState([])
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)

  const config = roleConfig[role] || { title: 'Users', icon: Users, color: 'gray' }
  const RoleIcon = config.icon

  useEffect(() => {
    fetchUsers()
  }, [role, pagination.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('meridian_token')
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        role: role,
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`${API_BASE_URL}/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users')
      }
      
      if (data.success) {
        setUsers(data.data || [])
        setPagination(prev => ({ ...prev, ...data.meta }))
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers()
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(u => u._id))
    }
  }

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    )
  }

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return
    
    setDeleting(true)
    try {
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/users/${deleteDialog.user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user')
      }
      
      const userName = deleteDialog.user.profile 
        ? `${deleteDialog.user.profile.firstName} ${deleteDialog.user.profile.lastName}` 
        : 'User'
      toast.success(`${userName} deleted successfully`)
      setDeleteDialog({ open: false, user: null })
      fetchUsers()
    } catch (error) {
      toast.error(error.message || 'Failed to delete user')
    } finally {
      setDeleting(false)
    }
  }

  // Import handlers
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportFile(file)
    setImportErrors([])
    setImportWarnings([])
    setImportPreview(null)
    setImportResult(null)

    try {
      const csvContent = await readCSVFile(file)
      const { headers, data, errors: parseErrors } = parseCSV(csvContent)

      if (parseErrors.length > 0) {
        setImportErrors(parseErrors)
        return
      }

      const validation = validateCSVFormat(headers, data, role)
      setImportErrors(validation.errors)
      setImportWarnings(validation.warnings)

      if (validation.valid) {
        setImportPreview({ headers, data, count: data.length })
      }
    } catch (err) {
      setImportErrors([err.message])
    }
  }

  const handleImport = async () => {
    if (!importPreview || importErrors.length > 0) return

    setImporting(true)
    try {
      const transformedData = transformCSVToUserData(importPreview.data, role)
      const response = await usersApi.bulkImport({
        users: transformedData,
        role: role
      })

      setImportResult(response.data)
      
      if (response.data.successful.length > 0) {
        toast.success(`Successfully imported ${response.data.successful.length} ${config.title.toLowerCase()}`)
        fetchUsers()
      }
      
      if (response.data.failed.length > 0) {
        toast.warning(`${response.data.failed.length} users failed to import`)
      }
    } catch (err) {
      toast.error(err.message || 'Import failed')
      setImportErrors([err.message || 'Import failed'])
    } finally {
      setImporting(false)
    }
  }

  const resetImportModal = () => {
    setShowImportModal(false)
    setImportFile(null)
    setImportPreview(null)
    setImportErrors([])
    setImportWarnings([])
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Export handler
  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await usersApi.export({ role })
      const usersData = response.data

      if (usersData.length === 0) {
        toast.warning(`No ${config.title.toLowerCase()} to export`)
        return
      }

      const { data, headers } = transformUserDataToCSV(usersData, role)
      const csvContent = generateCSV(data, headers)
      const filename = `${role}s_export_${new Date().toISOString().split('T')[0]}`
      downloadCSV(csvContent, filename)

      toast.success(`Exported ${usersData.length} ${config.title.toLowerCase()}`)
      setShowExportModal(false)
    } catch (err) {
      toast.error(err.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/users')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <RoleIcon className={`w-6 h-6 text-${config.color}-600`} />
              {config.title}
            </h1>
            <p className="text-gray-500 mt-1">Manage all {config.title.toLowerCase()} in your institution</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <Link
            to={`/dashboard/users/new?role=${role}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add {config.title.slice(0, -1)}
          </Link>
        </div>
      </div>

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 rounded-xl p-6 text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Total {config.title}</p>
            <p className="text-4xl font-bold mt-1">{pagination.total || users.length}</p>
          </div>
          <div className={`w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center`}>
            <RoleIcon className="w-8 h-8" />
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <SearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={`Search ${config.title.toLowerCase()} by name or email...`}
        filters={[]}
        onFilterChange={(key, value) => {
          if (key === 'status') setStatusFilter(value)
        }}
        extendedFilters={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ]}
        onClearFilters={() => {
          setSearchQuery('')
          setStatusFilter('all')
        }}
      />

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8">
                    <TableSkeleton rows={5} cols={6} />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No {config.title.toLowerCase()} found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const userName = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.fullName || 'Unknown'
                  const userInitial = userName.charAt(0).toUpperCase()
                  const isActive = user.isActive !== false
                  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleSelectUser(user._id)}
                          className="rounded border-gray-300 text-primary-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-${config.color}-400 to-${config.color}-600 flex items-center justify-center text-white text-sm font-medium`}>
                            {userInitial}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.profile?.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{joinDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setPreviewUser(user)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link 
                            to={`/dashboard/users/${user._id}/edit`}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => setDeleteDialog({ open: true, user })}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          itemName={config.title.toLowerCase()}
        />
      </motion.div>

      {/* User Preview Modal */}
      <UserPreviewModal 
        user={previewUser}
        isOpen={!!previewUser}
        onClose={() => setPreviewUser(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        onConfirm={handleDeleteUser}
        title={`Delete ${config.title.slice(0, -1)}`}
        message={`Are you sure you want to delete ${deleteDialog.user?.profile ? `${deleteDialog.user.profile.firstName} ${deleteDialog.user.profile.lastName}` : 'this user'}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      {/* Import Modal */}
      {showImportModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Import {config.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Upload a CSV file to bulk import {config.title.toLowerCase()}</p>
              </div>
              <button onClick={resetImportModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Download Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Download CSV Template
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Download the template to see the required format. Fill in your data and upload.
                </p>
                <button
                  onClick={() => downloadCSVTemplate(role)}
                  className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition text-sm flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" /> Download {config.title.slice(0, -1)} Template
                </button>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-1">Required columns:</p>
                  <p className="text-xs text-gray-500">
                    {CSV_TEMPLATES[role]?.required.join(', ')}
                  </p>
                </div>
              </div>

              {/* Step 2: Upload File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Upload CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload-role"
                  />
                  <label htmlFor="csv-upload-role" className="cursor-pointer">
                    <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {importFile ? importFile.name : 'Click to select or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">CSV files only</p>
                  </label>
                </div>
              </div>

              {/* Errors */}
              {importErrors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Format Error - Please fix the following issues:
                  </div>
                  <ul className="text-sm text-red-600 space-y-1 max-h-32 overflow-y-auto">
                    {importErrors.slice(0, 10).map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {importErrors.length > 10 && (
                      <li className="font-medium">... and {importErrors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {importWarnings.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                    <AlertCircle className="w-4 h-4" />
                    Warnings
                  </div>
                  <ul className="text-sm text-yellow-600 space-y-1">
                    {importWarnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview */}
              {importPreview && importErrors.length === 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                    <CheckCircle className="w-4 h-4" />
                    File validated successfully
                  </div>
                  <p className="text-sm text-green-600">
                    Ready to import <strong>{importPreview.count}</strong> {config.title.toLowerCase()}
                  </p>
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className="space-y-3">
                  {importResult.successful.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-2">
                        Successfully imported: {importResult.successful.length}
                      </p>
                      <div className="max-h-32 overflow-y-auto text-xs text-green-600 space-y-1">
                        {importResult.successful.map((u, i) => (
                          <div key={i}>• {u.name} ({u.email}) - Temp Password: <code className="bg-green-100 px-1 rounded">{u.temporaryPassword}</code></div>
                        ))}
                      </div>
                    </div>
                  )}
                  {importResult.failed.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-700 mb-2">
                        Failed to import: {importResult.failed.length}
                      </p>
                      <div className="max-h-32 overflow-y-auto text-xs text-red-600 space-y-1">
                        {importResult.failed.map((u, i) => (
                          <div key={i}>• {u.email}: {u.error}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={resetImportModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                {importResult ? 'Close' : 'Cancel'}
              </button>
              {!importResult && (
                <button
                  onClick={handleImport}
                  disabled={!importPreview || importErrors.length > 0 || importing}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {importing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Import {config.title}
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Export Modal */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Export {config.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Download {config.title.toLowerCase()} data as CSV</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                The exported CSV will contain all {config.title.toLowerCase()} with their profile information including name, email, phone, and role-specific data.
              </p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-600 mb-1">Export includes:</p>
                <p className="text-xs text-gray-500">
                  {CSV_TEMPLATES[role]?.headers.slice(0, 6).join(', ')}...
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Export CSV
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  )
}
