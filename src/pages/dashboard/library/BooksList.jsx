import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  BookOpen, Plus, Search, Filter, Edit2, Trash2, Eye,
  BookMarked, Users, AlertTriangle, X, Tag
} from 'lucide-react'
import { libraryApi, subjectsApi } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'

const CATEGORIES = [
  { value: 'textbook', label: 'Textbook' },
  { value: 'reference', label: 'Reference' },
  { value: 'fiction', label: 'Fiction' },
  { value: 'non_fiction', label: 'Non-Fiction' },
  { value: 'magazine', label: 'Magazine' },
  { value: 'journal', label: 'Journal' },
  { value: 'newspaper', label: 'Newspaper' },
  { value: 'other', label: 'Other' }
]

export default function BooksList() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  
  // Modal
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [viewingBook, setViewingBook] = useState(null)

  useEffect(() => {
    fetchData()
  }, [pagination.page, categoryFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page === 1) fetchBooks()
      else setPagination(p => ({ ...p, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, subjectsRes] = await Promise.all([
        libraryApi.getStats(),
        subjectsApi.getAll({ limit: 100 })
      ])
      console.log('Stats response:', statsRes)
      console.log('Subjects response:', subjectsRes)
      if (statsRes.success) {
        // Handle nested data structure
        const statsData = statsRes.data?.data || statsRes.data || {}
        setStats(statsData)
      }
      if (subjectsRes.success) {
        const subjectsData = Array.isArray(subjectsRes.data) ? subjectsRes.data : (subjectsRes.data?.data || [])
        setSubjects(subjectsData)
      }
      await fetchBooks()
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBooks = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter })
      }
      const res = await libraryApi.getBooks(params)
      if (res.success) {
        setBooks(res.data || [])
        if (res.pagination) setPagination(p => ({ ...p, ...res.pagination }))
      }
    } catch (error) {
      console.error('Failed to fetch books:', error)
    }
  }

  const handleSaveBook = async (data) => {
    try {
      if (editingBook) {
        await libraryApi.updateBook(editingBook._id, data)
        toast.success('Book updated successfully')
      } else {
        await libraryApi.createBook(data)
        toast.success('Book added successfully')
      }
      setShowModal(false)
      setEditingBook(null)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to save book')
    }
  }

  const handleDeleteBook = async (id) => {
    if (!confirm('Are you sure you want to delete this book?')) return
    try {
      await libraryApi.deleteBook(id)
      toast.success('Book deleted')
      fetchBooks()
    } catch (error) {
      toast.error(error.message || 'Failed to delete book')
    }
  }

  if (loading && !books.length) {
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
          <h1 className="text-2xl font-bold text-gray-900">Library - Books</h1>
          <p className="text-gray-500">Manage your library book collection</p>
        </div>
        <button
          onClick={() => { setEditingBook(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add Book
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total Books" value={stats.totalBooks || 0} color="blue" />
        <StatCard icon={BookMarked} label="Available" value={stats.availableCopies || 0} color="green" />
        <StatCard icon={Users} label="Issued" value={stats.issuedCount || 0} color="purple" />
        <StatCard icon={AlertTriangle} label="Overdue" value={stats.overdueCount || 0} color="red" />
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books by title, author, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        
        <DataTable
          columns={[
            { key: 'title', header: 'Title', sortable: true },
            { key: 'bookCode', header: 'Code', sortable: true },
            { key: 'author', header: 'Author', sortable: true },
            { key: 'category', header: 'Category' },
            { key: 'copies', header: 'Available' },
            { key: 'shelfLocation', header: 'Location' },
            { key: 'actions', header: 'Actions' }
          ]}
          data={books}
          loading={loading}
          emptyMessage="No books found"
          renderRow={(book) => (
            <>
              <td className="px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{book.title}</p>
                  <p className="text-xs text-gray-500">{book.isbn || 'No ISBN'}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{book.bookCode}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{book.author}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  book.category === 'textbook' ? 'bg-blue-100 text-blue-700' :
                  book.category === 'reference' ? 'bg-purple-100 text-purple-700' :
                  book.category === 'fiction' ? 'bg-pink-100 text-pink-700' :
                  book.category === 'non_fiction' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {book.category?.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {book.availableCopies}/{book.totalCopies}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{book.shelfLocation || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setViewingBook(book); setShowViewModal(true) }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setEditingBook(book); setShowModal(true) }}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </>
          )}
        />
        
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages || pagination.pages || 1}
              onPageChange={(page) => setPagination(p => ({ ...p, page }))}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <BookModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingBook(null) }}
        onSave={handleSaveBook}
        book={editingBook}
        subjects={subjects}
      />

      {/* View Modal */}
      <ViewBookModal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setViewingBook(null) }}
        book={viewingBook}
      />
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600'
  }
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

