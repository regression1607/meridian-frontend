import { createContext, useContext, useState, useEffect } from 'react'
import ApiService from '../services/api'

const AuthContext = createContext(null)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('meridian_token')
      
      if (token) {
        // Verify token by fetching user profile
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const userData = transformUserData(data.data)
            setUser(userData)
            localStorage.setItem('meridian_user', JSON.stringify(userData))
          }
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('meridian_user')
          localStorage.removeItem('meridian_token')
          localStorage.removeItem('meridian_refresh_token')
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      localStorage.removeItem('meridian_user')
      localStorage.removeItem('meridian_token')
      localStorage.removeItem('meridian_refresh_token')
    } finally {
      setLoading(false)
    }
  }

  const transformUserData = (apiUser) => {
    return {
      id: apiUser._id || apiUser.id,
      name: apiUser.fullName || `${apiUser.profile?.firstName || ''} ${apiUser.profile?.lastName || ''}`.trim(),
      firstName: apiUser.profile?.firstName,
      lastName: apiUser.profile?.lastName,
      email: apiUser.email,
      role: apiUser.role,
      institution: apiUser.institution,
      avatar: apiUser.profile?.avatar,
      phone: apiUser.profile?.phone,
      isEmailVerified: apiUser.isEmailVerified,
      mustChangePassword: apiUser.mustChangePassword
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      const { accessToken, refreshToken, user: apiUser } = data.data
      const userData = transformUserData(apiUser)

      localStorage.setItem('meridian_token', accessToken)
      localStorage.setItem('meridian_refresh_token', refreshToken)
      localStorage.setItem('meridian_user', JSON.stringify(userData))
      setUser(userData)

      return { success: true, user: userData }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('meridian_token')
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {})
      }
    } finally {
      localStorage.removeItem('meridian_user')
      localStorage.removeItem('meridian_token')
      localStorage.removeItem('meridian_refresh_token')
      setUser(null)
    }
  }

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates }
    localStorage.setItem('meridian_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  // Role-based access helpers
  const isAdmin = () => ['super_admin', 'admin', 'institution_admin'].includes(user?.role)
  const isPlatformAdmin = () => ['super_admin', 'admin'].includes(user?.role)
  const isTeacher = () => user?.role === 'teacher'
  const isStudent = () => user?.role === 'student'
  const isParent = () => user?.role === 'parent'
  const isStaff = () => user?.role === 'staff'

  const hasRole = (roles) => {
    if (!user) return false
    if (typeof roles === 'string') return user.role === roles
    return roles.includes(user.role)
  }

  const hasMinRole = (minRole) => {
    const roleHierarchy = ['student', 'parent', 'teacher', 'staff', 'institution_admin', 'super_admin']
    if (!user) return false
    const userRoleIndex = roleHierarchy.indexOf(user.role)
    const minRoleIndex = roleHierarchy.indexOf(minRole)
    return userRoleIndex >= minRoleIndex
  }

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin,
    isPlatformAdmin,
    isTeacher,
    isStudent,
    isParent,
    isStaff,
    hasRole,
    hasMinRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
