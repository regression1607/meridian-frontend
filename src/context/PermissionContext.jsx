import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { rolesApi } from '../services/api'

const PermissionContext = createContext(null)

const MODULES = {
  DASHBOARD: 'dashboard',
  USER_MANAGEMENT: 'user_management',
  ACADEMICS: 'academics',
  ATTENDANCE: 'attendance',
  HOMEWORK: 'homework',
  EXAMINATIONS: 'examinations',
  FEE_MANAGEMENT: 'fee_management',
  LIBRARY: 'library',
  TRANSPORT: 'transport',
  HOSTEL: 'hostel',
  EVENTS: 'events',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  PAYROLL: 'payroll',
  ADMISSIONS: 'admissions',
  SETTINGS: 'settings',
  AI_ASSISTANT: 'ai_assistant'
}

const PERMISSION_TYPES = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  MANAGE: 'manage'
}

export function PermissionProvider({ children }) {
  const { user, isAuthenticated } = useAuth()
  const [permissions, setPermissions] = useState(null)
  const [specialPermissions, setSpecialPermissions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fullAccess, setFullAccess] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPermissions()
    } else {
      setPermissions(null)
      setSpecialPermissions(null)
      setFullAccess(false)
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      
      // Super admin and admin have full access
      if (user.role === 'super_admin' || user.role === 'admin') {
        setFullAccess(true)
        setPermissions(null)
        setSpecialPermissions(null)
        setLoading(false)
        return
      }

      const institutionId = user.institution?._id || user.institution
      if (!institutionId) {
        setLoading(false)
        return
      }

      const response = await rolesApi.getMyPermissions({ institution: institutionId })
      
      if (response.data?.fullAccess) {
        setFullAccess(true)
      } else {
        setPermissions(response.data?.permissions || null)
        setSpecialPermissions(response.data?.specialPermissions || null)
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      // Default to allowing based on role for backward compatibility
      setPermissions(null)
    } finally {
      setLoading(false)
    }
  }

  // Check if user has permission for a module action
  const hasPermission = (module, action) => {
    // Full access users can do anything
    if (fullAccess) return true
    
    // Super admin and admin bypass all checks
    if (user?.role === 'super_admin' || user?.role === 'admin') return true

    // If no permissions loaded, allow based on legacy role
    if (!permissions) return true

    // Check module permission
    const modulePerms = permissions[module]
    if (!modulePerms) return false

    return modulePerms[action] === true
  }

  // Check if user can access a module at all (has view permission)
  const canAccessModule = (module) => {
    return hasPermission(module, 'view')
  }

  // Check if user has a special permission
  const hasSpecialPermission = (key) => {
    if (fullAccess) return true
    if (user?.role === 'super_admin' || user?.role === 'admin') return true
    if (!specialPermissions) return false
    return specialPermissions[key] === true
  }

  // Get all permissions for a module
  const getModulePermissions = (module) => {
    if (fullAccess || user?.role === 'super_admin' || user?.role === 'admin') {
      return { view: true, create: true, edit: true, delete: true, manage: true }
    }
    return permissions?.[module] || { view: false, create: false, edit: false, delete: false, manage: false }
  }

  // Shorthand helpers
  const canView = (module) => hasPermission(module, 'view')
  const canCreate = (module) => hasPermission(module, 'create')
  const canEdit = (module) => hasPermission(module, 'edit')
  const canDelete = (module) => hasPermission(module, 'delete')
  const canManage = (module) => hasPermission(module, 'manage')

  const value = {
    permissions,
    specialPermissions,
    loading,
    fullAccess,
    hasPermission,
    canAccessModule,
    hasSpecialPermission,
    getModulePermissions,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,
    refreshPermissions: fetchPermissions,
    MODULES,
    PERMISSION_TYPES
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}

export { MODULES, PERMISSION_TYPES }
export default PermissionContext
