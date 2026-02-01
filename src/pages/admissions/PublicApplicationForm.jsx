import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast, ToastContainer } from 'react-toastify'
import {
  User, Users, MapPin, GraduationCap, FileText, Save,
  ArrowLeft, ArrowRight, Check, School, Phone, Mail
} from 'lucide-react'
import { admissionsApi, classesApi, institutionsApi } from '../../services/api'

const STEPS = [
  { id: 1, title: 'Institution', icon: School },
  { id: 2, title: 'Student Info', icon: User },
  { id: 3, title: 'Parent Info', icon: Users },
  { id: 4, title: 'Address', icon: MapPin },
  { id: 5, title: 'Previous School', icon: GraduationCap }
]

const INITIAL_FORM = {
  institutionId: '',
  applyingForClass: '',
  academicYear: new Date().getFullYear().toString(),
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
  primaryContact: 'father',
  address: {
    street: '', city: '', state: '', country: 'India', zipCode: ''
  },
  previousSchool: {
    name: '', board: '', class: '', percentage: '', yearOfPassing: '', reasonForLeaving: ''
  }
}

export default function PublicApplicationForm() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [institutions, setInstitutions] = useState([])
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [submitted, setSubmitted] = useState(false)
  const [applicationNumber, setApplicationNumber] = useState('')

  useEffect(() => {
    fetchInstitutions()
  }, [])

  useEffect(() => {
    if (formData.institutionId) {
      fetchClasses()
    }
  }, [formData.institutionId])

  const fetchInstitutions = async () => {
    try {
      const response = await institutionsApi.getPublic()
      if (response.success) {
        setInstitutions(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load institutions:', error)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getPublic(formData.institutionId)
      if (response.success) {
        setClasses(response.data || [])
      }
    } catch (error) {
      console.error('Failed to load classes:', error)
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
        if (!formData.institutionId) {
          toast.error('Please select an institution')
          return false
        }
        if (!formData.applyingForClass) {
          toast.error('Please select a class')
          return false
        }
        return true
      case 2:
        if (!formData.studentInfo.firstName || !formData.studentInfo.lastName) {
          toast.error('Please enter student name')
          return false
        }
        if (!formData.studentInfo.dateOfBirth) {
          toast.error('Please enter date of birth')
          return false
        }
        if (!formData.studentInfo.gender) {
          toast.error('Please select gender')
          return false
        }
        return true
      case 3:
        // If both parents deceased, guardian is required
        if (bothParentsDeceased) {
          if (!formData.guardianInfo.name) {
            toast.error('Guardian name is required')
            return false
          }
          if (!formData.guardianInfo.relation) {
            toast.error('Guardian relation is required')
            return false
          }
          if (!formData.guardianInfo.phone) {
            toast.error('Guardian phone is required')
            return false
          }
          if (!formData.guardianInfo.email) {
            toast.error('Guardian email is required for parent account')
            return false
          }
        } else {
          // At least one parent must have details
          if (!formData.fatherInfo.isDeceased && formData.motherInfo.isDeceased) {
            if (!formData.fatherInfo.name) {
              toast.error('Father name is required')
              return false
            }
            if (!formData.fatherInfo.phone) {
              toast.error('Father phone is required')
              return false
            }
          }
          if (!formData.motherInfo.isDeceased && formData.fatherInfo.isDeceased) {
            if (!formData.motherInfo.name) {
              toast.error('Mother name is required')
              return false
            }
            if (!formData.motherInfo.phone) {
              toast.error('Mother phone is required')
              return false
            }
          }
          // Primary contact email is required
          if (formData.primaryContact === 'father' && !formData.fatherInfo.email) {
            toast.error('Father email is required (selected as primary contact)')
            return false
          }
          if (formData.primaryContact === 'mother' && !formData.motherInfo.email) {
            toast.error('Mother email is required (selected as primary contact)')
            return false
          }
          if (formData.primaryContact === 'guardian' && !formData.guardianInfo.email) {
            toast.error('Guardian email is required (selected as primary contact)')
            return false
          }
        }
        return true
      case 4:
        if (!formData.address.city || !formData.address.state) {
          toast.error('Please enter city and state')
          return false
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return

    setLoading(true)
    try {
      const response = await admissionsApi.submitApplication(formData)
      if (response.success) {
        setApplicationNumber(response.data.applicationNumber)
        setSubmitted(true)
        toast.success('Application submitted successfully!')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Your admission application has been submitted successfully.
          </p>
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Application Number</p>
            <p className="text-2xl font-bold text-indigo-600">{applicationNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Please save this application number for future reference. 
            You will be notified about the status of your application.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Meridian EMS</span>
          </Link>
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Login
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admission Application</h1>
          <p className="text-gray-600">Fill out the form below to apply for admission</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isActive ? 'bg-indigo-600 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1 hidden sm:block ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`h-1 w-full mx-2 rounded ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          {/* Step 1: Institution Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Institution & Class</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                <select
                  value={formData.institutionId}
                  onChange={(e) => {
                    updateFormData(null, 'institutionId', e.target.value)
                    updateFormData(null, 'applyingForClass', '')
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select an institution</option>
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applying for Class *</label>
                <select
                  value={formData.applyingForClass}
                  onChange={(e) => updateFormData(null, 'applyingForClass', e.target.value)}
                  disabled={!formData.institutionId}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Select a class</option>
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
                  placeholder="e.g., 2024-25"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Student Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.studentInfo.firstName}
                    onChange={(e) => updateFormData('studentInfo', 'firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.studentInfo.lastName}
                    onChange={(e) => updateFormData('studentInfo', 'lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.studentInfo.dateOfBirth}
                    onChange={(e) => updateFormData('studentInfo', 'dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    value={formData.studentInfo.gender}
                    onChange={(e) => updateFormData('studentInfo', 'gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.studentInfo.category}
                    onChange={(e) => updateFormData('studentInfo', 'category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="general">General</option>
                    <option value="obc">OBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                    <option value="ews">EWS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                  <input
                    type="text"
                    value={formData.studentInfo.religion}
                    onChange={(e) => updateFormData('studentInfo', 'religion', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother Tongue</label>
                  <input
                    type="text"
                    value={formData.studentInfo.motherTongue}
                    onChange={(e) => updateFormData('studentInfo', 'motherTongue', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Student Email for Account Creation */}
              <div className="bg-indigo-50 p-4 rounded-lg mt-4">
                <h4 className="font-medium text-indigo-900 mb-2">Student Account Email</h4>
                <p className="text-sm text-indigo-700 mb-3">This email will be used to create the student's Meridian account</p>
                <input
                  type="email"
                  value={formData.studentInfo.email}
                  onChange={(e) => updateFormData('studentInfo', 'email', e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Parent Info */}
          {currentStep === 3 && (() => {
            const bothParentsDeceased = formData.fatherInfo.isDeceased && formData.motherInfo.isDeceased
            return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Parent/Guardian Information</h2>
              <p className="text-sm text-gray-500">At least one parent's email is required for parent account creation. If both parents are deceased, guardian details are required.</p>
              
              {/* Father's Info */}
              <div className={`p-4 rounded-lg ${formData.fatherInfo.isDeceased ? 'bg-gray-100' : 'bg-blue-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Father's Details</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name {formData.motherInfo.isDeceased ? '*' : ''}</label>
                      <input
                        type="text"
                        value={formData.fatherInfo.name}
                        onChange={(e) => updateFormData('fatherInfo', 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone {formData.motherInfo.isDeceased ? '*' : ''}</label>
                      <input
                        type="tel"
                        value={formData.fatherInfo.phone}
                        onChange={(e) => updateFormData('fatherInfo', 'phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                        placeholder="For parent account creation"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <input
                        type="text"
                        value={formData.fatherInfo.occupation}
                        onChange={(e) => updateFormData('fatherInfo', 'occupation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mother's Info */}
              <div className={`p-4 rounded-lg ${formData.motherInfo.isDeceased ? 'bg-gray-100' : 'bg-pink-50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Mother's Details</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name {formData.fatherInfo.isDeceased ? '*' : ''}</label>
                      <input
                        type="text"
                        value={formData.motherInfo.name}
                        onChange={(e) => updateFormData('motherInfo', 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone {formData.fatherInfo.isDeceased ? '*' : ''}</label>
                      <input
                        type="tel"
                        value={formData.motherInfo.phone}
                        onChange={(e) => updateFormData('motherInfo', 'phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                        placeholder="For parent account creation"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                      <input
                        type="text"
                        value={formData.motherInfo.occupation}
                        onChange={(e) => updateFormData('motherInfo', 'occupation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Guardian Info */}
              <div className={`p-4 rounded-lg ${bothParentsDeceased ? 'bg-amber-50 border-2 border-amber-300' : 'bg-gray-50'}`}>
                <h3 className="font-medium text-gray-900 mb-4">
                  Guardian's Details {bothParentsDeceased && <span className="text-red-600">* (Required)</span>}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name {bothParentsDeceased ? '*' : ''}</label>
                    <input
                      type="text"
                      value={formData.guardianInfo.name}
                      onChange={(e) => updateFormData('guardianInfo', 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relation {bothParentsDeceased ? '*' : ''}</label>
                    <select
                      value={formData.guardianInfo.relation}
                      onChange={(e) => updateFormData('guardianInfo', 'relation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
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
                      placeholder="For parent account creation"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Contact Selection */}
              {!bothParentsDeceased && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">Primary Contact for Parent Account</h4>
                  <p className="text-sm text-green-700 mb-3">Select whose email will be used to create the parent account</p>
                  <div className="flex flex-wrap gap-4">
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
          })()}

          {/* Step 4: Address */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Address Details</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <textarea
                    value={formData.address.street}
                    onChange={(e) => updateFormData('address', 'street', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => updateFormData('address', 'city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => updateFormData('address', 'state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => updateFormData('address', 'zipCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => updateFormData('address', 'country', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Previous School */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Previous School Details</h2>
              <p className="text-sm text-gray-500 mb-4">Fill this section if the student has attended school before</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input
                    type="text"
                    value={formData.previousSchool.name}
                    onChange={(e) => updateFormData('previousSchool', 'name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Board</label>
                  <select
                    value={formData.previousSchool.board}
                    onChange={(e) => updateFormData('previousSchool', 'board', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/Grade</label>
                  <input
                    type="text"
                    value={formData.previousSchool.percentage}
                    onChange={(e) => updateFormData('previousSchool', 'percentage', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing</label>
                  <input
                    type="text"
                    value={formData.previousSchool.yearOfPassing}
                    onChange={(e) => updateFormData('previousSchool', 'yearOfPassing', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Need help? Contact us at <a href="mailto:admissions@meridian.edu" className="text-indigo-600">admissions@meridian.edu</a></p>
        </div>
      </div>
    </div>
  )
}
