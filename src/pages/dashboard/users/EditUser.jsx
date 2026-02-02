import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { ArrowLeft, Save, X, User, Mail, Phone, MapPin, Shield, Building, GraduationCap, Plus, Calendar } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { ButtonLoader, PageLoader } from '../../../components/ui/Loading'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const ALL_ROLES = [
  { value: 'admin', label: 'Platform Admin', superAdminOnly: true },
  { value: 'institution_admin', label: 'Institution Admin' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'staff', label: 'Staff' }
]

export default function EditUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [selectedClassData, setSelectedClassData] = useState(null)
  const [userInstitutionId, setUserInstitutionId] = useState(null)
  
  const isPlatformAdmin = ['super_admin', 'admin'].includes(currentUser?.role)
  const availableRoles = ALL_ROLES.filter(role => {
    if (role.superAdminOnly && currentUser?.role !== 'super_admin') return false
    return true
  })

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    gender: '',
    dateOfBirth: '',
    isActive: true,
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    teacherProfile: {
      employeeId: '',
      department: '',
      qualifications: ''
    },
    studentProfile: {
      admissionNumber: '',
      rollNumber: '',
      class: '',
      section: ''
    },
    staffProfile: {
      employeeId: '',
      department: '',
      designation: ''
    }
  })

  useEffect(() => {
    fetchUser()
  }, [id])

  // Fetch classes when we have institution ID and role is student
  useEffect(() => {
    if (userInstitutionId && formData.role === 'student') {
      fetchClasses(userInstitutionId)
    }
  }, [userInstitutionId, formData.role])

  // Update selected class data when class changes
  useEffect(() => {
    if (formData.studentProfile.class && classes.length > 0) {
      const classData = classes.find(c => c._id === formData.studentProfile.class)
      setSelectedClassData(classData)
    } else {
      setSelectedClassData(null)
    }
  }, [formData.studentProfile.class, classes])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user')
      }

      if (data.success && data.data) {
        const user = data.data
        
        // Store institution ID for fetching classes
        const instId = user.institution?._id || user.institution
        setUserInstitutionId(instId)
        
        setFormData({
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          email: user.email || '',
          phone: user.profile?.phone || '',
          role: user.role || '',
          gender: user.profile?.gender || '',
          dateOfBirth: user.profile?.dateOfBirth ? user.profile.dateOfBirth.split('T')[0] : '',
          isActive: user.isActive !== false,
          address: {
            street: user.profile?.address?.street || '',
            city: user.profile?.address?.city || '',
            state: user.profile?.address?.state || '',
            pincode: user.profile?.address?.pincode || '',
            country: user.profile?.address?.country || 'India'
          },
          teacherProfile: {
            employeeId: user.teacherData?.employeeId || '',
            department: user.teacherData?.department || '',
            qualifications: user.teacherData?.qualification || ''
          },
          studentProfile: {
            admissionNumber: user.studentData?.admissionNumber || '',
            rollNumber: user.studentData?.rollNumber || '',
            class: user.studentData?.class?._id || user.studentData?.class || '',
            section: user.studentData?.section?._id || user.studentData?.section || ''
          },
          staffProfile: {
            employeeId: user.staffData?.employeeId || '',
            department: user.staffData?.department || '',
            designation: user.staffData?.designation || ''
          }
        })
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch user')
      navigate('/dashboard/users')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async (institutionId) => {
    try {
      setLoadingClasses(true)
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/classes?institution=${institutionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setClasses(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('meridian_token')
      
      const body = {
        email: formData.email,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          address: formData.address.street ? formData.address : undefined
        },
        role: formData.role,
        isActive: formData.isActive
      }

      // Add role-specific data
      if (formData.role === 'teacher') {
        body.teacherProfile = {
          employeeId: formData.teacherProfile.employeeId || undefined,
          department: formData.teacherProfile.department || undefined,
          qualifications: formData.teacherProfile.qualifications || undefined
        }
      }
      if (formData.role === 'student') {
        body.studentProfile = {
          admissionNumber: formData.studentProfile.admissionNumber || undefined,
          rollNumber: formData.studentProfile.rollNumber || undefined,
          class: formData.studentProfile.class || undefined,
          section: formData.studentProfile.section || undefined
        }
      }
      if (formData.role === 'staff') {
        body.staffProfile = {
          employeeId: formData.staffProfile.employeeId || undefined,
          department: formData.staffProfile.department || undefined,
          designation: formData.staffProfile.designation || undefined
        }
      }

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user')
      }

      toast.success('User updated successfully!')
      navigate('/dashboard/users')
    } catch (err) {
      toast.error(err.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-500 mt-1">Update user information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Role & Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role & Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Role</option>
                {availableRoles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Account</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Teacher Information */}
        {formData.role === 'teacher' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Teacher Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  name="teacherProfile.employeeId"
                  value={formData.teacherProfile.employeeId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., TCH001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="teacherProfile.department"
                  value={formData.teacherProfile.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                <input
                  type="text"
                  name="teacherProfile.qualifications"
                  value={formData.teacherProfile.qualifications}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., M.Sc, B.Ed"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Student Information */}
        {formData.role === 'student' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                <input
                  type="text"
                  name="studentProfile.admissionNumber"
                  value={formData.studentProfile.admissionNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., ADM2024001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  name="studentProfile.rollNumber"
                  value={formData.studentProfile.rollNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 001"
                />
              </div>
              
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                {loadingClasses ? (
                  <div className="px-4 py-2 text-gray-500 text-sm">Loading classes...</div>
                ) : classes.length === 0 ? (
                  <div className="space-y-2">
                    <div className="text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                      No classes found.
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/classes')}
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Class
                    </button>
                  </div>
                ) : (
                  <select
                    name="studentProfile.class"
                    value={formData.studentProfile.class}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} {cls.grade ? `(Grade ${cls.grade})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                {!formData.studentProfile.class ? (
                  <div className="px-4 py-2 text-gray-400 text-sm border border-gray-200 rounded-lg bg-gray-50">
                    Select a class first
                  </div>
                ) : selectedClassData?.sections?.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500 text-sm border border-gray-200 rounded-lg bg-gray-50">
                    No sections in this class
                  </div>
                ) : selectedClassData?.sections?.length > 0 ? (
                  <select
                    name="studentProfile.section"
                    value={formData.studentProfile.section}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Select Section --</option>
                    {selectedClassData.sections.map((sec) => (
                      <option key={sec._id} value={sec._id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-2 text-gray-400 text-sm border border-gray-200 rounded-lg bg-gray-50">
                    Loading...
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Staff Information */}
        {formData.role === 'staff' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Staff Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  name="staffProfile.employeeId"
                  value={formData.staffProfile.employeeId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., STF001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="staffProfile.department"
                  value={formData.staffProfile.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Administration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input
                  type="text"
                  name="staffProfile.designation"
                  value={formData.staffProfile.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Office Assistant"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
              <input
                type="text"
                name="address.pincode"
                value={formData.address.pincode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard/users')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <ButtonLoader />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
