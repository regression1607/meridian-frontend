import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, X, ChevronDown, User, BookOpen } from 'lucide-react'

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Search...',
  displayKey = 'label',
  valueKey = '_id',
  loading = false,
  disabled = false,
  renderOption,
  renderSelected,
  emptyMessage = 'No options found',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options.slice(0, 50)
    const search = searchTerm.toLowerCase().trim()
    return options.filter(opt => {
      const label = typeof displayKey === 'function' ? displayKey(opt) : opt[displayKey]
      return label?.toLowerCase().includes(search)
    }).slice(0, 50)
  }, [options, searchTerm, displayKey])

  // Get selected option
  const selectedOption = useMemo(() => {
    return options.find(opt => opt[valueKey] === value)
  }, [options, value, valueKey])

  const handleSelect = (option) => {
    onChange(option[valueKey])
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
    setSearchTerm('')
  }

  const getDisplayValue = (option) => {
    if (typeof displayKey === 'function') return displayKey(option)
    return option[displayKey]
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`w-full px-3 py-2 border rounded-lg flex items-center gap-2 cursor-pointer ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'
        } ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : 'border-gray-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none bg-transparent text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 text-sm ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedOption ? (renderSelected ? renderSelected(selectedOption) : getDisplayValue(selectedOption)) : placeholder}
          </span>
        )}
        {value && !isOpen && (
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 text-gray-400 hover:text-red-500 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">{emptyMessage}</div>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option[valueKey]}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 ${
                  option[valueKey] === value ? 'bg-primary-50' : ''
                }`}
              >
                {renderOption ? renderOption(option) : (
                  <span className="text-sm text-gray-900">{getDisplayValue(option)}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Pre-configured User Search Select
export function UserSearchSelect({ users = [], value, onChange, loading, placeholder = 'Search user...', filterRoles = null }) {
  const filteredUsers = useMemo(() => {
    if (!filterRoles) return users
    return users.filter(u => filterRoles.includes(u.role))
  }, [users, filterRoles])

  return (
    <SearchableSelect
      options={filteredUsers}
      value={value}
      onChange={onChange}
      loading={loading}
      placeholder={placeholder}
      displayKey={(u) => `${u.profile?.firstName || ''} ${u.profile?.lastName || ''} - ${u.email}`}
      renderOption={(user) => (
        <>
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.profile?.firstName} {user.profile?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email} • {user.role}</p>
          </div>
        </>
      )}
      renderSelected={(user) => (
        <span>{user.profile?.firstName} {user.profile?.lastName} ({user.role})</span>
      )}
      emptyMessage="No users found"
    />
  )
}

// API-driven User Search Select with pagination
export function ApiUserSearchSelect({ 
  value, 
  onChange, 
  placeholder = 'Search user...', 
  filterRoles = null,
  filterClassId = null,
  initialLimit = 5,
  className = '',
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const dropdownRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Import api dynamically to avoid circular deps
  const fetchUsers = async (search = '') => {
    setLoading(true)
    try {
      const { usersApi, classesApi } = await import('../../services/api')
      
      // If filtering by class, use classesApi.getStudents
      if (filterClassId) {
        const response = await classesApi.getStudents(filterClassId)
        let studentList = response.data || []
        // Filter by search term if provided
        if (search) {
          const searchLower = search.toLowerCase()
          studentList = studentList.filter(s => {
            const name = `${s.profile?.firstName || ''} ${s.profile?.lastName || ''}`.toLowerCase()
            const email = (s.email || '').toLowerCase()
            const admNo = (s.studentData?.admissionNumber || '').toLowerCase()
            return name.includes(searchLower) || email.includes(searchLower) || admNo.includes(searchLower)
          })
        }
        setUsers(studentList.slice(0, search ? 20 : initialLimit))
      } else {
        // Use general users API
        const params = { 
          limit: search ? 20 : initialLimit,
          ...(search && { search }),
          ...(filterRoles && { role: filterRoles.join(',') })
        }
        const response = await usersApi.getAll(params)
        if (response.success) {
          setUsers(response.data || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset and refetch when filterClassId changes
  useEffect(() => {
    setUsers([])
    setSelectedUser(null)
    onChange('')
    if (isOpen) fetchUsers()
  }, [filterClassId])

  // Fetch initial users when dropdown opens
  useEffect(() => {
    if (isOpen && users.length === 0 && !searchTerm) {
      fetchUsers()
    }
  }, [isOpen])

  // Fetch selected user details if value exists but no selectedUser
  useEffect(() => {
    if (value && !selectedUser) {
      const found = users.find(u => u._id === value)
      if (found) {
        setSelectedUser(found)
      } else {
        // Fetch user by ID
        (async () => {
          try {
            const { usersApi } = await import('../../services/api')
            const response = await usersApi.getById(value)
            if (response.success) setSelectedUser(response.data)
          } catch (e) { console.error(e) }
        })()
      }
    }
  }, [value, users])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    if (isOpen) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchUsers(searchTerm)
      }, 300)
    }
    return () => clearTimeout(searchTimeoutRef.current)
  }, [searchTerm, isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (user) => {
    setSelectedUser(user)
    onChange(user._id)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e) => {
    e.stopPropagation()
    setSelectedUser(null)
    onChange('')
    setSearchTerm('')
  }

  const getUserDisplayName = (user) => {
    const firstName = user.profile?.firstName || user.firstName || ''
    const lastName = user.profile?.lastName || user.lastName || ''
    return `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'Unknown'
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`w-full px-3 py-2 border rounded-lg flex items-center gap-2 ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'cursor-pointer bg-white hover:border-gray-400'
        } ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : 'border-gray-300'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={placeholder}
            className="flex-1 outline-none bg-transparent text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`flex-1 text-sm ${selectedUser ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedUser ? `${getUserDisplayName(selectedUser)} (${selectedUser.role})` : placeholder}
          </span>
        )}
        {value && !isOpen && (
          <button type="button" onClick={handleClear} className="p-0.5 text-gray-400 hover:text-red-500 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              {searchTerm ? 'No users found' : 'Start typing to search...'}
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => handleSelect(user)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0 ${
                  user._id === value ? 'bg-primary-50' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName(user)}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email} • {user.role}
                    {user.studentData?.admissionNumber && ` • ${user.studentData.admissionNumber}`}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Pre-configured Book Search Select
export function BookSearchSelect({ books = [], value, onChange, loading, placeholder = 'Search book...', onlyAvailable = false }) {
  const filteredBooks = useMemo(() => {
    if (!onlyAvailable) return books
    return books.filter(b => b.availableCopies > 0)
  }, [books, onlyAvailable])

  return (
    <SearchableSelect
      options={filteredBooks}
      value={value}
      onChange={onChange}
      loading={loading}
      placeholder={placeholder}
      displayKey={(b) => `${b.title} - ${b.bookCode}`}
      renderOption={(book) => (
        <>
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-primary-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{book.title}</p>
            <p className="text-xs text-gray-500 truncate">
              {book.bookCode} • {book.author} • {book.availableCopies}/{book.totalCopies} available
            </p>
          </div>
        </>
      )}
      renderSelected={(book) => (
        <span>{book.title} ({book.bookCode})</span>
      )}
      emptyMessage="No books found"
    />
  )
}
