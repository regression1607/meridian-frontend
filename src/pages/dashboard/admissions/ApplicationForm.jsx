import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  User, Users, MapPin, GraduationCap, FileText, Save,
  ArrowLeft, ArrowRight, Check, Upload, X
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { admissionsApi, classesApi, institutionsApi } from '../../../services/api'

const STEPS = [
  { id: 1, title: 'Student Info', icon: User },
  { id: 2, title: 'Parent Info', icon: Users },
  { id: 3, title: 'Address', icon: MapPin },
  { id: 4, title: 'Previous School', icon: GraduationCap },
  { id: 5, title: 'Documents', icon: FileText }
]

const INITIAL_FORM = {
  institutionId: '',
  applyingForClass: '',
  academicYear: '',
  studentInfo: {
    firstName: '', lastName: '', dateOfBirth: '', gender: '',
    bloodGroup: '', nationality: 'Indian', religion: '', category: 'general', motherTongue: '',
    email: '' // Email for student account creation
  },
  fatherInfo: {
    name: '', email: '', phone: '', occupation: '', qualification: '', annualIncome: '',
    isDeceased: false
  },
  motherInfo: {
    name: '', email: '', phone: '', occupation: '', qualification: '',
    isDeceased: false
  },
  guardianInfo: { name: '', relation: '', phone: '', email: '', isRequired: false },
  primaryContact: 'father', // father, mother, or guardian
  address: {
    street: '', city: '', state: '', country: 'India', zipCode: ''
  },
  previousSchool: {
    name: '', board: '', class: '', percentage: '', yearOfPassing: '', reasonForLeaving: ''
  },
  documents: []
}

