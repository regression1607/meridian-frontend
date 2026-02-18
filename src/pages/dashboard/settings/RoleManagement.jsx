import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Shield, Plus, Search, Edit, Trash2, Copy, Users, Check, X,
  ChevronDown, ChevronRight, Settings, Eye, FileEdit, FilePlus, Trash,
  LayoutDashboard, GraduationCap, UserCog, Calendar, BookOpen, ClipboardList,
  DollarSign, Library, Bus, Building, CalendarDays, Bell, BarChart3, Wallet,
  UserPlus, Sparkles, Save, AlertCircle
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { rolesApi, institutionsApi } from '../../../services/api'

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'user_management', label: 'User Management', icon: UserCog },
  { key: 'academics', label: 'Academics', icon: GraduationCap },
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'homework', label: 'Homework', icon: BookOpen },
  { key: 'examinations', label: 'Examinations', icon: ClipboardList },
  { key: 'fee_management', label: 'Fee Management', icon: DollarSign },
  { key: 'library', label: 'Library', icon: Library },
  { key: 'transport', label: 'Transport', icon: Bus },
  { key: 'hostel', label: 'Hostel', icon: Building },
  { key: 'events', label: 'Events', icon: CalendarDays },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'payroll', label: 'Payroll', icon: Wallet },
  { key: 'admissions', label: 'Admissions', icon: UserPlus },
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'ai_assistant', label: 'AI Assistant', icon: Sparkles }
]

const PERMISSION_TYPES = [
  { key: 'view', label: 'View', icon: Eye },
  { key: 'create', label: 'Create', icon: FilePlus },
  { key: 'edit', label: 'Edit', icon: FileEdit },
  { key: 'delete', label: 'Delete', icon: Trash },
  { key: 'manage', label: 'Manage', icon: Settings }
]

const SPECIAL_PERMISSIONS = [
  { key: 'canViewAllStudents', label: 'View All Students' },
  { key: 'canViewAllTeachers', label: 'View All Teachers' },
  { key: 'canViewAllStaff', label: 'View All Staff' },
  { key: 'canManageRoles', label: 'Manage Roles' },
  { key: 'canManageInstitution', label: 'Manage Institution' },
  { key: 'canExportData', label: 'Export Data' },
  { key: 'canImportData', label: 'Import Data' },
  { key: 'canViewReports', label: 'View Reports' },
  { key: 'canViewFinancials', label: 'View Financials' }
]

