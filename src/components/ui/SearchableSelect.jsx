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
