import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  ArrowLeft, Save, BookOpen, Calendar, FileText,
  GraduationCap, Clock, Upload, X, Wand2, Loader2,
  RefreshCw, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { homeworkApi, classesApi, subjectsApi, institutionsApi, aiApi } from '../../../services/api'

export default function HomeworkForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selectedClassData, setSelectedClassData] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiConfig, setAiConfig] = useState({
    topic: '',
    questionCount: 5,
    difficulty: 'medium',
    includeAnswers: false,
    assignmentType: 'practice'
  })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    section: '',
    dueDate: '',
    maxScore: 100,
    status: 'published',
    allowLateSubmission: true,
    latePenaltyPercent: 0,
    attachments: []
  })

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
    if (institutionId) {
      fetchClasses()
      fetchSubjects()
      if (isEditing) {
        fetchHomework()
      }
    }
  }, [institutionId, id])

  useEffect(() => {
    if (formData.class && classes.length > 0) {
      const classData = classes.find(c => c._id === formData.class)
      setSelectedClassData(classData)
    } else {
      setSelectedClassData(null)
    }
  }, [formData.class, classes])

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getAll({ institution: institutionId })
      setClasses(response.data || [])
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchSubjects = async () => {
    try {
      const response = await subjectsApi.getAll({ institution: institutionId })
      setSubjects(response.data || [])
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  const fetchHomework = async () => {
    try {
      setLoading(true)
      const response = await homeworkApi.getById(id, { institution: institutionId })
      const hw = response.data
      setFormData({
        title: hw.title || '',
        description: hw.description || '',
        subject: hw.subject?._id || '',
        class: hw.class?._id || '',
        section: hw.section?._id || '',
        dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString().split('T')[0] : '',
        maxScore: hw.maxScore || 100,
        status: hw.status || 'published',
        allowLateSubmission: hw.allowLateSubmission ?? true,
        latePenaltyPercent: hw.latePenaltyPercent || 0,
        attachments: hw.attachments || []
      })
    } catch (error) {
      console.error('Failed to fetch homework:', error)
      toast.error('Failed to load homework')
      navigate('/dashboard/homework/assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const generateWithAI = async () => {
    const selectedSubject = subjects.find(s => s._id === formData.subject)
    const selectedClass = classes.find(c => c._id === formData.class)
    
    if (!selectedSubject) {
      toast.error('Please select a subject first')
      return
    }

    setGenerating(true)
    try {
      const prompt = `Generate a homework assignment for students with the following details:

Subject: ${selectedSubject.name}
Class/Grade: ${selectedClass?.name || 'Not specified'}
Topic: ${aiConfig.topic || 'General ' + selectedSubject.name}
Assignment Type: ${aiConfig.assignmentType}
Number of Questions: ${aiConfig.questionCount}
Difficulty: ${aiConfig.difficulty}
${aiConfig.includeAnswers ? 'Include answer key at the end.' : ''}

Please generate:
1. A clear assignment title
2. Detailed instructions/description
3. ${aiConfig.questionCount} well-structured questions appropriate for the difficulty level

Format the response as:
TITLE: [assignment title]
DESCRIPTION: [detailed instructions and questions formatted nicely with numbering]

Make the questions educational, engaging, and appropriate for the grade level.`

      const response = await aiApi.quickAsk(prompt)
      const content = response.data?.response || response.data?.content || ''
      
      // Parse the response
      const titleMatch = content.match(/TITLE:\s*(.+?)(?=\n|DESCRIPTION:)/is)
      const descMatch = content.match(/DESCRIPTION:\s*([\s\S]+)/i)
      
      const generatedTitle = titleMatch ? titleMatch[1].trim() : `${selectedSubject.name} - ${aiConfig.topic || 'Assignment'}`
      const generatedDesc = descMatch ? descMatch[1].trim() : content

      setFormData(prev => ({
        ...prev,
        title: generatedTitle,
        description: generatedDesc
      }))

      toast.success('Assignment generated! You can edit the content as needed.')
      setShowAIPanel(false)
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate. Please try again or write manually.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.subject || !formData.class || !formData.dueDate) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...formData,
        institution: institutionId,
        section: formData.section || undefined
      }

      if (isEditing) {
        await homeworkApi.update(id, payload)
        toast.success('Homework updated successfully')
      } else {
        await homeworkApi.create(payload)
        toast.success('Homework created successfully')
      }
      navigate('/dashboard/homework/assignments')
    } catch (error) {
      console.error('Failed to save homework:', error)
      toast.error(error.message || 'Failed to save homework')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/homework/assignments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Assignment' : 'Create Assignment'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditing ? 'Update homework assignment details' : 'Create a new homework assignment for students'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Assignment Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Chapter 5 Exercises"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="flex items-center gap-1.5 px-3 py-1 text-sm bg-gradient-to-r from-purple-500 to-primary-600 text-white rounded-lg hover:from-purple-600 hover:to-primary-700 transition"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Generate with AI
                </button>
              </div>

              {/* AI Generation Panel */}
              <AnimatePresence>
                {showAIPanel && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 p-4 bg-gradient-to-br from-purple-50 to-primary-50 border border-purple-200 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-purple-900">AI Assignment Generator</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Topic/Chapter</label>
                        <input
                          type="text"
                          value={aiConfig.topic}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, topic: e.target.value }))}
                          placeholder="e.g., Quadratic Equations"
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Questions</label>
                        <input
                          type="number"
                          value={aiConfig.questionCount}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 5 }))}
                          min="1"
                          max="20"
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                        <select
                          value={aiConfig.difficulty}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={aiConfig.includeAnswers}
                            onChange={(e) => setAiConfig(prev => ({ ...prev, includeAnswers: e.target.checked }))}
                            className="w-4 h-4 rounded text-purple-600"
                          />
                          <span className="text-gray-600">Include answer key</span>
                        </label>
                        <select
                          value={aiConfig.assignmentType}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, assignmentType: e.target.value }))}
                          className="px-2 py-1 text-sm border border-gray-200 rounded-lg"
                        >
                          <option value="practice">Practice</option>
                          <option value="homework">Homework</option>
                          <option value="project">Project</option>
                          <option value="worksheet">Worksheet</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={generateWithAI}
                        disabled={generating || !formData.subject}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            Generate
                          </>
                        )}
                      </button>
                    </div>
                    
                    {!formData.subject && (
                      <p className="mt-2 text-xs text-amber-600">⚠️ Please select a subject first</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed instructions for the assignment... or use AI to generate!"
                rows={8}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>

            {selectedClassData?.sections?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section (Optional)
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Sections</option>
                  {selectedClassData.sections.map(sec => (
                    <option key={sec._id} value={sec._id}>{sec.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grading & Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Grading & Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Score
              </label>
              <input
                type="number"
                name="maxScore"
                value={formData.maxScore}
                onChange={handleChange}
                min="1"
                max="1000"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Late Penalty (%)
              </label>
              <input
                type="number"
                name="latePenaltyPercent"
                value={formData.latePenaltyPercent}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="md:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowLateSubmission"
                  checked={formData.allowLateSubmission}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Allow late submissions</span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/homework/assignments')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update Assignment' : 'Create Assignment'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
