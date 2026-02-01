import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  ClipboardList, Plus, Search, Filter, Calendar, Clock,
  Edit2, Trash2, Eye, X, BookOpen, Users, MapPin, AlertCircle,
  ChevronDown, FileText
} from 'lucide-react'
import { examinationsApi, classesApi, subjectsApi, usersApi } from '../../../services/api'
import { toast } from 'react-toastify'

const examTypes = [
  { value: 'unit_test', label: 'Unit Test' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'final', label: 'Final' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'annual', label: 'Annual' },
  { value: 'practical', label: 'Practical' },
  { value: 'assignment', label: 'Assignment' }
]

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  postponed: 'bg-orange-100 text-orange-700'
}

export default function ExamManagement() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [stats, setStats] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [editingExam, setEditingExam] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ class: '', examType: '', status: '', search: '' })
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })

  useEffect(() => {
    fetchData()
  }, [filters, pagination.page])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [examsRes, classesRes, subjectsRes, teachersRes, statsRes] = await Promise.all([
        examinationsApi.getExams({ ...filters, page: pagination.page, limit: pagination.limit }),
        classesApi.getAll({ limit: 100 }),
        subjectsApi.getAll({ limit: 100 }),
        usersApi.getAll({ role: 'teacher', limit: 100 }),
        examinationsApi.getExamStats({})
      ])
      setExams(examsRes.data || [])
      setPagination(prev => ({ ...prev, ...examsRes.meta }))
      setClasses(classesRes.data || [])
      setSubjects(subjectsRes.data || [])
      setTeachers(teachersRes.data || [])
      setStats(statsRes.data)
    } catch (error) {
      toast.error('Failed to fetch exams')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      setSaving(true)
      if (editingExam) {
        await examinationsApi.updateExam(editingExam._id, formData)
        toast.success('Exam updated successfully')
      } else {
        await examinationsApi.createExam(formData)
        toast.success('Exam created successfully')
      }
      setShowModal(false)
      setEditingExam(null)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to save exam')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (exam) => {
    if (!confirm('Delete this exam? All associated results will also be deleted.')) return
    try {
      await examinationsApi.deleteExam(exam._id)
      toast.success('Exam deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete exam')
    }
  }

  const openEdit = (exam) => {
    setEditingExam(exam)
    setShowModal(true)
  }

  const openView = (exam) => {
    setSelectedExam(exam)
    setShowViewModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-500 mt-1">Schedule and manage examinations</p>
        </div>
        <button
          onClick={() => { setEditingExam(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          Schedule Exam
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={ClipboardList} label="Total Exams" value={stats.totalExams} color="blue" />
          <StatCard icon={FileText} label="Total Results" value={stats.totalResults} color="green" />
          <StatCard icon={Users} label="Pass Rate" value={`${stats.passRate}%`} color="purple" />
          <StatCard icon={BookOpen} label="Avg Score" value={`${stats.averagePercentage}%`} color="orange" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={filters.class}
            onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            value={filters.examType}
            onChange={(e) => setFilters(prev => ({ ...prev, examType: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Types</option>
            {examTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No exams found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class/Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exams.map(exam => (
                  <tr key={exam._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{exam.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{exam.examType?.replace('_', ' ')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{exam.class?.name}</div>
                      <div className="text-sm text-gray-500">{exam.subject?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{new Date(exam.examDate).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{exam.startTime} - {exam.endTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{exam.totalMarks} marks</div>
                      <div className="text-sm text-gray-500">Pass: {exam.passingMarks}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[exam.status]}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openView(exam)} className="p-1 hover:bg-gray-100 rounded">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => openEdit(exam)} className="p-1 hover:bg-gray-100 rounded">
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(exam)} className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <ExamFormModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingExam(null) }}
          onSave={handleSubmit}
          exam={editingExam}
          classes={classes}
          subjects={subjects}
          teachers={teachers}
          saving={saving}
        />
      )}

      {showViewModal && selectedExam && (
        <ExamViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          exam={selectedExam}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function ExamFormModal({ isOpen, onClose, onSave, exam, classes, subjects, teachers, saving }) {
  const [formData, setFormData] = useState({
    name: '', examType: 'unit_test', class: '', section: '', subject: '',
    examDate: '', startTime: '09:00', endTime: '12:00', duration: 180,
    totalMarks: 100, passingMarks: 35, room: '', invigilator: '',
    instructions: '', syllabus: '', term: 'term1', status: 'scheduled'
  })
  const [sections, setSections] = useState([])
  const [teacherSearch, setTeacherSearch] = useState('')
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false)

  const getTeacherName = (t) => {
    if (t.firstName || t.lastName) {
      return `${t.firstName || ''} ${t.lastName || ''}`.trim()
    }
    if (t.name) return t.name
    return t.email?.split('@')[0] || 'Unknown'
  }

  const filteredTeachers = teachers.filter(t => {
    const searchLower = teacherSearch.toLowerCase()
    const fullName = getTeacherName(t).toLowerCase()
    const email = (t.email || '').toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower)
  })

  const selectedTeacher = teachers.find(t => t._id === formData.invigilator)

  useEffect(() => {
    if (exam) {
      setFormData({
        name: exam.name || '',
        examType: exam.examType || 'unit_test',
        class: exam.class?._id || '',
        section: exam.section?._id || '',
        subject: exam.subject?._id || '',
        examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
        startTime: exam.startTime || '09:00',
        endTime: exam.endTime || '12:00',
        duration: exam.duration || 180,
        totalMarks: exam.totalMarks || 100,
        passingMarks: exam.passingMarks || 35,
        room: exam.room || '',
        invigilator: exam.invigilator?._id || '',
        instructions: exam.instructions || '',
        syllabus: exam.syllabus || '',
        term: exam.term || 'term1',
        status: exam.status || 'scheduled'
      })
    }
  }, [exam])

  useEffect(() => {
    if (formData.class) {
      classesApi.getSections(formData.class).then(res => setSections(res.data || []))
    } else {
      setSections([])
    }
  }, [formData.class])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.class || !formData.subject || !formData.examDate) {
      toast.error('Please fill required fields')
      return
    }
    onSave(formData)
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{exam ? 'Edit Exam' : 'Schedule Exam'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Exam Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Mid Term Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Exam Type *</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {examTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Term</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="term1">Term 1</option>
                <option value="term2">Term 2</option>
                <option value="term3">Term 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Class *</label>
              <select
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value, section: '' })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Section</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={!formData.class}
              >
                <option value="">All Sections</option>
                {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Exam Date *</label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (mins)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Passing Marks</label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Room 101"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Invigilator</label>
              <div
                className="w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between"
                onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
              >
                <span className={selectedTeacher ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedTeacher ? getTeacherName(selectedTeacher) : 'Select Teacher'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTeacherDropdown ? 'rotate-180' : ''}`} />
              </div>
              {showTeacherDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border rounded text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <div
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
                      onClick={() => { setFormData({ ...formData, invigilator: '' }); setShowTeacherDropdown(false); setTeacherSearch('') }}
                    >
                      None
                    </div>
                    {filteredTeachers.length === 0 ? (
                      <div className="px-3 py-2 text-gray-500 text-sm">No teachers found</div>
                    ) : (
                      filteredTeachers.map(t => (
                        <div
                          key={t._id}
                          className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${formData.invigilator === t._id ? 'bg-primary-50' : ''}`}
                          onClick={() => { setFormData({ ...formData, invigilator: t._id }); setShowTeacherDropdown(false); setTeacherSearch('') }}
                        >
                          <div className="font-medium text-sm">{getTeacherName(t)}</div>
                          <div className="text-xs text-gray-500">{t.email}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="postponed">Postponed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Syllabus</label>
              <textarea
                value={formData.syllabus}
                onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Topics covered in this exam"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
                placeholder="Exam instructions for students"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Saving...' : exam ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  )
}

function ExamViewModal({ isOpen, onClose, exam }) {
  if (!isOpen || !exam) return null

  const getInvigilatorName = () => {
    if (!exam.invigilator) return 'N/A'
    const inv = exam.invigilator
    if (inv.firstName || inv.lastName) {
      return `${inv.firstName || ''} ${inv.lastName || ''}`.trim()
    }
    if (inv.name) return inv.name
    return inv.email?.split('@')[0] || 'N/A'
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Exam Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-lg">
              <ClipboardList className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{exam.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{exam.examType?.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={BookOpen} label="Class" value={exam.class?.name} />
            <InfoItem icon={FileText} label="Subject" value={exam.subject?.name} />
            <InfoItem icon={Calendar} label="Date" value={new Date(exam.examDate).toLocaleDateString()} />
            <InfoItem icon={Clock} label="Time" value={`${exam.startTime} - ${exam.endTime}`} />
            <InfoItem icon={MapPin} label="Room" value={exam.room || 'N/A'} />
            <InfoItem icon={Users} label="Invigilator" value={getInvigilatorName()} />
          </div>
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
            <div><span className="text-sm text-gray-500">Total Marks:</span><span className="ml-2 font-medium">{exam.totalMarks}</span></div>
            <div><span className="text-sm text-gray-500">Passing:</span><span className="ml-2 font-medium">{exam.passingMarks}</span></div>
            <div><span className="text-sm text-gray-500">Duration:</span><span className="ml-2 font-medium">{exam.duration} mins</span></div>
            <div><span className="text-sm text-gray-500">Term:</span><span className="ml-2 font-medium capitalize">{exam.term?.replace('term', 'Term ')}</span></div>
          </div>
          {exam.syllabus && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Syllabus</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{exam.syllabus}</p>
            </div>
          )}
          {exam.instructions && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{exam.instructions}</p>
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <button onClick={onClose} className="w-full py-2 border rounded-lg hover:bg-gray-50">Close</button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-400" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value || 'N/A'}</p>
      </div>
    </div>
  )
}
