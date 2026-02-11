import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  BookOpen, Plus, Edit, Trash2, Users, GraduationCap, Tag, Eye, Search, X
} from 'lucide-react'
import { subjectsApi, classesApi, usersApi } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import SearchFilter from '../../../components/ui/SearchFilter'
import DataTable, { StatusBadge, ActionButtons } from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'

const TYPE_COLORS = {
  core: 'bg-blue-100 text-blue-700',
  elective: 'bg-purple-100 text-purple-700',
  language: 'bg-green-100 text-green-700',
  practical: 'bg-orange-100 text-orange-700',
  other: 'bg-gray-100 text-gray-700'
}

export default function SubjectsList() {
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, subject: null })
  const [deleting, setDeleting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [viewSubject, setViewSubject] = useState(null)

  // For platform admins without institution, fetch first institution
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!institutionId && isPlatformAdmin()) {
        try {
          const token = localStorage.getItem('meridian_token')
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/institutions?limit=1`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const data = await response.json()
          if (data.success && data.data?.length > 0) {
            setInstitutionId(data.data[0]._id)
          }
        } catch (error) {
          console.error('Failed to fetch institution:', error)
        }
      }
    }
    fetchInstitution()
  }, [isPlatformAdmin])

  const [editingSubject, setEditingSubject] = useState(null)
  const [formData, setFormData] = useState({
    name: '', code: '', type: 'core', description: '', credits: 1, classes: [], teachers: []
  })
  const [saving, setSaving] = useState(false)
  const [teacherSearch, setTeacherSearch] = useState('')

  useEffect(() => {
    if (institutionId) {
      fetchSubjects()
      fetchClasses()
      fetchTeachers()
    }
  }, [institutionId, pagination.page, typeFilter])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const params = { page: pagination.page, limit: pagination.limit, institution: institutionId }
      if (typeFilter !== 'all') params.type = typeFilter
      const response = await subjectsApi.getAll(params)
      setSubjects(response.data || [])
      if (response.meta) {
        setPagination(prev => ({ ...prev, ...response.meta }))
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getAll({ institution: institutionId })
      setClasses(response.data || [])
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await usersApi.getAll({ role: 'teacher', limit: 100 })
      setTeachers(response.data || [])
    } catch (error) {
      console.error('Failed to fetch teachers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingSubject) {
        await subjectsApi.update(editingSubject._id, { ...formData, institution: institutionId })
        toast.success('Subject updated successfully')
      } else {
        await subjectsApi.create({ ...formData, institution: institutionId })
        toast.success('Subject created successfully')
      }
      setShowModal(false)
      setEditingSubject(null)
      resetForm()
      fetchSubjects()
    } catch (error) {
      toast.error(error.message || 'Failed to save subject')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (subject) => {
    setEditingSubject(subject)
    setFormData({
      name: subject.name,
      code: subject.code || '',
      type: subject.type,
      description: subject.description || '',
      credits: subject.credits,
      classes: subject.classes?.map(c => c._id || c) || [],
      teachers: subject.teachers?.map(t => t._id || t) || []
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deleteDialog.subject) return
    setDeleting(true)
    try {
      await subjectsApi.delete(deleteDialog.subject._id)
      toast.success('Subject deleted successfully')
      setDeleteDialog({ open: false, subject: null })
      fetchSubjects()
    } catch (error) {
      toast.error(error.message || 'Failed to delete subject')
    } finally {
      setDeleting(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '', code: '', type: 'core', description: '', credits: 1, classes: [], teachers: [] })
    setTeacherSearch('')
  }

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code?.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: pagination.total || subjects.length,
    core: subjects.filter(s => s.type === 'core').length,
    elective: subjects.filter(s => s.type === 'elective').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 mt-1">Manage academic subjects</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingSubject(null); setShowModal(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Subjects</p>
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.core}</p>
              <p className="text-xs text-gray-500">Core Subjects</p>
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
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.elective}</p>
              <p className="text-xs text-gray-500">Electives</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subjects..."
        filters={[
          {
            key: 'type',
            value: typeFilter,
            options: [
              { value: 'all', label: 'All Types' },
              { value: 'core', label: 'Core' },
              { value: 'elective', label: 'Elective' },
              { value: 'language', label: 'Language' },
              { value: 'practical', label: 'Practical' },
              { value: 'other', label: 'Other' }
            ]
          }
        ]}
        onFilterChange={(key, value) => setTypeFilter(value)}
        onClearFilters={() => { setSearch(''); setTypeFilter('all'); }}
      />

      {/* Subjects Table */}
      <DataTable
        columns={[
          { header: 'Subject', accessor: 'name' },
          { header: 'Code', accessor: 'code' },
          { header: 'Type', accessor: 'type' },
          { header: 'Classes', accessor: 'classes' },
          { header: 'Teachers', accessor: 'teachers' },
          { header: 'Status', accessor: 'status' },
          { header: 'Actions', accessor: 'actions', align: 'right' }
        ]}
        data={filteredSubjects}
        loading={loading}
        emptyMessage="No subjects found"
        emptyIcon={BookOpen}
        renderRow={(subject) => (
          <>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
                  {subject.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                  <p className="text-xs text-gray-500">{subject.credits} credit{subject.credits > 1 ? 's' : ''}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-gray-600">{subject.code || '-'}</span>
            </td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${TYPE_COLORS[subject.type]}`}>
                {subject.type}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-gray-600">{subject.classes?.length || 0} classes</span>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-gray-600">{subject.teachers?.length || 0} teachers</span>
            </td>
            <td className="px-4 py-3">
              <StatusBadge active={subject.isActive !== false} />
            </td>
            <td className="px-4 py-3">
              <ActionButtons
                actions={[
                  { icon: Eye, onClick: () => setViewSubject(subject), title: 'View', className: 'hover:bg-blue-50 text-gray-500 hover:text-blue-600' },
                  { icon: Edit, onClick: () => handleEdit(subject), title: 'Edit' },
                  { icon: Trash2, onClick: () => setDeleteDialog({ open: true, subject }), title: 'Delete', className: 'hover:bg-red-50 text-gray-500 hover:text-red-600' }
                ]}
              />
            </td>
          </>
        )}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        itemName="subjects"
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., MATH101"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                    <option value="language">Language</option>
                    <option value="practical">Practical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  rows="2"
                />
              </div>
              {/* Assign to Classes - Checkbox style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Classes</label>
                {formData.classes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.classes.map(classId => {
                      const cls = classes.find(c => c._id === classId)
                      return cls ? (
                        <span
                          key={classId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                        >
                          {cls.name}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, classes: formData.classes.filter(id => id !== classId) })}
                            className="hover:text-primary-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                )}
                <div className="border border-gray-300 rounded-lg max-h-32 overflow-y-auto">
                  {classes.map(cls => {
                    const isSelected = formData.classes.includes(cls._id)
                    return (
                      <label
                        key={cls._id}
                        className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-primary-50' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setFormData({
                              ...formData,
                              classes: isSelected
                                ? formData.classes.filter(id => id !== cls._id)
                                : [...formData.classes, cls._id]
                            })
                          }}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{cls.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Assign Teachers - Searchable selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Teachers</label>
                
                {/* Search box */}
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Search teachers..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                {/* Selected teachers badges */}
                {formData.teachers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.teachers.map(teacherId => {
                      const teacher = teachers.find(t => t._id === teacherId)
                      return teacher ? (
                        <span
                          key={teacherId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                        >
                          {teacher.profile?.firstName} {teacher.profile?.lastName}
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, teachers: formData.teachers.filter(id => id !== teacherId) })}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null
                    })}
                  </div>
                )}

                {/* Teacher list */}
                <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                  {teachers
                    .filter(t => {
                      if (!teacherSearch) return true
                      const name = `${t.profile?.firstName} ${t.profile?.lastName}`.toLowerCase()
                      return name.includes(teacherSearch.toLowerCase())
                    })
                    .map(teacher => {
                      const isSelected = formData.teachers.includes(teacher._id)
                      return (
                        <label
                          key={teacher._id}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setFormData({
                                ...formData,
                                teachers: isSelected
                                  ? formData.teachers.filter(id => id !== teacher._id)
                                  : [...formData.teachers, teacher._id]
                              })
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm text-gray-900">
                              {teacher.profile?.firstName} {teacher.profile?.lastName}
                            </span>
                            {teacher.email && (
                              <span className="text-xs text-gray-500 ml-2">{teacher.email}</span>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  {teachers.filter(t => {
                    if (!teacherSearch) return true
                    const name = `${t.profile?.firstName} ${t.profile?.lastName}`.toLowerCase()
                    return name.includes(teacherSearch.toLowerCase())
                  }).length === 0 && (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      {teacherSearch ? 'No teachers match your search' : 'No teachers available'}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSubject(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Subject Modal */}
      {viewSubject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Subject Details</h2>
              <button
                onClick={() => setViewSubject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                  {viewSubject.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{viewSubject.name}</h3>
                  <p className="text-sm text-gray-500">{viewSubject.code || 'No code'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${TYPE_COLORS[viewSubject.type]}`}>
                    {viewSubject.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Credits</p>
                  <p className="text-sm font-medium text-gray-900">{viewSubject.credits}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Classes Assigned</p>
                  <p className="text-sm font-medium text-gray-900">{viewSubject.classes?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Teachers Assigned</p>
                  <p className="text-sm font-medium text-gray-900">{viewSubject.teachers?.length || 0}</p>
                </div>
              </div>

              {viewSubject.description && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{viewSubject.description}</p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <StatusBadge active={viewSubject.isActive !== false} />
              </div>

              {viewSubject.classes?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Assigned Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {viewSubject.classes.map((cls, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {cls.name || cls}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewSubject.teachers?.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Assigned Teachers</p>
                  <div className="flex flex-wrap gap-2">
                    {viewSubject.teachers.map((teacher, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        {teacher.profile?.firstName ? `${teacher.profile.firstName} ${teacher.profile.lastName}` : teacher}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setViewSubject(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => { handleEdit(viewSubject); setViewSubject(null); }}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Edit Subject
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, subject: null })}
        onConfirm={handleDelete}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deleteDialog.subject?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  )
}
