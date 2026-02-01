import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  ArrowLeft, Edit, BookOpen, Calendar, Clock, Users,
  CheckCircle, XCircle, AlertCircle, FileText, Award,
  User, MessageSquare, Save
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
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [loading, setLoading] = useState(true)
  const [homework, setHomework] = useState(null)
  const [gradingStudent, setGradingStudent] = useState(null)
  const [gradeData, setGradeData] = useState({ score: '', feedback: '' })
  const [saving, setSaving] = useState(false)

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
    if (institutionId && id) {
      fetchHomework()
    }
  }, [institutionId, id])

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const response = await homeworkApi.getById(id, { institution: institutionId })
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
        <button
          onClick={() => navigate(`/dashboard/homework/${id}/edit`)}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
        >
          <Edit className="w-4 h-4" /> Edit
        </button>
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
                              Roll: {submission.student?.studentData?.rollNumber || '-'}
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
                          <button
                            onClick={() => handleGrade(submission)}
                            className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition"
                          >
                            {submission.grade ? 'Edit Grade' : 'Grade'}
                          </button>
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
    </div>
  )
}
