import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  ArrowLeft, Edit, BookOpen, Calendar, Clock, Users,
  CheckCircle, XCircle, AlertCircle, FileText, Award,
  User, MessageSquare, Save, Send, Upload, Eye
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { TableSkeleton } from '../../../components/ui/Loading'
import { homeworkApi, institutionsApi } from '../../../services/api'

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  late: { label: 'Late', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
  graded: { label: 'Graded', color: 'bg-green-100 text-green-700', icon: Award },
  returned: { label: 'Returned', color: 'bg-purple-100 text-purple-700', icon: FileText }
}

export default function HomeworkDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [loading, setLoading] = useState(true)
  const [homework, setHomework] = useState(null)
  const [gradingStudent, setGradingStudent] = useState(null)
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' })
  const [saving, setSaving] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submissionText, setSubmissionText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [viewingSubmission, setViewingSubmission] = useState(null)
  
  const isStudent = user?.role === 'student'
  const canManage = ['super_admin', 'admin', 'institution_admin', 'coordinator', 'teacher'].includes(user?.role)

  useEffect(() => {
    const fetchInstitution = async () => {
      if (!institutionId && isPlatformAdmin && isPlatformAdmin()) {
        try {
          const response = await institutionsApi.getAll({ limit: 1 })
          if (response.data?.length > 0) {
            setInstitutionId(response.data[0]._id)
          }
        } catch (error) {
          console.error('Failed to fetch institution:', error)
        }
      }
    }
    fetchInstitution()
  }, [institutionId, isPlatformAdmin])

  useEffect(() => {
    // Fetch homework if we have an id (institutionId is optional for some roles)
    if (id) {
      fetchHomework()
    }
  }, [institutionId, id])

  // Auto-open submit modal if submit=true query param is present
  useEffect(() => {
    if (homework && isStudent && searchParams.get('submit') === 'true') {
      setShowSubmitModal(true)
    }
  }, [homework, isStudent, searchParams])

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const params = institutionId ? { institution: institutionId } : {}
      const response = await homeworkApi.getById(id, params)
      setHomework(response.data)
    } catch (error) {
      console.error('Failed to fetch homework:', error)
      toast.error('Failed to load homework')
      navigate('/dashboard/homework/assignments')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleGrade = (submission) => {
    setGradingStudent(submission.student._id)
    setGradeData({
      score: submission.grade?.score || '',
      feedback: submission.feedback || ''
    })
  }

  const submitGrade = async () => {
    if (!gradeData.score) {
      toast.error('Please enter a score')
      return
    }

    if (parseFloat(gradeData.score) > homework.maxScore) {
      toast.error(`Score cannot exceed ${homework.maxScore}`)
      return
    }

    try {
      setSaving(true)
      await homeworkApi.grade(id, gradingStudent, {
        ...gradeData,
        institution: institutionId
      })
      toast.success('Submission graded successfully')
      setGradingStudent(null)
      setGradeData({ score: '', feedback: '' })
      fetchHomework()
    } catch (error) {
      console.error('Failed to grade:', error)
      toast.error(error.message || 'Failed to grade submission')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!homework) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Homework not found</p>
      </div>
    )
  }

  const isOverdue = new Date() > new Date(homework.dueDate)
  const submissionCount = homework.submissions?.length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/homework/assignments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{homework.title}</h1>
            <p className="text-gray-500 mt-1">
              {homework.class?.name} {homework.section?.name ? `- ${homework.section.name}` : ''} • {homework.subject?.name}
            </p>
          </div>
        </div>
        {canManage ? (
          <button
            onClick={() => navigate(`/dashboard/homework/${id}/edit`)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
        ) : isStudent && homework?.status === 'published' && (
          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit Assignment
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Due Date</p>
              <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(homework.dueDate)}
              </p>
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
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Submissions</p>
              <p className="text-sm font-semibold text-gray-900">{submissionCount}</p>
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Max Score</p>
              <p className="text-sm font-semibold text-gray-900">{homework.maxScore} points</p>
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
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">{homework.status}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Instructions</h2>
        </div>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="whitespace-pre-wrap">{homework.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          <p>Assigned by: {homework.assignedBy?.profile?.firstName} {homework.assignedBy?.profile?.lastName}</p>
          <p>Created: {formatDate(homework.createdAt)}</p>
        </div>
      </motion.div>

      {/* Submissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Submissions ({submissionCount})</h2>
          </div>
        </div>

        {submissionCount === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">No Submissions Yet</p>
            <p className="text-sm mt-1">Students haven't submitted their work yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted At</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {homework.submissions.map((submission) => {
                  const statusConfig = STATUS_CONFIG[submission.status] || STATUS_CONFIG.submitted
                  const StatusIcon = statusConfig.icon
                  const isGrading = gradingStudent === submission.student._id

                  return (
                    <tr key={submission._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                            {submission.student?.profile?.firstName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {submission.student?.profile?.firstName} {submission.student?.profile?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {submission.student?.studentData?.rollNumber 
                                ? `Roll: ${submission.student.studentData.rollNumber}` 
                                : submission.student?.studentData?.admissionNumber 
                                  ? `Adm: ${submission.student.studentData.admissionNumber}`
                                  : submission.student?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{formatDate(submission.submittedAt)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {submission.grade ? (
                          <span className="text-sm font-medium text-gray-900">
                            {submission.grade.score}/{submission.grade.maxScore}
                            <span className="text-xs text-gray-500 ml-1">
                              ({submission.grade.percentage?.toFixed(1)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Not graded</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isGrading ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={gradeData.score}
                              onChange={(e) => setGradeData(prev => ({ ...prev, score: e.target.value }))}
                              placeholder="Score"
                              min="0"
                              max={homework.maxScore}
                              className="w-20 px-2 py-1 text-sm border border-gray-200 rounded"
                            />
                            <input
                              type="text"
                              value={gradeData.feedback}
                              onChange={(e) => setGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                              placeholder="Feedback"
                              className="w-32 px-2 py-1 text-sm border border-gray-200 rounded"
                            />
                            <button
                              onClick={submitGrade}
                              disabled={saving}
                              className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setGradingStudent(null)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setViewingSubmission(submission)}
                              className="p-1.5 text-blue-600 bg-blue-100 rounded hover:bg-blue-200 transition"
                              title="View Submission"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {canManage && (
                              <button
                                onClick={() => handleGrade(submission)}
                                className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition"
                              >
                                {submission.grade ? 'Edit Grade' : 'Grade'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Submit Assignment Modal for Students */}
      {showSubmitModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Submit Assignment</h2>
              <button onClick={() => setShowSubmitModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Assignment:</strong> {homework?.title}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Due Date:</strong> {homework?.dueDate && formatDate(homework.dueDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Submission</label>
                <textarea
                  rows={5}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter your answer or paste a link to your work..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-600">
                  Note: Once submitted, you cannot edit your submission. Make sure your answer is complete.
                </p>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!submissionText.trim()) {
                    toast.error('Please enter your submission')
                    return
                  }
                  try {
                    setSubmitting(true)
                    await homeworkApi.submit(id, { content: submissionText, institution: institutionId })
                    toast.success('Assignment submitted successfully!')
                    setShowSubmitModal(false)
                    setSubmissionText('')
                    fetchHomework()
                  } catch (error) {
                    toast.error(error.message || 'Failed to submit assignment')
                  } finally {
                    setSubmitting(false)
                  }
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* View Submission Modal */}
      {viewingSubmission && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Submission Details</h2>
              <button onClick={() => setViewingSubmission(null)} className="p-1 hover:bg-gray-100 rounded">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
              {/* Student Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-semibold">
                  {viewingSubmission.student?.profile?.firstName?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {viewingSubmission.student?.profile?.firstName} {viewingSubmission.student?.profile?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {viewingSubmission.student?.studentData?.rollNumber 
                      ? `Roll: ${viewingSubmission.student.studentData.rollNumber}` 
                      : viewingSubmission.student?.studentData?.admissionNumber 
                        ? `Adm: ${viewingSubmission.student.studentData.admissionNumber}`
                        : viewingSubmission.student?.email || ''} • 
                    Submitted: {formatDate(viewingSubmission.submittedAt)}
                  </p>
                </div>
              </div>

              {/* Submission Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submission Content</label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[150px]">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {viewingSubmission.content || viewingSubmission.answer || 'No content submitted'}
                  </p>
                </div>
              </div>

              {/* Attachments if any */}
              {viewingSubmission.attachments?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="space-y-2">
                    {viewingSubmission.attachments.map((attachment, idx) => (
                      <a
                        key={idx}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{attachment.name || `Attachment ${idx + 1}`}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Grade Info */}
              {viewingSubmission.grade && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-700">Grade</span>
                    <span className="text-lg font-bold text-green-700">
                      {viewingSubmission.grade.score}/{viewingSubmission.grade.maxScore || homework?.maxScore}
                      <span className="text-sm ml-1">
                        ({((viewingSubmission.grade.score / (viewingSubmission.grade.maxScore || homework?.maxScore)) * 100).toFixed(1)}%)
                      </span>
                    </span>
                  </div>
                  {viewingSubmission.feedback && (
                    <p className="text-sm text-green-600 mt-2">
                      <strong>Feedback:</strong> {viewingSubmission.feedback}
                    </p>
                  )}
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[viewingSubmission.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_CONFIG[viewingSubmission.status]?.label || viewingSubmission.status}
                </span>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={() => setViewingSubmission(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              {canManage && (
                <button
                  onClick={() => {
                    handleGrade(viewingSubmission)
                    setViewingSubmission(null)
                  }}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {viewingSubmission.grade ? 'Edit Grade' : 'Grade Submission'}
                </button>
              )}
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  )
}
