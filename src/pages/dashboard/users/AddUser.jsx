import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  ArrowLeft, User, Mail, Phone, Calendar, MapPin, 
  Save, X, Eye, EyeOff, Building, GraduationCap, Plus
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { ButtonLoader } from '../../../components/ui/Loading'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// All available roles - admin only visible to super_admin
const ALL_ROLES = [
  { value: 'admin', label: 'Platform Admin', description: 'Manage all institutions', superAdminOnly: true },
  { value: 'institution_admin', label: 'Institution Admin', description: 'Full access to institution' },
  { value: 'coordinator', label: 'Coordinator', description: 'Manage classes and schedules' },
  { value: 'teacher', label: 'Teacher', description: 'Manage classes and students' },
  { value: 'student', label: 'Student', description: 'Access learning materials' },
  { value: 'parent', label: 'Parent', description: 'Monitor child progress' },
  { value: 'staff', label: 'Staff', description: 'Administrative tasks' }
]

export default function AddUser() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [institutions, setInstitutions] = useState([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(false)
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [selectedClassData, setSelectedClassData] = useState(null)
  
  // Get institution ID from user or set null for platform admins to select
  const userInstitutionId = user?.institution?._id || user?.institution || null
  
  // Check if current user is platform admin (super_admin or admin)
  const isPlatformAdmin = ['super_admin', 'admin'].includes(user?.role)
  
  // Filter roles based on current user's role
  const availableRoles = ALL_ROLES.filter(role => {
    if (role.superAdminOnly && user?.role !== 'super_admin') return false
    return true
  })

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
    gender: '',
    dateOfBirth: '',
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
    },
    institutionId: ''
  })

  // Fetch institutions for platform admins
  useEffect(() => {
    if (isPlatformAdmin) {
      fetchInstitutions()
    }
  }, [isPlatformAdmin])

  // Fetch classes when institution is selected or for non-platform admins
  useEffect(() => {
    // For platform admins, use selected institution; for others, use their institution
    const instId = isPlatformAdmin ? formData.institutionId : userInstitutionId
    
    if (instId && formData.role === 'student') {
      fetchClasses(instId)
    }
  }, [formData.institutionId, formData.role, isPlatformAdmin, userInstitutionId])

  // Update selected class data when class changes
  useEffect(() => {
    if (formData.studentProfile.class) {
      const classData = classes.find(c => c._id === formData.studentProfile.class)
      setSelectedClassData(classData)
    } else {
      setSelectedClassData(null)
    }
  }, [formData.studentProfile.class, classes])

  const fetchInstitutions = async () => {
    try {
      setLoadingInstitutions(true)
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/institutions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setInstitutions(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch institutions:', error)
    } finally {
      setLoadingInstitutions(false)
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
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('meridian_token')
      
      // Validate institution for platform admins creating non-admin users
      if (isPlatformAdmin && formData.role !== 'admin' && !formData.institutionId) {
        toast.error('Please select an institution for this user')
        setLoading(false)
        return
      }

      // Build request body based on role
      const body = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password || undefined,
        role: formData.role,
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        address: formData.address.street ? formData.address : undefined,
        // Include institutionId for platform admins
        institutionId: isPlatformAdmin ? formData.institutionId : undefined
      }

      // Add role-specific data
      if (formData.role === 'teacher' && formData.teacherProfile.employeeId) {
        body.teacherProfile = formData.teacherProfile
      }
      if (formData.role === 'student') {
        body.studentProfile = {
          admissionNumber: formData.studentProfile.admissionNumber,
          rollNumber: formData.studentProfile.rollNumber,
          class: formData.studentProfile.class || undefined,
          section: formData.studentProfile.section || undefined
        }
      }
      if (formData.role === 'staff' && formData.staffProfile.employeeId) {
        body.staffProfile = formData.staffProfile
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user')
      }

      toast.success(`User ${formData.firstName} ${formData.lastName} created successfully!`)
      navigate('/dashboard/users')
    } catch (err) {
      toast.error(err.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData(prev => ({ ...prev, password }))
    setShowPassword(true)
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
        <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
        <p className="text-gray-500 mt-1">Create a new user account for your institution</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableRoles.map((role) => (
              <label
                key={role.value}
                className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition ${
                  formData.role === role.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={formData.role === role.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-medium text-gray-900">{role.label}</span>
                <span className="text-xs text-gray-500 mt-1">{role.description}</span>
              </label>
            ))}
          </div>
        </motion.div>

        {/* Institution Selection - Only for Platform Admins creating non-admin users */}
        {isPlatformAdmin && formData.role !== 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Select Institution <span className="text-red-500">*</span>
            </h2>
            {loadingInstitutions ? (
              <div className="text-gray-500">Loading institutions...</div>
            ) : institutions.length === 0 ? (
              <div className="text-amber-600 bg-amber-50 p-4 rounded-lg">
                No institutions found. Please create an institution first.
              </div>
            ) : (
              <select
                name="institutionId"
                value={formData.institutionId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">-- Select Institution --</option>
                {institutions.map((inst) => (
                  <option key={inst._id} value={inst._id}>
                    {inst.name} ({inst.code})
                  </option>
                ))}
              </select>
            )}
          </motion.div>
        )}

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 pr-20 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Leave blank to auto-generate"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Generate
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave blank to auto-generate a secure password</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Role-specific fields */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                {isPlatformAdmin && !formData.institutionId ? (
                  <div className="px-4 py-2 text-blue-600 bg-blue-50 p-3 rounded-lg text-sm">
                    Please select an institution first to see available classes.
                  </div>
                ) : loadingClasses ? (
                  <div className="px-4 py-2 text-gray-500 text-sm">Loading classes...</div>
                ) : classes.length === 0 ? (
                  <div className="space-y-2">
                    <div className="text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
                      No classes found. Please create a class first.
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
                    required
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

              {/* Section Selection - Only show if class is selected and has sections */}
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
            Address (Optional)
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
                placeholder="Enter street address"
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
                placeholder="Enter city"
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
                placeholder="Enter state"
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
                placeholder="Enter pincode"
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toast.info('Draft saved (feature coming soon)')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <ButtonLoader />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create User
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
