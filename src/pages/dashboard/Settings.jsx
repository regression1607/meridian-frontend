import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Building2, Palette, Bell, Shield, Database,
  Mail, CreditCard, Users, Save, Upload, MessageCircle,
  Video, Calendar, X, Check, Settings as SettingsIcon
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('institution')
  const [saving, setSaving] = useState(false)
  const logoInputRef = useRef(null)
  const faviconInputRef = useRef(null)

  // Institution state
  const [institution, setInstitution] = useState({
    name: user?.institution?.name || 'Meridian Demo School',
    code: user?.institution?.code || 'MDS001',
    type: 'K-12 School',
    board: 'CBSE',
    email: 'contact@demo.meridian-ems.com',
    phone: '+91 80 1234 5678',
    address: '123 Education Lane, Koramangala, Bangalore, Karnataka 560034'
  })

  // Branding state
  const [branding, setBranding] = useState({
    logo: null,
    logoPreview: null,
    favicon: null,
    faviconPreview: null,
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981'
  })

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    feeReminders: true,
    attendanceAlerts: true
  })

  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30,
    ipWhitelistEnabled: false
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const tabs = [
    { id: 'institution', label: 'Institution', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Database }
  ]

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo must be less than 2MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setBranding(prev => ({ ...prev, logo: file, logoPreview: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle favicon upload
  const handleFaviconUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error('Favicon must be less than 500KB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setBranding(prev => ({ ...prev, favicon: file, faviconPreview: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle color change
  const handleColorChange = (field, value) => {
    setBranding(prev => ({ ...prev, [field]: value }))
  }

  // Toggle notification setting
  const toggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Save settings
  const handleSave = async (section) => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success(`${section} settings saved successfully`)
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your institution settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
          >
            {activeTab === 'institution' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Institution Details</h2>
                  <p className="text-sm text-gray-500">Basic information about your institution</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Name</label>
                    <input
                      type="text"
                      value={institution.name}
                      onChange={(e) => setInstitution(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Code</label>
                    <input
                      type="text"
                      value={institution.code}
                      onChange={(e) => setInstitution(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution Type</label>
                    <select 
                      value={institution.type}
                      onChange={(e) => setInstitution(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option>K-12 School</option>
                      <option>Primary School</option>
                      <option>High School</option>
                      <option>College</option>
                      <option>University</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Board/Affiliation</label>
                    <select 
                      value={institution.board}
                      onChange={(e) => setInstitution(prev => ({ ...prev, board: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    >
                      <option>CBSE</option>
                      <option>ICSE</option>
                      <option>State Board</option>
                      <option>IB</option>
                      <option>Cambridge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={institution.email}
                      onChange={(e) => setInstitution(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={institution.phone}
                      onChange={(e) => setInstitution(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                    <textarea
                      value={institution.address}
                      onChange={(e) => setInstitution(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => handleSave('Institution')}
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
                  <p className="text-sm text-gray-500">Customize the look and feel of your institution</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary-400 transition">
                      <input
                        type="file"
                        ref={logoInputRef}
                        onChange={handleLogoUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      {branding.logoPreview ? (
                        <div className="relative inline-block">
                          <img src={branding.logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-cover mx-auto mb-3" />
                          <button
                            onClick={() => setBranding(prev => ({ ...prev, logo: null, logoPreview: null }))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-3">
                          <span className="text-white text-2xl font-bold">M</span>
                        </div>
                      )}
                      <button 
                        onClick={() => logoInputRef.current?.click()}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mx-auto"
                      >
                        <Upload className="w-4 h-4" /> Upload Logo
                      </button>
                      <p className="text-xs text-gray-400 mt-1">Max 2MB, PNG/JPG</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Favicon</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary-400 transition">
                      <input
                        type="file"
                        ref={faviconInputRef}
                        onChange={handleFaviconUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      {branding.faviconPreview ? (
                        <div className="relative inline-block">
                          <img src={branding.faviconPreview} alt="Favicon" className="w-10 h-10 rounded-lg object-cover mx-auto mb-3" />
                          <button
                            onClick={() => setBranding(prev => ({ ...prev, favicon: null, faviconPreview: null }))}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold">M</span>
                        </div>
                      )}
                      <button 
                        onClick={() => faviconInputRef.current?.click()}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mx-auto"
                      >
                        <Upload className="w-4 h-4" /> Upload Favicon
                      </button>
                      <p className="text-xs text-gray-400 mt-1">Max 500KB, ICO/PNG</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={branding.primaryColor} 
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="w-12 h-10 rounded border-0 cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={branding.primaryColor} 
                        onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" 
                      />
                    </div>
                    <div className="mt-2 h-8 rounded-lg" style={{ backgroundColor: branding.primaryColor }} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Secondary Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={branding.secondaryColor} 
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 rounded border-0 cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={branding.secondaryColor} 
                        onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" 
                      />
                    </div>
                    <div className="mt-2 h-8 rounded-lg" style={{ backgroundColor: branding.secondaryColor }} />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => handleSave('Branding')}
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                  <p className="text-sm text-gray-500">Configure how notifications are sent to users</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Send notifications via email', icon: Mail },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Send notifications via SMS', icon: MessageCircle },
                    { key: 'push', label: 'Push Notifications', desc: 'Send push notifications to mobile apps', icon: Bell },
                    { key: 'feeReminders', label: 'Fee Reminders', desc: 'Automatic fee payment reminders', icon: CreditCard },
                    { key: 'attendanceAlerts', label: 'Attendance Alerts', desc: 'Alert parents when student is absent', icon: Users }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleNotification(item.key)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          notifications[item.key] ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => handleSave('Notification')}
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500">Configure security options for your institution</p>
                </div>

                <div className="space-y-4">
                  {/* Two-Factor Authentication - Coming Soon */}
                  <div className="p-4 bg-gray-50 rounded-lg opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">Enforce Two-Factor Authentication</p>
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Coming Soon</span>
                        </div>
                        <p className="text-sm text-gray-500">Require 2FA for all admin accounts</p>
                      </div>
                      <button disabled className="relative w-11 h-6 bg-gray-300 rounded-full cursor-not-allowed">
                        <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>

                  {/* Password Policy */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Password Policy</p>
                        <p className="text-sm text-gray-500">
                          Minimum {security.passwordMinLength} characters
                          {security.requireSpecialChars && ', special characters'}
                          {security.requireNumbers && ', numbers'}
                          {security.requireUppercase && ', uppercase'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-white flex items-center gap-1"
                      >
                        <SettingsIcon className="w-3.5 h-3.5" /> Configure
                      </button>
                    </div>
                  </div>

                  {/* Session Timeout */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Session Timeout</p>
                        <p className="text-sm text-gray-500">Automatically logout after inactivity</p>
                      </div>
                      <select 
                        value={security.sessionTimeout}
                        onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>
                  </div>

                  {/* IP Whitelisting - Coming Soon */}
                  <div className="p-4 bg-gray-50 rounded-lg opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">IP Whitelisting</p>
                          <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Coming Soon</span>
                        </div>
                        <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                      </div>
                      <button disabled className="relative w-11 h-6 bg-gray-300 rounded-full cursor-not-allowed">
                        <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => handleSave('Security')}
                    disabled={saving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Password Policy Modal */}
            {showPasswordModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Password Policy</h3>
                    <button onClick={() => setShowPasswordModal(false)} className="p-1 hover:bg-gray-100 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Password Length</label>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={security.passwordMinLength}
                        onChange={(e) => setSecurity(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) || 8 }))}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.requireSpecialChars}
                          onChange={(e) => setSecurity(prev => ({ ...prev, requireSpecialChars: e.target.checked }))}
                          className="w-4 h-4 rounded text-primary-600"
                        />
                        <span className="text-sm text-gray-700">Require special characters (!@#$%^&*)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.requireNumbers}
                          onChange={(e) => setSecurity(prev => ({ ...prev, requireNumbers: e.target.checked }))}
                          className="w-4 h-4 rounded text-primary-600"
                        />
                        <span className="text-sm text-gray-700">Require numbers (0-9)</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={security.requireUppercase}
                          onChange={(e) => setSecurity(prev => ({ ...prev, requireUppercase: e.target.checked }))}
                          className="w-4 h-4 rounded text-primary-600"
                        />
                        <span className="text-sm text-gray-700">Require uppercase letters (A-Z)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowPasswordModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordModal(false)
                        toast.success('Password policy updated')
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                    >
                      Save Policy
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
                  <p className="text-sm text-gray-500">Connect with third-party services</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WhatsApp Business */}
                  <div className="p-4 border border-gray-200 rounded-lg opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">WhatsApp Business</p>
                          <p className="text-sm text-gray-500">Send notifications via WhatsApp</p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  {/* Zoom */}
                  <div className="p-4 border border-gray-200 rounded-lg opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Video className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Zoom</p>
                          <p className="text-sm text-gray-500">Virtual classroom integration</p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  {/* Google Meet */}
                  <div className="p-4 border border-gray-200 rounded-lg opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <Video className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Google Meet</p>
                          <p className="text-sm text-gray-500">Video conferencing</p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  {/* Google Calendar */}
                  <div className="p-4 border border-gray-200 rounded-lg opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Google Calendar</p>
                          <p className="text-sm text-gray-500">Sync events and schedules</p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  {/* Razorpay */}
                  <div className="p-4 border border-gray-200 rounded-lg opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Razorpay</p>
                          <p className="text-sm text-gray-500">Payment gateway integration</p>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> These integrations will be available in future updates. Stay tuned!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
