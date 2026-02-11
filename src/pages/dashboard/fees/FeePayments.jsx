import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { 
  CreditCard, DollarSign, AlertCircle, CheckCircle, 
  Search, Filter, Download, Plus, Receipt, X, User,
  ChevronLeft, ChevronRight, Settings, Users, Eye, FileText,
  Calendar, Hash, Banknote, Percent, Upload, Mail, Bell, Clock
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { TableSkeleton } from '../../../components/ui/Loading'
import Pagination from '../../../components/ui/Pagination'
import { feesApi, usersApi, classesApi } from '../../../services/api'
import { ApiUserSearchSelect } from '../../../components/ui/SearchableSelect'
import { generateCSV, downloadCSV, CSV_TEMPLATES } from '../../../utils/csvUtils'

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 0 })
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    classId: '',
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
  const [exporting, setExporting] = useState(false)
  const [sendingAlert, setSendingAlert] = useState(null)
  const [studentDues, setStudentDues] = useState(null)
  const [loadingDues, setLoadingDues] = useState(false)
  const [selectedDues, setSelectedDues] = useState({ transport: false, hostel: false, libraryFines: [] })

  useEffect(() => {
    fetchFeeStats()
    fetchPayments()
    fetchFeeStructures()
  }, [statusFilter, pagination.page, selectedMonth, selectedYear])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [statusFilter, selectedMonth, selectedYear])

  const fetchFeeStats = async () => {
    try {
      const response = await feesApi.getStats({ month: selectedMonth, year: selectedYear })
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
        month: selectedMonth,
        year: selectedYear,
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

  const fetchStudentDues = async (studentId) => {
    if (!studentId) {
      setStudentDues(null)
      setSelectedDues({ transport: false, hostel: false, libraryFines: [] })
      return
    }
    try {
      setLoadingDues(true)
      const response = await feesApi.getStudentDues(studentId)
      if (response.success) {
        setStudentDues(response.data)
        setSelectedDues({ transport: false, hostel: false, libraryFines: [] })
      }
    } catch (error) {
      console.error('Failed to fetch student dues:', error)
      setStudentDues(null)
    } finally {
      setLoadingDues(false)
    }
  }

  const handleStudentChange = (studentId) => {
    setPaymentForm(prev => ({ ...prev, studentId }))
    fetchStudentDues(studentId)
  }

  const openPaymentModal = () => {
    fetchClasses()
    setPaymentForm({
      classId: '',
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
    setStudentDues(null)
    setSelectedDues({ transport: false, hostel: false, libraryFines: [] })
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
    
    // Calculate total amount including selected dues
    const feeAmount = parseFloat(paymentForm.amount) || 0
    const transportAmount = selectedDues.transport && studentDues?.transport ? studentDues.transport.amount : 0
    const hostelAmount = selectedDues.hostel && studentDues?.hostel ? studentDues.hostel.amount : 0
    const libraryFinesAmount = studentDues?.libraryFines?.filter(f => selectedDues.libraryFines.includes(f._id)).reduce((sum, f) => sum + f.amount, 0) || 0
    const totalAmount = feeAmount + transportAmount + hostelAmount + libraryFinesAmount

    if (!paymentForm.studentId || totalAmount <= 0) {
      toast.error('Please select a student and enter amount or select dues')
      return
    }

    // Build dues breakdown
    const duesBreakdown = {
      feeAmount,
      transport: {
        included: selectedDues.transport && !!studentDues?.transport,
        amount: transportAmount,
        description: studentDues?.transport?.description || ''
      },
      hostel: {
        included: selectedDues.hostel && !!studentDues?.hostel,
        amount: hostelAmount,
        description: studentDues?.hostel?.description || ''
      },
      libraryFines: studentDues?.libraryFines
        ?.filter(f => selectedDues.libraryFines.includes(f._id))
        .map(f => ({ fineId: f._id, amount: f.amount, description: f.description })) || []
    }

    try {
      setSaving(true)
      const response = await feesApi.recordPayment({
        studentId: paymentForm.studentId,
        feeStructureId: paymentForm.feeStructureId || undefined,
        amount: totalAmount,
        paymentMethod: paymentForm.paymentMethod,
        transactionId: paymentForm.transactionId || undefined,
        discount: paymentForm.discount ? parseFloat(paymentForm.discount) : 0,
        discountReason: paymentForm.discountReason || undefined,
        remarks: paymentForm.remarks || undefined,
        duesBreakdown
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

  // Send fee reminder alert
  const sendFeeAlert = async (payment) => {
    try {
      setSendingAlert(payment._id)
      const response = await feesApi.sendReminder(payment._id)
      if (response.success) {
        toast.success(`Reminder sent to ${response.data.sentTo}`)
        fetchPayments() // Refresh to get updated alert count
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send reminder')
    } finally {
      setSendingAlert(null)
    }
  }

  // Update payment status (e.g., pending -> overdue)
  const markAsOverdue = async (payment) => {
    try {
      setUpdatingStatus(payment._id)
      const response = await feesApi.updatePaymentStatus(payment._id, 'overdue')
      if (response.success) {
        toast.success('Payment marked as overdue')
        fetchPayments()
        fetchFeeStats()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Month options for filter
  const MONTHS = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ]

  // Year options (last 3 years + current)
  const currentYear = new Date().getFullYear()
  const YEARS = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]

  // Generate pending fees for all students
  const handleGenerateFees = async () => {
    try {
      setGenerating(true)
      const response = await feesApi.generateMonthlyFees(selectedMonth, selectedYear)
      if (response.success) {
        toast.success(response.message || `Generated ${response.data.created} pending fee records`)
        fetchPayments()
        fetchFeeStats()
      }
    } catch (error) {
      toast.error(error.message || 'Failed to generate fees')
    } finally {
      setGenerating(false)
    }
  }

  // Export handler
  const handleExport = () => {
    if (payments.length === 0) {
      toast.warning('No payments to export')
      return
    }
    setExporting(true)
    try {
      const exportData = payments.map(p => ({
        studentName: p.student?.profile ? `${p.student.profile.firstName} ${p.student.profile.lastName}` : '',
        rollNumber: p.student?.studentData?.admissionNumber || '',
        email: p.student?.email || '',
        feeType: p.feeStructure?.name || 'Fee Payment',
        amount: p.amount || 0,
        dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : '',
        paidAmount: p.paidAmount || p.amount || 0,
        paymentDate: p.paidDate ? new Date(p.paidDate).toISOString().split('T')[0] : '',
        paymentMethod: p.paymentMethod || '',
        transactionId: p.transactionId || '',
        status: p.status || ''
      }))
      const headers = CSV_TEMPLATES.fees.headers
      const csvContent = generateCSV(exportData, headers)
      downloadCSV(csvContent, `fee_payments_${new Date().toISOString().split('T')[0]}`)
      toast.success('Payments exported successfully')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
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
              ${payment.duesBreakdown ? `
                ${payment.duesBreakdown.feeAmount > 0 ? `
                <tr>
                  <td>📋 ${payment.feeStructure?.name || 'Fee'}</td>
                  <td style="text-align: right;">₹${(payment.duesBreakdown.feeAmount || 0).toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                ${payment.duesBreakdown.transport?.included ? `
                <tr>
                  <td>🚌 Transport Fee</td>
                  <td style="text-align: right;">₹${(payment.duesBreakdown.transport.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                ${payment.duesBreakdown.hostel?.included ? `
                <tr>
                  <td>🏠 Hostel Fee</td>
                  <td style="text-align: right;">₹${(payment.duesBreakdown.hostel.amount || 0).toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
                ${payment.duesBreakdown.libraryFines?.length > 0 ? `
                <tr>
                  <td>📚 Library Fines (${payment.duesBreakdown.libraryFines.length})</td>
                  <td style="text-align: right;">₹${(payment.duesBreakdown.libraryFines.reduce((sum, f) => sum + f.amount, 0) || 0).toLocaleString('en-IN')}</td>
                </tr>
                ` : ''}
              ` : `
              <tr>
                <td>${payment.feeStructure?.name || 'Fee Payment'}</td>
                <td style="text-align: right;">₹${(payment.amount || 0).toLocaleString('en-IN')}</td>
              </tr>
              `}
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
          {isAdmin() && (
            <button 
              onClick={handleGenerateFees}
              disabled={generating}
              className="px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition text-sm flex items-center gap-2 disabled:opacity-50"
              title="Generate pending fee records for all students"
            >
              {generating ? <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /> : <Calendar className="w-4 h-4" />}
              Generate Fees
            </button>
          )}
          {isAdmin() && (
            <button 
              onClick={openPaymentModal}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Record Payment
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={exporting || payments.length === 0}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            Export
          </button>
        </div>
      </div>

      {/* Stats - Clickable to filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setStatusFilter('paid')}
          className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition hover:shadow-md ${
            statusFilter === 'paid' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalCollected)}</p>
              <p className="text-xs text-gray-500">Collected ({stats.paidCount || 0})</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setStatusFilter('pending')}
          className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition hover:shadow-md ${
            statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalPending)}</p>
              <p className="text-xs text-gray-500">Pending ({stats.pendingCount || 0})</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setStatusFilter('overdue')}
          className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition hover:shadow-md ${
            statusFilter === 'overdue' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalOverdue)}</p>
              <p className="text-xs text-gray-500">Overdue ({stats.overdueCount || 0})</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setStatusFilter('all')}
          className={`bg-white rounded-xl p-4 border shadow-sm cursor-pointer transition hover:shadow-md ${
            statusFilter === 'all' ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{pagination.total || 0}</p>
              <p className="text-xs text-gray-500">All Payments</p>
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
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {MONTHS.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
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
                        <div>
                          {payment.duesBreakdown ? (
                            <div className="space-y-0.5">
                              {payment.duesBreakdown.feeAmount > 0 && (
                                <span className="block">📋 {payment.feeStructure?.name || 'Fee'}</span>
                              )}
                              {payment.duesBreakdown.transport?.included && (
                                <span className="block text-xs text-blue-600">🚌 Transport</span>
                              )}
                              {payment.duesBreakdown.hostel?.included && (
                                <span className="block text-xs text-purple-600">🏠 Hostel</span>
                              )}
                              {payment.duesBreakdown.libraryFines?.length > 0 && (
                                <span className="block text-xs text-red-600">📚 Library ({payment.duesBreakdown.libraryFines.length})</span>
                              )}
                            </div>
                          ) : (
                            payment.feeStructure?.name || 'General Fee'
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(payment.paidAmount || payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-700'}`}>
                            {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                          </span>
                          {payment.alertCount > 0 && (
                            <span className="text-xs text-orange-600 flex items-center gap-1" title={`Last sent: ${payment.lastAlertSentAt ? new Date(payment.lastAlertSentAt).toLocaleDateString() : 'N/A'}`}>
                              <Bell className="w-3 h-3" /> {payment.alertCount} alert{payment.alertCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '-'}
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
                          {(payment.status === 'pending' || payment.status === 'overdue') && isAdmin() && (
                            <button
                              onClick={() => sendFeeAlert(payment)}
                              disabled={sendingAlert === payment._id}
                              className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition disabled:opacity-50"
                              title={`Send reminder to parent${payment.alertCount > 0 ? ` (${payment.alertCount} sent)` : ''}`}
                            >
                              {sendingAlert === payment._id ? (
                                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          {payment.status === 'pending' && isAdmin() && (
                            <button
                              onClick={() => markAsOverdue(payment)}
                              disabled={updatingStatus === payment._id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                              title="Mark as Overdue"
                            >
                              {updatingStatus === payment._id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <AlertCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
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

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          itemName="payments"
        />
      </motion.div>

      {/* Payment Modal */}
      {showPaymentModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
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
                  value={paymentForm.classId || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, classId: e.target.value, studentId: '' }))}
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
                <ApiUserSearchSelect
                  value={paymentForm.studentId}
                  onChange={handleStudentChange}
                  placeholder={paymentForm.classId ? "Search student by name or admission number..." : "Select class first"}
                  filterClassId={paymentForm.classId}
                  initialLimit={5}
                  disabled={!paymentForm.classId}
                />
              </div>

              {/* Student Dues Section */}
              {paymentForm.studentId && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> Pending Dues
                  </h4>
                  {loadingDues ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2 text-sm text-gray-500">Loading dues...</span>
                    </div>
                  ) : studentDues && studentDues.totalDue > 0 ? (
                    <div className="space-y-2">
                      {/* Transport Due */}
                      {studentDues.transport && (
                        <label className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-blue-50">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedDues.transport}
                              onChange={(e) => setSelectedDues(prev => ({ ...prev, transport: e.target.checked }))}
                              className="w-4 h-4 text-primary-600 rounded"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">🚌 Transport</span>
                              <p className="text-xs text-gray-500">{studentDues.transport.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(studentDues.transport.amount)}</span>
                        </label>
                      )}

                      {/* Hostel Due */}
                      {studentDues.hostel && (
                        <label className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-blue-50">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedDues.hostel}
                              onChange={(e) => setSelectedDues(prev => ({ ...prev, hostel: e.target.checked }))}
                              className="w-4 h-4 text-primary-600 rounded"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">🏠 Hostel</span>
                              <p className="text-xs text-gray-500">{studentDues.hostel.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(studentDues.hostel.amount)}</span>
                        </label>
                      )}

                      {/* Library Fines */}
                      {studentDues.libraryFines?.length > 0 && studentDues.libraryFines.map((fine, idx) => (
                        <label key={fine._id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-blue-50">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedDues.libraryFines.includes(fine._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDues(prev => ({ ...prev, libraryFines: [...prev.libraryFines, fine._id] }))
                                } else {
                                  setSelectedDues(prev => ({ ...prev, libraryFines: prev.libraryFines.filter(id => id !== fine._id) }))
                                }
                              }}
                              className="w-4 h-4 text-primary-600 rounded"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">📚 Library Fine</span>
                              <p className="text-xs text-gray-500">{fine.description}</p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-red-600">{formatCurrency(fine.amount)}</span>
                        </label>
                      ))}

                      <div className="pt-2 border-t border-gray-200 flex justify-between text-sm">
                        <span className="text-gray-600">Total Pending Dues:</span>
                        <span className="font-bold text-gray-900">{formatCurrency(studentDues.totalDue)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">No pending dues found</p>
                  )}
                </div>
              )}

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
              {(paymentForm.amount || (studentDues && (selectedDues.transport || selectedDues.hostel || selectedDues.libraryFines.length > 0))) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  {paymentForm.amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fee Amount</span>
                      <span className="font-medium">{formatCurrency(parseFloat(paymentForm.amount) || 0)}</span>
                    </div>
                  )}
                  {selectedDues.transport && studentDues?.transport && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">🚌 Transport</span>
                      <span className="font-medium">{formatCurrency(studentDues.transport.amount)}</span>
                    </div>
                  )}
                  {selectedDues.hostel && studentDues?.hostel && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">🏠 Hostel</span>
                      <span className="font-medium">{formatCurrency(studentDues.hostel.amount)}</span>
                    </div>
                  )}
                  {selectedDues.libraryFines.length > 0 && studentDues?.libraryFines && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">📚 Library Fines ({selectedDues.libraryFines.length})</span>
                      <span className="font-medium">{formatCurrency(
                        studentDues.libraryFines
                          .filter(f => selectedDues.libraryFines.includes(f._id))
                          .reduce((sum, f) => sum + f.amount, 0)
                      )}</span>
                    </div>
                  )}
                  {paymentForm.discount && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">-{formatCurrency(parseFloat(paymentForm.discount) || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-900">Total Payable</span>
                    <span className="font-bold text-primary-600">
                      {formatCurrency(
                        (parseFloat(paymentForm.amount) || 0) +
                        (selectedDues.transport && studentDues?.transport ? studentDues.transport.amount : 0) +
                        (selectedDues.hostel && studentDues?.hostel ? studentDues.hostel.amount : 0) +
                        (studentDues?.libraryFines?.filter(f => selectedDues.libraryFines.includes(f._id)).reduce((sum, f) => sum + f.amount, 0) || 0) -
                        (parseFloat(paymentForm.discount) || 0)
                      )}
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
        </div>,
        document.body
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
                  <div className="font-medium text-gray-900">
                    {selectedPayment.duesBreakdown ? (
                      <div className="space-y-0.5">
                        {selectedPayment.duesBreakdown.feeAmount > 0 && <span className="block">📋 {selectedPayment.feeStructure?.name || 'Fee'}</span>}
                        {selectedPayment.duesBreakdown.transport?.included && <span className="block text-sm text-blue-600">🚌 Transport</span>}
                        {selectedPayment.duesBreakdown.hostel?.included && <span className="block text-sm text-purple-600">🏠 Hostel</span>}
                        {selectedPayment.duesBreakdown.libraryFines?.length > 0 && <span className="block text-sm text-red-600">📚 Library Fines</span>}
                      </div>
                    ) : (
                      selectedPayment.feeStructure?.name || 'General Fee'
                    )}
                  </div>
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
                  {selectedPayment.duesBreakdown ? (
                    <>
                      {selectedPayment.duesBreakdown.feeAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">📋 {selectedPayment.feeStructure?.name || 'Fee'}</span>
                          <span className="font-medium">{formatCurrency(selectedPayment.duesBreakdown.feeAmount)}</span>
                        </div>
                      )}
                      {selectedPayment.duesBreakdown.transport?.included && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">🚌 Transport</span>
                          <span className="font-medium">{formatCurrency(selectedPayment.duesBreakdown.transport.amount)}</span>
                        </div>
                      )}
                      {selectedPayment.duesBreakdown.hostel?.included && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">🏠 Hostel</span>
                          <span className="font-medium">{formatCurrency(selectedPayment.duesBreakdown.hostel.amount)}</span>
                        </div>
                      )}
                      {selectedPayment.duesBreakdown.libraryFines?.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">📚 Library Fines ({selectedPayment.duesBreakdown.libraryFines.length})</span>
                          <span className="font-medium">{formatCurrency(selectedPayment.duesBreakdown.libraryFines.reduce((sum, f) => sum + f.amount, 0))}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base Amount</span>
                      <span className="font-medium">{formatCurrency(selectedPayment.amount || 0)}</span>
                    </div>
                  )}
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
