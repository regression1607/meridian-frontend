import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  FileText, Download, Printer, Eye, Search, Filter, RefreshCw,
  Send, X, Award, TrendingUp, Users, CheckCircle, Clock, BookOpen, Edit2, Trash2
} from 'lucide-react'
import { examinationsApi, classesApi } from '../../../services/api'
import { toast } from 'react-toastify'
import Pagination from '../../../components/ui/Pagination'

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

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  generated: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-purple-100 text-purple-700'
}

export default function ReportCards() {
  const [reportCards, setReportCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [showViewModal, setShowViewModal] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [editingReport, setEditingReport] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const getStudentName = (student) => {
    if (!student) return 'Unknown'
    if (student.firstName || student.lastName) {
      return `${student.firstName || ''} ${student.lastName || ''}`.trim()
    }
    if (student.name) return student.name
    return student.email?.split('@')[0] || student.admissionNumber || 'Unknown'
  }
  const [filters, setFilters] = useState({ class: '', section: '', term: '', status: '' })
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 })
  const [selectedCards, setSelectedCards] = useState([])

  useEffect(() => {
    fetchData()
  }, [filters.class, filters.section, filters.term, filters.status, pagination.page])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [filters.class, filters.section, filters.term, filters.status])

  useEffect(() => {
    if (filters.class) {
      classesApi.getSections(filters.class).then(res => setSections(res.data || []))
    } else {
      setSections([])
    }
  }, [filters.class])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reportsRes, classesRes] = await Promise.all([
        examinationsApi.getReportCards({ ...filters, page: pagination.page, limit: pagination.limit }),
        classesApi.getAll({ limit: 100 })
      ])
      setReportCards(reportsRes.data || [])
      setPagination(prev => ({ ...prev, ...reportsRes.meta }))
      setClasses(classesRes.data || [])
    } catch (error) {
      toast.error('Failed to fetch report cards')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async (data) => {
    try {
      setGenerating(true)
      if (data.bulk) {
        await examinationsApi.generateBulkReportCards(data)
        toast.success('Report cards generated successfully')
      } else {
        await examinationsApi.generateReportCard(data)
        toast.success('Report card generated successfully')
      }
      setShowGenerateModal(false)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to generate report cards')
    } finally {
      setGenerating(false)
    }
  }

  const handlePublish = async () => {
    if (selectedCards.length === 0) {
      toast.error('Select report cards to publish')
      return
    }
    try {
      await examinationsApi.publishReportCards(selectedCards)
      toast.success('Report cards published')
      setSelectedCards([])
      fetchData()
    } catch (error) {
      toast.error('Failed to publish report cards')
    }
  }

  const toggleSelect = (id) => {
    setSelectedCards(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedCards.length === reportCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(reportCards.map(r => r._id))
    }
  }

  const openView = async (report) => {
    try {
      const res = await examinationsApi.getReportCardById(report._id)
      setSelectedReport(res.data)
      setShowViewModal(true)
    } catch (error) {
      toast.error('Failed to load report card')
    }
  }

  const openEdit = async (report) => {
    try {
      const res = await examinationsApi.getReportCardById(report._id)
      setEditingReport(res.data)
      setShowEditModal(true)
    } catch (error) {
      toast.error('Failed to load report card')
    }
  }

  const handleUpdate = async (data) => {
    try {
      setSaving(true)
      await examinationsApi.updateReportCard(editingReport._id, data)
      toast.success('Report card updated')
      setShowEditModal(false)
      setEditingReport(null)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to update report card')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report card?')) return
    try {
      await examinationsApi.deleteReportCard(id)
      toast.success('Report card deleted')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete report card')
    }
  }

  const handlePrint = async (report) => {
    try {
      const res = await examinationsApi.getReportCardById(report._id)
      setSelectedReport(res.data)
      setShowViewModal(true)
      // Auto-trigger print after modal opens
      setTimeout(() => window.print(), 500)
    } catch (error) {
      toast.error('Failed to load report card')
    }
  }

  const handleBulkDownload = () => {
    if (reportCards.length === 0) {
      toast.error('No report cards to download')
      return
    }
    toast.info('Opening print dialog for all report cards. Use "Save as PDF" to download.')
    window.print()
  }

  // Stats
  const stats = {
    total: reportCards.length,
    published: reportCards.filter(r => r.status === 'published').length,
    pending: reportCards.filter(r => r.status === 'generated').length,
    avgPercentage: reportCards.length > 0 
      ? Math.round(reportCards.reduce((sum, r) => sum + (r.overallPercentage || 0), 0) / reportCards.length) 
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
          <p className="text-gray-500 mt-1">Generate and manage student report cards</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBulkDownload}
            disabled={reportCards.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            Download All
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Report Cards
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Reports" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle} label="Published" value={stats.published} color="green" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="orange" />
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
                placeholder="Search student name..."
                value={filters.search || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <select
            value={filters.class}
            onChange={(e) => setFilters(prev => ({ ...prev, class: e.target.value, section: '' }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            value={filters.section}
            onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
            disabled={!filters.class}
          >
            <option value="">All Sections</option>
            {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select
            value={filters.term}
            onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Terms</option>
            <option value="term1">Term 1</option>
            <option value="term2">Term 2</option>
            <option value="term3">Term 3</option>
            <option value="annual">Annual</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="generated">Generated</option>
            <option value="published">Published</option>
          </select>
          {selectedCards.length > 0 && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Send className="w-4 h-4 inline mr-1" />
              Publish ({selectedCards.length})
            </button>
          )}
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : reportCards.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No report cards found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCards.length === reportCards.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportCards.map(report => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedCards.includes(report._id)}
                        onChange={() => toggleSelect(report._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={report.student?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(getStudentName(report.student))}`}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {getStudentName(report.student)}
                          </div>
                          <div className="text-sm text-gray-500">{report.student?.admissionNumber || report.student?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{report.class?.name}</div>
                      <div className="text-xs text-gray-500">{report.section?.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize">{report.term?.replace('term', 'Term ')}</span>
                      <div className="text-xs text-gray-500">{report.academicYear}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{report.totalMarksObtained || 0}/{report.totalMaxMarks || 0}</div>
                      <div className="text-xs text-gray-500">{report.overallPercentage || 0}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${gradeColors[report.overallGrade] || 'bg-gray-100 text-gray-700'}`}>
                        {report.overallGrade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{report.rank || '-'}</span>
                        {report.totalStudents && <span className="text-xs text-gray-500">/{report.totalStudents}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openView(report)} className="p-1.5 hover:bg-gray-100 rounded" title="View">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button onClick={() => openEdit(report)} className="p-1.5 hover:bg-blue-50 rounded" title="Edit">
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handlePrint(report)} className="p-1.5 hover:bg-green-50 rounded" title="Print / Download PDF">
                          <Printer className="w-4 h-4 text-green-500" />
                        </button>
                        <button onClick={() => handleDelete(report._id)} className="p-1.5 hover:bg-red-50 rounded" title="Delete">
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
          itemName="report cards"
        />
      </div>

      {/* Modals */}
      {showViewModal && selectedReport && (
        <ReportCardViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          report={selectedReport}
        />
      )}

      {showGenerateModal && (
        <GenerateReportModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onGenerate={handleGenerate}
          classes={classes}
          generating={generating}
        />
      )}

      {showEditModal && editingReport && (
        <EditReportModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); setEditingReport(null) }}
          onSave={handleUpdate}
          report={editingReport}
          saving={saving}
          getStudentName={getStudentName}
        />
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
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

function GenerateReportModal({ isOpen, onClose, onGenerate, classes, generating }) {
  const [formData, setFormData] = useState({
    classId: '', section: '', term: 'term1', academicYear: '', bulk: true
  })
  const [sections, setSections] = useState([])

  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    const academicYear = now.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`
    setFormData(prev => ({ ...prev, academicYear }))
  }, [])

  useEffect(() => {
    if (formData.classId) {
      classesApi.getSections(formData.classId).then(res => setSections(res.data || []))
    }
  }, [formData.classId])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.classId || !formData.term) {
      toast.error('Please select class and term')
      return
    }
    onGenerate(formData)
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
          <h2 className="text-lg font-semibold">Generate Report Cards</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class *</label>
            <select
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value, section: '' })}
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
              disabled={!formData.classId}
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Term *</label>
            <select
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="term1">Term 1</option>
              <option value="term2">Term 2</option>
              <option value="term3">Term 3</option>
              <option value="annual">Annual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Academic Year</label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., 2024-2025"
            />
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
            <p>This will generate report cards for all students in the selected class/section based on their exam results.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={generating} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  )
}

function ReportCardViewModal({ isOpen, onClose, report }) {
  if (!isOpen || !report) return null

  const getStudentName = (student) => {
    if (!student) return 'Unknown'
    if (student.firstName || student.lastName) {
      return `${student.firstName || ''} ${student.lastName || ''}`.trim()
    }
    if (student.name) return student.name
    return student.email?.split('@')[0] || student.admissionNumber || 'Unknown'
  }

  const handlePrint = () => {
    window.print()
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Report Card</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
              <Printer className="w-4 h-4" />Print
            </button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 print:p-0" id="report-card">
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Student Report Card</h1>
            <p className="text-gray-500">{report.academicYear} - {report.term?.replace('term', 'Term ')}</p>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">Student Name</p>
              <p className="font-medium">{getStudentName(report.student)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Admission No</p>
              <p className="font-medium">{report.student?.admissionNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Class</p>
              <p className="font-medium">{report.class?.name} {report.section?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Roll Number</p>
              <p className="font-medium">{report.student?.studentData?.rollNumber || '-'}</p>
            </div>
          </div>

          {/* Subject Results */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-600" />
              Subject-wise Performance
            </h3>
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left text-sm">Subject</th>
                  <th className="border px-3 py-2 text-center text-sm">Marks Obtained</th>
                  <th className="border px-3 py-2 text-center text-sm">Total Marks</th>
                  <th className="border px-3 py-2 text-center text-sm">Percentage</th>
                  <th className="border px-3 py-2 text-center text-sm">Grade</th>
                </tr>
              </thead>
              <tbody>
                {report.subjectResults?.map((sr, idx) => (
                  <tr key={idx}>
                    <td className="border px-3 py-2">{sr.subjectName || sr.subject?.name}</td>
                    <td className="border px-3 py-2 text-center">{sr.totalMarksObtained}</td>
                    <td className="border px-3 py-2 text-center">{sr.totalMaxMarks}</td>
                    <td className="border px-3 py-2 text-center">{sr.averagePercentage}%</td>
                    <td className="border px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[sr.finalGrade] || 'bg-gray-100'}`}>
                        {sr.finalGrade}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="border px-3 py-2">Total</td>
                  <td className="border px-3 py-2 text-center">{report.totalMarksObtained}</td>
                  <td className="border px-3 py-2 text-center">{report.totalMaxMarks}</td>
                  <td className="border px-3 py-2 text-center">{report.overallPercentage}%</td>
                  <td className="border px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${gradeColors[report.overallGrade] || 'bg-gray-100'}`}>
                      {report.overallGrade}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">{report.overallPercentage}%</p>
              <p className="text-sm text-blue-600">Overall Percentage</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">{report.overallGrade}</p>
              <p className="text-sm text-green-600">Overall Grade</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-700">{report.rank || '-'}</p>
              <p className="text-sm text-yellow-600">Class Rank</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-700">{report.attendance?.percentage || 0}%</p>
              <p className="text-sm text-purple-600">Attendance</p>
            </div>
          </div>

          {/* Remarks */}
          {(report.classTeacherRemarks || report.principalRemarks) && (
            <div className="mb-6 space-y-3">
              {report.classTeacherRemarks && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Class Teacher's Remarks</p>
                  <p className="text-sm">{report.classTeacherRemarks}</p>
                </div>
              )}
              {report.principalRemarks && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Principal's Remarks</p>
                  <p className="text-sm">{report.principalRemarks}</p>
                </div>
              )}
            </div>
          )}

          {/* Promotion Status */}
          {report.promotionStatus && report.promotionStatus !== 'pending' && (
            <div className={`p-4 rounded-lg text-center ${
              report.promotionStatus === 'promoted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <p className="font-semibold">
                {report.promotionStatus === 'promoted' ? 'PROMOTED' : 'DETAINED'}
              </p>
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

function EditReportModal({ isOpen, onClose, onSave, report, saving, getStudentName }) {
  const [formData, setFormData] = useState({
    classTeacherRemarks: report?.classTeacherRemarks || '',
    principalRemarks: report?.principalRemarks || '',
    promotionStatus: report?.promotionStatus || 'pending',
    status: report?.status || 'generated'
  })

  useEffect(() => {
    if (report) {
      setFormData({
        classTeacherRemarks: report.classTeacherRemarks || '',
        principalRemarks: report.principalRemarks || '',
        promotionStatus: report.promotionStatus || 'pending',
        status: report.status || 'generated'
      })
    }
  }, [report])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isOpen || !report) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit Report Card</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Student Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Student</p>
            <p className="font-medium">{getStudentName(report.student)}</p>
            <p className="text-xs text-gray-500">{report.student?.admissionNumber} • {report.class?.name} {report.section?.name}</p>
          </div>

          {/* Scores Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <p className="text-lg font-bold text-blue-700">{report.overallPercentage}%</p>
              <p className="text-xs text-blue-600">Percentage</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <p className="text-lg font-bold text-green-700">{report.overallGrade}</p>
              <p className="text-xs text-green-600">Grade</p>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg">
              <p className="text-lg font-bold text-yellow-700">{report.rank || '-'}</p>
              <p className="text-xs text-yellow-600">Rank</p>
            </div>
          </div>

          {/* Class Teacher Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1">Class Teacher's Remarks</label>
            <textarea
              value={formData.classTeacherRemarks}
              onChange={(e) => setFormData({ ...formData, classTeacherRemarks: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              rows={3}
              placeholder="Enter class teacher's remarks..."
            />
          </div>

          {/* Principal Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1">Principal's Remarks</label>
            <textarea
              value={formData.principalRemarks}
              onChange={(e) => setFormData({ ...formData, principalRemarks: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              rows={3}
              placeholder="Enter principal's remarks..."
            />
          </div>

          {/* Promotion Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Promotion Status</label>
            <select
              value={formData.promotionStatus}
              onChange={(e) => setFormData({ ...formData, promotionStatus: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="pending">Pending</option>
              <option value="promoted">Promoted</option>
              <option value="detained">Detained</option>
            </select>
          </div>

          {/* Report Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Report Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="draft">Draft</option>
              <option value="generated">Generated</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  )
}