// Book Card Component
function BookCard({ book, onView, onEdit, onDelete }) {
  const getCategoryColor = (category) => {
    const colors = {
      textbook: 'bg-blue-100 text-blue-700',
      reference: 'bg-purple-100 text-purple-700',
      fiction: 'bg-pink-100 text-pink-700',
      non_fiction: 'bg-green-100 text-green-700',
      magazine: 'bg-yellow-100 text-yellow-700',
      journal: 'bg-indigo-100 text-indigo-700',
      newspaper: 'bg-gray-100 text-gray-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return colors[category] || colors.other
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-32 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
        <BookOpen className="w-16 h-16 text-primary-400" />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(book.category)}`}>
            {book.category?.replace('_', ' ')}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            book.availableCopies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {book.availableCopies}/{book.totalCopies}
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-1">{book.author}</p>
        <p className="text-xs text-gray-400 mt-1">{book.bookCode}</p>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <button onClick={onView} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Book Modal
function BookModal({ isOpen, onClose, onSave, book, subjects }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'other',
    subject: '',
    customSubject: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    edition: '',
    language: 'English',
    pages: 0,
    shelfLocation: '',
    bookCode: '',
    totalCopies: 1,
    price: 0,
    description: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  const [subjectSearch, setSubjectSearch] = useState('')
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)

  useEffect(() => {
    if (book) {
      setFormData({
        ...book,
        subject: book.subject?._id || book.subject || ''
      })
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: 'other',
        subject: '',
        publisher: '',
        publicationYear: new Date().getFullYear(),
        edition: '',
        language: 'English',
        pages: 0,
        shelfLocation: '',
        bookCode: '',
        totalCopies: 1,
        price: 0,
        description: '',
        tags: []
      })
    }
  }, [book, isOpen])

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.author || !formData.bookCode) {
      toast.error('Please fill required fields')
      return
    }
    onSave(formData)
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{book ? 'Edit Book' : 'Add Book'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book Code *</label>
              <input
                type="text"
                value={formData.bookCode}
                onChange={(e) => setFormData({ ...formData, bookCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., LIB-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              {formData.subject === 'other' ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.customSubject}
                    onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter subject name"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, subject: '', customSubject: '' })}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={subjectSearch}
                    onChange={(e) => { setSubjectSearch(e.target.value); setShowSubjectDropdown(true) }}
                    onFocus={() => setShowSubjectDropdown(true)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder={formData.subject ? subjects.find(s => s._id === formData.subject)?.name : 'Search or select subject'}
                  />
                  {showSubjectDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => { setFormData({ ...formData, subject: 'other' }); setShowSubjectDropdown(false); setSubjectSearch('') }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 text-primary-600 font-medium border-b"
                      >
                        + Other (Type custom)
                      </button>
                      {subjects
                        .filter(s => !subjectSearch || s.name?.toLowerCase().includes(subjectSearch.toLowerCase()))
                        .slice(0, 20)
                        .map(s => (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => { setFormData({ ...formData, subject: s._id }); setShowSubjectDropdown(false); setSubjectSearch('') }}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 ${formData.subject === s._id ? 'bg-primary-50' : ''}`}
                          >
                            {s.name}
                          </button>
                        ))}
                      {subjects.length === 0 && (
                        <div className="px-3 py-2 text-gray-500 text-sm">No subjects found</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
              <input
                type="number"
                value={formData.publicationYear}
                onChange={(e) => setFormData({ ...formData, publicationYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
              <input
                type="text"
                value={formData.edition}
                onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies</label>
              <input
                type="number"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Location</label>
              <input
                type="text"
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., A-12"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {formData.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Add tag and press Enter"
                />
                <button type="button" onClick={addTag} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Tag className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {book ? 'Update' : 'Add'} Book
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  )
}

// View Book Modal
function ViewBookModal({ isOpen, onClose, book }) {
  if (!isOpen || !book) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Book Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
            <BookOpen className="w-20 h-20 text-primary-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
            <p className="text-gray-600">{book.author}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Book Code</p>
              <p className="font-medium">{book.bookCode}</p>
            </div>
            <div>
              <p className="text-gray-500">ISBN</p>
              <p className="font-medium">{book.isbn || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium capitalize">{book.category?.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500">Publisher</p>
              <p className="font-medium">{book.publisher || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Available / Total</p>
              <p className="font-medium">{book.availableCopies} / {book.totalCopies}</p>
            </div>
            <div>
              <p className="text-gray-500">Shelf Location</p>
              <p className="font-medium">{book.shelfLocation || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-medium">₹{book.price}</p>
            </div>
            <div>
              <p className="text-gray-500">Language</p>
              <p className="font-medium">{book.language}</p>
            </div>
          </div>
          {book.description && (
            <div>
              <p className="text-gray-500 text-sm">Description</p>
              <p className="text-gray-700">{book.description}</p>
            </div>
          )}
          {book.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {book.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-sm">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            Close
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
