import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Plus, Edit, Trash2, Eye,
  Download, Upload, Users, GraduationCap, UserCheck, ArrowLeft
} from 'lucide-react'
import { TableSkeleton } from '../../../components/ui/Loading'
import { UserPreviewModal } from '../../../components/ui/PreviewModal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Pagination from '../../../components/ui/Pagination'
import SearchFilter from '../../../components/ui/SearchFilter'

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
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2">
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
    </div>
  )
}