export default function RoleManagement() {
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [expandedModules, setExpandedModules] = useState({})

  const [newRole, setNewRole] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    if (isPlatformAdmin && !institutionId) {
      fetchInstitutions()
    } else if (institutionId) {
      fetchRoles()
    }
  }, [institutionId, isPlatformAdmin])

  const fetchInstitutions = async () => {
    try {
      const response = await institutionsApi.getAll()
      if (response.data?.length > 0) {
        setInstitutionId(response.data[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch institutions:', error)
    }
  }

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await rolesApi.getAll({ institution: institutionId })
      setRoles(response.data || [])
      if (response.data?.length > 0 && !selectedRole) {
        setSelectedRole(response.data[0])
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      if (error.status === 404) {
        await initializeDefaultRoles()
      } else {
        toast.error('Failed to load roles')
      }
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultRoles = async () => {
    try {
      await rolesApi.initializeDefaults({ institution: institutionId })
      await fetchRoles()
      toast.success('Default roles initialized')
    } catch (error) {
      console.error('Failed to initialize roles:', error)
    }
  }

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      toast.error('Please enter a role name')
      return
    }

    try {
      setSaving(true)
      const response = await rolesApi.create({
        ...newRole,
        institution: institutionId
      })
      setRoles([...roles, response.data])
      setSelectedRole(response.data)
      setShowCreateModal(false)
      setNewRole({ name: '', description: '' })
      toast.success('Role created successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to create role')
    } finally {
      setSaving(false)
    }
  }

  const handleCloneRole = async (role) => {
    const newName = prompt('Enter name for the cloned role:', `${role.name} (Copy)`)
    if (!newName) return

    try {
      const response = await rolesApi.clone(role._id, {
        newName,
        institution: institutionId
      })
      setRoles([...roles, response.data])
      setSelectedRole(response.data)
      toast.success('Role cloned successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to clone role')
    }
  }

  const handleDeleteRole = async () => {
    if (!roleToDelete) return

    try {
      await rolesApi.delete(roleToDelete._id, { institution: institutionId })
      setRoles(roles.filter(r => r._id !== roleToDelete._id))
      if (selectedRole?._id === roleToDelete._id) {
        setSelectedRole(roles.find(r => r._id !== roleToDelete._id) || null)
      }
      setShowDeleteModal(false)
      setRoleToDelete(null)
      toast.success('Role deleted successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to delete role')
    }
  }

  const handlePermissionChange = async (module, permission, value) => {
    if (!selectedRole) return

    const updatedPermissions = {
      ...selectedRole.permissions,
      [module]: {
        ...selectedRole.permissions[module],
        [permission]: value
      }
    }

    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    })

    try {
      await rolesApi.updatePermissions(selectedRole._id, {
        modules: { [module]: { [permission]: value } },
        institution: institutionId
      })
    } catch (error) {
      toast.error('Failed to update permission')
      fetchRoles()
    }
  }

  const handleSpecialPermissionChange = async (key, value) => {
    if (!selectedRole) return

    const updatedSpecialPermissions = {
      ...selectedRole.specialPermissions,
      [key]: value
    }

    setSelectedRole({
      ...selectedRole,
      specialPermissions: updatedSpecialPermissions
    })

    try {
      await rolesApi.updatePermissions(selectedRole._id, {
        special: { [key]: value },
        institution: institutionId
      })
    } catch (error) {
      toast.error('Failed to update permission')
      fetchRoles()
    }
  }

  const handleToggleAllModulePermissions = async (module, enabled) => {
    if (!selectedRole) return

    const updatedPermissions = {
      view: enabled,
      create: enabled,
      edit: enabled,
      delete: enabled,
      manage: enabled
    }

    setSelectedRole({
      ...selectedRole,
      permissions: {
        ...selectedRole.permissions,
        [module]: updatedPermissions
      }
    })

    try {
      await rolesApi.updatePermissions(selectedRole._id, {
        modules: { [module]: updatedPermissions },
        institution: institutionId
      })
    } catch (error) {
      toast.error('Failed to update permissions')
      fetchRoles()
    }
  }

  const toggleModuleExpand = (moduleKey) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleKey]: !prev[moduleKey]
    }))
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getModulePermissionCount = (module) => {
    if (!selectedRole?.permissions?.[module]) return 0
    const perms = selectedRole.permissions[module]
    return Object.values(perms).filter(Boolean).length
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="col-span-3 h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary-600" />
            Roles & Permissions
          </h1>
          <p className="text-gray-500 mt-1">Manage user roles and their access permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search roles..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredRoles.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Shield className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p>No roles found</p>
                  <button
                    onClick={initializeDefaultRoles}
                    className="mt-2 text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Initialize default roles
                  </button>
                </div>
              ) : (
                filteredRoles.map((role) => (
                  <div
                    key={role._id}
                    onClick={() => setSelectedRole(role)}
                    className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition ${
                      selectedRole?._id === role._id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 truncate">{role.name}</p>
                          {role.isDefault && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-700 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 truncate">{role.description}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCloneRole(role) }}
                          className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="Clone Role"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {!role.isDefault && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setRoleToDelete(role); setShowDeleteModal(true) }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete Role"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-3">
          {selectedRole ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Role Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    {selectedRole.name}
                    {selectedRole.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        Default Role
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedRole.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCloneRole(selectedRole)}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Clone
                  </button>
                </div>
              </div>

              {/* Module Permissions */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Module Permissions
                </h3>

                <div className="space-y-2">
                  {MODULES.map((module) => {
                    const ModuleIcon = module.icon
                    const isExpanded = expandedModules[module.key]
                    const permCount = getModulePermissionCount(module.key)
                    const permissions = selectedRole.permissions?.[module.key] || {}

                    return (
                      <div key={module.key} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div
                          onClick={() => toggleModuleExpand(module.key)}
                          className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )}
                            <ModuleIcon className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">{module.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500">
                              {permCount}/5 permissions
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleAllModulePermissions(module.key, permCount < 5)
                              }}
                              className={`px-2 py-1 text-xs rounded ${
                                permCount === 5
                                  ? 'bg-green-100 text-green-700'
                                  : permCount > 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {permCount === 5 ? 'Full Access' : permCount > 0 ? 'Partial' : 'No Access'}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-3 bg-white border-t border-gray-100">
                            <div className="grid grid-cols-5 gap-2">
                              {PERMISSION_TYPES.map((perm) => {
                                const PermIcon = perm.icon
                                const isEnabled = permissions[perm.key] === true

                                return (
                                  <button
                                    key={perm.key}
                                    onClick={() => handlePermissionChange(module.key, perm.key, !isEnabled)}
                                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition ${
                                      isEnabled
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                                    }`}
                                  >
                                    <PermIcon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{perm.label}</span>
                                    {isEnabled && <Check className="w-4 h-4" />}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Special Permissions */}
                <h3 className="text-sm font-semibold text-gray-700 mt-6 mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Special Permissions
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIAL_PERMISSIONS.map((perm) => {
                    const isEnabled = selectedRole.specialPermissions?.[perm.key] === true

                    return (
                      <label
                        key={perm.key}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                          isEnabled
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => handleSpecialPermissionChange(perm.key, e.target.checked)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <span className={`text-sm ${isEnabled ? 'text-primary-700 font-medium' : 'text-gray-700'}`}>
                          {perm.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
              <p className="text-gray-500">Choose a role from the list to view and edit its permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Role</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Lab Assistant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Brief description of this role..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600">
                  After creating the role, you can configure its permissions from the permissions panel.
                </p>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Role
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roleToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Delete Role
              </h2>
              <button onClick={() => { setShowDeleteModal(false); setRoleToDelete(null) }} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700">
                Are you sure you want to delete the role <strong>"{roleToDelete.name}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone. Users assigned to this role will lose their permissions.
              </p>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setRoleToDelete(null) }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Role
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
