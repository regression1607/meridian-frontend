import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  Building, Plus, Eye, Edit, Trash2,
  Download, Upload, GraduationCap, Users, Crown
} from 'lucide-react'
import { InstitutionPreviewModal } from '../../../components/ui/PreviewModal'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import Pagination from '../../../components/ui/Pagination'
import SearchFilter from '../../../components/ui/SearchFilter'
import DataTable, { StatusBadge, ActionButtons, DateCell } from '../../../components/ui/DataTable'
import {
  fetchInstitutions,
  deleteInstitution,
  setFilters,
  setPage,
  toggleSelectInstitution,
  toggleSelectAll
} from '../../../store/slices/institutionsSlice'

const TYPE_LABELS = {
  preschool: 'Preschool',
  primary: 'Primary',
  middle: 'Middle School',
  secondary: 'Secondary',
  higher_secondary: 'Higher Secondary',
  college: 'College',
  university: 'University',
  coaching: 'Coaching Center',
  vocational: 'Vocational',
  special_education: 'Special Education',
  international: 'International',
  online: 'Online Academy'
}

const TYPE_COLORS = {
  preschool: 'bg-pink-100 text-pink-700',
  primary: 'bg-blue-100 text-blue-700',
  middle: 'bg-indigo-100 text-indigo-700',
  secondary: 'bg-purple-100 text-purple-700',
  higher_secondary: 'bg-violet-100 text-violet-700',
  college: 'bg-cyan-100 text-cyan-700',
  university: 'bg-teal-100 text-teal-700',
  coaching: 'bg-orange-100 text-orange-700',
  vocational: 'bg-amber-100 text-amber-700',
  special_education: 'bg-rose-100 text-rose-700',
  international: 'bg-emerald-100 text-emerald-700',
  online: 'bg-sky-100 text-sky-700'
}

const PLAN_COLORS = {
  free: 'bg-gray-100 text-gray-700',
  trial: 'bg-blue-100 text-blue-700',
  basic: 'bg-green-100 text-green-700',
  standard: 'bg-purple-100 text-purple-700',
  premium: 'bg-amber-100 text-amber-700',
  enterprise: 'bg-red-100 text-red-700'
}

