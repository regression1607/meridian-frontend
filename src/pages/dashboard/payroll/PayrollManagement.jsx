import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Wallet, Users, FileText, Gift, CreditCard, TrendingUp,
  Plus, Search, Edit2, Trash2, Eye, X, Check, DollarSign, Download, Printer
} from 'lucide-react'
import { payrollApi, usersApi } from '../../../services/api'
import DataTable from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'
import { UserSearchSelect } from '../../../components/ui/SearchableSelect'

const TABS = [
  { id: 'structures', label: 'Salary Structures', icon: TrendingUp },
  { id: 'salaries', label: 'Employee Salaries', icon: Users },
  { id: 'payslips', label: 'Payslips', icon: FileText },
  { id: 'bonuses', label: 'Bonuses', icon: Gift },
  { id: 'advances', label: 'Advances/Loans', icon: CreditCard }
]

const MONTHS = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' }, { value: 4, label: 'April' },
  { value: 5, label: 'May' }, { value: 6, label: 'June' },
  { value: 7, label: 'July' }, { value: 8, label: 'August' },
  { value: 9, label: 'September' }, { value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' }
]

export default function PayrollManagement() {
  const [activeTab, setActiveTab] = useState('structures')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [data, setData] = useState([])
  const [employees, setEmployees] = useState([])
  const [structures, setStructures] = useState([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  useEffect(() => {
    fetchStats()
    loadEmployees()
    fetchStructures()
  }, [])

  useEffect(() => {
    fetchData()
  }, [activeTab, pagination.page, searchTerm, selectedMonth, selectedYear])

  const fetchStats = async () => {
    try {
      const res = await payrollApi.getStats()
      if (res.success) setStats(res.data || {})
    } catch (err) { console.error(err) }
  }

  const loadEmployees = async () => {
    setLoadingEmployees(true)
    try {
      // Fetch teachers, staff, and coordinators separately and combine
      const [teachersRes, staffRes, coordinatorsRes] = await Promise.all([
        usersApi.getAll({ role: 'teacher', limit: 100 }),
        usersApi.getAll({ role: 'staff', limit: 100 }),
        usersApi.getAll({ role: 'coordinator', limit: 100 })
      ])
      const allEmployees = [
        ...(teachersRes.success ? teachersRes.data || [] : []),
        ...(staffRes.success ? staffRes.data || [] : []),
        ...(coordinatorsRes.success ? coordinatorsRes.data || [] : [])
      ]
      setEmployees(allEmployees)
    } catch (err) { console.error(err) }
    setLoadingEmployees(false)
  }

  const fetchStructures = async () => {
    try {
      const res = await payrollApi.getStructures({ limit: 100 })
      if (res.success) setStructures(res.data || [])
    } catch (err) { console.error(err) }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      let res
      const params = { page: pagination.page, limit: 10, search: searchTerm }
      if (activeTab === 'structures') res = await payrollApi.getStructures(params)
      else if (activeTab === 'salaries') res = await payrollApi.getSalaries(params)
      else if (activeTab === 'payslips') res = await payrollApi.getPayslips({ ...params, month: selectedMonth, year: selectedYear })
      else if (activeTab === 'bonuses') res = await payrollApi.getBonuses(params)
      else if (activeTab === 'advances') res = await payrollApi.getAdvances(params)
      if (res?.success) {
        setData(res.data || [])
        if (res.meta) setPagination(p => ({ ...p, ...res.meta }))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const handleSave = async (formData) => {
    try {
      if (activeTab === 'structures') {
        if (editingItem) await payrollApi.updateStructure(editingItem._id, formData)
        else await payrollApi.createStructure(formData)
        fetchStructures() // Refresh structures for dropdown
      } else if (activeTab === 'salaries') {
        await payrollApi.assignSalary(formData)
      } else if (activeTab === 'payslips') {
        await payrollApi.generatePayslip(formData)
      } else if (activeTab === 'bonuses') {
        await payrollApi.createBonus(formData)
      } else if (activeTab === 'advances') {
        await payrollApi.createAdvance(formData)
      }
      toast.success('Saved successfully')
      setShowModal(false)
      setEditingItem(null)
      setPagination(p => ({ ...p, page: 1 })) // Reset to page 1 to see new item
      setTimeout(() => fetchData(), 100) // Small delay to ensure state updates
      fetchStats()
    } catch (err) { toast.error(err.message || 'Failed to save') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return
    try {
      await payrollApi.deleteStructure(id)
      toast.success('Deleted')
      fetchData()
    } catch (err) { toast.error(err.message) }
  }

  const handleApprove = async (id) => {
    try {
      if (activeTab === 'payslips') await payrollApi.approvePayslip(id)
      else if (activeTab === 'bonuses') await payrollApi.approveBonus(id, true)
      else if (activeTab === 'advances') await payrollApi.approveAdvance(id, true)
      toast.success('Approved')
      fetchData()
    } catch (err) { toast.error(err.message) }
  }

  const handleMarkPaid = async (id) => {
    try {
      await payrollApi.markPayslipPaid(id, { method: 'bank_transfer' })
      toast.success('Marked as paid')
      fetchData()
      fetchStats()
    } catch (err) { toast.error(err.message) }
  }

  const formatCurrency = (amt) => `₹${(amt || 0).toLocaleString()}`

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-500">Manage salaries, payslips, bonuses and advances</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'structures' ? 'Add Structure' : activeTab === 'salaries' ? 'Assign Salary' : activeTab === 'payslips' ? 'Generate Payslip' : activeTab === 'bonuses' ? 'Add Bonus' : 'New Request'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Employees" value={stats.totalEmployees || 0} color="blue" />
        <StatCard icon={Wallet} label="Configured" value={stats.configuredSalaries || 0} color="green" />
        <StatCard icon={FileText} label="Paid This Month" value={stats.currentMonth?.paid || 0} color="purple" />
        <StatCard icon={DollarSign} label="Total Paid" value={formatCurrency(stats.currentMonth?.totalPaid)} color="emerald" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPagination({ page: 1, totalPages: 1 }); setSearchTerm('') }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
          {['structures', 'salaries'].includes(activeTab) && (
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          )}
          {activeTab === 'payslips' && (
            <>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg">
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 border rounded-lg">
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}
        </div>

        <div className="p-4">
          {activeTab === 'structures' && <StructuresTable data={data} loading={loading} onEdit={(item) => { setEditingItem(item); setShowModal(true) }} onDelete={handleDelete} />}
          {activeTab === 'salaries' && <SalariesTable data={data} loading={loading} />}
          {activeTab === 'payslips' && <PayslipsTable data={data} loading={loading} onApprove={handleApprove} onMarkPaid={handleMarkPaid} onViewPdf={(p) => { setSelectedPayslip(p); setShowPdfModal(true) }} />}
          {activeTab === 'bonuses' && <BonusesTable data={data} loading={loading} onApprove={handleApprove} />}
          {activeTab === 'advances' && <AdvancesTable data={data} loading={loading} onApprove={handleApprove} />}
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t"><Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => setPagination(p => ({ ...p, page }))} /></div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingItem(null) }} onSave={handleSave} type={activeTab} item={editingItem} employees={employees} structures={structures} loadingEmployees={loadingEmployees} />
      <PayslipPDFModal isOpen={showPdfModal} onClose={() => { setShowPdfModal(false); setSelectedPayslip(null) }} payslip={selectedPayslip} />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', emerald: 'bg-emerald-50 text-emerald-600' }
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function StructuresTable({ data, loading, onEdit, onDelete }) {
  return (
    <DataTable columns={[{ header: 'Name', key: 'name' }, { header: 'Code', key: 'code' }, { header: 'Gross', key: 'gross' }, { header: 'Net', key: 'net' }, { header: 'Actions', key: 'actions' }]} data={data} loading={loading} emptyMessage="No structures found"
      renderRow={(item) => (
        <>
          <td className="px-4 py-3 font-medium">{item.name}</td>
          <td className="px-4 py-3 text-gray-600">{item.code}</td>
          <td className="px-4 py-3">₹{(item.grossSalary || 0).toLocaleString()}</td>
          <td className="px-4 py-3 text-green-600 font-medium">₹{(item.netSalary || 0).toLocaleString()}</td>
          <td className="px-4 py-3 flex gap-1">
            <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4 text-gray-400" /></button>
            <button onClick={() => onDelete(item._id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-gray-400" /></button>
          </td>
        </>
      )}
    />
  )
}

function SalariesTable({ data, loading }) {
  return (
    <DataTable columns={[{ header: 'Employee', key: 'emp' }, { header: 'Role', key: 'role' }, { header: 'Gross', key: 'gross' }, { header: 'Net', key: 'net' }, { header: 'Status', key: 'status' }]} data={data} loading={loading} emptyMessage="No salaries configured"
      renderRow={(item) => (
        <>
          <td className="px-4 py-3"><p className="font-medium">{item.employee?.profile?.firstName} {item.employee?.profile?.lastName}</p><p className="text-xs text-gray-500">{item.employee?.email}</p></td>
          <td className="px-4 py-3 capitalize">{item.employee?.role}</td>
          <td className="px-4 py-3">₹{(item.grossSalary || 0).toLocaleString()}</td>
          <td className="px-4 py-3 text-green-600 font-medium">₹{(item.netSalary || 0).toLocaleString()}</td>
          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{item.status}</span></td>
        </>
      )}
    />
  )
}

function PayslipsTable({ data, loading, onApprove, onMarkPaid, onViewPdf }) {
  return (
    <DataTable columns={[{ header: 'Employee', key: 'emp' }, { header: 'Payslip #', key: 'num' }, { header: 'Period', key: 'period' }, { header: 'Net', key: 'net' }, { header: 'Status', key: 'status' }, { header: 'Actions', key: 'actions' }]} data={data} loading={loading} emptyMessage="No payslips found"
      renderRow={(item) => (
        <>
          <td className="px-4 py-3 font-medium">{item.employee?.profile?.firstName} {item.employee?.profile?.lastName}</td>
          <td className="px-4 py-3">{item.payslipNumber}</td>
          <td className="px-4 py-3">{MONTHS.find(m => m.value === item.month)?.label} {item.year}</td>
          <td className="px-4 py-3 text-green-600 font-medium">₹{(item.netSalary || 0).toLocaleString()}</td>
          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${item.status === 'paid' ? 'bg-green-100 text-green-700' : item.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
          <td className="px-4 py-3 flex gap-1">
            {item.status === 'generated' && <button onClick={() => onApprove(item._id)} className="p-1.5 hover:bg-green-50 rounded" title="Approve"><Check className="w-4 h-4 text-gray-400" /></button>}
            {item.status === 'approved' && <button onClick={() => onMarkPaid(item._id)} className="p-1.5 hover:bg-emerald-50 rounded" title="Mark Paid"><DollarSign className="w-4 h-4 text-gray-400" /></button>}
            {item.status === 'paid' && <button onClick={() => onViewPdf(item)} className="p-1.5 hover:bg-blue-50 rounded" title="View/Download PDF"><Eye className="w-4 h-4 text-blue-500" /></button>}
          </td>
        </>
      )}
    />
  )
}

function BonusesTable({ data, loading, onApprove }) {
  return (
    <DataTable columns={[{ header: 'Employee', key: 'emp' }, { header: 'Type', key: 'type' }, { header: 'Amount', key: 'amt' }, { header: 'Status', key: 'status' }, { header: 'Actions', key: 'actions' }]} data={data} loading={loading} emptyMessage="No bonuses found"
      renderRow={(item) => (
        <>
          <td className="px-4 py-3 font-medium">{item.employee?.profile?.firstName} {item.employee?.profile?.lastName}</td>
          <td className="px-4 py-3 capitalize">{item.type}</td>
          <td className="px-4 py-3 text-green-600">₹{(item.amount || 0).toLocaleString()}</td>
          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${item.status === 'paid' ? 'bg-green-100 text-green-700' : item.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
          <td className="px-4 py-3">{item.status === 'pending' && <button onClick={() => onApprove(item._id)} className="p-1.5 hover:bg-green-50 rounded"><Check className="w-4 h-4 text-gray-400" /></button>}</td>
        </>
      )}
    />
  )
}

function AdvancesTable({ data, loading, onApprove }) {
  return (
    <DataTable columns={[{ header: 'Employee', key: 'emp' }, { header: 'Type', key: 'type' }, { header: 'Amount', key: 'amt' }, { header: 'Remaining', key: 'rem' }, { header: 'Status', key: 'status' }, { header: 'Actions', key: 'actions' }]} data={data} loading={loading} emptyMessage="No advances found"
      renderRow={(item) => (
        <>
          <td className="px-4 py-3 font-medium">{item.employee?.profile?.firstName} {item.employee?.profile?.lastName}</td>
          <td className="px-4 py-3 capitalize">{item.type}</td>
          <td className="px-4 py-3">₹{(item.amount || 0).toLocaleString()}</td>
          <td className="px-4 py-3 text-orange-600">₹{(item.remainingAmount || 0).toLocaleString()}</td>
          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${item.status === 'completed' ? 'bg-green-100 text-green-700' : item.status === 'repaying' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
          <td className="px-4 py-3">{item.status === 'pending' && <button onClick={() => onApprove(item._id)} className="p-1.5 hover:bg-green-50 rounded"><Check className="w-4 h-4 text-gray-400" /></button>}</td>
        </>
      )}
    />
  )
}

function Modal({ isOpen, onClose, onSave, type, item, employees, structures, loadingEmployees }) {
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (type === 'structures') {
      setFormData(item || { name: '', code: '', components: { basic: 0, hra: 0, da: 0, ta: 0, medical: 0, special: 0, other: 0 }, deductions: { pf: 0, esi: 0, tax: 0, other: 0 } })
    } else if (type === 'salaries') {
      setFormData({ employeeId: '', salaryStructureId: '' })
    } else if (type === 'payslips') {
      setFormData({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), workingDays: { total: 30, present: 30 } })
    } else if (type === 'bonuses') {
      setFormData({ employee: '', type: 'performance', amount: 0, reason: '' })
    } else if (type === 'advances') {
      setFormData({ employee: '', type: 'advance', amount: 0, reason: '', emiAmount: 0, totalInstallments: 1 })
    }
  }, [type, item, isOpen])

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData) }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{item ? 'Edit' : 'Add'} {type === 'structures' ? 'Structure' : type === 'salaries' ? 'Salary' : type === 'payslips' ? 'Payslip' : type === 'bonuses' ? 'Bonus' : 'Advance'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {type === 'structures' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="block text-sm font-medium mb-1">Code *</label><input type="text" value={formData.code || ''} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <h3 className="font-medium">Earnings</h3>
              <div className="grid grid-cols-4 gap-2">
                {formData.components && Object.keys(formData.components).map(key => (
                  <div key={key}><label className="block text-xs capitalize">{key}</label><input type="number" value={formData.components[key] || 0} onChange={(e) => setFormData({ ...formData, components: { ...formData.components, [key]: Number(e.target.value) } })} className="w-full px-2 py-1 border rounded text-sm" /></div>
                ))}
              </div>
              <h3 className="font-medium">Deductions</h3>
              <div className="grid grid-cols-4 gap-2">
                {formData.deductions && Object.keys(formData.deductions).map(key => (
                  <div key={key}><label className="block text-xs uppercase">{key}</label><input type="number" value={formData.deductions[key] || 0} onChange={(e) => setFormData({ ...formData, deductions: { ...formData.deductions, [key]: Number(e.target.value) } })} className="w-full px-2 py-1 border rounded text-sm" /></div>
                ))}
              </div>
            </>
          )}
          {type === 'salaries' && (
            <>
              <div><label className="block text-sm font-medium mb-1">Employee *</label><UserSearchSelect users={employees} value={formData.employeeId} onChange={(v) => setFormData({ ...formData, employeeId: v })} loading={loadingEmployees} placeholder="Search employee..." /></div>
              <div><label className="block text-sm font-medium mb-1">Salary Structure</label><select value={formData.salaryStructureId || ''} onChange={(e) => setFormData({ ...formData, salaryStructureId: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="">Custom</option>{structures.map(s => <option key={s._id} value={s._id}>{s.name} - ₹{s.netSalary?.toLocaleString()}</option>)}</select></div>
            </>
          )}
          {type === 'payslips' && (
            <>
              <div><label className="block text-sm font-medium mb-1">Employee *</label><UserSearchSelect users={employees} value={formData.employeeId} onChange={(v) => setFormData({ ...formData, employeeId: v })} loading={loadingEmployees} placeholder="Search employee..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Month</label><select value={formData.month} onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg">{MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Year</label><select value={formData.year} onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full px-3 py-2 border rounded-lg">{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              </div>
            </>
          )}
          {type === 'bonuses' && (
            <>
              <div><label className="block text-sm font-medium mb-1">Employee *</label><UserSearchSelect users={employees} value={formData.employee} onChange={(v) => setFormData({ ...formData, employee: v })} loading={loadingEmployees} placeholder="Search employee..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="performance">Performance</option><option value="festival">Festival</option><option value="annual">Annual</option><option value="special">Special</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Amount *</label><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
            </>
          )}
          {type === 'advances' && (
            <>
              <div><label className="block text-sm font-medium mb-1">Employee *</label><UserSearchSelect users={employees} value={formData.employee} onChange={(v) => setFormData({ ...formData, employee: v })} loading={loadingEmployees} placeholder="Search employee..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="advance">Advance</option><option value="loan">Loan</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Amount *</label><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              {formData.type === 'loan' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1">EMI</label><input type="number" value={formData.emiAmount} onChange={(e) => setFormData({ ...formData, emiAmount: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border rounded-lg" /></div>
                  <div><label className="block text-sm font-medium mb-1">Installments</label><input type="number" value={formData.totalInstallments} onChange={(e) => setFormData({ ...formData, totalInstallments: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 border rounded-lg" /></div>
                </div>
              )}
            </>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function PayslipPDFModal({ isOpen, onClose, payslip }) {
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Your Institution Name',
    address: 'Address Line 1, City, State - PIN',
    gstNumber: '',
    panNumber: '',
    phone: '',
    email: ''
  })
  const printRef = useRef()

  useEffect(() => {
    // Load saved company info from localStorage
    const saved = localStorage.getItem('payslipCompanyInfo')
    if (saved) setCompanyInfo(JSON.parse(saved))
  }, [])

  const handleCompanyInfoChange = (field, value) => {
    const updated = { ...companyInfo, [field]: value }
    setCompanyInfo(updated)
    localStorage.setItem('payslipCompanyInfo', JSON.stringify(updated))
  }

  const handlePrint = () => {
    const content = printRef.current
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${payslip?.payslipNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; color: #666; font-size: 12px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-box { background: #f9f9f9; padding: 10px; border-radius: 5px; }
            .info-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .info-box p { margin: 3px 0; font-size: 12px; }
            .info-box strong { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border: 1px solid #ddd; font-size: 12px; }
            th { background: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .total-row { background: #e8f5e9; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #666; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleDownload = () => {
    handlePrint()
  }

  if (!isOpen || !payslip) return null

  const emp = payslip.employee || {}
  const earnings = payslip.earnings || {}
  const deductions = payslip.deductions || {}
  const totalEarnings = Object.values(earnings).reduce((a, b) => a + (b || 0), 0)
  const totalDeductions = Object.values(deductions).reduce((a, b) => a + (b || 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold">Payslip - {payslip.payslipNumber}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Printer className="w-4 h-4" />Print</button>
            <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Download className="w-4 h-4" />Download</button>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Editable Company Info */}
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Company Details (Editable - saved locally)</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs text-gray-500">Company Name</label><input type="text" value={companyInfo.name} onChange={(e) => handleCompanyInfoChange('name', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" /></div>
            <div><label className="block text-xs text-gray-500">GST Number</label><input type="text" value={companyInfo.gstNumber} onChange={(e) => handleCompanyInfoChange('gstNumber', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" placeholder="22AAAAA0000A1Z5" /></div>
            <div><label className="block text-xs text-gray-500">PAN Number</label><input type="text" value={companyInfo.panNumber} onChange={(e) => handleCompanyInfoChange('panNumber', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" placeholder="AAAAA0000A" /></div>
            <div className="col-span-2"><label className="block text-xs text-gray-500">Address</label><input type="text" value={companyInfo.address} onChange={(e) => handleCompanyInfoChange('address', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" /></div>
            <div><label className="block text-xs text-gray-500">Phone</label><input type="text" value={companyInfo.phone} onChange={(e) => handleCompanyInfoChange('phone', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" /></div>
          </div>
        </div>

        {/* PDF Preview */}
        <div ref={printRef} className="p-6">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{companyInfo.name}</h1>
            <p className="text-gray-600 text-sm">{companyInfo.address}</p>
            {companyInfo.gstNumber && <p className="text-gray-600 text-sm">GSTIN: {companyInfo.gstNumber}</p>}
            {companyInfo.panNumber && <p className="text-gray-600 text-sm">PAN: {companyInfo.panNumber}</p>}
            <h2 className="text-lg font-semibold mt-4 text-gray-700">PAYSLIP FOR {MONTHS.find(m => m.value === payslip.month)?.label?.toUpperCase()} {payslip.year}</h2>
          </div>

          {/* Employee & Payment Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 border-b pb-2 mb-2">Employee Details</h3>
              <p className="text-sm"><strong>Name:</strong> {emp.profile?.firstName} {emp.profile?.lastName}</p>
              <p className="text-sm"><strong>Email:</strong> {emp.email}</p>
              <p className="text-sm"><strong>Role:</strong> <span className="capitalize">{emp.role}</span></p>
              <p className="text-sm"><strong>Payslip No:</strong> {payslip.payslipNumber}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 border-b pb-2 mb-2">Payment Details</h3>
              <p className="text-sm"><strong>Pay Period:</strong> {MONTHS.find(m => m.value === payslip.month)?.label} {payslip.year}</p>
              <p className="text-sm"><strong>Payment Date:</strong> {payslip.payment?.paidAt ? new Date(payslip.payment.paidAt).toLocaleDateString() : '-'}</p>
              <p className="text-sm"><strong>Payment Method:</strong> <span className="capitalize">{payslip.payment?.method || 'Bank Transfer'}</span></p>
              <p className="text-sm"><strong>Working Days:</strong> {payslip.workingDays?.present || 0} / {payslip.workingDays?.total || 30}</p>
            </div>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <table className="w-full border-collapse border">
                <thead><tr className="bg-green-50"><th colSpan="2" className="border p-2 text-left text-green-700">Earnings</th></tr></thead>
                <tbody>
                  {Object.entries(earnings).map(([key, val]) => val > 0 && (
                    <tr key={key}><td className="border p-2 capitalize text-sm">{key}</td><td className="border p-2 text-right text-sm">₹{val.toLocaleString()}</td></tr>
                  ))}
                  {payslip.bonus > 0 && <tr><td className="border p-2 text-sm">Bonus</td><td className="border p-2 text-right text-sm">₹{payslip.bonus.toLocaleString()}</td></tr>}
                  <tr className="bg-green-100 font-semibold"><td className="border p-2">Total Earnings</td><td className="border p-2 text-right">₹{(totalEarnings + (payslip.bonus || 0)).toLocaleString()}</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <table className="w-full border-collapse border">
                <thead><tr className="bg-red-50"><th colSpan="2" className="border p-2 text-left text-red-700">Deductions</th></tr></thead>
                <tbody>
                  {Object.entries(deductions).map(([key, val]) => val > 0 && (
                    <tr key={key}><td className="border p-2 uppercase text-sm">{key}</td><td className="border p-2 text-right text-sm">₹{val.toLocaleString()}</td></tr>
                  ))}
                  {payslip.loanDeduction > 0 && <tr><td className="border p-2 text-sm">Loan EMI</td><td className="border p-2 text-right text-sm">₹{payslip.loanDeduction.toLocaleString()}</td></tr>}
                  <tr className="bg-red-100 font-semibold"><td className="border p-2">Total Deductions</td><td className="border p-2 text-right">₹{(totalDeductions + (payslip.loanDeduction || 0)).toLocaleString()}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
            <p className="text-gray-600">Net Salary Payable</p>
            <p className="text-3xl font-bold text-blue-700">₹{(payslip.netSalary || 0).toLocaleString()}</p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
