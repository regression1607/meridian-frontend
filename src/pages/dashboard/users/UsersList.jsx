import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Plus, Edit, Trash2, Eye,
  Download, Upload, Users, GraduationCap, UserCheck,
  X, FileText, AlertCircle, CheckCircle, FileDown
} from 'lucide-react'
import { UserPreviewModal } from '../../../components/ui/PreviewModal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Pagination from '../../../components/ui/Pagination'
import SearchFilter from '../../../components/ui/SearchFilter'
import DataTable, { UserCell, RoleBadge, StatusBadge, ActionButtons, DateCell } from '../../../components/ui/DataTable'
import {
  fetchUsers,
  deleteUser,
  setFilters,
  setPage,
  toggleSelectUser,
  toggleSelectAll
} from '../../../store/slices/usersSlice'
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

const roleIcons = {
  student: GraduationCap,
  teacher: Users,
  parent: UserCheck,
  staff: Users
}

export default function UsersList() {
  const dispatch = useDispatch()
  
  // Redux state
  const { 
    users, 
    loading, 
    stats, 
    pagination, 
    filters, 
    selectedUsers,
    error 
  } = useSelector((state) => state.users)

  // Local state for UI
  const [previewUser, setPreviewUser] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null })
  const [deleting, setDeleting] = useState(false)
  
  // Import/Export state
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [importRole, setImportRole] = useState('student')
  const [exportRole, setExportRole] = useState('all')
  const [importFile, setImportFile] = useState(null)
  const [importPreview, setImportPreview] = useState(null)
  const [importErrors, setImportErrors] = useState([])
  const [importWarnings, setImportWarnings] = useState([])
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)

  // Fetch users on mount and when filters/page change
  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.role !== 'all' && { role: filters.role }),
      ...(filters.search && { search: filters.search }),
      ...(filters.status !== 'all' && { status: filters.status })
    }
    dispatch(fetchUsers(params))
  }, [dispatch, pagination.page, filters])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
  }

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage))
  }

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return
    
    setDeleting(true)
    try {
      await dispatch(deleteUser(deleteDialog.user._id)).unwrap()
      const userName = deleteDialog.user.profile 
        ? `${deleteDialog.user.profile.firstName} ${deleteDialog.user.profile.lastName}` 
        : 'User'
      toast.success(`${userName} deleted successfully`)
      setDeleteDialog({ open: false, user: null })
    } catch (err) {
      toast.error(err || 'Failed to delete user')
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

      const validation = validateCSVFormat(headers, data, importRole)
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
      const transformedData = transformCSVToUserData(importPreview.data, importRole)
      const response = await usersApi.bulkImport({
        users: transformedData,
        role: importRole
      })

      setImportResult(response.data)
      
      if (response.data.successful.length > 0) {
        toast.success(`Successfully imported ${response.data.successful.length} users`)
        dispatch(fetchUsers({ page: 1, limit: pagination.limit }))
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
    setImportRole('student')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Export handler
  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await usersApi.export({ role: exportRole !== 'all' ? exportRole : undefined })
      const users = response.data

      if (users.length === 0) {
        toast.warning('No users to export')
        return
      }

      const role = exportRole !== 'all' ? exportRole : 'student'
      const { data, headers } = transformUserDataToCSV(users, role)
      const csvContent = generateCSV(data, headers)
      const filename = `users_export_${exportRole}_${new Date().toISOString().split('T')[0]}`
      downloadCSV(csvContent, filename)

      toast.success(`Exported ${users.length} users`)
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users across your institution</p>
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
            to="/dashboard/users/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add User
          </Link>
        </div>
      </div>

      {/* Stats */}
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
              <p className="text-xs text-gray-500">Total Users</p>
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
              <p className="text-xs text-gray-500">Students</p>
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
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.teachers}</p>
              <p className="text-xs text-gray-500">Teachers</p>
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
            <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.parents}</p>
              <p className="text-xs text-gray-500">Parents</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <SearchFilter
        searchValue={filters.search}
        onSearchChange={(value) => handleFilterChange('search', value)}
        searchPlaceholder="Search users by name or email..."
        filters={[
          {
            key: 'role',
            value: filters.role,
            options: [
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Platform Admins' },
              { value: 'institution_admin', label: 'Institution Admins' },
              { value: 'coordinator', label: 'Coordinators' },
              { value: 'teacher', label: 'Teachers' },
              { value: 'student', label: 'Students' },
              { value: 'parent', label: 'Parents' },
              { value: 'staff', label: 'Staff' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        extendedFilters={[
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            value: filters.status,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ]}
        onClearFilters={() => {
          dispatch(setFilters({ search: '', role: 'all', status: 'all' }))
        }}
      />

      {/* Users Table */}
      <DataTable
        columns={[
          { header: 'User', accessor: 'user' },
          { header: 'Role', accessor: 'role' },
          { header: 'Status', accessor: 'status' },
          { header: 'Joined', accessor: 'joined' },
          { header: 'Actions', accessor: 'actions', align: 'right' }
        ]}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        emptyIcon={Users}
        selectable={true}
        selectedItems={selectedUsers}
        onSelectAll={() => dispatch(toggleSelectAll())}
        onSelectItem={(id) => dispatch(toggleSelectUser(id))}
        renderRow={(user) => {
          const RoleIcon = roleIcons[user.role] || Users
          const userName = user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.fullName || 'Unknown'
          
          return (
            <>
              <td className="px-4 py-3">
                <UserCell name={userName} email={user.email} />
              </td>
              <td className="px-4 py-3">
                <RoleBadge role={user.role} icon={RoleIcon} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge active={user.isActive !== false} />
              </td>
              <td className="px-4 py-3">
                <DateCell date={user.createdAt} />
              </td>
              <td className="px-4 py-3">
                <ActionButtons
                  actions={[
                    { icon: Eye, onClick: () => setPreviewUser(user), title: 'View Details' },
                    { icon: Edit, to: `/dashboard/users/${user._id}/edit`, title: 'Edit' },
                    { icon: Trash2, onClick: () => setDeleteDialog({ open: true, user }), title: 'Delete', className: 'hover:bg-red-50 text-gray-500 hover:text-red-600' }
                  ]}
                />
              </td>
            </>
          )
        }}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        itemName="users"
      />

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
        title="Delete User"
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
                <h2 className="text-xl font-bold text-gray-900">Import Users</h2>
                <p className="text-sm text-gray-500 mt-1">Upload a CSV file to bulk import users</p>
              </div>
              <button onClick={resetImportModal} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Select Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Select User Type
                </label>
                <select
                  value={importRole}
                  onChange={(e) => {
                    setImportRole(e.target.value)
                    setImportFile(null)
                    setImportPreview(null)
                    setImportErrors([])
                    setImportWarnings([])
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="parent">Parents</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {/* Step 2: Download Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Download CSV Template
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Download the template to see the required format. Fill in your data and upload.
                </p>
                <button
                  onClick={() => downloadCSVTemplate(importRole)}
                  className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition text-sm flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" /> Download {importRole.charAt(0).toUpperCase() + importRole.slice(1)} Template
                </button>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 mb-1">Required columns:</p>
                  <p className="text-xs text-gray-500">
                    {CSV_TEMPLATES[importRole]?.required.join(', ')}
                  </p>
                </div>
              </div>

              {/* Step 3: Upload File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. Upload CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
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
                    Ready to import <strong>{importPreview.count}</strong> {importRole}(s)
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
                      <Upload className="w-4 h-4" /> Import Users
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
                <h2 className="text-xl font-bold text-gray-900">Export Users</h2>
                <p className="text-sm text-gray-500 mt-1">Download user data as CSV</p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User Type to Export
                </label>
                <select
                  value={exportRole}
                  onChange={(e) => setExportRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="parent">Parents</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                The exported CSV will contain all {exportRole === 'all' ? 'users' : `${exportRole}s`} with their profile information.
              </p>
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
