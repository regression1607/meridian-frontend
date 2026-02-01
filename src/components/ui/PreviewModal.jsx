import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, Calendar, MapPin, Building, User, Shield } from 'lucide-react'

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

export function UserPreviewModal({ user, isOpen, onClose }) {
  if (!user) return null

  const userName = user.profile 
    ? `${user.profile.firstName} ${user.profile.lastName}` 
    : user.fullName || 'Unknown'
  const userInitial = userName.charAt(0).toUpperCase()
  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      }) 
    : '-'
  const lastLogin = user.lastLogin 
    ? new Date(user.lastLogin).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }) 
    : 'Never'

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0, padding: 16 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
            style={{ margin: 0 }}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative rounded-2xl shadow-xl max-w-md w-full overflow-hidden bg-primary-500"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-8 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {userInitial}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{userName}</h2>
                  <p className="text-white/80 text-sm">{user.email}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                    {user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className={`font-medium ${user.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Joined</p>
                    <p className="font-medium text-gray-900">{joinDate}</p>
                  </div>
                </div>

                {user.profile?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="font-medium text-gray-900">{user.profile.phone}</p>
                    </div>
                  </div>
                )}

                {user.institution && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Institution</p>
                      <p className="font-medium text-gray-900">
                        {typeof user.institution === 'object' ? user.institution.name : 'Assigned'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Last Login</p>
                    <p className="font-medium text-gray-900">{lastLogin}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export function InstitutionPreviewModal({ institution, isOpen, onClose }) {
  if (!institution) return null

  const initial = institution.name?.charAt(0).toUpperCase() || 'I'
  const createdDate = institution.createdAt 
    ? new Date(institution.createdAt).toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      }) 
    : '-'

  const planColors = {
    free: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-amber-100 text-amber-700'
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0, padding: 16 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
            style={{ margin: 0 }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative rounded-2xl shadow-xl max-w-md w-full overflow-hidden bg-primary-500"
          >
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-8 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {initial}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{institution.name}</h2>
                  <p className="text-white/80 text-sm">{institution.code}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${planColors[institution.subscription?.plan] || planColors.free}`}>
                    {institution.subscription?.plan?.charAt(0).toUpperCase() + institution.subscription?.plan?.slice(1) || 'Free'} Plan
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-medium text-gray-900 truncate">{institution.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="font-medium text-gray-900">{institution.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Created</p>
                    <p className="font-medium text-gray-900">{createdDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className={`font-medium ${institution.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {institution.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {institution.address && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Address</p>
                      <p className="font-medium text-gray-900">
                        {institution.address.street}, {institution.address.city}, {institution.address.state} {institution.address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default { UserPreviewModal, InstitutionPreviewModal }
