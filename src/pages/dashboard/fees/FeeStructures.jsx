import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  CreditCard, Plus, Edit, Trash2, X,
  DollarSign, Calendar, Users, CheckCircle, Eye
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import Pagination from '../../../components/ui/Pagination'
import SearchFilter from '../../../components/ui/SearchFilter'
import DataTable, { ActionButtons } from '../../../components/ui/DataTable'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import { feesApi, classesApi } from '../../../services/api'

const FEE_TYPES = [
  { value: 'tuition', label: 'Tuition Fee' },
  { value: 'admission', label: 'Admission Fee' },
  { value: 'exam', label: 'Exam Fee' },
  { value: 'transport', label: 'Transport Fee' },
  { value: 'hostel', label: 'Hostel Fee' },
  { value: 'library', label: 'Library Fee' },
  { value: 'sports', label: 'Sports Fee' },
  { value: 'lab', label: 'Lab Fee' },
  { value: 'other', label: 'Other' }
]

const FREQUENCY_OPTIONS = [
  { value: 'one_time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'yearly', label: 'Yearly' }
]

export default function FeeStructures() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [structures, setStructures] = useState([])
  const [classes, setClasses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, structure: null })
  const [filters, setFilters] = useState({ search: '', type: 'all', frequency: 'all' })
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 0 })
  const [formData, setFormData] = useState({
    name: '',
    type: 'tuition',
    amount: '',
    frequency: 'monthly',
    applicableTo: 'all',
    classes: [],
    dueDay: 10,
    lateFee: '',
    lateFeeAfterDays: 15,
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
  })

  useEffect(() => {
    fetchStructures()
    fetchClasses()
  }, [filters, pagination.page])

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [filters.search, filters.type, filters.frequency])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleDelete = async () => {
    if (!deleteDialog.structure) return
    try {
      setDeleting(true)
      await feesApi.deleteStructure(deleteDialog.structure._id)
      toast.success('Fee structure deleted successfully')
      setDeleteDialog({ open: false, structure: null })
      fetchStructures()
    } catch (error) {
      toast.error(error.message || 'Failed to delete fee structure')
    } finally {
      setDeleting(false)
    }
  }

  const fetchStructures = async () => {
    try {
      setLoading(true)
      const response = await feesApi.getStructures()
      if (response.success) setStructures(response.data || [])
    } catch (error) {
      console.error('Failed to fetch fee structures:', error)
      toast.error('Failed to load fee structures')
    } finally {
      setLoading(false)
    }
  }

  const fetchClasses = async () => {
    try {
      const response = await classesApi.getAll()
      if (response.success) setClasses(response.data || [])
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const openModal = (structure = null) => {
    if (structure) {
      setEditingId(structure._id)
      setFormData({
        name: structure.name,
        type: structure.type,
        amount: structure.amount,
        frequency: structure.frequency,
        applicableTo: structure.applicableTo,
        classes: structure.classes?.map(c => c._id || c) || [],
        dueDay: structure.dueDay || 10,
        lateFee: structure.lateFee || '',
        lateFeeAfterDays: structure.lateFeeAfterDays || 15,
        academicYear: structure.academicYear || ''
      })
    } else {
      setEditingId(null)
      setFormData({
        name: '',
        type: 'tuition',
        amount: '',
        frequency: 'monthly',
        applicableTo: 'all',
        classes: [],
        dueDay: 10,
        lateFee: '',
        lateFeeAfterDays: 15,
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1)
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        lateFee: formData.lateFee ? parseFloat(formData.lateFee) : 0,
        classes: formData.applicableTo === 'class' ? formData.classes : []
      }

      if (editingId) {
        await feesApi.updateStructure(editingId, payload)
        toast.success('Fee structure updated successfully')
      } else {
        await feesApi.createStructure(payload)
        toast.success('Fee structure created successfully')
      }

      setShowModal(false)
      fetchStructures()
    } catch (error) {
      toast.error(error.message || 'Failed to save fee structure')
    } finally {
      setSaving(false)
    }
  }

  const handleClassToggle = (classId) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter(id => id !== classId)
        : [...prev.classes, classId]
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Client-side filtering
  const filteredStructures = structures.filter(s => {
    const matchesSearch = !filters.search || 
      s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.type.toLowerCase().includes(filters.search.toLowerCase())
    const matchesType = filters.type === 'all' || s.type === filters.type
    const matchesFrequency = filters.frequency === 'all' || s.frequency === filters.frequency
    return matchesSearch && matchesType && matchesFrequency
  })

  // Client-side pagination
  const totalPages = Math.ceil(filteredStructures.length / pagination.limit)
  const paginatedStructures = filteredStructures.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Structures</h1>
          <p className="text-gray-500 mt-1">Manage fee types and amounts for your institution</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Fee Structure
        </button>
      </div>

      {/* Filters */}
      <SearchFilter
        searchValue={filters.search}
        onSearchChange={(value) => handleFilterChange('search', value)}
        searchPlaceholder="Search fee structures..."
        filters={[
          {
            key: 'type',
            value: filters.type,
            options: [
              { value: 'all', label: 'All Types' },
              ...FEE_TYPES
            ]
          },
          {
            key: 'frequency',
            value: filters.frequency,
            options: [
              { value: 'all', label: 'All Frequencies' },
              ...FREQUENCY_OPTIONS
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        onClearFilters={() => setFilters({ search: '', type: 'all', frequency: 'all' })}
      />

      {/* Fee Structures Table */}
      <DataTable
        columns={[
          { header: 'Name', accessor: 'name' },
          { header: 'Type', accessor: 'type' },
          { header: 'Amount', accessor: 'amount' },
          { header: 'Frequency', accessor: 'frequency' },
          { header: 'Applicable To', accessor: 'applicableTo' },
          { header: 'Actions', accessor: 'actions', align: 'right' }
        ]}
        data={paginatedStructures}
        loading={loading}
        emptyMessage="No fee structures found"
        emptyIcon={CreditCard}
        renderRow={(structure) => (
          <>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{structure.name}</p>
                  {structure.lateFee > 0 && (
                    <p className="text-xs text-red-500">Late fee: {formatCurrency(structure.lateFee)}</p>
                  )}
                </div>
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                {structure.type?.replace('_', ' ')}
              </span>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm font-semibold text-primary-600">{formatCurrency(structure.amount)}</span>
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-gray-600 capitalize">{structure.frequency?.replace('_', ' ')}</span>
            </td>
            <td className="px-4 py-3">
              <div>
                <span className="text-sm text-gray-600 capitalize">{structure.applicableTo}</span>
                {structure.classes?.length > 0 && (
                  <p className="text-xs text-gray-400">{structure.classes.length} classes</p>
                )}
              </div>
            </td>
            <td className="px-4 py-3">
              <ActionButtons
                actions={[
                  { icon: Edit, onClick: () => openModal(structure), title: 'Edit' },
                  { icon: Trash2, onClick: () => setDeleteDialog({ open: true, structure }), title: 'Delete', className: 'hover:bg-red-50 text-gray-500 hover:text-red-600' }
                ]}
              />
            </td>
          </>
        )}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={totalPages}
        totalItems={filteredStructures.length}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        itemName="fee structures"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, structure: null })}
        onConfirm={handleDelete}
        title="Delete Fee Structure"
        message={`Are you sure you want to delete "${deleteDialog.structure?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      {/* Add/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Fee Structure' : 'Add Fee Structure'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Tuition Fee"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Type & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {FEE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Frequency & Due Day */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    value={formData.dueDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDay: parseInt(e.target.value) }))}
                    min="1"
                    max="28"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Applicable To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicable To</label>
                <select
                  value={formData.applicableTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicableTo: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Students</option>
                  <option value="class">Specific Classes</option>
                </select>
              </div>

              {/* Class Selection */}
              {formData.applicableTo === 'class' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Classes</label>
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {classes.map(cls => (
                      <label key={cls._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.classes.includes(cls._id)}
                          onChange={() => handleClassToggle(cls._id)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{cls.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Late Fee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={formData.lateFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, lateFee: e.target.value }))}
                      placeholder="0"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee After (Days)</label>
                  <input
                    type="number"
                    value={formData.lateFeeAfterDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, lateFeeAfterDays: parseInt(e.target.value) }))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                  placeholder="e.g., 2025-2026"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> {editingId ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  )
}