export default function InstitutionsList() {
  const dispatch = useDispatch()
  
  // Redux state
  const { 
    institutions, 
    loading, 
    stats, 
    pagination, 
    filters, 
    selectedInstitutions,
    error 
  } = useSelector((state) => state.institutions)

  // Local state for UI
  const [previewInstitution, setPreviewInstitution] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, institution: null })
  const [deleting, setDeleting] = useState(false)

  // Fetch institutions on mount and when filters/page change
  useEffect(() => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.type !== 'all' && { type: filters.type }),
      ...(filters.search && { search: filters.search }),
      ...(filters.status !== 'all' && { isActive: filters.status === 'active' }),
      ...(filters.plan !== 'all' && { plan: filters.plan })
    }
    dispatch(fetchInstitutions(params))
  }, [dispatch, pagination.page, filters])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }))
  }

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage))
  }

  const handleDeleteInstitution = async () => {
    if (!deleteDialog.institution) return
    
    setDeleting(true)
    try {
      await dispatch(deleteInstitution(deleteDialog.institution._id)).unwrap()
      toast.success(`${deleteDialog.institution.name} deleted successfully`)
      setDeleteDialog({ open: false, institution: null })
    } catch (err) {
      toast.error(err || 'Failed to delete institution')
    } finally {
      setDeleting(false)
    }
  }

  // Filter institutions locally for search (in addition to server-side)
  const filteredInstitutions = institutions

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institution Management</h1>
          <p className="text-gray-500 mt-1">Manage all institutions on the platform</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link
            to="/dashboard/institutions/add"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Institution
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Institutions</p>
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
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">Active</p>
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
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.premium}</p>
              <p className="text-xs text-gray-500">Premium</p>
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
            <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.free}</p>
              <p className="text-xs text-gray-500">Free</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <SearchFilter
        searchValue={filters.search}
        onSearchChange={(value) => handleFilterChange('search', value)}
        searchPlaceholder="Search institutions..."
        filters={[
          {
            key: 'type',
            value: filters.type,
            options: [
              { value: 'all', label: 'All Types' },
              { value: 'preschool', label: 'Preschool' },
              { value: 'primary', label: 'Primary' },
              { value: 'middle', label: 'Middle School' },
              { value: 'secondary', label: 'Secondary' },
              { value: 'higher_secondary', label: 'Higher Secondary' },
              { value: 'college', label: 'College' },
              { value: 'university', label: 'University' },
              { value: 'coaching', label: 'Coaching Center' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        extendedFilters={[
          {
            key: 'plan',
            label: 'Plan',
            type: 'select',
            value: filters.plan,
            options: [
              { value: 'all', label: 'All Plans' },
              { value: 'free', label: 'Free' },
              { value: 'trial', label: 'Trial' },
              { value: 'basic', label: 'Basic' },
              { value: 'standard', label: 'Standard' },
              { value: 'premium', label: 'Premium' },
              { value: 'enterprise', label: 'Enterprise' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            type: 'select',
            value: filters.status,
            options: [
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ]}
        onClearFilters={() => {
          dispatch(setFilters({ search: '', type: 'all', plan: 'all', status: 'all' }))
        }}
      />

      {/* Institutions Table */}
      <DataTable
        columns={[
          { header: 'Institution', accessor: 'name' },
          { header: 'Type', accessor: 'type' },
          { header: 'Contact', accessor: 'contact' },
          { header: 'Plan', accessor: 'plan' },
          { header: 'Status', accessor: 'status' },
          { header: 'Created', accessor: 'created' },
          { header: 'Actions', accessor: 'actions', align: 'right' }
        ]}
        data={filteredInstitutions}
        loading={loading}
        emptyMessage="No institutions found"
        emptyIcon={Building}
        selectable={true}
        selectedItems={selectedInstitutions}
        onSelectAll={() => dispatch(toggleSelectAll())}
        onSelectItem={(id) => dispatch(toggleSelectInstitution(id))}
        renderRow={(institution) => {
          const initial = institution.name.charAt(0).toUpperCase()
          
          return (
            <>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{institution.name}</p>
                    <p className="text-xs text-gray-500">{institution.code}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[institution.type] || 'bg-gray-100 text-gray-700'}`}>
                  {TYPE_LABELS[institution.type] || institution.type}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm">
                  <p className="text-gray-900">{institution.email}</p>
                  <p className="text-xs text-gray-500">{institution.phone}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${PLAN_COLORS[institution.subscription?.plan] || 'bg-gray-100 text-gray-700'}`}>
                  {institution.subscription?.plan || 'Free'}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge active={institution.isActive} />
              </td>
              <td className="px-4 py-3">
                <DateCell date={institution.createdAt} />
              </td>
              <td className="px-4 py-3">
                <ActionButtons
                  actions={[
                    { icon: Eye, onClick: () => setPreviewInstitution(institution), title: 'Quick View' },
                    { icon: Edit, to: `/dashboard/institutions/${institution._id}`, title: 'Edit' },
                    { icon: Trash2, onClick: () => setDeleteDialog({ open: true, institution }), title: 'Delete', className: 'hover:bg-red-50 text-gray-500 hover:text-red-600' }
                  ]}
                />
              </td>
            </>
          )
        }}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={handlePageChange}
        itemName="institutions"
      />

      {/* Institution Preview Modal */}
      <InstitutionPreviewModal 
        institution={previewInstitution}
        isOpen={!!previewInstitution}
        onClose={() => setPreviewInstitution(null)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, institution: null })}
        onConfirm={handleDeleteInstitution}
        title="Delete Institution"
        message={`Are you sure you want to delete ${deleteDialog.institution?.name}? This will remove all associated data. This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />
    </div>
  )
}
