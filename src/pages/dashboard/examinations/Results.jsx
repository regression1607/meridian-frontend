import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  FileText, Plus, Search, Filter, Download, Upload, CheckCircle,
  Edit2, Trash2, Eye, X, Award, TrendingUp, Users, AlertCircle, ChevronDown, FileDown
} from 'lucide-react'
import { examinationsApi, classesApi, subjectsApi } from '../../../services/api'
import { toast } from 'react-toastify'
import Pagination from '../../../components/ui/Pagination'
import {
  parseCSV, downloadCSVTemplate, readCSVFile, generateCSV, downloadCSV, CSV_TEMPLATES
} from '../../../utils/csvUtils'

const gradeColors = {
  'A+': 'bg-green-100 text-green-700',
  'A': 'bg-green-100 text-green-600',
  'B+': 'bg-blue-100 text-blue-700',
  'B': 'bg-blue-100 text-blue-600',
  'C+': 'bg-yellow-100 text-yellow-700',
  'C': 'bg-yellow-100 text-yellow-600',
  'D': 'bg-orange-100 text-orange-700',
  'E': 'bg-orange-100 text-orange-600',
  'F': 'bg-red-100 text-red-700'
}

export default function Results() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [exams, setExams] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [editingResult, setEditingResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filters, setFilters] = useState({ exam: '', class: '', subject: '', status: '' })
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 })
  const [selectedResults, setSelectedResults] = useState([])
  const [exporting, setExporting] = useState(false)

  const getStudentDisplayName = (student) => {
    if (!student) return 'Unknown'
    if (student.firstName || student.lastName) {
      return `${student.firstName || ''} ${student.lastName || ''}`.trim()
    }
    if (student.name) return student.name
    return student.email?.split('@')[0] || student.admissionNumber || 'Unknown'
  }

  useEffect(() => {
    fetchData()
  }, [filters.exam, filters.class, filters.subject, filters.status, pagination.page])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [filters.exam, filters.class, filters.subject, filters.status])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resultsRes, examsRes, classesRes, subjectsRes] = await Promise.all([
        examinationsApi.getResults({ ...filters, page: pagination.page, limit: pagination.limit }),
        examinationsApi.getExams({ limit: 100 }),
        classesApi.getAll({ limit: 100 }),
        subjectsApi.getAll({ limit: 100 })
      ])
      setResults(resultsRes.data || [])
      setPagination(prev => ({ ...prev, ...resultsRes.meta }))
      setExams(examsRes.data || [])
      setClasses(classesRes.data || [])
      setSubjects(subjectsRes.data || [])
    } catch (error) {
      toast.error('Failed to fetch results')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData) => {
    try {
      setSaving(true)
      if (editingResult) {
        await examinationsApi.updateResult(editingResult._id, formData)
        toast.success('Result updated successfully')
      } else {
        await examinationsApi.createResult(formData)
        toast.success('Result added successfully')
      }
      setShowModal(false)
      setEditingResult(null)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to save result')
    } finally {
      setSaving(false)
    }
  }

  const handleBulkSubmit = async (resultsData) => {
    try {
      setSaving(true)
      await examinationsApi.createBulkResults({ results: resultsData })
      toast.success('Results added successfully')
      setShowBulkModal(false)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to save results')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (result) => {
    if (!confirm('Delete this result?')) return
    try {
      await examinationsApi.deleteResult(result._id)
      toast.success('Result deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete result')
    }
  }

  const handleVerify = async () => {
    if (selectedResults.length === 0) {
      toast.error('Select results to verify')
      return
    }
    try {
      await examinationsApi.verifyResults(selectedResults)
      toast.success('Results verified')
      setSelectedResults([])
      fetchData()
    } catch (error) {
      toast.error('Failed to verify results')
    }
  }

  const toggleSelect = (id) => {
    setSelectedResults(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedResults.length === results.length) {
      setSelectedResults([])
    } else {
      setSelectedResults(results.map(r => r._id))
    }
  }

  // Export handler
  const handleExport = async () => {
    if (results.length === 0) {
      toast.warning('No results to export')
      return
    }
    setExporting(true)
    try {
      const exportData = results.map(r => ({
        rollNumber: r.student?.admissionNumber || r.student?.rollNumber || '',
        studentName: getStudentDisplayName(r.student),
        examName: r.exam?.name || '',
        subjectName: r.subject?.name || '',
        marksObtained: r.marksObtained || 0,
        maxMarks: r.totalMarks || 100,
        grade: r.grade || '',
        remarks: r.remarks || ''
      }))
      const headers = CSV_TEMPLATES.examResults.headers
      const csvContent = generateCSV(exportData, headers)
      downloadCSV(csvContent, `exam_results_${new Date().toISOString().split('T')[0]}`)
      toast.success('Results exported successfully')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  // Calculate stats from current results
  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    failed: results.filter(r => r.status === 'fail').length,
    avgPercentage: results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length) 
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-500 mt-1">Manage and view student exam results</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || results.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            Export
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            Bulk Entry
          </button>
          <button
            onClick={() => { setEditingResult(null); setShowModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add Result
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Results" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle} label="Passed" value={stats.passed} color="green" />
        <StatCard icon={AlertCircle} label="Failed" value={stats.failed} color="red" />
        <StatCard icon={TrendingUp} label="Avg Score" value={`${stats.avgPercentage}%`} color="purple" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search student name, email..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={filters.exam}
            onChange={(e) => setFilters(prev => ({ ...prev, exam: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Exams</option>
            {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <select
            value={filters.class}
            onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            value={filters.subject}
            onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="absent">Absent</option>
          </select>
          {selectedResults.length > 0 && (
            <button
              onClick={handleVerify}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Verify Selected ({selectedResults.length})
            </button>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No results found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedResults.length === results.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map(result => (
                  <tr key={result._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedResults.includes(result._id)}
                        onChange={() => toggleSelect(result._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {getStudentDisplayName(result.student)}
                      </div>
                      <div className="text-sm text-gray-500">{result.student?.admissionNumber || result.student?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{result.exam?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{result.exam?.examType?.replace('_', ' ')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{result.subject?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{result.marksObtained}/{result.totalMarks}</div>
                      <div className="text-xs text-gray-500">{result.percentage}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${gradeColors[result.grade] || 'bg-gray-100'}`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.status === 'pass' ? 'bg-green-100 text-green-700' :
                        result.status === 'fail' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {result.status}
                      </span>
                      {result.isVerified && <CheckCircle className="w-4 h-4 text-green-500 inline ml-1" />}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingResult(result); setShowModal(true) }} 
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(result)} className="p-1 hover:bg-gray-100 rounded">
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

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          itemName="results"
        />
      </div>

      {/* Modals */}
      {showModal && (
        <ResultFormModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingResult(null) }}
          onSave={handleSubmit}
          result={editingResult}
          exams={exams}
          saving={saving}
        />
      )}

      {showBulkModal && (
        <BulkResultModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onSave={handleBulkSubmit}
          exams={exams}
          classes={classes}
          saving={saving}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
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

function ResultFormModal({ isOpen, onClose, onSave, result, exams, saving }) {
  const [formData, setFormData] = useState({
    exam: '', student: '', marksObtained: 0, remarks: '', status: 'pass'
  })
  const [students, setStudents] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)

  const getStudentName = (s) => {
    if (s.firstName || s.lastName) {
      return `${s.firstName || ''} ${s.lastName || ''}`.trim()
    }
    if (s.name) return s.name
    return s.email?.split('@')[0] || s.admissionNumber || 'Unknown'
  }

  const filteredStudents = students.filter(s => {
    const searchLower = studentSearch.toLowerCase()
    const fullName = getStudentName(s).toLowerCase()
    const email = (s.email || '').toLowerCase()
    const admNo = (s.admissionNumber || '').toLowerCase()
    return fullName.includes(searchLower) || email.includes(searchLower) || admNo.includes(searchLower)
  })

  const selectedStudent = students.find(s => s._id === formData.student)

  useEffect(() => {
    if (result) {
      setFormData({
        exam: result.exam?._id || '',
        student: result.student?._id || '',
        marksObtained: result.marksObtained || 0,
        remarks: result.remarks || '',
        status: result.status || 'pass'
      })
    }
  }, [result])

  useEffect(() => {
    if (formData.exam) {
      const exam = exams.find(e => e._id === formData.exam)
      setSelectedExam(exam)
      if (exam?.class?._id) {
        classesApi.getStudents(exam.class._id).then(res => setStudents(res.data || []))
      }
    }
  }, [formData.exam, exams])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.exam || !formData.student) {
      toast.error('Please select exam and student')
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
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{result ? 'Edit Result' : 'Add Result'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Exam *</label>
            <select
              value={formData.exam}
              onChange={(e) => setFormData({ ...formData, exam: e.target.value, student: '' })}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={!!result}
            >
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e._id} value={e._id}>{e.name} - {e.subject?.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Student *</label>
            <div
              className={`w-full px-3 py-2 border rounded-lg flex items-center justify-between ${!formData.exam || !!result ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !result && formData.exam && setShowStudentDropdown(!showStudentDropdown)}
            >
              <span className={selectedStudent ? 'text-gray-900' : 'text-gray-500'}>
                {selectedStudent ? `${getStudentName(selectedStudent)} (${selectedStudent.admissionNumber || ''})` : 'Select Student'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showStudentDropdown ? 'rotate-180' : ''}`} />
            </div>
            {showStudentDropdown && !result && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-hidden">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, email or admission no..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border rounded text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="px-3 py-2 text-gray-500 text-sm">No students found</div>
                  ) : (
                    filteredStudents.map(s => (
                      <div
                        key={s._id}
                        className={`px-3 py-2 hover:bg-gray-100 cursor-pointer ${formData.student === s._id ? 'bg-primary-50' : ''}`}
                        onClick={() => { setFormData({ ...formData, student: s._id }); setShowStudentDropdown(false); setStudentSearch('') }}
                      >
                        <div className="font-medium text-sm">{getStudentName(s)}</div>
                        <div className="text-xs text-gray-500">{s.admissionNumber} {s.email && `• ${s.email}`}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Marks Obtained * {selectedExam && <span className="text-gray-500">(out of {selectedExam.totalMarks})</span>}
            </label>
            <input
              type="number"
              value={formData.marksObtained}
              onChange={(e) => setFormData({ ...formData, marksObtained: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min={0}
              max={selectedExam?.totalMarks || 100}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="absent">Absent</option>
              <option value="withheld">Withheld</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Saving...' : result ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  )
}

function BulkResultModal({ isOpen, onClose, onSave, exams, classes, saving }) {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedExam, setSelectedExam] = useState('')
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({})
  const [existingMarks, setExistingMarks] = useState({}) // Track which students have existing results
  const [exam, setExam] = useState(null)

  const getStudentName = (s) => {
    if (s.firstName || s.lastName) {
      return `${s.firstName || ''} ${s.lastName || ''}`.trim()
    }
    if (s.name) return s.name
    return s.email?.split('@')[0] || s.admissionNumber || 'Unknown'
  }

  // Filter exams by selected class
  const filteredExams = selectedClass 
    ? exams.filter(e => e.class?._id === selectedClass)
    : []

  // Reset exam when class changes
  useEffect(() => {
    setSelectedExam('')
    setExam(null)
    setStudents([])
    setMarks({})
    setExistingMarks({})
  }, [selectedClass])

  // Fetch students and existing results when exam is selected
  useEffect(() => {
    if (selectedExam && selectedClass) {
      const examData = exams.find(e => e._id === selectedExam)
      setExam(examData)
      
      // Fetch students and existing results in parallel
      Promise.all([
        classesApi.getStudents(selectedClass),
        examinationsApi.getResults({ exam: selectedExam, limit: 100 })
      ]).then(([studentsRes, resultsRes]) => {
        const studentsList = studentsRes.data || []
        setStudents(studentsList)
        
        // Create a map of existing results by student ID
        const existingResults = {}
        ;(resultsRes.data || []).forEach(r => {
          const studentId = r.student?._id || r.student
          if (studentId) existingResults[studentId] = r.marksObtained
        })
        setExistingMarks(existingResults)
        
        // Pre-populate marks with existing results or empty
        const initialMarks = {}
        studentsList.forEach(s => {
          initialMarks[s._id] = existingResults[s._id] !== undefined ? existingResults[s._id] : ''
        })
        setMarks(initialMarks)
      })
    }
  }, [selectedExam, selectedClass, exams])

  const handleSubmit = () => {
    const results = Object.entries(marks)
      .filter(([_, m]) => m !== '' && m !== null)
      .map(([studentId, marksObtained]) => ({
        exam: selectedExam,
        student: studentId,
        marksObtained: parseFloat(marksObtained)
      }))
    
    if (results.length === 0) {
      toast.error('Enter marks for at least one student')
      return
    }
    onSave(results)
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Bulk Result Entry</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Class *</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Select Class</option>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name} {c.section ? `- ${c.section}` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Exam *</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={!selectedClass}
            >
              <option value="">{selectedClass ? 'Select Exam' : 'Select class first'}</option>
              {filteredExams.map(e => <option key={e._id} value={e._id}>{e.name} - {e.subject?.name}</option>)}
            </select>
            {selectedClass && filteredExams.length === 0 && (
              <p className="mt-1 text-sm text-orange-600">No exams found for this class</p>
            )}
          </div>
          {exam && (
            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
              Total Marks: {exam.totalMarks} | Passing: {exam.passingMarks}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {students.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Roll No</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Student Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Marks</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.map((student, idx) => {
                  const hasExisting = existingMarks[student._id] !== undefined
                  return (
                    <tr key={student._id} className={hasExisting ? 'bg-blue-50/50' : ''}>
                      <td className="px-3 py-2 text-sm">{idx + 1}</td>
                      <td className="px-3 py-2 text-sm font-medium">{getStudentName(student)}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={marks[student._id] !== undefined && marks[student._id] !== '' ? marks[student._id] : ''}
                          onChange={(e) => setMarks({ ...marks, [student._id]: e.target.value })}
                          className={`w-24 px-2 py-1 border rounded ${hasExisting ? 'border-blue-300 bg-white' : ''}`}
                          min={0}
                          max={exam?.totalMarks || 100}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-3 py-2">
                        {hasExisting ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            Existing
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                            New
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {!selectedClass ? 'Select a class first' : !selectedExam ? 'Select an exam to enter results' : 'No students found in this class'}
            </div>
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={saving || !selectedExam}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Results'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
