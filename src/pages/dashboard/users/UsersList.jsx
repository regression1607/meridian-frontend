import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Plus, Edit, Trash2, Eye,
  Download, Upload, Users, GraduationCap, UserCheck
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users across your institution</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2">
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
    </div>
  )
}
