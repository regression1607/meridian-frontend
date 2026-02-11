import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, Calendar, MapPin, Building, User, Shield, CreditCard, Bus, Home, BookOpen, Clock, DollarSign, Award, Loader2, Users, GraduationCap } from 'lucide-react'
import { usersApi } from '../../services/api'

const roleColors = {
  super_admin: 'bg-red-100 text-red-700',
  admin: 'bg-pink-100 text-pink-700',
  institution_admin: 'bg-indigo-100 text-indigo-700',
  coordinator: 'bg-cyan-100 text-cyan-700',
  student: 'bg-blue-100 text-blue-700',
  teacher: 'bg-purple-100 text-purple-700',
  parent: 'bg-green-100 text-green-700',
  staff: 'bg-orange-100 text-orange-700'
}

const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`
const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'

export function UserPreviewModal({ user, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user?._id) {
      setLoading(true)
      setActiveTab('profile')
      usersApi.getFullDetails(user._id)
        .then(res => setDetails(res.data))
        .catch(err => console.error('Failed to load details:', err))
        .finally(() => setLoading(false))
    }
  }, [isOpen, user?._id])

  if (!user) return null

  const userData = details?.user || user
  const userName = userData.profile 
    ? `${userData.profile.firstName} ${userData.profile.lastName}` 
    : userData.fullName || 'Unknown'
  const userInitial = userName.charAt(0).toUpperCase()

  const tabs = [{ id: 'profile', label: 'Profile', icon: User }]
  if (userData.role === 'student') {
    tabs.push({ id: 'fees', label: 'Fees', icon: CreditCard })
    tabs.push({ id: 'services', label: 'Services', icon: Bus })
    tabs.push({ id: 'attendance', label: 'Attendance', icon: Clock })
  }
  if (['teacher', 'staff', 'coordinator'].includes(userData.role)) {
    tabs.push({ id: 'salary', label: 'Salary', icon: DollarSign })
    tabs.push({ id: 'payslips', label: 'Payslips', icon: CreditCard })
  }
  if (userData.role === 'parent') {
    tabs.push({ id: 'children', label: 'Children', icon: Users })
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0, padding: 16 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50" style={{ margin: 0 }} />
          
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden bg-white flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-6 text-white flex-shrink-0">
              <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"><X className="w-5 h-5" /></button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">{userInitial}</div>
                <div>
                  <h2 className="text-xl font-bold">{userName}</h2>
                  <p className="text-white/80 text-sm">{userData.email}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${roleColors[userData.role] || 'bg-gray-100 text-gray-700'}`}>
                    {userData.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-gray-50 px-4 flex-shrink-0">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
              ) : (
                <>
                  {activeTab === 'profile' && <ProfileTab user={userData} />}
                  {activeTab === 'fees' && <FeesTab fees={details?.fees} />}
                  {activeTab === 'services' && <ServicesTab transport={details?.transport} hostel={details?.hostel} library={details?.library} />}
                  {activeTab === 'attendance' && <AttendanceTab attendance={details?.attendance} />}
                  {activeTab === 'salary' && <SalaryTab salary={details?.salary} summary={details?.payrollSummary} />}
                  {activeTab === 'payslips' && <PayslipsTab payslips={details?.payslips} bonuses={details?.bonuses} advances={details?.advances} />}
                  {activeTab === 'children' && <ChildrenTab children={details?.childrenDetails} />}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t flex justify-end flex-shrink-0">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function ProfileTab({ user }) {
  const joinDate = formatDate(user.createdAt)
  const lastLogin = user.lastLogin ? formatDate(user.lastLogin) : 'Never'
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <InfoCard icon={Shield} color="blue" label="Status" value={user.isActive ? 'Active' : 'Inactive'} valueClass={user.isActive ? 'text-green-600' : 'text-gray-500'} />
        <InfoCard icon={Calendar} color="purple" label="Joined" value={joinDate} />
        <InfoCard icon={User} color="gray" label="Last Login" value={lastLogin} />
        {user.profile?.phone && <InfoCard icon={Phone} color="green" label="Phone" value={user.profile.phone} />}
        {user.institution && <InfoCard icon={Building} color="amber" label="Institution" value={typeof user.institution === 'object' ? user.institution.name : 'Assigned'} />}
        {user.profile?.gender && <InfoCard icon={User} color="pink" label="Gender" value={user.profile.gender} />}
      </div>
      
      {user.role === 'student' && user.studentData && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Student Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.studentData.admissionNumber && <InfoCard icon={GraduationCap} color="indigo" label="Admission No" value={user.studentData.admissionNumber} />}
            {user.studentData.rollNumber && <InfoCard icon={GraduationCap} color="cyan" label="Roll No" value={user.studentData.rollNumber} />}
            {user.studentData.class && <InfoCard icon={GraduationCap} color="blue" label="Class" value={typeof user.studentData.class === 'object' ? user.studentData.class?.name : 'Assigned'} />}
            {user.studentData.section && <InfoCard icon={GraduationCap} color="teal" label="Section" value={typeof user.studentData.section === 'object' ? user.studentData.section?.name : 'Assigned'} />}
          </div>
        </div>
      )}

      {['teacher', 'staff'].includes(user.role) && (user.teacherData || user.staffData) && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Employee Details</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(user.teacherData?.employeeId || user.staffData?.employeeId) && <InfoCard icon={User} color="indigo" label="Employee ID" value={user.teacherData?.employeeId || user.staffData?.employeeId} />}
            {user.staffData?.department && <InfoCard icon={Building} color="cyan" label="Department" value={user.staffData.department} />}
            {user.staffData?.designation && <InfoCard icon={Award} color="purple" label="Designation" value={user.staffData.designation} />}
          </div>
        </div>
      )}

      {user.profile?.address && (
        <div className="border-t pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><MapPin className="w-4 h-4 text-gray-600" /></div>
            <div>
              <p className="text-gray-500 text-xs">Address</p>
              <p className="font-medium text-gray-900">{user.profile.address.street}, {user.profile.address.city}, {user.profile.address.state} {user.profile.address.zipCode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ icon: Icon, color, label, value, valueClass = 'text-gray-900' }) {
  const colors = { blue: 'bg-blue-100 text-blue-600', purple: 'bg-purple-100 text-purple-600', green: 'bg-green-100 text-green-600', amber: 'bg-amber-100 text-amber-600', gray: 'bg-gray-100 text-gray-600', pink: 'bg-pink-100 text-pink-600', indigo: 'bg-indigo-100 text-indigo-600', cyan: 'bg-cyan-100 text-cyan-600', teal: 'bg-teal-100 text-teal-600', red: 'bg-red-100 text-red-600' }
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[color]}`}><Icon className="w-4 h-4" /></div>
      <div><p className="text-gray-500 text-xs">{label}</p><p className={`font-medium ${valueClass}`}>{value}</p></div>
    </div>
  )
}

function FeesTab({ fees }) {
  if (!fees) return <p className="text-gray-500 text-center py-8">No fee data available</p>
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-green-600">Total Paid</p><p className="text-2xl font-bold text-green-700">{formatCurrency(fees.totalPaid)}</p></div>
        <div className="p-4 bg-red-50 rounded-lg"><p className="text-sm text-red-600">Total Pending</p><p className="text-2xl font-bold text-red-700">{formatCurrency(fees.totalPending)}</p></div>
      </div>
      
      <h4 className="font-medium text-gray-900">Recent Payments</h4>
      {fees.payments?.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {fees.payments.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">{p.feeStructure?.name || 'Fee Payment'}</p>
                <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(p.amount)}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-gray-500 text-sm">No payments found</p>}
    </div>
  )
}

function ServicesTab({ transport, hostel, library }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><Bus className="w-4 h-4" /> Transport</h4>
        {transport ? (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-medium">{transport.route?.name || 'Route Assigned'}</p>
            <p className="text-sm text-gray-600">{transport.route?.startPoint} → {transport.route?.endPoint}</p>
            <p className="text-sm text-gray-500 mt-1">Vehicle: {transport.vehicle?.vehicleNumber || 'N/A'}</p>
            <p className="text-sm font-medium text-blue-600 mt-2">Monthly Fee: {formatCurrency(transport.monthlyFee)}</p>
          </div>
        ) : <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">No transport allocation</p>}
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><Home className="w-4 h-4" /> Hostel</h4>
        {hostel ? (
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="font-medium">{hostel.room?.block?.name || 'Block'} - Room {hostel.room?.roomNumber}</p>
            <p className="text-sm text-gray-600">Bed: {hostel.bedNumber}</p>
            <p className="text-sm font-medium text-purple-600 mt-2">Monthly Rent: {formatCurrency(hostel.monthlyRent)}</p>
          </div>
        ) : <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">No hostel allocation</p>}
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Library</h4>
        {library ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-amber-50 rounded-lg"><p className="text-sm text-amber-600">Books Issued</p><p className="text-xl font-bold text-amber-700">{library.currentlyIssued}</p></div>
              <div className="p-3 bg-red-50 rounded-lg"><p className="text-sm text-red-600">Total Fines</p><p className="text-xl font-bold text-red-700">{formatCurrency(library.totalFines)}</p></div>
            </div>
            {library.books?.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {library.books.slice(0, 5).map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span>{b.book?.title || 'Book'}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${b.status === 'issued' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">No library data</p>}
      </div>
    </div>
  )
}

function AttendanceTab({ attendance }) {
  if (!attendance) return <p className="text-gray-500 text-center py-8">No attendance data available</p>
  
  const percentage = attendance.totalDays > 0 ? Math.round((attendance.presentDays / attendance.totalDays) * 100) : 0
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg text-center"><p className="text-sm text-green-600">Present</p><p className="text-2xl font-bold text-green-700">{attendance.presentDays}</p></div>
        <div className="p-4 bg-gray-50 rounded-lg text-center"><p className="text-sm text-gray-600">Total Days</p><p className="text-2xl font-bold text-gray-700">{attendance.totalDays}</p></div>
        <div className="p-4 bg-blue-50 rounded-lg text-center"><p className="text-sm text-blue-600">Percentage</p><p className="text-2xl font-bold text-blue-700">{percentage}%</p></div>
      </div>
      
      {attendance.recent?.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {attendance.recent.map((a, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <span>{formatDate(a.date)}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${a.status === 'present' ? 'bg-green-100 text-green-700' : a.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SalaryTab({ salary, summary }) {
  if (!salary) return <p className="text-gray-500 text-center py-8">No salary configured</p>
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-green-50 rounded-lg"><p className="text-sm text-green-600">Net Salary</p><p className="text-xl font-bold text-green-700">{formatCurrency(salary.netSalary)}</p></div>
        <div className="p-4 bg-blue-50 rounded-lg"><p className="text-sm text-blue-600">Gross Salary</p><p className="text-xl font-bold text-blue-700">{formatCurrency(salary.grossSalary)}</p></div>
        <div className="p-4 bg-purple-50 rounded-lg"><p className="text-sm text-purple-600">Total Earned</p><p className="text-xl font-bold text-purple-700">{formatCurrency(summary?.totalEarned)}</p></div>
      </div>

      {salary.salaryStructure && <p className="text-sm text-gray-500">Structure: <span className="font-medium text-gray-900">{salary.salaryStructure.name}</span></p>}

      {salary.components && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Earnings</h4>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(salary.components).filter(([_, v]) => v > 0).map(([k, v]) => (
              <div key={k} className="p-2 bg-gray-50 rounded text-center"><p className="text-xs text-gray-500 capitalize">{k}</p><p className="font-medium text-sm">{formatCurrency(v)}</p></div>
            ))}
          </div>
        </div>
      )}

      {salary.deductions && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Deductions</h4>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(salary.deductions).filter(([_, v]) => v > 0).map(([k, v]) => (
              <div key={k} className="p-2 bg-red-50 rounded text-center"><p className="text-xs text-red-500 uppercase">{k}</p><p className="font-medium text-sm text-red-700">{formatCurrency(v)}</p></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PayslipsTab({ payslips, bonuses, advances }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Recent Payslips</h4>
        {payslips?.length > 0 ? (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {payslips.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div><p className="font-medium text-sm">{p.payslipNumber}</p><p className="text-xs text-gray-500">{p.month}/{p.year}</p></div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(p.netSalary)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">No payslips found</p>}
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Bonuses</h4>
        {bonuses?.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {bonuses.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                <span className="capitalize">{b.type}</span>
                <span className="font-medium">{formatCurrency(b.amount)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">No bonuses</p>}
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Advances/Loans</h4>
        {advances?.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {advances.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-amber-50 rounded text-sm">
                <div><span className="capitalize">{a.type}</span><span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{a.status}</span></div>
                <span className="font-medium">{formatCurrency(a.amount)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-gray-500 text-sm">No advances</p>}
      </div>
    </div>
  )
}

function ChildrenTab({ children }) {
  if (!children?.length) return <p className="text-gray-500 text-center py-8">No children linked</p>
  
  return (
    <div className="space-y-4">
      {children.map((child, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
              {child.user?.profile?.firstName?.charAt(0) || 'C'}
            </div>
            <div>
              <p className="font-medium">{child.user?.profile?.firstName} {child.user?.profile?.lastName}</p>
              <p className="text-sm text-gray-500">{child.user?.email}</p>
            </div>
          </div>
          {child.fees && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-white rounded"><span className="text-gray-500">Fees Paid:</span> <span className="font-medium text-green-600">{formatCurrency(child.fees.totalPaid)}</span></div>
              <div className="p-2 bg-white rounded"><span className="text-gray-500">Pending:</span> <span className="font-medium text-red-600">{formatCurrency(child.fees.totalPending)}</span></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function InstitutionPreviewModal({ institution, isOpen, onClose }) {
  if (!institution) return null

  const initial = institution.name?.charAt(0).toUpperCase() || 'I'
  const createdDate = institution.createdAt 
    ? new Date(institution.createdAt).toLocaleDateString('en-US', { 
        month: 'long', day: 'numeric', year: 'numeric' 
      }) 
    : '-'

  const planColors = {
    free: 'bg-gray-100 text-gray-700',
    basic: 'bg-blue-100 text-blue-700',
    premium: 'bg-purple-100 text-purple-700',
    enterprise: 'bg-amber-100 text-amber-700'
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ margin: 0, padding: 16 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50"
            style={{ margin: 0 }}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative rounded-2xl shadow-xl max-w-md w-full overflow-hidden bg-primary-500"
          >
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 px-6 py-8 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {initial}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{institution.name}</h2>
                  <p className="text-white/80 text-sm">{institution.code}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${planColors[institution.subscription?.plan] || planColors.free}`}>
                    {institution.subscription?.plan?.charAt(0).toUpperCase() + institution.subscription?.plan?.slice(1) || 'Free'} Plan
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="font-medium text-gray-900 truncate">{institution.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="font-medium text-gray-900">{institution.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Created</p>
                    <p className="font-medium text-gray-900">{createdDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Status</p>
                    <p className={`font-medium ${institution.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {institution.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {institution.address && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Address</p>
                      <p className="font-medium text-gray-900">
                        {institution.address.street}, {institution.address.city}, {institution.address.state} {institution.address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end rounded-b-2xl">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default { UserPreviewModal, InstitutionPreviewModal }
