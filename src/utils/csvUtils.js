/**
 * Global CSV Utility Functions
 * Reusable utilities for CSV import/export across the application
 */

// CSV Templates for different user roles
export const CSV_TEMPLATES = {
  student: {
    headers: ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'admissionNumber', 'rollNumber', 'bloodGroup', 'street', 'city', 'state', 'country', 'zipCode'],
    required: ['firstName', 'lastName', 'email'],
    example: [
      ['John', 'Doe', 'john.doe@example.com', '9876543210', 'male', '2010-05-15', 'ADM001', 'R001', 'O+', '123 Main St', 'Mumbai', 'Maharashtra', 'India', '400001'],
      ['Jane', 'Smith', 'jane.smith@example.com', '9876543211', 'female', '2010-08-20', 'ADM002', 'R002', 'A+', '456 Oak Ave', 'Delhi', 'Delhi', 'India', '110001']
    ]
  },
  teacher: {
    headers: ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'employeeId', 'qualification', 'experience', 'joiningDate', 'street', 'city', 'state', 'country', 'zipCode'],
    required: ['firstName', 'lastName', 'email'],
    example: [
      ['Robert', 'Johnson', 'robert.j@example.com', '9876543212', 'male', '1985-03-10', 'EMP001', 'M.Ed', '10', '2020-04-01', '789 Teacher Lane', 'Bangalore', 'Karnataka', 'India', '560001'],
      ['Sarah', 'Williams', 'sarah.w@example.com', '9876543213', 'female', '1990-07-25', 'EMP002', 'B.Ed', '5', '2021-06-15', '321 Edu St', 'Chennai', 'Tamil Nadu', 'India', '600001']
    ]
  },
  parent: {
    headers: ['firstName', 'lastName', 'email', 'phone', 'gender', 'occupation', 'relation', 'street', 'city', 'state', 'country', 'zipCode'],
    required: ['firstName', 'lastName', 'email'],
    example: [
      ['Michael', 'Doe', 'michael.doe@example.com', '9876543214', 'male', 'Engineer', 'father', '123 Main St', 'Mumbai', 'Maharashtra', 'India', '400001'],
      ['Emily', 'Smith', 'emily.smith@example.com', '9876543215', 'female', 'Doctor', 'mother', '456 Oak Ave', 'Delhi', 'Delhi', 'India', '110001']
    ]
  },
  staff: {
    headers: ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'employeeId', 'department', 'designation', 'joiningDate', 'street', 'city', 'state', 'country', 'zipCode'],
    required: ['firstName', 'lastName', 'email'],
    example: [
      ['David', 'Brown', 'david.b@example.com', '9876543216', 'male', '1988-11-05', 'STF001', 'Administration', 'Office Manager', '2019-01-10', '555 Staff Rd', 'Hyderabad', 'Telangana', 'India', '500001'],
      ['Lisa', 'Davis', 'lisa.d@example.com', '9876543217', 'female', '1992-02-14', 'STF002', 'Accounts', 'Accountant', '2022-03-01', '777 Admin Blvd', 'Pune', 'Maharashtra', 'India', '411001']
    ]
  },
  // Attendance template
  attendance: {
    headers: ['rollNumber', 'studentName', 'email', 'status', 'date', 'remarks'],
    required: ['rollNumber', 'status', 'date'],
    example: [
      ['R001', 'John Doe', 'john.doe@example.com', 'present', '2024-01-15', ''],
      ['R002', 'Jane Smith', 'jane.smith@example.com', 'absent', '2024-01-15', 'Medical leave'],
      ['R003', 'Bob Wilson', 'bob.w@example.com', 'late', '2024-01-15', 'Arrived 10 mins late']
    ]
  },
  // Exam Results template
  examResults: {
    headers: ['rollNumber', 'studentName', 'examName', 'subjectName', 'marksObtained', 'maxMarks', 'grade', 'remarks'],
    required: ['rollNumber', 'examName', 'subjectName', 'marksObtained', 'maxMarks'],
    example: [
      ['R001', 'John Doe', 'Mid Term 2024', 'Mathematics', '85', '100', 'A', 'Excellent performance'],
      ['R001', 'John Doe', 'Mid Term 2024', 'Science', '78', '100', 'B+', 'Good'],
      ['R002', 'Jane Smith', 'Mid Term 2024', 'Mathematics', '92', '100', 'A+', 'Outstanding']
    ]
  },
  // Fees template
  fees: {
    headers: ['studentName', 'rollNumber', 'email', 'feeType', 'amount', 'dueDate', 'paidAmount', 'paymentDate', 'paymentMethod', 'transactionId', 'status'],
    required: ['rollNumber', 'feeType', 'amount'],
    example: [
      ['John Doe', 'R001', 'john@example.com', 'Tuition Fee', '50000', '2024-04-01', '50000', '2024-03-25', 'online', 'TXN123456', 'paid'],
      ['Jane Smith', 'R002', 'jane@example.com', 'Tuition Fee', '50000', '2024-04-01', '25000', '2024-03-20', 'cash', '', 'partial']
    ]
  },
  // Admissions template
  admissions: {
    headers: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'applyingForClass', 'previousSchool', 'parentName', 'parentPhone', 'parentEmail', 'address', 'city', 'state', 'status'],
    required: ['firstName', 'lastName', 'email', 'phone', 'applyingForClass'],
    example: [
      ['John', 'Doe', 'john@example.com', '9876543210', '2015-05-10', 'male', 'Class 1', 'ABC School', 'Michael Doe', '9876543211', 'michael@example.com', '123 Main St', 'Mumbai', 'Maharashtra', 'submitted'],
      ['Jane', 'Smith', 'jane@example.com', '9876543212', '2014-08-20', 'female', 'Class 2', 'XYZ School', 'Emily Smith', '9876543213', 'emily@example.com', '456 Oak Ave', 'Delhi', 'Delhi', 'under_review']
    ]
  },
  // Books template
  books: {
    headers: ['title', 'author', 'isbn', 'category', 'publisher', 'publicationYear', 'copies', 'availableCopies', 'location', 'price'],
    required: ['title', 'author', 'isbn', 'category', 'copies'],
    example: [
      ['Introduction to Physics', 'Dr. John Smith', '978-3-16-148410-0', 'textbook', 'Academic Press', '2020', '10', '8', 'Shelf A-1', '500'],
      ['Harry Potter', 'J.K. Rowling', '978-0-7475-3269-9', 'fiction', 'Bloomsbury', '1997', '5', '3', 'Shelf B-2', '350']
    ]
  },
  // Payroll export template
  payroll: {
    headers: ['employeeId', 'employeeName', 'email', 'department', 'designation', 'basicSalary', 'allowances', 'deductions', 'netSalary', 'month', 'year', 'status'],
    required: [],
    example: []
  },
  // Events export template
  events: {
    headers: ['title', 'type', 'startDate', 'endDate', 'location', 'description', 'organizer', 'attendees', 'status'],
    required: [],
    example: []
  },
  // Homework Submissions template
  homework: {
    headers: ['studentName', 'rollNumber', 'homeworkTitle', 'subject', 'submittedAt', 'status', 'score', 'maxScore', 'feedback'],
    required: [],
    example: []
  }
}

