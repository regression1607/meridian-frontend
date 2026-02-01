import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../../context/AuthContext'
import { DashboardSkeleton } from '../ui/Loading'

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Full viewport background to prevent any gaps */}
      <div className="fixed inset-0 bg-white -z-10" />
      
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed}
          userRole={user.role}
        />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar 
              collapsed={false} 
              setCollapsed={() => setMobileSidebarOpen(false)}
              userRole={user.role}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header 
          onMenuClick={() => setMobileSidebarOpen(true)}
          user={user}
        />
        
        {/* Page Content */}
        <main className="p-4 lg:p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
