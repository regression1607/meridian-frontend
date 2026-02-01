import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  ArrowLeft, Building, Mail, Phone, Globe, MapPin, Save, Edit2, X,
  Users, GraduationCap, Calendar, CreditCard, CheckCircle, AlertCircle,
  Crown, Zap, Shield, Star
} from 'lucide-react'
import { PageLoader, ButtonLoader } from '../../../components/ui/Loading'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const TYPE_LABELS = {
  preschool: 'Preschool / Kindergarten',
  primary: 'Primary School',
  middle: 'Middle School',
  secondary: 'Secondary School',
  higher_secondary: 'Higher Secondary',
  college: 'College',
  university: 'University',
  coaching: 'Coaching Center',
  vocational: 'Vocational Training',
  special_education: 'Special Education',
  international: 'International School',
  online: 'Online Learning Platform'
}

const SUBSCRIPTION_PLANS = [
  { 
    value: 'free', 
    label: 'Free', 
    icon: Shield,
    color: 'gray',
    price: '₹0',
    features: ['Up to 100 students', 'Up to 20 staff', 'Basic features', 'Email support']
  },
  { 
    value: 'basic', 
    label: 'Basic', 
    icon: Zap,
    color: 'blue',
    price: '₹4,999/mo',
    features: ['Up to 500 students', 'Up to 50 staff', 'All basic features', 'SMS notifications', 'Priority support']
  },
  { 
    value: 'premium', 
    label: 'Premium', 
    icon: Star,
    color: 'purple',
    price: '₹9,999/mo',
    features: ['Up to 2000 students', 'Up to 200 staff', 'All premium features', 'AI features', 'Online payments', '24/7 support']
  },
  { 
    value: 'enterprise', 
    label: 'Enterprise', 
    icon: Crown,
    color: 'amber',
    price: 'Custom',
    features: ['Unlimited students', 'Unlimited staff', 'All features', 'Custom integrations', 'Dedicated support', 'White-labeling']
  }
]

export default function InstitutionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [institution, setInstitution] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({})
  const [showPlanModal, setShowPlanModal] = useState(false)

  useEffect(() => {
    fetchInstitution()
    fetchStats()
  }, [id])

  const fetchInstitution = async () => {
    try {
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setInstitution(data.data)
        setEditData(data.data)
      } else {
        toast.error(data.message || 'Failed to fetch institution')
      }
    } catch (error) {
      toast.error('Failed to fetch institution')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/institutions/${id}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setEditData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })
      const data = await response.json()
      if (data.success) {
        setInstitution(data.data)
        setEditing(false)
        toast.success('Institution updated successfully!')
      } else {
        toast.error(data.message || 'Failed to update institution')
      }
    } catch (error) {
      toast.error('Failed to update institution')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePlan = async (plan) => {
    try {
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: {
            ...institution.subscription,
            plan
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        setInstitution(data.data)
        setShowPlanModal(false)
        toast.success(`Plan upgraded to ${plan}!`)
      } else {
        toast.error(data.message || 'Failed to update plan')
      }
    } catch (error) {
      toast.error('Failed to update plan')
    }
  }

  if (loading) return <PageLoader />

  if (!institution) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Institution not found</h2>
        <button onClick={() => navigate('/dashboard/institutions')} className="mt-4 text-primary-600 hover:underline">
          Back to Institutions
        </button>
      </div>
    )
  }

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.value === institution.subscription?.plan) || SUBSCRIPTION_PLANS[0]
  const daysLeft = institution.subscription?.endDate 
    ? Math.ceil((new Date(institution.subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/institutions')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Institutions
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
          <p className="text-gray-500">{institution.code} • {TYPE_LABELS[institution.type] || institution.type}</p>
        </div>
        <div className="flex items-center gap-3">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
              >
                {saving ? <ButtonLoader /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit Institution
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTeachers}</p>
                    <p className="text-xs text-gray-500">Teachers</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalParents}</p>
                    <p className="text-xs text-gray-500">Parents</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
                    <p className="text-xs text-gray-500">Staff</p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </h2>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={editData.website || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{institution.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{institution.phone}</span>
                </div>
                {institution.website && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {institution.website}
                    </a>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Address
            </h2>
            {editing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <input
                    type="text"
                    name="address.street"
                    value={editData.address?.street || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={editData.address?.city || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={editData.address?.state || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={editData.address?.zipCode || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={editData.address?.country || ''}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                <p>{institution.address?.street}</p>
                <p>{institution.address?.city}, {institution.address?.state} {institution.address?.zipCode}</p>
                <p>{institution.address?.country}</p>
              </div>
            )}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enabled Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(institution.features || {}).map(([key, enabled]) => (
                <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                  {enabled ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Subscription Sidebar */}
        <div className="space-y-6">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${
              currentPlan.value === 'enterprise' ? 'from-amber-500 to-orange-600' :
              currentPlan.value === 'premium' ? 'from-purple-500 to-indigo-600' :
              currentPlan.value === 'basic' ? 'from-blue-500 to-cyan-600' :
              'from-gray-500 to-gray-600'
            } rounded-xl p-6 text-white`}
          >
            <div className="flex items-center gap-3 mb-4">
              <currentPlan.icon className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">{currentPlan.label} Plan</h3>
                <p className="text-white/80 text-sm">{currentPlan.price}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {currentPlan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-white/90">
                  <CheckCircle className="w-4 h-4" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
            >
              Change Plan
            </button>
          </motion.div>

          {/* Subscription Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  institution.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {institution.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Start Date</span>
                <span className="text-gray-900">
                  {institution.subscription?.startDate 
                    ? new Date(institution.subscription.startDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">End Date</span>
                <span className="text-gray-900">
                  {institution.subscription?.endDate 
                    ? new Date(institution.subscription.endDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Days Remaining</span>
                <span className={`font-medium ${daysLeft < 30 ? 'text-red-600' : 'text-green-600'}`}>
                  {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max Students</span>
                <span className="text-gray-900">{institution.subscription?.maxStudents || 100}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Max Staff</span>
                <span className="text-gray-900">{institution.subscription?.maxStaff || 20}</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <Users className="w-4 h-4" />
                View All Users
              </button>
              <button className="w-full py-2 px-4 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                View Attendance
              </button>
              <button className="w-full py-2 px-4 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                View Fee Reports
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Plan Selection Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Choose a Plan</h2>
                <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.value}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                      institution.subscription?.plan === plan.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleUpdatePlan(plan.value)}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      plan.value === 'enterprise' ? 'bg-amber-100 text-amber-600' :
                      plan.value === 'premium' ? 'bg-purple-100 text-purple-600' :
                      plan.value === 'basic' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <plan.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{plan.label}</h3>
                    <p className="text-lg font-bold text-primary-600 mb-3">{plan.price}</p>
                    <ul className="space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {institution.subscription?.plan === plan.value && (
                      <div className="mt-3 text-xs text-primary-600 font-medium">Current Plan</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
