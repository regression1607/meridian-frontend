import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, Menu, User, Settings, LogOut, ChevronDown, HelpCircle, Bell, Check, Trash2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import VersionInfo from '../ui/VersionInfo'
import { notificationsApi } from '../../services/api'

export default function Header({ onMenuClick, user }) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const profileRef = useRef(null)
  const notificationRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const res = await notificationsApi.getAll({ limit: 3 })
      if (res.success) {
        setNotifications(res.data || [])
        setUnreadCount(res.unreadCount || 0)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoadingNotifications(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) { console.error(err) }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Mobile Search */}
        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              if (!showNotifications) fetchNotifications()
              setShowNotifications(!showNotifications)
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div>
                {loadingNotifications ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-primary-500' : 'bg-gray-300'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link
                to="/dashboard/notifications"
                onClick={() => setShowNotifications(false)}
                className="block p-3 text-center text-sm text-primary-600 hover:bg-gray-50 border-t"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* Version Info */}
        <VersionInfo />

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 mx-2" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            {(user?.profile?.avatar || user?.avatar) ? (
              <img 
                src={user?.profile?.avatar || user?.avatar} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace(/_/g, ' ') || 'User'}</p>
            </div>
            <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                {(user?.profile?.avatar || user?.avatar) ? (
                  <img 
                    src={user?.profile?.avatar || user?.avatar} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
              </div>
              <div className="py-1">
                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <Link
                  to="/dashboard/help"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <HelpCircle className="w-4 h-4" />
                  Help & Support
                </Link>
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
