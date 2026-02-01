import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  CreditCard, DollarSign, AlertCircle, CheckCircle, 
  Search, Filter, Download, Plus, Receipt, X, User,
  ChevronLeft, ChevronRight, Settings, Users, Eye, FileText,
  Calendar, Hash, Banknote, Percent
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { TableSkeleton } from '../../../components/ui/Loading'
import { feesApi, usersApi, classesApi } from '../../../services/api'

const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  partial: 'bg-blue-100 text-blue-700',
  waived: 'bg-gray-100 text-gray-700'
}

export default function FeePayments() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalCollected: 0, totalPending: 0, totalOverdue: 0 })
  const [payments, setPayments] = useState([])
  const [feeStructures, setFeeStructures] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [saving, setSaving] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    feeStructureId: '',
    amount: '',
    paymentMethod: 'cash',
    transactionId: '',
    discount: '',
    discountReason: '',
    remarks: ''
  })
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState(null)

  useEffect(() => {
    fetchFeeStats()
    fetchPayments()
    fetchFeeStructures()
  }, [statusFilter, pagination.page])

  const fetchFeeStats = async () => {
    try {
      const response = await feesApi.getStats()
      if (response.success) setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch fee stats:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        page: pagination.page,
        limit: pagination.limit
      }
      const response = await feesApi.getPayments(params)
      if (response.success) {
        setPayments(response.data || [])
        if (response.meta) {
          setPagination(prev => ({ ...prev, total: response.meta.total, pages: response.meta.totalPages }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFeeStructures = async () => {
    try {
      const response = await feesApi.getStructures()
      if (response.success) setFeeStructures(response.data || [])
    } catch (error) {
      console.error('Failed to fetch fee structures:', error)
    }
  }

  const fetchStudents = async (classId) => {
    try {
      const response = await classesApi.getStudents(classId)
      if (response.success) setStudents(response.data || [])
    } catch (error) {
      console.error('Failed to fetch students:', error)
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

  const openPaymentModal = () => {
    fetchClasses()
    setPaymentForm({
      studentId: '',
      feeStructureId: '',
      amount: '',
      paymentMethod: 'cash',
      transactionId: '',
      discount: '',
      discountReason: '',
      remarks: ''
    })
    setStudents([])
    setShowPaymentModal(true)
  }

  const handleFeeStructureChange = (structureId) => {
    const structure = feeStructures.find(s => s._id === structureId)
    setPaymentForm(prev => ({
      ...prev,
      feeStructureId: structureId,
      amount: structure?.amount || ''
    }))
  }

  const handleRecordPayment = async (e) => {
    e.preventDefault()
    if (!paymentForm.studentId || !paymentForm.amount) {
      toast.error('Please select a student and enter amount')
      return
    }

    try {
      setSaving(true)
      const response = await feesApi.recordPayment({
        studentId: paymentForm.studentId,
        feeStructureId: paymentForm.feeStructureId || undefined,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId || undefined,
        discount: paymentForm.discount ? parseFloat(paymentForm.discount) : 0,
        discountReason: paymentForm.discountReason || undefined,
        remarks: paymentForm.remarks || undefined
      })

      if (response.success) {
        toast.success('Payment recorded successfully')
        setShowPaymentModal(false)
        fetchPayments()
        fetchFeeStats()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment)
    setShowDetailModal(true)
  }

  const downloadInvoice = async (payment) => {
    try {
      setDownloadingInvoice(payment._id)
      
      const studentName = payment.student?.profile
        ? `${payment.student.profile.firstName} ${payment.student.profile.lastName}`
        : 'Student'
      const receiptNo = payment.receiptNumber || payment._id.slice(-8).toUpperCase()
      const institutionName = user?.institution?.name || 'School'
      
      // Generate PDF using browser
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Fee Receipt - ${receiptNo}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #1e40af; font-size: 24px; margin-bottom: 5px; }
            .header p { color: #666; font-size: 14px; }
            .receipt-title { text-align: center; font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { background: #f8fafc; padding: 15px; border-radius: 8px; }
            .info-box label { font-size: 12px; color: #666; text-transform: uppercase; display: block; margin-bottom: 5px; }
            .info-box span { font-size: 14px; font-weight: 600; color: #333; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th { background: #3b82f6; color: white; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
            .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .table tr:last-child td { border-bottom: none; }
            .total-row { background: #f0f9ff; }
            .total-row td { font-weight: bold; color: #1e40af; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
            .signature { text-align: center; }
            .signature-line { width: 150px; border-top: 1px solid #333; margin: 40px auto 5px; }
            .signature p { font-size: 12px; color: #666; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-overdue { background: #fee2e2; color: #991b1b; }
            .print-info { text-align: center; margin-top: 30px; font-size: 11px; color: #999; }
            @media print { body { padding: 20px; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${institutionName}</h1>
            <p>Fee Payment Receipt</p>
          </div>
          
          <div class="receipt-title">Payment Receipt</div>
          
          <div class="info-grid">
            <div class="info-box">
              <label>Receipt Number</label>
              <span>${receiptNo}</span>
            </div>
            <div class="info-box">
              <label>Date</label>
              <span>${payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN')}</span>
            </div>
            <div class="info-box">
              <label>Student Name</label>
              <span>${studentName}</span>
            </div>
            <div class="info-box">
              <label>Admission No.</label>
              <span>${payment.student?.studentData?.admissionNumber || '-'}</span>
            </div>
            <div class="info-box">
              <label>Class</label>
              <span>${payment.student?.studentData?.class?.name || '-'} ${payment.student?.studentData?.section?.name ? '- ' + payment.student.studentData.section.name : ''}</span>
            </div>
            <div class="info-box">
              <label>Payment Method</label>
              <span style="text-transform: capitalize;">${payment.paymentMethod?.replace('_', ' ') || 'Cash'}</span>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${payment.feeStructure?.name || 'Fee Payment'}</td>
                <td style="text-align: right;">₹${(payment.amount || 0).toLocaleString('en-IN')}</td>
              </tr>
              ${payment.discount > 0 ? `
              <tr>
                <td>Discount ${payment.discountReason ? `(${payment.discountReason})` : ''}</td>
                <td style="text-align: right; color: #16a34a;">-₹${(payment.discount || 0).toLocaleString('en-IN')}</td>
              </tr>
              ` : ''}
              ${payment.lateFee > 0 ? `
              <tr>
                <td>Late Fee</td>
                <td style="text-align: right; color: #dc2626;">+₹${(payment.lateFee || 0).toLocaleString('en-IN')}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td>Total Paid</td>
                <td style="text-align: right;">₹${(payment.paidAmount || payment.amount || 0).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-bottom: 20px;">
            <span class="status status-${payment.status || 'paid'}">${(payment.status || 'paid').toUpperCase()}</span>
            ${payment.transactionId ? `<span style="margin-left: 15px; font-size: 13px; color: #666;">Transaction ID: ${payment.transactionId}</span>` : ''}
          </div>
          
          ${payment.remarks ? `<p style="font-size: 13px; color: #666; margin-bottom: 20px;"><strong>Remarks:</strong> ${payment.remarks}</p>` : ''}
          
          <div class="footer">
            <div class="signature">
              <div class="signature-line"></div>
              <p>Student/Parent Signature</p>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <p>Authorized Signature</p>
            </div>
          </div>
          
          <div class="print-info">
            This is a computer generated receipt. Printed on ${new Date().toLocaleString('en-IN')}
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `)
      printWindow.document.close()
      
      toast.success('Invoice generated! Print dialog opened.')
    } catch (error) {
      toast.error('Failed to generate invoice')
      console.error('Invoice generation error:', error)
    } finally {
      setDownloadingInvoice(null)
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true
    const studentName = payment.student?.profile 
      ? `${payment.student.profile.firstName} ${payment.student.profile.lastName}`
      : ''
    return studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           payment.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 mt-1">Track and manage fee collections</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          {isAdmin() && (
            <button 
              onClick={openPaymentModal}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalCollected)}</p>
              <p className="text-xs text-gray-500">Collected This Month</p>
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
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalPending)}</p>
              <p className="text-xs text-gray-500">Pending</p>
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
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalOverdue)}</p>
              <p className="text-xs text-gray-500">Overdue</p>
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
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.paidCount || 0}</p>
              <p className="text-xs text-gray-500">Payments This Month</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or receipt number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map((payment) => {
                  const studentName = payment.student?.profile
                    ? `${payment.student.profile.firstName} ${payment.student.profile.lastName}`
                    : 'Unknown'
                  return (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {payment.receiptNumber || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                            {studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{studentName}</p>
                            <p className="text-xs text-gray-500">{payment.student?.studentData?.admissionNumber || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {payment.feeStructure?.name || 'General Fee'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(payment.paidAmount || payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-700'}`}>
                          {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                        {payment.paymentMethod?.replace('_', ' ') || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => viewPaymentDetails(payment)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadInvoice(payment)}
                            disabled={downloadingInvoice === payment._id}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                            title="Download Invoice"
                          >
                            {downloadingInvoice === payment._id ? (
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Record Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              {/* Select Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Class <span className="text-red-500">*</span>
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) fetchStudents(e.target.value)
                    else setStudents([])
                    setPaymentForm(prev => ({ ...prev, studentId: '' }))
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Student */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentForm.studentId}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={students.length === 0}
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.profile?.firstName} {student.profile?.lastName} ({student.studentData?.admissionNumber || '-'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fee Structure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                <select
                  value={paymentForm.feeStructureId}
                  onChange={(e) => handleFeeStructureChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Fee Type (Optional)</option>
                  {feeStructures.map(structure => (
                    <option key={structure._id} value={structure._id}>
                      {structure.name} - {formatCurrency(structure.amount)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                    min="0"
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {/* Transaction ID */}
              {paymentForm.paymentMethod !== 'cash' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Enter transaction reference"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                      type="number"
                      value={paymentForm.discount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, discount: e.target.value }))}
                      placeholder="0"
                      min="0"
                      className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Reason</label>
                  <input
                    type="text"
                    value={paymentForm.discountReason}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, discountReason: e.target.value }))}
                    placeholder="e.g., Scholarship"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Summary */}
              {paymentForm.amount && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount</span>
                    <span className="font-medium">{formatCurrency(parseFloat(paymentForm.amount) || 0)}</span>
                  </div>
                  {paymentForm.discount && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">-{formatCurrency(parseFloat(paymentForm.discount) || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-900">Total Payable</span>
                    <span className="font-bold text-primary-600">
                      {formatCurrency((parseFloat(paymentForm.amount) || 0) - (parseFloat(paymentForm.discount) || 0))}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
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
                      Recording...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" /> Record Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <p className="text-sm text-gray-500">Receipt #{selectedPayment.receiptNumber || selectedPayment._id.slice(-8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-medium">
                  {selectedPayment.student?.profile?.firstName?.charAt(0) || 'S'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedPayment.student?.profile?.firstName} {selectedPayment.student?.profile?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPayment.student?.studentData?.admissionNumber || 'N/A'} • {selectedPayment.student?.studentData?.class?.name || ''} {selectedPayment.student?.studentData?.section?.name || ''}
                  </p>
                </div>
              </div>

              {/* Payment Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <FileText className="w-3 h-3" /> Fee Type
                  </div>
                  <p className="font-medium text-gray-900">{selectedPayment.feeStructure?.name || 'General Fee'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Calendar className="w-3 h-3" /> Payment Date
                  </div>
                  <p className="font-medium text-gray-900">
                    {selectedPayment.paidDate ? new Date(selectedPayment.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Banknote className="w-3 h-3" /> Payment Method
                  </div>
                  <p className="font-medium text-gray-900 capitalize">{selectedPayment.paymentMethod?.replace('_', ' ') || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                    <Hash className="w-3 h-3" /> Transaction ID
                  </div>
                  <p className="font-medium text-gray-900">{selectedPayment.transactionId || '-'}</p>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Amount Breakdown</p>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Amount</span>
                    <span className="font-medium">{formatCurrency(selectedPayment.amount || 0)}</span>
                  </div>
                  {selectedPayment.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Discount {selectedPayment.discountReason && <span className="text-gray-400">({selectedPayment.discountReason})</span>}
                      </span>
                      <span className="font-medium text-green-600">-{formatCurrency(selectedPayment.discount)}</span>
                    </div>
                  )}
                  {selectedPayment.lateFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Late Fee</span>
                      <span className="font-medium text-red-600">+{formatCurrency(selectedPayment.lateFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total Paid</span>
                    <span className="font-bold text-primary-600 text-lg">{formatCurrency(selectedPayment.paidAmount || selectedPayment.amount || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[selectedPayment.status] || 'bg-gray-100 text-gray-700'}`}>
                  {selectedPayment.status?.charAt(0).toUpperCase() + selectedPayment.status?.slice(1)}
                </span>
              </div>

              {/* Due Date */}
              {selectedPayment.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Due Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(selectedPayment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}

              {/* Collected By */}
              {selectedPayment.collectedBy && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Collected By</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedPayment.collectedBy?.profile?.firstName} {selectedPayment.collectedBy?.profile?.lastName}
                  </span>
                </div>
              )}

              {/* Remarks */}
              {selectedPayment.remarks && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-600 font-medium mb-1">Remarks</p>
                  <p className="text-sm text-amber-900">{selectedPayment.remarks}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    downloadInvoice(selectedPayment)
                    setShowDetailModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Invoice
                </button>
              </div>
            </div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> payments
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
