import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  ArrowLeft, User, Users, MapPin, GraduationCap, FileText,
  CheckCircle, XCircle, Clock, UserPlus, Calendar, Phone, Mail,
  Edit, Trash2, Download, AlertCircle
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { admissionsApi } from '../../../services/api'

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileText },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  document_pending: { label: 'Documents Pending', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: FileText },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  enrolled: { label: 'Enrolled', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: UserPlus },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: XCircle }
}

export default function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState({ status: '', remarks: '' })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchApplication()
  }, [id])

  const fetchApplication = async () => {
    try {
      setLoading(true)
      const response = await admissionsApi.getApplicationById(id)
      if (response.success) {
        setApplication(response.data)
      }
    } catch (error) {
      toast.error('Failed to load application')
      navigate('/dashboard/admissions/applications')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!statusAction.status) return
    setUpdating(true)
    try {
      const response = await admissionsApi.updateApplicationStatus(id, statusAction)
      if (response.success) {
        toast.success(`Application ${statusAction.status.replace('_', ' ')}`)
        setShowStatusModal(false)
        setStatusAction({ status: '', remarks: '' })
        fetchApplication()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const openStatusModal = (status) => {
    setStatusAction({ status, remarks: '' })
    setShowStatusModal(true)
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    })
  }

  const calculateAge = (dob) => {
    if (!dob) return '-'
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
    return `${age} years`
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

  const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.submitted
  const StatusIcon = statusConfig.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard/admissions/applications')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-lg font-medium text-indigo-600">{application.applicationNumber}</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusConfig.label}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {application.status === 'submitted' && (
            <button
              onClick={() => openStatusModal('under_review')}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              Start Review
            </button>
          )}
          {application.status === 'under_review' && (
            <>
              <button
                onClick={() => openStatusModal('approved')}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </button>
              <button
                onClick={() => openStatusModal('rejected')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </button>
            </>
          )}
          {application.status === 'approved' && (
            <button
              onClick={() => navigate(`/dashboard/admissions/enroll/${id}`)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Enroll Student
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Student Information</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{application.studentInfo?.firstName} {application.studentInfo?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{formatDate(application.studentInfo?.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{calculateAge(application.studentInfo?.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{application.studentInfo?.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{application.studentInfo?.bloodGroup || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium uppercase">{application.studentInfo?.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Religion</p>
                <p className="font-medium">{application.studentInfo?.religion || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mother Tongue</p>
                <p className="font-medium">{application.studentInfo?.motherTongue || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="font-medium">{application.studentInfo?.nationality}</p>
              </div>
              {application.studentInfo?.email && (
                <div>
                  <p className="text-sm text-gray-500">Student Email</p>
                  <p className="font-medium">{application.studentInfo.email}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Parent Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Parent Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Father */}
              <div className={`p-4 rounded-lg ${application.fatherInfo?.isDeceased ? 'bg-gray-100' : 'bg-blue-50'}`}>
                <h3 className="font-medium text-blue-900 mb-3">
                  Father's Details
                  {application.fatherInfo?.isDeceased && <span className="text-gray-500 text-sm ml-2">(Deceased)</span>}
                </h3>
                {!application.fatherInfo?.isDeceased && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">{application.fatherInfo?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{application.fatherInfo?.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{application.fatherInfo?.email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupation</span>
                      <span className="font-medium">{application.fatherInfo?.occupation || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Qualification</span>
                      <span className="font-medium">{application.fatherInfo?.qualification || '-'}</span>
                    </div>
                    {application.fatherInfo?.annualIncome && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual Income</span>
                        <span className="font-medium">₹{application.fatherInfo.annualIncome.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mother */}
              <div className={`p-4 rounded-lg ${application.motherInfo?.isDeceased ? 'bg-gray-100' : 'bg-pink-50'}`}>
                <h3 className="font-medium text-pink-900 mb-3">
                  Mother's Details
                  {application.motherInfo?.isDeceased && <span className="text-gray-500 text-sm ml-2">(Deceased)</span>}
                </h3>
                {!application.motherInfo?.isDeceased && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">{application.motherInfo?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone</span>
                      <span className="font-medium">{application.motherInfo?.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium">{application.motherInfo?.email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occupation</span>
                      <span className="font-medium">{application.motherInfo?.occupation || '-'}</span>
                    </div>
                    {application.motherInfo?.qualification && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Qualification</span>
                        <span className="font-medium">{application.motherInfo.qualification}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Guardian - Show if exists or if both parents deceased */}
            {(application.guardianInfo?.name || (application.fatherInfo?.isDeceased && application.motherInfo?.isDeceased)) && (
              <div className="bg-amber-50 p-4 rounded-lg mt-4">
                <h3 className="font-medium text-amber-900 mb-3">Guardian's Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium">{application.guardianInfo?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Relation</span>
                    <span className="font-medium capitalize">{application.guardianInfo?.relation || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-medium">{application.guardianInfo?.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium">{application.guardianInfo?.email || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Contact Indicator */}
            {application.primaryContact && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm">
                <span className="text-green-700">
                  <strong>Primary Contact:</strong> {application.primaryContact.charAt(0).toUpperCase() + application.primaryContact.slice(1)}
                </span>
              </div>
            )}
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Address</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-3">
                <p className="text-sm text-gray-500">Street Address</p>
                <p className="font-medium">{application.address?.street}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p className="font-medium">{application.address?.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">State</p>
                <p className="font-medium">{application.address?.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ZIP Code</p>
                <p className="font-medium">{application.address?.zipCode}</p>
              </div>
            </div>
          </motion.div>

          {/* Previous School */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <GraduationCap className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Previous School</h2>
            </div>
            {application.previousSchool?.name ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">School Name</p>
                  <p className="font-medium">{application.previousSchool?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Board</p>
                  <p className="font-medium">{application.previousSchool?.board || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Class</p>
                  <p className="font-medium">{application.previousSchool?.class || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Percentage</p>
                  <p className="font-medium">{application.previousSchool?.percentage ? `${application.previousSchool.percentage}%` : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Year of Passing</p>
                  <p className="font-medium">{application.previousSchool?.yearOfPassing || '-'}</p>
                </div>
                {application.previousSchool?.reasonForLeaving && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Reason for Leaving</p>
                    <p className="font-medium">{application.previousSchool.reasonForLeaving}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No previous school information provided (Fresh admission)</p>
            )}
          </motion.div>

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            </div>
            {application.documents && application.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-sm">{doc.name || doc.type?.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500 capitalize">{doc.type?.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.verified && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Verified</span>
                      )}
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" 
                           className="text-indigo-600 hover:text-indigo-800">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No documents uploaded yet</p>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Application No.</span>
                <span className="font-medium text-indigo-600">{application.applicationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Academic Year</span>
                <span className="font-medium">{application.academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Applying For</span>
                <span className="font-medium">{application.applyingForClass?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Submitted On</span>
                <span className="font-medium">{formatDate(application.createdAt)}</span>
              </div>
              {application.reviewedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reviewed By</span>
                  <span className="font-medium">
                    {application.reviewedBy?.profile?.firstName} {application.reviewedBy?.profile?.lastName}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Status History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status History</h2>
            <div className="space-y-4">
              {application.statusHistory?.map((history, index) => {
                const config = STATUS_CONFIG[history.status] || STATUS_CONFIG.submitted
                const HistoryIcon = config.icon
                return (
                  <div key={index} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                      <HistoryIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 capitalize">
                        {history.status.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(history.changedAt)}</p>
                      {history.remarks && (
                        <p className="text-sm text-gray-600 mt-1">{history.remarks}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Review Remarks */}
          {application.reviewRemarks && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Remarks</h2>
              <p className="text-gray-700">{application.reviewRemarks}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {statusAction.status === 'approved' ? 'Approve Application' :
               statusAction.status === 'rejected' ? 'Reject Application' :
               statusAction.status === 'under_review' ? 'Start Review' : 'Update Status'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarks {statusAction.status === 'rejected' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={statusAction.remarks}
                onChange={(e) => setStatusAction(prev => ({ ...prev, remarks: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Add remarks..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={updating || (statusAction.status === 'rejected' && !statusAction.remarks)}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 flex items-center
                  ${statusAction.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                    statusAction.status === 'rejected' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {updating && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