/**
 * Parse CSV string to array of objects
 * @param {string} csvString - Raw CSV string
 * @returns {Object} - { headers: string[], data: object[], errors: string[] }
 */
export function parseCSV(csvString) {
  const errors = []
  const lines = csvString.trim().split(/\r?\n/)
  
  if (lines.length < 2) {
    return { headers: [], data: [], errors: ['CSV must have at least a header row and one data row'] }
  }

  // Parse header row
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
  
  // Parse data rows
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines
    
    const values = parseCSVLine(line)
    
    if (values.length !== headers.length) {
      errors.push(`Row ${i + 1}: Column count (${values.length}) doesn't match header count (${headers.length})`)
      continue
    }
    
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || ''
    })
    data.push(row)
  }

  return { headers, data, errors }
}

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - Single CSV line
 * @returns {string[]} - Array of values
 */
function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"'
      i++ // Skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  
  return result
}

/**
 * Validate CSV data against a template
 * @param {string[]} headers - CSV headers
 * @param {object[]} data - Parsed CSV data
 * @param {string} role - User role (student, teacher, parent, staff)
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateCSVFormat(headers, data, role) {
  const template = CSV_TEMPLATES[role]
  if (!template) {
    return { valid: false, errors: [`Invalid role: ${role}`], warnings: [] }
  }

  const errors = []
  const warnings = []

  // Check required headers
  const missingRequired = template.required.filter(
    req => !headers.includes(req.toLowerCase())
  )
  
  if (missingRequired.length > 0) {
    errors.push(`Missing required columns: ${missingRequired.join(', ')}`)
  }

  // Check for unknown headers
  const validHeaders = template.headers.map(h => h.toLowerCase())
  const unknownHeaders = headers.filter(h => !validHeaders.includes(h))
  
  if (unknownHeaders.length > 0) {
    warnings.push(`Unknown columns will be ignored: ${unknownHeaders.join(', ')}`)
  }

  // Validate each row
  data.forEach((row, index) => {
    // Check required fields have values
    template.required.forEach(field => {
      const key = field.toLowerCase()
      if (!row[key] || row[key].trim() === '') {
        errors.push(`Row ${index + 2}: Missing required field '${field}'`)
      }
    })

    // Validate email format
    if (row.email && !isValidEmail(row.email)) {
      errors.push(`Row ${index + 2}: Invalid email format '${row.email}'`)
    }

    // Validate date formats
    const dateFields = ['dateofbirth', 'joiningdate', 'admissiondate']
    dateFields.forEach(field => {
      if (row[field] && !isValidDate(row[field])) {
        errors.push(`Row ${index + 2}: Invalid date format for '${field}'. Use YYYY-MM-DD`)
      }
    })

    // Validate gender
    if (row.gender && !['male', 'female', 'other'].includes(row.gender.toLowerCase())) {
      errors.push(`Row ${index + 2}: Invalid gender '${row.gender}'. Use male, female, or other`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Generate CSV string from data
 * @param {object[]} data - Array of objects to convert
 * @param {string[]} headers - Column headers
 * @returns {string} - CSV string
 */
