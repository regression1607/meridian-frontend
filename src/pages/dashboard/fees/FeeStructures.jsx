import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  CreditCard, Plus, Search, Edit, Trash2, X,
  DollarSign, Calendar, Users, CheckCircle
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { TableSkeleton } from '../../../components/ui/Loading'
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
  const [searchQuery, setSearchQuery] = useState('')
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
  }, [])

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

  const filteredStructures = structures.filter(s => {
    if (!searchQuery) return true
    return s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.type.toLowerCase().includes(searchQuery.toLowerCase())
  })

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

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fee structures..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Fee Structures Grid */}
      {loading ? (
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <TableSkeleton rows={4} cols={4} />
        </div>
      ) : filteredStructures.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-100 shadow-sm text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No Fee Structures Found</p>
          <p className="text-sm text-gray-400 mt-1">Create your first fee structure to get started</p>
          <button
            onClick={() => openModal()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Fee Structure
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStructures.map((structure, index) => (
            <motion.div
              key={structure._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{structure.name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{structure.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(structure)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-lg font-bold text-primary-600">{formatCurrency(structure.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Frequency</span>
                  <span className="text-sm font-medium text-gray-700 capitalize">{structure.frequency?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Applicable To</span>
                  <span className="text-sm font-medium text-gray-700 capitalize">{structure.applicableTo}</span>
                </div>
                {structure.lateFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Late Fee</span>
                    <span className="text-sm font-medium text-red-600">{formatCurrency(structure.lateFee)}</span>
                  </div>
                )}
              </div>

              {structure.classes?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Classes:</p>
                  <div className="flex flex-wrap gap-1">
                    {structure.classes.slice(0, 3).map(cls => (
                      <span key={cls._id || cls} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {cls.name || 'Class'}
                      </span>
                    ))}
                    {structure.classes.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        +{structure.classes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
        </div>
      )}
    </div>
  )
}
