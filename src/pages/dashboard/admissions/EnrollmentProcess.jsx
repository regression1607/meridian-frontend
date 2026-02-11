import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  ArrowLeft, UserPlus, User, GraduationCap, CreditCard,
  CheckCircle, AlertCircle, Hash, Mail, Phone, Lock, Eye, EyeOff, Loader2
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { admissionsApi, classesApi } from '../../../services/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

export default function EnrollmentProcess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [application, setApplication] = useState(null)
  const [sections, setSections] = useState([])
  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showParentPassword, setShowParentPassword] = useState(false)
  const [loadingRollNumber, setLoadingRollNumber] = useState(false)
  const [loadingAdmissionNumber, setLoadingAdmissionNumber] = useState(false)
  const [enrollmentData, setEnrollmentData] = useState({
    sectionId: '',
    rollNumber: '',
    admissionNumber: '',
    admissionFeeAmount: 0,
    admissionFeePaid: false,
    remarks: '',
    studentEmail: '',
    studentPassword: '',
    parentEmail: '',
    parentPassword: ''
  })

  useEffect(() => {
    fetchApplication()
  }, [id])

  // Fetch next admission number when component loads
  useEffect(() => {
    const institutionId = user?.institution?._id || user?.institution
    if (institutionId) {
      fetchNextAdmissionNumber(institutionId)
    }
  }, [user?.institution])

  // Fetch next roll number when section is selected
  useEffect(() => {
    if (enrollmentData.sectionId && application?.applyingForClass?._id) {
      fetchNextRollNumber(application.applyingForClass._id, enrollmentData.sectionId)
    }
  }, [enrollmentData.sectionId, application?.applyingForClass?._id])

  const fetchNextAdmissionNumber = async (institutionId) => {
    try {
      setLoadingAdmissionNumber(true)
      const token = localStorage.getItem('meridian_token')
      const response = await fetch(`${API_BASE_URL}/users/id-generator/next?institutionId=${institutionId}&idType=admissionNumber`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      const admissionNumber = data.data?.id || data.data?.admissionNumber
      if (data.success && admissionNumber) {
        setEnrollmentData(prev => ({
          ...prev,
          admissionNumber: admissionNumber
        }))
      }
    } catch (error) {
      console.error('Failed to fetch next admission number:', error)
    } finally {
      setLoadingAdmissionNumber(false)
    }
  }

  const fetchNextRollNumber = async (classId, sectionId) => {
    try {
      setLoadingRollNumber(true)
      const token = localStorage.getItem('meridian_token')
      const institutionId = user?.institution?._id || user?.institution
      let url = `${API_BASE_URL}/users/id-generator/next?institutionId=${institutionId}&idType=rollNumber&classId=${classId}`
      if (sectionId) {
        url += `&sectionId=${sectionId}`
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      const rollNumber = data.data?.id || data.data?.rollNumber
      if (data.success && rollNumber) {
        setEnrollmentData(prev => ({
          ...prev,
          rollNumber: rollNumber
        }))
      }
    } catch (error) {
      console.error('Failed to fetch next roll number:', error)
    } finally {
      setLoadingRollNumber(false)
    }
  }

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const response = await admissionsApi.getApplicationById(id)
      if (response.success) {
        if (response.data.status !== 'approved') {
          toast.error('Only approved applications can be enrolled')
          navigate('/dashboard/admissions/applications')
          return
        }
        setApplication(response.data)
        
        // Initialize emails from application data
        const app = response.data
        const parentEmail = app.primaryContact === 'guardian' 
          ? app.guardianInfo?.email 
          : app.primaryContact === 'mother'
            ? app.motherInfo?.email
            : (app.fatherInfo?.email || app.motherInfo?.email || app.guardianInfo?.email)
        
        setEnrollmentData(prev => ({
          ...prev,
          studentEmail: app.studentInfo?.email || '',
          parentEmail: parentEmail || ''
        }))
        
        // Fetch sections for the class
        if (response.data.applyingForClass?._id) {
          const sectionsRes = await classesApi.getSections(response.data.applyingForClass._id)
          if (sectionsRes.success) {
            setSections(sectionsRes.data || [])
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load application')
      navigate('/dashboard/admissions/applications')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async () => {
    // Validate emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!enrollmentData.studentEmail || !emailRegex.test(enrollmentData.studentEmail)) {
      toast.error('Please enter a valid student email')
      return
    }
    if (!enrollmentData.parentEmail || !emailRegex.test(enrollmentData.parentEmail)) {
      toast.error('Please enter a valid parent email')
      return
    }
    // Validate passwords
    if (!enrollmentData.studentPassword || enrollmentData.studentPassword.length < 6) {
      toast.error('Student password must be at least 6 characters')
      return
    }
    if (!enrollmentData.parentPassword || enrollmentData.parentPassword.length < 6) {
      toast.error('Parent password must be at least 6 characters')
      return
    }
    if (!enrollmentData.sectionId) {
      toast.error('Please select a section')
      return
    }

    setEnrolling(true)
    try {
      const response = await admissionsApi.enrollStudent(id, enrollmentData)
      if (response.success) {
        toast.success(`Student enrolled successfully! Admission No: ${response.data.admissionNumber}`)
        navigate('/dashboard/admissions/applications')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to enroll student')
    } finally {
      setEnrolling(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Application not found</h3>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/dashboard/admissions/applications/${id}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Application
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Enroll Student</h1>
        <p className="text-gray-600">Complete the enrollment process for approved application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6"
          >
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-lg font-semibold text-green-900">Approved Application</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Application No.</span>
                <p className="font-medium text-gray-900">{application.applicationNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Academic Year</span>
                <p className="font-medium text-gray-900">{application.academicYear}</p>
              </div>
            </div>
          </motion.div>

          {/* Student Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Student Details</h2>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-indigo-600">
                  {application.studentInfo?.firstName?.charAt(0)}{application.studentInfo?.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Full Name</span>
                  <p className="font-medium">{application.studentInfo?.firstName} {application.studentInfo?.lastName}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date of Birth</span>
                  <p className="font-medium">{formatDate(application.studentInfo?.dateOfBirth)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Gender</span>
                  <p className="font-medium capitalize">{application.studentInfo?.gender}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category</span>
                  <p className="font-medium uppercase">{application.studentInfo?.category}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Class & Section Assignment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <GraduationCap className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Class Assignment</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <input
                  type="text"
                  value={application.applyingForClass?.name || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
                <select
                  value={enrollmentData.sectionId}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, sectionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section._id} value={section._id}>{section.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Number</label>
                <div className="relative">
                  {loadingAdmissionNumber ? (
                    <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
                  ) : (
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                  <input
                    type="text"
                    value={enrollmentData.admissionNumber}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, admissionNumber: e.target.value }))}
                    placeholder={loadingAdmissionNumber ? "Loading..." : "Auto-generated"}
                    disabled={loadingAdmissionNumber}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-generated admission number</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <div className="relative">
                  {loadingRollNumber ? (
                    <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />
                  ) : (
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  )}
                  <input
                    type="text"
                    value={enrollmentData.rollNumber}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, rollNumber: e.target.value }))}
                    placeholder={loadingRollNumber ? "Loading..." : "Auto-generated on section select"}
                    disabled={loadingRollNumber}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-generated when you select a section</p>
              </div>
            </div>
          </motion.div>

          {/* Fee Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <CreditCard className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Admission Fee</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Amount (₹)</label>
                <input
                  type="number"
                  value={enrollmentData.admissionFeeAmount}
                  onChange={(e) => setEnrollmentData(prev => ({ ...prev, admissionFeeAmount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enrollmentData.admissionFeePaid}
                    onChange={(e) => setEnrollmentData(prev => ({ ...prev, admissionFeePaid: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Fee Paid</span>
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                value={enrollmentData.remarks}
                onChange={(e) => setEnrollmentData(prev => ({ ...prev, remarks: e.target.value }))}
                rows={2}
                placeholder="Any additional notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </motion.div>

          {/* Account Credentials Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <Lock className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Account Credentials</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Set initial passwords for student and parent accounts</p>
            
            {/* Student Account */}
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-medium text-indigo-900 mb-3">Student Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={enrollmentData.studentEmail}
                        onChange={(e) => setEnrollmentData(prev => ({ ...prev, studentEmail: e.target.value }))}
                        placeholder="student@example.com"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showStudentPassword ? 'text' : 'password'}
                        value={enrollmentData.studentPassword}
                        onChange={(e) => setEnrollmentData(prev => ({ ...prev, studentPassword: e.target.value }))}
                        placeholder="Set student password"
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent/Guardian Account */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-3">
                  {(application?.fatherInfo?.isDeceased && application?.motherInfo?.isDeceased) 
                    ? 'Guardian Account' 
                    : 'Parent Account'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={enrollmentData.parentEmail}
                        onChange={(e) => setEnrollmentData(prev => ({ ...prev, parentEmail: e.target.value }))}
                        placeholder="parent@example.com"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(application?.fatherInfo?.isDeceased && application?.motherInfo?.isDeceased) ? (
                        <span>Guardian: {application?.guardianInfo?.name} ({application?.guardianInfo?.relation})</span>
                      ) : application?.fatherInfo?.isDeceased ? (
                        <span>Mother: {application?.motherInfo?.name} <span className="text-amber-600">(Father N/A)</span></span>
                      ) : application?.motherInfo?.isDeceased ? (
                        <span>Father: {application?.fatherInfo?.name} <span className="text-amber-600">(Mother N/A)</span></span>
                      ) : (
                        <span>Primary: {application?.primaryContact || 'Father'}</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showParentPassword ? 'text' : 'password'}
                        value={enrollmentData.parentPassword}
                        onChange={(e) => setEnrollmentData(prev => ({ ...prev, parentPassword: e.target.value }))}
                        placeholder="Set parent password"
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowParentPassword(!showParentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showParentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Parent/Guardian Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {(application?.fatherInfo?.isDeceased && application?.motherInfo?.isDeceased) 
                ? 'Guardian Contact' 
                : 'Parent Contact'}
            </h2>
            <div className="space-y-3">
              {/* Show Guardian if both parents N/A, otherwise show available parent */}
              {(application?.fatherInfo?.isDeceased && application?.motherInfo?.isDeceased) ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Guardian's Name</p>
                    <p className="font-medium">{application?.guardianInfo?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Relation</p>
                    <p className="font-medium capitalize">{application?.guardianInfo?.relation || '-'}</p>
                  </div>
                  {application?.guardianInfo?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{application.guardianInfo.phone}</span>
                    </div>
                  )}
                  {application?.guardianInfo?.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{application.guardianInfo.email}</span>
                    </div>
                  )}
                </>
              ) : application?.fatherInfo?.isDeceased ? (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Mother's Name</p>
                    <p className="font-medium">{application?.motherInfo?.name || '-'}</p>
                  </div>
                  {application?.motherInfo?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{application.motherInfo.phone}</span>
                    </div>
                  )}
                  {application?.motherInfo?.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{application.motherInfo.email}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Father's Name</p>
                    <p className="font-medium">{application?.fatherInfo?.name || '-'}</p>
                  </div>
                  {application?.fatherInfo?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{application.fatherInfo.phone}</span>
                    </div>
                  )}
                  {application?.fatherInfo?.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{application.fatherInfo.email}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* What will be created */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-indigo-50 border border-indigo-200 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-indigo-900 mb-4">On Enrollment</h2>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-indigo-600" />
                Student account will be created
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-indigo-600" />
                Parent account will be created (if email provided)
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-indigo-600" />
                Admission number will be generated
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-indigo-600" />
                Student assigned to class & section
              </li>
            </ul>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> Default passwords will be set for new accounts. Users should change them on first login.
              </p>
            </div>
          </motion.div>

          {/* Enroll Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center font-medium"
            >
              {enrolling ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enrolling...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Complete Enrollment
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
