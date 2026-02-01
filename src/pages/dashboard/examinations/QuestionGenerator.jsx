import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, Plus, Trash2, Wand2, RefreshCw, Save,
  Download, Printer, ChevronDown, ChevronUp, Edit3, Eye,
  Loader2, FileQuestion, BookOpen, CheckCircle, AlertCircle,
  X, Settings, List
} from 'lucide-react'
import { toast } from 'react-toastify'
import { questionPaperApi, subjectsApi, classesApi } from '../../../services/api'

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)', icon: '🔘' },
  { value: 'short_answer', label: 'Short Answer', icon: '📝' },
  { value: 'long_answer', label: 'Long Answer / Essay', icon: '📄' },
  { value: 'fill_blank', label: 'Fill in the Blanks', icon: '⬜' },
  { value: 'true_false', label: 'True / False', icon: '✓✗' },
  { value: 'match', label: 'Match the Following', icon: '🔗' }
]

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'text-green-600 bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'hard', label: 'Hard', color: 'text-red-600 bg-red-100' },
  { value: 'mixed', label: 'Mixed', color: 'text-purple-600 bg-purple-100' }
]

const EXAM_TYPES = [
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final', label: 'Final Exam' },
  { value: 'practice', label: 'Practice Test' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' }
]

export default function QuestionGenerator() {
  const [step, setStep] = useState(1) // 1: Config, 2: Generating, 3: Preview/Edit
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [generatedPaper, setGeneratedPaper] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [savedPapers, setSavedPapers] = useState([])
  const [showSavedPapers, setShowSavedPapers] = useState(false)
  const fileInputRef = useRef(null)

  const [config, setConfig] = useState({
    subject: '',
    subjectId: '',
    classId: '',
    className: '',
    topic: '',
    examType: 'practice',
    duration: 60,
    difficulty: 'mixed',
    questionTypes: [
      { type: 'mcq', count: 5, marksEach: 1 }
    ],
    referencePdf: null,
    referenceText: ''
  })

  useEffect(() => {
    fetchSubjectsAndClasses()
    fetchSavedPapers()
  }, [])

  const fetchSubjectsAndClasses = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        subjectsApi.getAll(),
        classesApi.getAll()
      ])
      setSubjects(subjectsRes.data || [])
      setClasses(classesRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const fetchSavedPapers = async () => {
    try {
      const res = await questionPaperApi.getAll({ limit: 10 })
      setSavedPapers(res.data || [])
    } catch (error) {
      console.error('Failed to fetch saved papers:', error)
    }
  }

  const handleSubjectChange = (e) => {
    const subjectId = e.target.value
    const subject = subjects.find(s => s._id === subjectId)
    setConfig(prev => ({
      ...prev,
      subjectId,
      subject: subject?.name || ''
    }))
  }

  const handleClassChange = (e) => {
    const classId = e.target.value
    const cls = classes.find(c => c._id === classId)
    setConfig(prev => ({
      ...prev,
      classId,
      className: cls?.name || ''
    }))
  }

  const addQuestionType = () => {
    setConfig(prev => ({
      ...prev,
      questionTypes: [...prev.questionTypes, { type: 'short_answer', count: 3, marksEach: 2 }]
    }))
  }

  const removeQuestionType = (index) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.filter((_, i) => i !== index)
    }))
  }

  const updateQuestionType = (index, field, value) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.map((qt, i) => 
        i === index ? { ...qt, [field]: value } : qt
      )
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file')
      return
    }

    setConfig(prev => ({ ...prev, referencePdf: file }))
    toast.success(`PDF uploaded: ${file.name}`)
  }

  const calculateTotalMarks = () => {
    return config.questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marksEach), 0)
  }

  const calculateTotalQuestions = () => {
    return config.questionTypes.reduce((sum, qt) => sum + qt.count, 0)
  }

  const handleGenerate = async () => {
    if (!config.subject) {
      toast.error('Please select a subject')
      return
    }
    if (config.questionTypes.length === 0) {
      toast.error('Please add at least one question type')
      return
    }

    setStep(2)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('subject', config.subject)
      formData.append('subjectId', config.subjectId)
      formData.append('classId', config.classId)
      formData.append('className', config.className)
      formData.append('topic', config.topic)
      formData.append('examType', config.examType)
      formData.append('duration', config.duration)
      formData.append('difficulty', config.difficulty)
      formData.append('totalMarks', calculateTotalMarks())
      formData.append('questionTypes', JSON.stringify(config.questionTypes))
      
      if (config.referencePdf) {
        formData.append('referencePdf', config.referencePdf)
      }

      const res = await questionPaperApi.generate(formData)
      setGeneratedPaper(res.data)
      setStep(3)
      toast.success('Question paper generated successfully!')
      fetchSavedPapers()
    } catch (error) {
      toast.error(error.message || 'Failed to generate question paper')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!generatedPaper?._id) return

    setLoading(true)
    try {
      const res = await questionPaperApi.regenerate(generatedPaper._id)
      setGeneratedPaper(res.data)
      toast.success('Question paper regenerated!')
      fetchSavedPapers()
    } catch (error) {
      toast.error('Failed to regenerate')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!generatedPaper?._id) return

    setLoading(true)
    try {
      await questionPaperApi.update(generatedPaper._id, {
        sections: generatedPaper.sections,
        instructions: generatedPaper.instructions,
        status: 'draft'
      })
      toast.success('Question paper saved!')
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    setGeneratedPaper(prev => {
      const newSections = [...prev.sections]
      newSections[sectionIndex].questions[questionIndex][field] = value
      return { ...prev, sections: newSections }
    })
  }

  const loadSavedPaper = async (paperId) => {
    try {
      const res = await questionPaperApi.getById(paperId)
      setGeneratedPaper(res.data)
      setStep(3)
      setShowSavedPapers(false)
    } catch (error) {
      toast.error('Failed to load paper')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wand2 className="w-7 h-7 text-primary-600" />
            AI Question Paper Generator
          </h1>
          <p className="text-gray-500 mt-1">Generate question papers using AI with customizable options</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSavedPapers(!showSavedPapers)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <List className="w-4 h-4" />
            Saved Papers ({savedPapers.length})
          </button>
          {step === 3 && (
            <button
              onClick={() => { setStep(1); setGeneratedPaper(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-4 h-4" />
              New Paper
            </button>
          )}
        </div>
      </div>

      {/* Saved Papers Dropdown */}
      <AnimatePresence>
        {showSavedPapers && savedPapers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Recently Generated Papers</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {savedPapers.map(paper => (
                <div
                  key={paper._id}
                  onClick={() => loadSavedPaper(paper._id)}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{paper.title}</p>
                    <p className="text-sm text-gray-500">
                      {paper.subjectName} • {paper.totalMarks} marks • {new Date(paper.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    paper.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                    paper.status === 'finalized' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {paper.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[
          { num: 1, label: 'Configure' },
          { num: 2, label: 'Generating' },
          { num: 3, label: 'Preview & Edit' }
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                step > s.num ? 'bg-primary-600 text-white' :
                step === s.num ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className="font-medium">{s.label}</span>
            </div>
            {i < 2 && <div className={`w-16 h-0.5 mx-2 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Configuration */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Config */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-600" />
                Paper Configuration
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select
                    value={config.subjectId}
                    onChange={handleSubjectChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={config.classId}
                    onChange={handleClassChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Chapter</label>
                  <input
                    type="text"
                    value={config.topic}
                    onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Quadratic Equations"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select
                    value={config.examType}
                    onChange={(e) => setConfig(prev => ({ ...prev, examType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {EXAM_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={config.duration}
                    onChange={(e) => setConfig(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={config.difficulty}
                    onChange={(e) => setConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {DIFFICULTY_LEVELS.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Question Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileQuestion className="w-5 h-5 text-primary-600" />
                  Question Distribution
                </h2>
                <button
                  onClick={addQuestionType}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"
                >
                  <Plus className="w-4 h-4" />
                  Add Type
                </button>
              </div>

              <div className="space-y-3">
                {config.questionTypes.map((qt, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <select
                      value={qt.type}
                      onChange={(e) => updateQuestionType(index, 'type', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      {QUESTION_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={qt.count}
                        onChange={(e) => updateQuestionType(index, 'count', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center"
                      />
                      <span className="text-sm text-gray-500">questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={qt.marksEach}
                        onChange={(e) => updateQuestionType(index, 'marksEach', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm text-center"
                      />
                      <span className="text-sm text-gray-500">marks each</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-20 text-right">
                      = {qt.count * qt.marksEach} marks
                    </span>
                    {config.questionTypes.length > 1 && (
                      <button
                        onClick={() => removeQuestionType(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
                <span className="text-gray-600">Total Questions: <strong>{calculateTotalQuestions()}</strong></span>
                <span className="text-gray-900 font-semibold">Total Marks: {calculateTotalMarks()}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* PDF Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary-600" />
                Reference Paper (Optional)
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload a previous year paper PDF to generate similar style questions
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                className="hidden"
              />
              
              {config.referencePdf ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-700 truncate max-w-[150px]">
                      {config.referencePdf.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, referencePdf: null }))}
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary-400 hover:bg-primary-50/50 transition text-center"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload PDF</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
                </button>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!config.subject || config.questionTypes.length === 0}
              className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Wand2 className="w-5 h-5" />
              Generate Question Paper
            </button>

            {/* Tips */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Tips for Better Results
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Be specific with topic/chapter names</li>
                <li>• Upload reference paper for similar style</li>
                <li>• Mix difficulty levels for balanced paper</li>
                <li>• You can edit generated questions later</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Generating */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="relative">
            <div className="w-24 h-24 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600" />
            <Wand2 className="w-10 h-10 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-6">Generating Question Paper...</h2>
          <p className="text-gray-500 mt-2">AI is crafting your questions. This may take a moment.</p>
        </motion.div>
      )}

      {/* Step 3: Preview & Edit */}
      {step === 3 && generatedPaper && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Actions Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between sticky top-20 z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  editMode ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {editMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                {editMode ? 'Preview Mode' : 'Edit Mode'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Printer className="w-4 h-4" />
                Print / Download
              </button>
            </div>
          </div>

          {/* Paper Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none" id="question-paper">
            {/* Paper Header */}
            <div className="text-center border-b-2 border-gray-900 pb-4 mb-6">
              {/* School Name - Editable */}
              {editMode ? (
                <input
                  type="text"
                  value={generatedPaper.schoolName || ''}
                  onChange={(e) => setGeneratedPaper(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="Enter School/Institution Name"
                  className="w-full text-center text-lg font-semibold text-gray-700 border-b border-dashed border-gray-300 focus:border-primary-500 outline-none mb-2"
                />
              ) : generatedPaper.schoolName && (
                <p className="text-lg font-semibold text-gray-700 mb-2">{generatedPaper.schoolName}</p>
              )}
              
              {/* Title - Editable */}
              {editMode ? (
                <input
                  type="text"
                  value={generatedPaper.title}
                  onChange={(e) => setGeneratedPaper(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-center text-2xl font-bold text-gray-900 border-b border-dashed border-gray-300 focus:border-primary-500 outline-none"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{generatedPaper.title}</h1>
              )}
              
              {/* Meta Info - Editable */}
              <div className="mt-3 flex items-center justify-center gap-4 text-sm text-gray-600 flex-wrap">
                {editMode ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span>Subject:</span>
                      <input
                        type="text"
                        value={generatedPaper.subjectName || ''}
                        onChange={(e) => setGeneratedPaper(prev => ({ ...prev, subjectName: e.target.value }))}
                        className="w-24 px-1 border-b border-dashed border-gray-300 focus:border-primary-500 outline-none text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Class:</span>
                      <input
                        type="text"
                        value={generatedPaper.className || ''}
                        onChange={(e) => setGeneratedPaper(prev => ({ ...prev, className: e.target.value }))}
                        className="w-16 px-1 border-b border-dashed border-gray-300 focus:border-primary-500 outline-none text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Duration:</span>
                      <input
                        type="number"
                        value={generatedPaper.duration || 60}
                        onChange={(e) => setGeneratedPaper(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                        className="w-12 px-1 border-b border-dashed border-gray-300 focus:border-primary-500 outline-none text-center"
                      />
                      <span>mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Total Marks:</span>
                      <input
                        type="number"
                        value={generatedPaper.totalMarks || 0}
                        onChange={(e) => setGeneratedPaper(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 0 }))}
                        className="w-12 px-1 border-b border-dashed border-gray-300 focus:border-primary-500 outline-none text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Date:</span>
                      <input
                        type="text"
                        value={generatedPaper.examDate || ''}
                        onChange={(e) => setGeneratedPaper(prev => ({ ...prev, examDate: e.target.value }))}
                        placeholder="DD/MM/YYYY"
                        className="w-24 px-1 border-b border-dashed border-gray-300 focus:border-primary-500 outline-none text-center"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <span>Subject: {generatedPaper.subjectName}</span>
                    {generatedPaper.className && <span>Class: {generatedPaper.className}</span>}
                    <span>Duration: {generatedPaper.duration} mins</span>
                    <span>Total Marks: {generatedPaper.totalMarks}</span>
                    {generatedPaper.examDate && <span>Date: {generatedPaper.examDate}</span>}
                  </>
                )}
              </div>
            </div>

            {/* Instructions - Editable */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">General Instructions:</h3>
              {editMode ? (
                <div className="space-y-2">
                  {(generatedPaper.instructions || []).map((inst, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-gray-500">•</span>
                      <input
                        type="text"
                        value={inst}
                        onChange={(e) => {
                          const newInstructions = [...(generatedPaper.instructions || [])]
                          newInstructions[i] = e.target.value
                          setGeneratedPaper(prev => ({ ...prev, instructions: newInstructions }))
                        }}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:border-primary-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          const newInstructions = generatedPaper.instructions.filter((_, idx) => idx !== i)
                          setGeneratedPaper(prev => ({ ...prev, instructions: newInstructions }))
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newInstructions = [...(generatedPaper.instructions || []), '']
                      setGeneratedPaper(prev => ({ ...prev, instructions: newInstructions }))
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add instruction
                  </button>
                </div>
              ) : generatedPaper.instructions?.length > 0 ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  {generatedPaper.instructions.map((inst, i) => (
                    <li key={i}>• {inst}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">No instructions added</p>
              )}
            </div>

            {/* Sections & Questions */}
            {generatedPaper.sections?.map((section, sIndex) => (
              <div key={sIndex} className="mb-8">
                <div className="flex items-center justify-between mb-4 gap-4">
                  {editMode ? (
                    <>
                      <input
                        type="text"
                        value={section.sectionName}
                        onChange={(e) => {
                          const newSections = [...generatedPaper.sections]
                          newSections[sIndex].sectionName = e.target.value
                          setGeneratedPaper(prev => ({ ...prev, sections: newSections }))
                        }}
                        className="text-lg font-bold text-gray-900 border-b border-dashed border-gray-300 focus:border-primary-500 outline-none"
                      />
                      <input
                        type="text"
                        value={section.instructions || ''}
                        onChange={(e) => {
                          const newSections = [...generatedPaper.sections]
                          newSections[sIndex].instructions = e.target.value
                          setGeneratedPaper(prev => ({ ...prev, sections: newSections }))
                        }}
                        placeholder="Section instructions..."
                        className="flex-1 text-sm text-gray-500 italic border-b border-dashed border-gray-300 focus:border-primary-500 outline-none"
                      />
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-bold text-gray-900">{section.sectionName}</h2>
                      {section.instructions && (
                        <span className="text-sm text-gray-500 italic">{section.instructions}</span>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  {section.questions?.map((question, qIndex) => (
                    <div key={qIndex} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-gray-700 mt-0.5">Q{question.questionNumber}.</span>
                        <div className="flex-1">
                          {editMode ? (
                            <textarea
                              value={question.questionText}
                              onChange={(e) => updateQuestion(sIndex, qIndex, 'questionText', e.target.value)}
                              className="w-full p-2 border border-gray-200 rounded-lg resize-none"
                              rows={2}
                            />
                          ) : (
                            <p className="text-gray-800">{question.questionText}</p>
                          )}

                          {/* MCQ Options */}
                          {question.questionType === 'mcq' && question.options && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              {question.options.map((opt, oIndex) => (
                                <div key={oIndex} className="text-sm text-gray-600">
                                  {editMode ? (
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const newOptions = [...question.options]
                                        newOptions[oIndex] = e.target.value
                                        updateQuestion(sIndex, qIndex, 'options', newOptions)
                                      }}
                                      className="w-full p-1 border border-gray-200 rounded text-sm"
                                    />
                                  ) : (
                                    <span>{opt}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {editMode ? (
                            <>
                              <select
                                value={question.difficulty || 'medium'}
                                onChange={(e) => updateQuestion(sIndex, qIndex, 'difficulty', e.target.value)}
                                className="text-xs px-2 py-1 border border-gray-200 rounded"
                              >
                                <option value="easy">easy</option>
                                <option value="medium">medium</option>
                                <option value="hard">hard</option>
                              </select>
                              <input
                                type="number"
                                value={question.marks}
                                onChange={(e) => updateQuestion(sIndex, qIndex, 'marks', parseInt(e.target.value) || 1)}
                                className="w-12 text-sm text-center border border-gray-200 rounded px-1"
                              />
                              <span className="text-sm text-gray-500">marks</span>
                            </>
                          ) : (
                            <>
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                question.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {question.difficulty}
                              </span>
                              <span className="text-sm font-medium text-gray-600">[{question.marks} marks]</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #question-paper, #question-paper * { visibility: visible; }
          #question-paper { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}