export function generateCSV(data, headers) {
  const csvRows = []
  
  // Add header row
  csvRows.push(headers.join(','))
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = getNestedValue(row, header) ?? ''
      // Escape quotes and wrap in quotes if contains comma or quote
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
    csvRows.push(values.join(','))
  })
  
  return csvRows.join('\n')
}

/**
 * Get nested value from object using dot notation
 * @param {object} obj - Object to get value from
 * @param {string} path - Dot notation path
 * @returns {*} - Value at path
 */
function getNestedValue(obj, path) {
  const keys = path.split('.')
  let value = obj
  for (const key of keys) {
    if (value == null) return ''
    value = value[key]
  }
  return value
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV string
 * @param {string} filename - File name without extension
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate and download CSV template for a role
 * @param {string} role - User role
 */
export function downloadCSVTemplate(role) {
  const template = CSV_TEMPLATES[role]
  if (!template) {
    throw new Error(`No template available for role: ${role}`)
  }

  const csvRows = [template.headers.join(',')]
  template.example.forEach(row => {
    csvRows.push(row.join(','))
  })
  
  downloadCSV(csvRows.join('\n'), `${role}_import_template`)
}

/**
 * Read CSV file and return parsed content
 * @param {File} file - File object
 * @returns {Promise<string>} - CSV content as string
 */
export function readCSVFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    if (!file.name.endsWith('.csv')) {
      reject(new Error('File must be a CSV file'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Validation helpers
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidDate(dateStr) {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * Transform CSV data to API format for user creation
 * @param {object[]} data - Parsed CSV data
 * @param {string} role - User role
 * @returns {object[]} - Transformed data ready for API
 */
export function transformCSVToUserData(data, role) {
  return data.map(row => {
    const user = {
      email: row.email,
      role: role,
      profile: {
        firstName: row.firstname,
        lastName: row.lastname,
        phone: row.phone || '',
        gender: row.gender?.toLowerCase() || undefined,
        dateOfBirth: row.dateofbirth ? new Date(row.dateofbirth) : undefined,
        address: {
          street: row.street || '',
          city: row.city || '',
          state: row.state || '',
          country: row.country || '',
          zipCode: row.zipcode || ''
        }
      }
    }

    // Add role-specific data
    if (role === 'student') {
      user.studentData = {
        admissionNumber: row.admissionnumber || '',
        rollNumber: row.rollnumber || '',
        bloodGroup: row.bloodgroup || ''
      }
    } else if (role === 'teacher') {
      user.teacherData = {
        employeeId: row.employeeid || '',
        qualification: row.qualification || '',
        experience: row.experience ? parseInt(row.experience) : undefined,
        joiningDate: row.joiningdate ? new Date(row.joiningdate) : undefined
      }
    } else if (role === 'parent') {
      user.parentData = {
        occupation: row.occupation || '',
        relation: row.relation?.toLowerCase() || undefined
      }
    } else if (role === 'staff') {
      user.staffData = {
        employeeId: row.employeeid || '',
        department: row.department || '',
        designation: row.designation || '',
        joiningDate: row.joiningdate ? new Date(row.joiningdate) : undefined
      }
    }

    return user
  })
}

/**
 * Transform user data to CSV export format
 * @param {object[]} users - User data from API
 * @param {string} role - User role for specific fields
 * @returns {Object} - { data: object[], headers: string[] }
 */
export function transformUserDataToCSV(users, role) {
  const template = CSV_TEMPLATES[role] || CSV_TEMPLATES.student
  
  const data = users.map(user => {
    const row = {
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      email: user.email || '',
      phone: user.profile?.phone || '',
      gender: user.profile?.gender || '',
      dateOfBirth: user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toISOString().split('T')[0] : '',
      street: user.profile?.address?.street || '',
      city: user.profile?.address?.city || '',
      state: user.profile?.address?.state || '',
      country: user.profile?.address?.country || '',
      zipCode: user.profile?.address?.zipCode || ''
    }

    // Add role-specific fields
    if (role === 'student' && user.studentData) {
      row.admissionNumber = user.studentData.admissionNumber || ''
      row.rollNumber = user.studentData.rollNumber || ''
      row.bloodGroup = user.studentData.bloodGroup || ''
    } else if (role === 'teacher' && user.teacherData) {
      row.employeeId = user.teacherData.employeeId || ''
      row.qualification = user.teacherData.qualification || ''
      row.experience = user.teacherData.experience || ''
      row.joiningDate = user.teacherData.joiningDate ? new Date(user.teacherData.joiningDate).toISOString().split('T')[0] : ''
    } else if (role === 'parent' && user.parentData) {
      row.occupation = user.parentData.occupation || ''
      row.relation = user.parentData.relation || ''
    } else if (role === 'staff' && user.staffData) {
      row.employeeId = user.staffData.employeeId || ''
      row.department = user.staffData.department || ''
      row.designation = user.staffData.designation || ''
      row.joiningDate = user.staffData.joiningDate ? new Date(user.staffData.joiningDate).toISOString().split('T')[0] : ''
    }

    return row
  })

  return { data, headers: template.headers }
}
