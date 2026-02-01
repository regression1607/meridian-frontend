import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  ClipboardList, CreditCard, Bus, Library, Building2, Wallet,
  PartyPopper, Bell, Settings, LogOut, ChevronDown, ChevronLeft,
  ChevronRight, UserCheck, FileText, BarChart3, Brain, Shield,
  HelpCircle, Menu
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'parent', 'staff']
  },
  {
    title: 'Institutions',
    icon: Building2,
    roles: ['super_admin', 'admin'],
    submenu: [
      { title: 'All Institutions', path: '/dashboard/institutions' },
      { title: 'Add Institution', path: '/dashboard/institutions/add' }
    ]
  },
  {
    title: 'User Management',
    icon: Users,
    roles: ['super_admin', 'admin', 'institution_admin'],
    submenu: [
      { title: 'All Users', path: '/dashboard/users' },
      { title: 'Add User', path: '/dashboard/users/new' },
      { title: 'Teachers', path: '/dashboard/users/teachers' },
      { title: 'Students', path: '/dashboard/users/students' },
      { title: 'Parents', path: '/dashboard/users/parents' },
      { title: 'Staff', path: '/dashboard/users/staff' }
    ]
  },
  {
    title: 'Academics',
    icon: GraduationCap,
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher'],
    submenu: [
      { title: 'Classes & Sections', path: '/dashboard/classes' },
      { title: 'Subjects', path: '/dashboard/subjects' },
      { title: 'Timetable', path: '/dashboard/timetable' }
    ]
  },
  {
    title: 'Attendance',
    icon: Calendar,
    path: '/dashboard/attendance',
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'parent']
  },
  {
    title: 'Homework',
    icon: BookOpen,
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'parent'],
    submenu: [
      { title: 'Assignments', path: '/dashboard/homework/assignments' },
      { title: 'Submissions', path: '/dashboard/homework/submissions' }
    ]
  },
  {
    title: 'Examinations',
    icon: ClipboardList,
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'parent'],
    submenu: [
      { title: 'Exams', path: '/dashboard/exams' },
      { title: 'Results', path: '/dashboard/exams/results' },
      { title: 'Report Cards', path: '/dashboard/exams/reports' },
      { title: 'Question Generator', path: '/dashboard/exams/question-generator', roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher'] }
    ]
  },
  {
    title: 'Fee Management',
    icon: CreditCard,
    roles: ['super_admin', 'admin', 'institution_admin', 'parent', 'staff'],
    submenu: [
      { title: 'Payments', path: '/dashboard/fees' },
      { title: 'Fee Structures', path: '/dashboard/fees/structures' }
    ]
  },
  {
    title: 'Admissions',
    icon: UserCheck,
    roles: ['super_admin', 'admin', 'institution_admin', 'staff'],
    submenu: [
      { title: 'Applications', path: '/dashboard/admissions/applications' },
      { title: 'Enrolled', path: '/dashboard/admissions/enrolled' }
    ]
  },
  {
    title: 'Transport',
    icon: Bus,
    path: '/dashboard/transport',
    roles: ['super_admin', 'admin', 'institution_admin', 'parent', 'staff']
  },
  {
    title: 'Library',
    icon: Library,
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'staff'],
    submenu: [
      { title: 'Books', path: '/dashboard/library/books' },
      { title: 'Issued', path: '/dashboard/library/issued' }
    ]
  },
  {
    title: 'Hostel',
    icon: Building2,
    path: '/dashboard/hostel',
    roles: ['super_admin', 'admin', 'institution_admin', 'staff']
  },
  {
    title: 'Payroll',
    icon: Wallet,
    path: '/dashboard/payroll',
    roles: ['super_admin', 'admin', 'institution_admin', 'staff']
  },
  {
    title: 'Events',
    icon: PartyPopper,
    path: '/dashboard/events',
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'student', 'parent', 'staff']
  },
  {
    title: 'Reports',
    icon: BarChart3,
    path: '/dashboard/reports',
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher']
  },
  {
    title: 'AI Assistant',
    icon: Brain,
    path: '/dashboard/ai-assistant',
    roles: ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher', 'staff']
  }
]

const bottomMenuItems = [
  { title: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
  { title: 'Settings', icon: Settings, path: '/dashboard/settings' },
  { title: 'Help & Support', icon: HelpCircle, path: '/dashboard/help' }
]

export default function Sidebar({ collapsed, setCollapsed, userRole = 'institution_admin' }) {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState({})

  const toggleSubmenu = (title) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }))
  }

  const isActive = (path) => location.pathname === path
  const isSubmenuActive = (submenu) => submenu?.some(item => location.pathname === item.path)

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole))

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Meridian</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">M</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 ${collapsed ? 'mx-auto mt-2' : ''}`}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => (
            <li key={item.title}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.title)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isSubmenuActive(item.submenu)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform ${openMenus[item.title] ? 'rotate-180' : ''}`} 
                        />
                      </>
                    )}
                  </button>
                  <AnimatePresence>
                    {!collapsed && openMenus[item.title] && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-4 mt-1 space-y-1"
                      >
                        {item.submenu.map((subitem) => (
                          <li key={subitem.path}>
                            <Link
                              to={subitem.path}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive(subitem.path)
                                  ? 'bg-primary-100 text-primary-700 font-medium'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                              }`}
                            >
                              {subitem.title}
                            </Link>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={collapsed ? item.title : ''}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Menu */}
      <div className="border-t border-gray-100 py-3 px-3 flex-shrink-0 mb-2">
        <ul className="space-y-1">
          {bottomMenuItems.map((item) => (
            <li key={item.title}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
                title={collapsed ? item.title : ''}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
