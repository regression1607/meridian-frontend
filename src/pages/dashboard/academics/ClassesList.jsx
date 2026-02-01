import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  GraduationCap, Plus, Edit, Trash2, Eye, Users, Layers, Settings
} from 'lucide-react'
import { classesApi } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Pagination from '../../../components/ui/Pagination'
import SearchFilter from '../../../components/ui/SearchFilter'
import DataTable, { StatusBadge, ActionButtons } from '../../../components/ui/DataTable'

export default function ClassesList() {
  const { user, isPlatformAdmin } = useAuth()
  const [institutionId, setInstitutionId] = useState(user?.institution?._id || user?.institution || null)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 })
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null })
  const [deleting, setDeleting] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState({ name: '', grade: '', maxStudents: 50, sectionNames: ['A'] })
  const [saving, setSaving] = useState(false)
  const [showSectionsModal, setShowSectionsModal] = useState({ open: false, classItem: null })
  const [sectionForm, setSectionForm] = useState({ name: '', room: '', maxStudents: 40 })
  const [editingSection, setEditingSection] = useState(null)

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

  useEffect(() => {
    if (institutionId) {
      fetchClasses()
    }
  }, [institutionId, pagination.page, gradeFilter, statusFilter])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const params = { 
        institution: institutionId,
        page: pagination.page,
        limit: pagination.limit
      }
      if (gradeFilter !== 'all') params.grade = gradeFilter
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active'
      
      const response = await classesApi.getAll(params)
      setClasses(response.data || [])
      if (response.meta) {
        setPagination(prev => ({ ...prev, ...response.meta }))
      }
    } catch (error) {
      toast.error(error.message || 'Failed to fetch classes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingClass) {
        await classesApi.update(editingClass._id, { ...formData, institution: institutionId })
        toast.success('Class updated successfully')
      } else {
        await classesApi.create({ ...formData, institution: institutionId })
        toast.success('Class created successfully')
      }
      setShowAddModal(false)
      setEditingClass(null)
      resetForm()
      fetchClasses()
    } catch (error) {
      toast.error(error.message || 'Failed to save class')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (classItem) => {
    setEditingClass(classItem)
    setFormData({
      name: classItem.name,
      grade: classItem.grade?.toString() || '',
      maxStudents: classItem.maxStudents || 50,
      sectionNames: classItem.sections?.map(s => s.name) || ['A']
    })
    setShowAddModal(true)
  }

  const handleDelete = async () => {
    if (!deleteDialog.item) return
    setDeleting(true)
    try {
      await classesApi.delete(deleteDialog.item._id, { institution: institutionId })
      toast.success('Class deleted successfully')
      setDeleteDialog({ open: false, item: null })
      fetchClasses()
    } catch (error) {
      toast.error(error.message || 'Failed to delete class')
    } finally {
      setDeleting(false)
    }
  }

  const handleCreateSection = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingSection) {
        await classesApi.updateSection(editingSection._id, { ...sectionForm, institution: institutionId })
        toast.success('Section updated successfully')
      } else {
        await classesApi.createSection(showSectionsModal.classItem._id, { ...sectionForm, institution: institutionId })
        toast.success('Section created successfully')
      }
      setSectionForm({ name: '', room: '', maxStudents: 40 })
      setEditingSection(null)
      fetchClasses()
    } catch (error) {
      toast.error(error.message || 'Failed to save section')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return
    try {
      await classesApi.deleteSection(sectionId, { institution: institutionId })
      toast.success('Section deleted successfully')
      fetchClasses()
    } catch (error) {
      toast.error(error.message || 'Failed to delete section')
    }
  }

  const handleEditSection = (section) => {
    setEditingSection(section)
    setSectionForm({
      name: section.name,
      room: section.room || '',
      maxStudents: section.maxStudents || 40
    })
  }

  const resetForm = () => {
    setFormData({ name: '', grade: '', maxStudents: 50, sectionNames: ['A'] })
  }

  const resetSectionForm = () => {
    setSectionForm({ name: '', room: '', maxStudents: 40 })
    setEditingSection(null)
  }

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: pagination.total || classes.length,
    sections: classes.reduce((sum, c) => sum + (c.sections?.length || 0), 0),
    students: classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)
  }

  const columns = [
    { header: 'Class', accessor: 'name' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'Sections', accessor: 'sections' },
    { header: 'Students', accessor: 'students' },
    { header: 'Max Capacity', accessor: 'maxStudents' },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions', align: 'right' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes & Sections</h1>
          <p className="text-gray-500 mt-1">Manage academic classes and sections</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingClass(null); setShowAddModal(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Classes</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.sections}</p>
              <p className="text-xs text-gray-500">Total Sections</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
              <p className="text-xs text-gray-500">Total Students</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search classes..."
        filters={[
          {
            key: 'grade',
            value: gradeFilter,
            options: [
              { value: 'all', label: 'All Grades' },
              ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Grade ${i + 1}` }))
            ]
          },
          {
            key: 'status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ]}
        onFilterChange={(key, value) => {
          if (key === 'grade') setGradeFilter(value)
          if (key === 'status') setStatusFilter(value)
        }}
        onClearFilters={() => {
          setSearch('')
          setGradeFilter('all')
          setStatusFilter('all')
        }}
      />

      {/* Classes Table */}
      <DataTable
        columns={columns}
        data={filteredClasses}
        loading={loading}
        emptyMessage="No classes found"
        emptyIcon={GraduationCap}
        renderRow={(classItem) => (
          <>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                  {classItem.grade || classItem.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{classItem.name}</p>
                  <p className="text-xs text-gray-500">{classItem.academicYear || 'Current Year'}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-gray-600">
                {classItem.grade ? `Grade ${classItem.grade}` : '-'}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-900">{classItem.sections?.length || 0}</span>
                <span className="text-xs text-gray-500">
                  ({classItem.sections?.map(s => s.name).join(', ') || 'None'})
                </span>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-gray-600">{classItem.studentCount || 0}</span>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-gray-600">{classItem.maxStudents || 50}</span>
            </td>
            <td className="px-4 py-3">
              <StatusBadge active={classItem.isActive !== false} />
            </td>
            <td className="px-4 py-3">
              <ActionButtons
                actions={[
                  { icon: Settings, onClick: () => setShowSectionsModal({ open: true, classItem }), title: 'Manage Sections', className: 'hover:bg-blue-50 text-gray-500 hover:text-blue-600' },
                  { icon: Edit, onClick: () => handleEdit(classItem), title: 'Edit' },
                  { icon: Trash2, onClick: () => setDeleteDialog({ open: true, item: classItem }), title: 'Delete', className: 'hover:bg-red-50 text-gray-500 hover:text-red-600' }
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
        itemName="classes"
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Class 10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select Grade</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
                <input
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  min="1"
                />
              </div>
              {!editingClass && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Sections</label>
                  <input
                    type="text"
                    value={formData.sectionNames.join(', ')}
                    onChange={(e) => setFormData({ ...formData, sectionNames: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="A, B, C"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated section names</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingClass(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingClass ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Manage Sections Modal */}
      {showSectionsModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Sections - {showSectionsModal.classItem?.name}
              </h2>
              <button
                onClick={() => { setShowSectionsModal({ open: false, classItem: null }); resetSectionForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Add Section Form */}
            <form onSubmit={handleCreateSection} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {editingSection ? 'Edit Section' : 'Add New Section'}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Section Name</label>
                  <input
                    type="text"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., A, B, C"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={sectionForm.room}
                    onChange={(e) => setSectionForm({ ...sectionForm, room: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., 101"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Students</label>
                  <input
                    type="number"
                    value={sectionForm.maxStudents}
                    onChange={(e) => setSectionForm({ ...sectionForm, maxStudents: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {editingSection && (
                  <button
                    type="button"
                    onClick={resetSectionForm}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingSection ? 'Update Section' : 'Add Section'}
                </button>
              </div>
            </form>

            {/* Existing Sections List */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Existing Sections</h3>
              {showSectionsModal.classItem?.sections?.length > 0 ? (
                <div className="space-y-2">
                  {showSectionsModal.classItem.sections.map((section) => (
                    <div
                      key={section._id}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">Section {section.name}</span>
                          {editingSection?._id === section._id && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Editing</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Room: {section.room || 'N/A'} • Max Students: {section.maxStudents || 40}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditSection(section)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Layers className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No sections yet. Add your first section above.</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => { setShowSectionsModal({ open: false, classItem: null }); resetSectionForm(); }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Class"
        message={`Are you sure you want to delete "${deleteDialog.item?.name}"? This will also delete all associated sections. This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  )
}
