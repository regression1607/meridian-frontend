import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  BookOpen, Plus, Search, RefreshCw, RotateCcw, AlertTriangle,
  User, Calendar, Clock, X, CheckCircle, XCircle
} from 'lucide-react'
import { libraryApi, usersApi } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import Pagination from '../../../components/ui/Pagination'
import { UserSearchSelect, BookSearchSelect } from '../../../components/ui/SearchableSelect'

export default function IssuedBooks() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState([])
  const [books, setBooks] = useState([])
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, pages: 1 })
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('issued')
  const [overdueFilter, setOverdueFilter] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchIssues()
  }, [pagination.page, statusFilter, overdueFilter])

  const fetchInitialData = async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        libraryApi.getBooks({ limit: 100 }),
        usersApi.getAll({ limit: 100 })
      ])
      console.log('Books response:', booksRes)
      console.log('Users response:', usersRes)
      if (booksRes.success) {
        const booksData = Array.isArray(booksRes.data) ? booksRes.data : (booksRes.data?.data || [])
        setBooks(booksData)
      }
      if (usersRes.success) {
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || [])
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error)
    }
  }

  const fetchIssues = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
        ...(overdueFilter && { overdue: 'true' })
      }
      const res = await libraryApi.getIssues(params)
      if (res.success) {
        setIssues(res.data || [])
        if (res.pagination) setPagination(p => ({ ...p, ...res.pagination }))
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleIssueBook = async (data) => {
    try {
      await libraryApi.issueBook(data)
      toast.success('Book issued successfully')
      setShowIssueModal(false)
      fetchIssues()
      fetchInitialData()
    } catch (error) {
      toast.error(error.message || 'Failed to issue book')
    }
  }

  const handleReturnBook = async (remarks) => {
    if (!selectedIssue) return
    try {
      await libraryApi.returnBook(selectedIssue._id, remarks)
      toast.success('Book returned successfully')
      setShowReturnModal(false)
      setSelectedIssue(null)
      fetchIssues()
      fetchInitialData()
    } catch (error) {
      toast.error(error.message || 'Failed to return book')
    }
  }

  const handleRenewBook = async (issueId) => {
    try {
      await libraryApi.renewBook(issueId)
      toast.success('Book renewed successfully')
      fetchIssues()
    } catch (error) {
      toast.error(error.message || 'Failed to renew book')
    }
  }

  const handleMarkAsLost = async (issueId) => {
    if (!confirm('Mark this book as lost? A fine may be applied.')) return
    try {
      await libraryApi.markAsLost(issueId)
      toast.success('Book marked as lost')
      fetchIssues()
    } catch (error) {
      toast.error(error.message || 'Failed to mark as lost')
    }
  }

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  const getDaysRemaining = (dueDate) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    return diff
  }

  if (loading && !issues.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library - Issued Books</h1>
          <p className="text-gray-500">Manage book issues, returns, and renewals</p>
        </div>
        <button
          onClick={() => setShowIssueModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Issue Book
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by book or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })) }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="issued">Currently Issued</option>
            <option value="returned">Returned</option>
            <option value="lost">Lost</option>
          </select>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={overdueFilter}
              onChange={(e) => { setOverdueFilter(e.target.checked); setPagination(p => ({ ...p, page: 1 })) }}
              className="rounded text-primary-600"
            />
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm">Overdue Only</span>
          </label>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issued To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {issues.filter(issue => 
                !searchTerm || 
                issue.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.issuedTo?.profile?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                issue.issuedTo?.profile?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(issue => {
                const daysRemaining = getDaysRemaining(issue.dueDate)
                const isOverdue = issue.status === 'issued' && daysRemaining < 0
                
                return (
                  <tr key={issue._id} className={`hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{issue.book?.title}</p>
                          <p className="text-sm text-gray-500">{issue.book?.bookCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-gray-900">
                            {issue.issuedTo?.profile?.firstName} {issue.issuedTo?.profile?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">{issue.issuedTo?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(issue.issueDate)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900">{formatDate(issue.dueDate)}</p>
                        {issue.status === 'issued' && (
                          <p className={`text-xs ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.status === 'issued' ? (isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700') :
                        issue.status === 'returned' ? 'bg-green-100 text-green-700' :
                        issue.status === 'lost' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {isOverdue ? 'Overdue' : issue.status}
                      </span>
                      {issue.renewCount > 0 && (
                        <span className="ml-1 text-xs text-gray-500">
                          (Renewed {issue.renewCount}x)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {issue.fineAmount > 0 ? (
                        <span className={`font-medium ${issue.finePaid ? 'text-green-600' : 'text-red-600'}`}>
                          ₹{issue.fineAmount}
                          {issue.finePaid && <CheckCircle className="w-3 h-3 inline ml-1" />}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {issue.status === 'issued' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedIssue(issue); setShowReturnModal(true) }}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            title="Return"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          {issue.renewCount < issue.maxRenewals && (
                            <button
                              onClick={() => handleRenewBook(issue._id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Renew"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleMarkAsLost(issue._id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Mark as Lost"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {issue.status === 'returned' && (
                        <span className="text-gray-400 text-sm">Returned {formatDate(issue.returnDate)}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {issues.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No issued books found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(page) => setPagination(p => ({ ...p, page }))}
        itemName="issued books"
      />

      {/* Issue Book Modal */}
      <IssueBookModal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        onSave={handleIssueBook}
        books={books}
        users={users}
      />

      {/* Return Book Modal */}
      <ReturnBookModal
        isOpen={showReturnModal}
        onClose={() => { setShowReturnModal(false); setSelectedIssue(null) }}
        onReturn={handleReturnBook}
        issue={selectedIssue}
      />
    </div>
  )
}

// Issue Book Modal
function IssueBookModal({ isOpen, onClose, onSave, books, users }) {
  const [formData, setFormData] = useState({
    bookId: '',
    issuedTo: '',
    dueDate: ''
  })

  useEffect(() => {
    if (isOpen) {
      const defaultDueDate = new Date()
      defaultDueDate.setDate(defaultDueDate.getDate() + 14)
      setFormData({
        bookId: '',
        issuedTo: '',
        dueDate: defaultDueDate.toISOString().split('T')[0]
      })
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.bookId || !formData.issuedTo) {
      toast.error('Please select a book and user')
      return
    }
    onSave(formData)
  }

  const eligibleUsers = users.filter(u => ['student', 'teacher'].includes(u.role))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Issue Book</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Book *</label>
            <BookSearchSelect
              books={books}
              value={formData.bookId}
              onChange={(value) => setFormData({ ...formData, bookId: value })}
              placeholder="Search book by title or code..."
              onlyAvailable={true}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue To *</label>
            <UserSearchSelect
              users={eligibleUsers}
              value={formData.issuedTo}
              onChange={(value) => setFormData({ ...formData, issuedTo: value })}
              placeholder="Search user by name or email..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Issue Book
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Return Book Modal
function ReturnBookModal({ isOpen, onClose, onReturn, issue }) {
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (isOpen) setRemarks('')
  }, [isOpen])

  if (!isOpen || !issue) return null

  const daysOverdue = Math.max(0, Math.ceil((new Date() - new Date(issue.dueDate)) / (1000 * 60 * 60 * 24)))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Return Book</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium text-gray-900">{issue.book?.title}</p>
            <p className="text-sm text-gray-500">{issue.book?.bookCode}</p>
            <div className="mt-2 text-sm">
              <p>Issued to: {issue.issuedTo?.profile?.firstName} {issue.issuedTo?.profile?.lastName}</p>
              <p>Due date: {new Date(issue.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {daysOverdue > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Book is {daysOverdue} days overdue</span>
              </div>
              <p className="text-sm text-red-600 mt-1">A fine may be applied based on library settings.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Any notes about the book condition..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => onReturn(remarks)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirm Return
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
