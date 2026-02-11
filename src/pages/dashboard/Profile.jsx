import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, Calendar, Edit, Camera,
  Shield, Key, Bell, Globe, Save, X, Loader2, CheckCircle, AlertCircle, Upload, Image as ImageIcon
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { authApi } from '../../services/api'
import { fetchCurrentUser } from '../../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function Profile() {
  const dispatch = useDispatch()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  
  // Profile form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    address: ''
  })
  
  // Image upload refs and state
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  
  // 2FA and Password Change State
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [enabling2FA, setEnabling2FA] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordStep, setPasswordStep] = useState('initial')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')

  const authUser = useSelector((state) => state.auth.user)

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return ''
    if (typeof address === 'string') return address
    const parts = [address.street, address.city, address.state, address.country, address.zipCode].filter(Boolean)
    return parts.join(', ')
  }

  // Get user initials for avatar placeholder
  const getInitials = () => {
    if (!authUser?.profile) return 'U'
    const first = authUser.profile.firstName?.[0] || ''
    const last = authUser.profile.lastName?.[0] || ''
    return (first + last).toUpperCase() || 'U'
  }

  // Fetch fresh user data on mount
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  // Initialize form data when user loads
  useEffect(() => {
    if (authUser) {
      setFormData({
        firstName: authUser.profile?.firstName || '',
        lastName: authUser.profile?.lastName || '',
        phone: authUser.profile?.phone || '',
        bio: authUser.profile?.bio || '',
        address: formatAddress(authUser.profile?.address)
      })
      setIs2FAEnabled(authUser.twoFactorEnabled || false)
    }
  }, [authUser])

  // 2FA Handlers
  const handleEnable2FA = async () => {
    setEnabling2FA(true)
    try {
      await authApi.enable2FA()
      setIs2FAEnabled(true)
      toast.success('Two-Factor Authentication enabled successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to enable 2FA')
    } finally {
      setEnabling2FA(false)
    }
  }

  const handleDisable2FA = async () => {
    setEnabling2FA(true)
    try {
      await authApi.disable2FA()
      setIs2FAEnabled(false)
      toast.success('Two-Factor Authentication disabled')
    } catch (error) {
      toast.error(error.message || 'Failed to disable 2FA')
    } finally {
      setEnabling2FA(false)
    }
  }

  // Password Change Handlers
  const handleOpenPasswordModal = () => {
    if (!is2FAEnabled) {
      toast.error('Please enable Two-Factor Authentication first to change your password')
      return
    }
    setShowPasswordModal(true)
    setPasswordStep('initial')
    setOtp('')
    setOtpToken('')
    setPasswords({ old: '', new: '', confirm: '' })
    setPasswordError('')
  }

  const handleSendOTP = async () => {
    setOtpSending(true)
    try {
      await authApi.sendPasswordChangeOTP()
      setPasswordStep('otp')
      toast.success('OTP sent to your email address')
    } catch (error) {
      toast.error(error.message || 'Failed to send OTP')
    } finally {
      setOtpSending(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    setOtpVerifying(true)
    try {
      const response = await authApi.verifyPasswordChangeOTP(otp)
      setOtpToken(response.data?.otpToken || response.data?.resetToken || 'verified')
      setPasswordStep('newPassword')
      toast.success('OTP verified successfully')
    } catch (error) {
      toast.error(error.message || 'Invalid OTP')
    } finally {
      setOtpVerifying(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    
    if (passwords.new.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError('Passwords do not match')
      return
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(passwords.new)) {
      setPasswordError('Password must contain uppercase, lowercase, number and special character')
      return
    }

    setChangingPassword(true)
    try {
      await authApi.changePasswordWith2FA(passwords.new, otpToken)
      toast.success('Password changed successfully!')
      setShowPasswordModal(false)
      setPasswordStep('initial')
      setOtp('')
      setOtpToken('')
      setPasswords({ old: '', new: '', confirm: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setPasswordStep('initial')
    setOtp('')
    setOtpToken('')
    setPasswords({ old: '', new: '', confirm: '' })
    setPasswordError('')
  }

  // Profile Save Handler
  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await authApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address
      })
      await dispatch(fetchCurrentUser())
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  // Avatar Upload Handler
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please select a valid image (JPG, PNG, or WebP)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await authApi.uploadAvatar(formData)
      await dispatch(fetchCurrentUser())
      toast.success('Avatar uploaded successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  // Cover Photo Upload Handler
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please select a valid image (JPG, PNG, or WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('cover', file)
      await authApi.uploadCoverPhoto(formData)
      await dispatch(fetchCurrentUser())
      toast.success('Cover photo uploaded successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to upload cover photo')
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reset form to original values
    if (authUser) {
      setFormData({
        firstName: authUser.profile?.firstName || '',
        lastName: authUser.profile?.lastName || '',
        phone: authUser.profile?.phone || '',
        bio: authUser.profile?.bio || '',
        address: formatAddress(authUser.profile?.address)
      })
    }
  }

  // Computed user display data
  const displayName = authUser?.profile 
    ? `${authUser.profile.firstName} ${authUser.profile.lastName}` 
    : 'User'
  const displayRole = authUser?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'
  const displayInstitution = authUser?.institution?.name || ''
  const displayEmail = authUser?.email || ''
  const displayJoinDate = authUser?.createdAt 
    ? new Date(authUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : ''

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Globe }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        {/* Cover Photo */}
        <div className="h-32 relative group overflow-hidden rounded-t-xl">
          {authUser?.profile?.coverPhoto ? (
            <img 
              src={authUser.profile.coverPhoto} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700" />
          )}
          {/* Cover Upload Button */}
          <button 
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 rounded-lg text-white opacity-0 group-hover:opacity-100 transition flex items-center gap-2"
          >
            {uploadingCover ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs">Change Cover</span>
              </>
            )}
          </button>
          <input 
            ref={coverInputRef}
            type="file" 
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverUpload}
            className="hidden"
          />
        </div>
        
        {/* Profile Info */}
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Avatar - positioned to overlap cover */}
            <div className="relative group flex-shrink-0 -mt-16">
              <div className="w-24 h-24 rounded-xl bg-white p-1 shadow-lg">
                {authUser?.profile?.avatar ? (
                  <img 
                    src={authUser.profile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">{getInitials()}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <input 
                ref={avatarInputRef}
                type="file" 
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            {/* Name and Role - no negative margin, clean layout */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 leading-relaxed">{displayName}</h2>
              <p className="text-gray-500 text-sm">{displayRole}{displayInstitution && ` • ${displayInstitution}`}</p>
            </div>

            <button
              onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2 flex-shrink-0"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={displayEmail}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter phone number"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Join Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={displayJoinDate}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={displayRole}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Two-Factor Authentication - Must be enabled first */}
              <div className={`p-4 rounded-lg ${is2FAEnabled ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${is2FAEnabled ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      {is2FAEnabled && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Enabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {is2FAEnabled 
                        ? 'Your account is protected with two-factor authentication' 
                        : 'Enable 2FA to change your password securely'}
                    </p>
                    {!is2FAEnabled && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Required to change password
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
                    disabled={enabling2FA}
                    className={`px-4 py-2 rounded-lg transition text-sm flex items-center gap-2 ${
                      is2FAEnabled 
                        ? 'border border-gray-300 text-gray-700 hover:bg-white' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {enabling2FA && <Loader2 className="w-4 h-4 animate-spin" />}
                    {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </button>
                </div>
              </div>

              {/* Password Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Password</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {is2FAEnabled 
                        ? 'Click to change your password with OTP verification' 
                        : 'Enable 2FA first to change your password'}
                    </p>
                  </div>
                  <button 
                    onClick={handleOpenPasswordModal}
                    disabled={!is2FAEnabled}
                    className={`px-4 py-2 rounded-lg transition text-sm ${
                      is2FAEnabled 
                        ? 'border border-gray-300 text-gray-700 hover:bg-white cursor-pointer' 
                        : 'border border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Change Password
                  </button>
                </div>
              </div>

              {/* Send OTP Option - Only shows when 2FA is enabled */}
              {is2FAEnabled && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">Email Verification</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        When changing password, an OTP will be sent to <strong>{displayEmail}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Sessions */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Chrome on MacOS</p>
                      <p className="text-xs text-gray-500">Bangalore, India • Active now</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Current</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Safari on iPhone</p>
                      <p className="text-xs text-gray-500">Bangalore, India • 2 hours ago</p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {[
                { label: 'Email notifications', desc: 'Receive email updates about your account', enabled: true },
                { label: 'Push notifications', desc: 'Receive push notifications on your devices', enabled: true },
                { label: 'SMS notifications', desc: 'Receive SMS for important updates', enabled: false },
                { label: 'Marketing emails', desc: 'Receive emails about new features and updates', enabled: false }
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{setting.label}</p>
                    <p className="text-sm text-gray-500">{setting.desc}</p>
                  </div>
                  <button
                    className={`relative w-11 h-6 rounded-full transition ${
                      setting.enabled ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        setting.enabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
                <select className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
                <select className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
                  <option>Asia/Kolkata (GMT+5:30)</option>
                  <option>UTC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date Format</label>
                <select className="w-full md:w-64 px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closePasswordModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                <button onClick={closePasswordModal} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Step 1: Send OTP */}
              {passwordStep === 'initial' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      To change your password, we'll send a verification code to your email address:
                    </p>
                    <p className="text-sm font-medium text-blue-900 mt-2">{displayEmail}</p>
                  </div>
                  <button
                    onClick={handleSendOTP}
                    disabled={otpSending}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                  >
                    {otpSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send OTP to Email
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Step 2: Verify OTP */}
              {passwordStep === 'otp' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      We've sent a 6-digit OTP to your email. Please enter it below:
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl tracking-widest font-mono"
                    />
                  </div>
                  <button
                    onClick={handleVerifyOTP}
                    disabled={otpVerifying || otp.length !== 6}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                  <button
                    onClick={handleSendOTP}
                    disabled={otpSending}
                    className="w-full py-2 text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Didn't receive? Resend OTP
                  </button>
                </div>
              )}

              {/* Step 3: New Password */}
              {passwordStep === 'newPassword' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">OTP verified! Now set your new password.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Password must contain:</p>
                    <ul className="list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>Uppercase and lowercase letters</li>
                      <li>At least one number</li>
                      <li>At least one special character (@$!%*?&)</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !passwords.new || !passwords.confirm}
                    className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