export default function ApplicationForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!id)
  const [classes, setClasses] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [formData, setFormData] = useState(INITIAL_FORM)
  const isEditMode = !!id

  useEffect(() => {
    fetchInitialData()
  }, [user?.institution])

  useEffect(() => {
    if (id) {
      fetchApplication()
    }
  }, [id])

  const fetchApplication = async () => {
    try {
      setInitialLoading(true)
      const response = await admissionsApi.getApplicationById(id)
      if (response.success) {
        const app = response.data
        setFormData({
          institutionId: app.institution?._id || app.institution,
          applyingForClass: app.applyingForClass?._id || app.applyingForClass,
          academicYear: app.academicYear || '',
          studentInfo: app.studentInfo || INITIAL_FORM.studentInfo,
          fatherInfo: app.fatherInfo || INITIAL_FORM.fatherInfo,
          motherInfo: app.motherInfo || INITIAL_FORM.motherInfo,
          guardianInfo: app.guardianInfo || INITIAL_FORM.guardianInfo,
          address: app.address || INITIAL_FORM.address,
          previousSchool: app.previousSchool || INITIAL_FORM.previousSchool,
          documents: app.documents || []
        })
      }
    } catch (error) {
      toast.error('Failed to load application')
      navigate('/dashboard/admissions/applications')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchInitialData = async () => {
    try {
      // Set default institution and academic year first
      const institutionId = user?.institution?._id || user?.institution
      if (institutionId) {
        setFormData(prev => ({ ...prev, institutionId }))
      }
      
      const year = new Date().getFullYear()
      setFormData(prev => ({ ...prev, academicYear: `${year}-${(year + 1).toString().slice(-2)}` }))

      // Fetch classes using the public endpoint with user's institution (same as public form)
      if (institutionId) {
        const classesRes = await classesApi.getPublic(institutionId)
        if (classesRes.success) {
          setClasses(classesRes.data || [])
        }
      }
      
      // Fetch institutions for super admin
      const institutionsRes = await institutionsApi.getAll()
      if (institutionsRes.success) {
        const instData = Array.isArray(institutionsRes.data) ? institutionsRes.data : (institutionsRes.data?.data || [])
        setInstitutions(instData)
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const updateFormData = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateStep = () => {
    const bothParentsDeceased = formData.fatherInfo.isDeceased && formData.motherInfo.isDeceased
    
    switch (currentStep) {
      case 1:
        if (!formData.applyingForClass) return toast.error('Please select a class')
        if (!formData.studentInfo.firstName) return toast.error('First name is required')
        if (!formData.studentInfo.lastName) return toast.error('Last name is required')
        if (!formData.studentInfo.dateOfBirth) return toast.error('Date of birth is required')
        if (!formData.studentInfo.gender) return toast.error('Gender is required')
        break
      case 2:
        // If both parents deceased, guardian is required
        if (bothParentsDeceased) {
          if (!formData.guardianInfo.name) return toast.error('Guardian name is required')
          if (!formData.guardianInfo.relation) return toast.error('Guardian relation is required')
          if (!formData.guardianInfo.phone) return toast.error('Guardian phone is required')
          if (!formData.guardianInfo.email) return toast.error('Guardian email is required for parent account')
        } else {
          // At least one parent must have details
          if (!formData.fatherInfo.isDeceased) {
            if (formData.motherInfo.isDeceased) {
              // Only father available - required
              if (!formData.fatherInfo.name) return toast.error('Father name is required')
              if (!formData.fatherInfo.phone) return toast.error('Father phone is required')
            }
          }
          if (!formData.motherInfo.isDeceased) {
            if (formData.fatherInfo.isDeceased) {
              // Only mother available - required
              if (!formData.motherInfo.name) return toast.error('Mother name is required')
              if (!formData.motherInfo.phone) return toast.error('Mother phone is required')
            }
          }
          // Primary contact email is required
          if (formData.primaryContact === 'father' && !formData.fatherInfo.email) {
            return toast.error('Father email is required (selected as primary contact)')
          }
          if (formData.primaryContact === 'mother' && !formData.motherInfo.email) {
            return toast.error('Mother email is required (selected as primary contact)')
          }
          if (formData.primaryContact === 'guardian' && !formData.guardianInfo.email) {
            return toast.error('Guardian email is required (selected as primary contact)')
          }
        }
        break
      case 3:
        if (!formData.address.city) return toast.error('City is required')
        if (!formData.address.state) return toast.error('State is required')
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep() === true) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // Use user's institution if available
      const submitData = {
        ...formData,
        institutionId: formData.institutionId || user?.institution
      }
      
      let response
      if (isEditMode) {
        response = await admissionsApi.updateApplication(id, submitData)
        if (response.success) {
          toast.success('Application updated successfully')
          navigate(`/dashboard/admissions/applications/${id}`)
        }
      } else {
        response = await admissionsApi.submitApplication(submitData)
        if (response.success) {
          toast.success(`Application submitted! Number: ${response.data.applicationNumber}`)
          navigate('/dashboard/admissions/applications')
        }
      }
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'submit'} application`)
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Student Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applying for Class *</label>
                <select
                  value={formData.applyingForClass}
                  onChange={(e) => updateFormData(null, 'applyingForClass', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => updateFormData(null, 'academicYear', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="2024-25"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.studentInfo.firstName}
                  onChange={(e) => updateFormData('studentInfo', 'firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.studentInfo.lastName}
                  onChange={(e) => updateFormData('studentInfo', 'lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.studentInfo.dateOfBirth}
                  onChange={(e) => updateFormData('studentInfo', 'dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  value={formData.studentInfo.gender}
                  onChange={(e) => updateFormData('studentInfo', 'gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  value={formData.studentInfo.bloodGroup}
                  onChange={(e) => updateFormData('studentInfo', 'bloodGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.studentInfo.category}
                  onChange={(e) => updateFormData('studentInfo', 'category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="obc">OBC</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                  <option value="ews">EWS</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                <input
                  type="text"
                  value={formData.studentInfo.religion}
                  onChange={(e) => updateFormData('studentInfo', 'religion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother Tongue</label>
                <input
                  type="text"
                  value={formData.studentInfo.motherTongue}
                  onChange={(e) => updateFormData('studentInfo', 'motherTongue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Student Email for Account Creation */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Student Account Email</h4>
              <p className="text-sm text-indigo-700 mb-3">This email will be used to create the student's Meridian account</p>
              <input
                type="email"
                value={formData.studentInfo.email}
                onChange={(e) => updateFormData('studentInfo', 'email', e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )
      
      case 2:
        const bothParentsDeceased = formData.fatherInfo.isDeceased && formData.motherInfo.isDeceased
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
            <p className="text-sm text-gray-500">At least one parent's email is required for parent account creation. If both parents are deceased, guardian details are required.</p>
            
            {/* Father Info */}
            <div className={`p-4 rounded-lg ${formData.fatherInfo.isDeceased ? 'bg-gray-100' : 'bg-blue-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-blue-900">Father's Details</h4>
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.fatherInfo.isDeceased}
                    onChange={(e) => {
                      updateFormData('fatherInfo', 'isDeceased', e.target.checked)
                      if (e.target.checked && formData.primaryContact === 'father') {
                        updateFormData(null, 'primaryContact', formData.motherInfo.isDeceased ? 'guardian' : 'mother')
                      }
                    }}
                    className="mr-2 rounded border-gray-300"
                  />
                  Deceased / Not Applicable
                </label>
              </div>
              {!formData.fatherInfo.isDeceased && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name {!formData.motherInfo.isDeceased ? '' : '*'}</label>
                    <input
                      type="text"
                      value={formData.fatherInfo.name}
                      onChange={(e) => updateFormData('fatherInfo', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone {!formData.motherInfo.isDeceased ? '' : '*'}</label>
                    <input
                      type="tel"
                      value={formData.fatherInfo.phone}
                      onChange={(e) => updateFormData('fatherInfo', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email {formData.primaryContact === 'father' ? '* (Primary Contact)' : ''}
                    </label>
                    <input
                      type="email"
                      value={formData.fatherInfo.email}
                      onChange={(e) => updateFormData('fatherInfo', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="For parent account creation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      value={formData.fatherInfo.occupation}
                      onChange={(e) => updateFormData('fatherInfo', 'occupation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      value={formData.fatherInfo.qualification}
                      onChange={(e) => updateFormData('fatherInfo', 'qualification', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                    <input
                      type="number"
                      value={formData.fatherInfo.annualIncome}
                      onChange={(e) => updateFormData('fatherInfo', 'annualIncome', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mother Info */}
            <div className={`p-4 rounded-lg ${formData.motherInfo.isDeceased ? 'bg-gray-100' : 'bg-pink-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-pink-900">Mother's Details</h4>
                <label className="flex items-center text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.motherInfo.isDeceased}
                    onChange={(e) => {
                      updateFormData('motherInfo', 'isDeceased', e.target.checked)
                      if (e.target.checked && formData.primaryContact === 'mother') {
                        updateFormData(null, 'primaryContact', formData.fatherInfo.isDeceased ? 'guardian' : 'father')
                      }
                    }}
                    className="mr-2 rounded border-gray-300"
                  />
                  Deceased / Not Applicable
                </label>
              </div>
              {!formData.motherInfo.isDeceased && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name {!formData.fatherInfo.isDeceased ? '' : '*'}</label>
                    <input
                      type="text"
                      value={formData.motherInfo.name}
                      onChange={(e) => updateFormData('motherInfo', 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone {!formData.fatherInfo.isDeceased ? '' : '*'}</label>
                    <input
                      type="tel"
                      value={formData.motherInfo.phone}
                      onChange={(e) => updateFormData('motherInfo', 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email {formData.primaryContact === 'mother' ? '* (Primary Contact)' : ''}
                    </label>
                    <input
                      type="email"
                      value={formData.motherInfo.email}
                      onChange={(e) => updateFormData('motherInfo', 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="For parent account creation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <input
                      type="text"
                      value={formData.motherInfo.occupation}
                      onChange={(e) => updateFormData('motherInfo', 'occupation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Guardian Info - Required when both parents are deceased */}
            <div className={`p-4 rounded-lg ${bothParentsDeceased ? 'bg-amber-50 border-2 border-amber-300' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-amber-900">
                  Guardian's Details {bothParentsDeceased && <span className="text-red-600">* (Required)</span>}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name {bothParentsDeceased ? '*' : ''}</label>
                  <input
                    type="text"
                    value={formData.guardianInfo.name}
                    onChange={(e) => updateFormData('guardianInfo', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relation {bothParentsDeceased ? '*' : ''}</label>
                  <select
                    value={formData.guardianInfo.relation}
                    onChange={(e) => updateFormData('guardianInfo', 'relation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Relation</option>
                    <option value="grandfather">Grandfather</option>
                    <option value="grandmother">Grandmother</option>
                    <option value="uncle">Uncle</option>
                    <option value="aunt">Aunt</option>
                    <option value="sibling">Sibling</option>
                    <option value="legal_guardian">Legal Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone {bothParentsDeceased ? '*' : ''}</label>
                  <input
                    type="tel"
                    value={formData.guardianInfo.phone}
                    onChange={(e) => updateFormData('guardianInfo', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email {bothParentsDeceased ? '* (For Parent Account)' : ''}
                  </label>
                  <input
                    type="email"
                    value={formData.guardianInfo.email}
                    onChange={(e) => updateFormData('guardianInfo', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="For parent account creation"
                  />
                </div>
              </div>
            </div>

            {/* Primary Contact Selection */}
            {!bothParentsDeceased && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Primary Contact for Parent Account</h4>
                <p className="text-sm text-green-700 mb-3">Select whose email will be used to create the parent account</p>
                <div className="flex gap-4">
                  {!formData.fatherInfo.isDeceased && (
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="primaryContact"
                        value="father"
                        checked={formData.primaryContact === 'father'}
                        onChange={(e) => updateFormData(null, 'primaryContact', e.target.value)}
                        className="mr-2"
                      />
                      Father
                    </label>
                  )}
                  {!formData.motherInfo.isDeceased && (
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="primaryContact"
                        value="mother"
                        checked={formData.primaryContact === 'mother'}
                        onChange={(e) => updateFormData(null, 'primaryContact', e.target.value)}
                        className="mr-2"
                      />
                      Mother
                    </label>
                  )}
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="primaryContact"
                      value="guardian"
                      checked={formData.primaryContact === 'guardian'}
                      onChange={(e) => updateFormData(null, 'primaryContact', e.target.value)}
                      className="mr-2"
                    />
                    Guardian
                  </label>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Address Details</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <textarea
                  value={formData.address.street}
                  onChange={(e) => updateFormData('address', 'street', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => updateFormData('address', 'city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => updateFormData('address', 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => updateFormData('address', 'country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => updateFormData('address', 'zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Previous School Information</h3>
            <p className="text-sm text-gray-500">Fill if applicable (for transfers/lateral entries)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={formData.previousSchool.name}
                  onChange={(e) => updateFormData('previousSchool', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                <select
                  value={formData.previousSchool.board}
                  onChange={(e) => updateFormData('previousSchool', 'board', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">IB</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Class Attended</label>
                <input
                  type="text"
                  value={formData.previousSchool.class}
                  onChange={(e) => updateFormData('previousSchool', 'class', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/CGPA</label>
                <input
                  type="number"
                  value={formData.previousSchool.percentage}
                  onChange={(e) => updateFormData('previousSchool', 'percentage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing</label>
                <input
                  type="number"
                  value={formData.previousSchool.yearOfPassing}
                  onChange={(e) => updateFormData('previousSchool', 'yearOfPassing', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
                <input
                  type="text"
                  value={formData.previousSchool.reasonForLeaving}
                  onChange={(e) => updateFormData('previousSchool', 'reasonForLeaving', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
            <p className="text-sm text-gray-500">Documents can be uploaded after submission from the application detail page</p>
            
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Document upload will be available after submission</p>
              <p className="text-sm text-gray-500 mt-2">
                Required documents: Birth Certificate, Previous Marksheet, Transfer Certificate, Photos
              </p>
            </div>

            {/* Summary */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-3">Application Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-600">Student Name:</div>
                <div className="font-medium">{formData.studentInfo.firstName} {formData.studentInfo.lastName}</div>
                <div className="text-gray-600">Applying for:</div>
                <div className="font-medium">{classes.find(c => c._id === formData.applyingForClass)?.name || '-'}</div>
                <div className="text-gray-600">Father's Name:</div>
                <div className="font-medium">{formData.fatherInfo.name}</div>
                <div className="text-gray-600">Contact:</div>
                <div className="font-medium">{formData.fatherInfo.phone}</div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/admissions/applications')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Application' : 'New Admission Application'}</h1>
        <p className="text-gray-600">{isEditMode ? 'Update the application details' : 'Fill in the details to submit an admission application'}</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                      isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 
                      'bg-white border-gray-300 text-gray-400'}`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} 
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        {renderStepContent()}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        
        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isEditMode ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Application' : 'Submit Application'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
