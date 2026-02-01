import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Building2, DoorOpen, Users, UtensilsCrossed, UserCheck, MessageSquare,
  Plus, Search, Edit2, Trash2, Eye, X, Phone, MapPin, User
} from 'lucide-react'
import { hostelApi, usersApi } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'
import { UserSearchSelect } from '../../../components/ui/SearchableSelect'

const TABS = [
  { id: 'blocks', label: 'Blocks', icon: Building2 },
  { id: 'rooms', label: 'Rooms', icon: DoorOpen },
  { id: 'allocations', label: 'Allocations', icon: Users },
  { id: 'mess', label: 'Mess Menu', icon: UtensilsCrossed },
  { id: 'visitors', label: 'Visitors', icon: UserCheck },
  { id: 'complaints', label: 'Complaints', icon: MessageSquare }
]

const BLOCK_TYPES = [
  { value: 'boys', label: 'Boys' },
  { value: 'girls', label: 'Girls' },
  { value: 'staff', label: 'Staff' },
  { value: 'mixed', label: 'Mixed' }
]

const ROOM_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
  { value: 'dormitory', label: 'Dormitory' }
]

const COMPLAINT_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'cleanliness', label: 'Cleanliness' },
  { value: 'food', label: 'Food' },
  { value: 'security', label: 'Security' },
  { value: 'roommate', label: 'Roommate Issue' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'other', label: 'Other' }
]

export default function HostelManagement() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('blocks')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  
  // Data states
  const [blocks, setBlocks] = useState([])
  const [rooms, setRooms] = useState([])
  const [allocations, setAllocations] = useState([])
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  
  // Pagination
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modals
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showRoomModal, setShowRoomModal] = useState(false)
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    fetchStats()
    fetchBlocks()
  }, [])

  useEffect(() => {
    if (activeTab === 'blocks') fetchBlocks()
    else if (activeTab === 'rooms') fetchRooms()
    else if (activeTab === 'allocations') {
      fetchAllocations()
      loadStudents()
    }
  }, [activeTab, pagination.page, searchTerm])

  const fetchStats = async () => {
    try {
      const res = await hostelApi.getStats()
      if (res.success) setStats(res.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchBlocks = async () => {
    setLoading(true)
    try {
      const res = await hostelApi.getBlocks({ page: pagination.page, limit: 10, search: searchTerm })
      if (res.success) {
        setBlocks(res.data || [])
        if (res.meta) setPagination(p => ({ ...p, ...res.meta }))
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res = await hostelApi.getRooms({ page: pagination.page, limit: 10, search: searchTerm })
      if (res.success) {
        setRooms(res.data || [])
        if (res.meta) setPagination(p => ({ ...p, ...res.meta }))
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllocations = async () => {
    setLoading(true)
    try {
      const res = await hostelApi.getAllocations({ page: pagination.page, limit: 10, status: 'active' })
      if (res.success) {
        setAllocations(res.data || [])
        if (res.meta) setPagination(p => ({ ...p, ...res.meta }))
      }
    } catch (error) {
      console.error('Failed to fetch allocations:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    setLoadingStudents(true)
    try {
      const res = await usersApi.getAll({ role: 'student', limit: 100 })
      if (res.success && Array.isArray(res.data)) {
        setStudents(res.data)
      }
    } catch (error) {
      console.error('Failed to load students:', error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleSaveBlock = async (data) => {
    try {
      if (editingItem) {
        await hostelApi.updateBlock(editingItem._id, data)
        toast.success('Block updated')
      } else {
        await hostelApi.createBlock(data)
        toast.success('Block created')
      }
      setShowBlockModal(false)
      setEditingItem(null)
      fetchBlocks()
      fetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to save block')
    }
  }

  const handleDeleteBlock = async (id) => {
    if (!confirm('Delete this block?')) return
    try {
      await hostelApi.deleteBlock(id)
      toast.success('Block deleted')
      fetchBlocks()
      fetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to delete block')
    }
  }

  const handleSaveRoom = async (data) => {
    try {
      if (editingItem) {
        await hostelApi.updateRoom(editingItem._id, data)
        toast.success('Room updated')
      } else {
        await hostelApi.createRoom(data)
        toast.success('Room created')
      }
      setShowRoomModal(false)
      setEditingItem(null)
      fetchRooms()
      fetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to save room')
    }
  }

  const handleDeleteRoom = async (id) => {
    if (!confirm('Delete this room?')) return
    try {
      await hostelApi.deleteRoom(id)
      toast.success('Room deleted')
      fetchRooms()
      fetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to delete room')
    }
  }

  const handleAllocateRoom = async (data) => {
    try {
      await hostelApi.allocateRoom(data)
      toast.success('Room allocated')
      setShowAllocationModal(false)
      fetchAllocations()
      fetchRooms()
      fetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to allocate room')
    }
  }

  const handleVacateRoom = async (id) => {
    if (!confirm('Vacate this allocation?')) return
    try {
      await hostelApi.vacateRoom(id, '')
      toast.success('Room vacated')
      fetchAllocations()
      fetchRooms()
      fetchStats()
    } catch (error) {
      toast.error(error.message || 'Failed to vacate room')
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPagination({ page: 1, totalPages: 1, total: 0 })
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
          <p className="text-gray-500">Manage hostel blocks, rooms, and allocations</p>
        </div>
        {activeTab === 'blocks' && (
          <button
            onClick={() => { setEditingItem(null); setShowBlockModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add Block
          </button>
        )}
        {activeTab === 'rooms' && (
          <button
            onClick={() => { setEditingItem(null); setShowRoomModal(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add Room
          </button>
        )}
        {activeTab === 'allocations' && (
          <button
            onClick={() => setShowAllocationModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Allocate Room
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Blocks" value={stats.totalBlocks || 0} color="blue" />
        <StatCard icon={DoorOpen} label="Total Rooms" value={stats.totalRooms || 0} color="purple" />
        <StatCard icon={Users} label="Occupied Beds" value={`${stats.occupiedBeds || 0}/${stats.totalCapacity || 0}`} color="green" />
        <StatCard icon={MessageSquare} label="Open Complaints" value={stats.openComplaints || 0} color="red" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        {['blocks', 'rooms'].includes(activeTab) && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {activeTab === 'blocks' && (
            <BlocksTable
              blocks={blocks}
              loading={loading}
              onEdit={(block) => { setEditingItem(block); setShowBlockModal(true) }}
              onDelete={handleDeleteBlock}
            />
          )}
          {activeTab === 'rooms' && (
            <RoomsTable
              rooms={rooms}
              loading={loading}
              onEdit={(room) => { setEditingItem(room); setShowRoomModal(true) }}
              onDelete={handleDeleteRoom}
            />
          )}
          {activeTab === 'allocations' && (
            <AllocationsTable
              allocations={allocations}
              loading={loading}
              onVacate={handleVacateRoom}
            />
          )}
          {activeTab === 'mess' && <MessMenuSection />}
          {activeTab === 'visitors' && <VisitorsSection />}
          {activeTab === 'complaints' && <ComplaintsSection />}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setPagination(p => ({ ...p, page }))}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <BlockModal
        isOpen={showBlockModal}
        onClose={() => { setShowBlockModal(false); setEditingItem(null) }}
        onSave={handleSaveBlock}
        block={editingItem}
      />
      <RoomModal
        isOpen={showRoomModal}
        onClose={() => { setShowRoomModal(false); setEditingItem(null) }}
        onSave={handleSaveRoom}
        room={editingItem}
        blocks={blocks}
      />
      <AllocationModal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        onSave={handleAllocateRoom}
        rooms={rooms}
        students={students}
        loadingStudents={loadingStudents}
      />
    </div>
  )
}

// Stat Card
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

// Blocks Table
function BlocksTable({ blocks, loading, onEdit, onDelete }) {
  return (
    <DataTable
      columns={[
        { header: 'Block', key: 'name' },
        { header: 'Code', key: 'code' },
        { header: 'Type', key: 'type' },
        { header: 'Floors', key: 'totalFloors' },
        { header: 'Status', key: 'status' },
        { header: 'Actions', key: 'actions' }
      ]}
      data={blocks}
      loading={loading}
      emptyMessage="No blocks found"
      renderRow={(block) => (
        <>
          <td className="px-4 py-3 font-medium text-gray-900">{block.name}</td>
          <td className="px-4 py-3 text-gray-600">{block.code}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              block.type === 'boys' ? 'bg-blue-100 text-blue-700' :
              block.type === 'girls' ? 'bg-pink-100 text-pink-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {block.type}
            </span>
          </td>
          <td className="px-4 py-3 text-gray-600">{block.totalFloors}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              block.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {block.status}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(block)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(block._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </>
      )}
    />
  )
}

// Rooms Table
function RoomsTable({ rooms, loading, onEdit, onDelete }) {
  return (
    <DataTable
      columns={[
        { header: 'Room No.', key: 'roomNumber' },
        { header: 'Block', key: 'block' },
        { header: 'Type', key: 'roomType' },
        { header: 'Capacity', key: 'capacity' },
        { header: 'Occupied', key: 'occupied' },
        { header: 'Rent', key: 'monthlyRent' },
        { header: 'Status', key: 'status' },
        { header: 'Actions', key: 'actions' }
      ]}
      data={rooms}
      loading={loading}
      emptyMessage="No rooms found"
      renderRow={(room) => (
        <>
          <td className="px-4 py-3 font-medium text-gray-900">{room.roomNumber}</td>
          <td className="px-4 py-3 text-gray-600">{room.block?.name || '-'}</td>
          <td className="px-4 py-3 text-gray-600 capitalize">{room.roomType}</td>
          <td className="px-4 py-3 text-gray-600">{room.capacity}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              room.occupiedBeds >= room.capacity ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {room.occupiedBeds}/{room.capacity}
            </span>
          </td>
          <td className="px-4 py-3 text-gray-600">₹{room.monthlyRent}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              room.status === 'available' ? 'bg-green-100 text-green-700' :
              room.status === 'full' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {room.status}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(room)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(room._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </>
      )}
    />
  )
}

// Allocations Table
function AllocationsTable({ allocations, loading, onVacate }) {
  return (
    <DataTable
      columns={[
        { header: 'Student', key: 'student' },
        { header: 'Room', key: 'room' },
        { header: 'Block', key: 'block' },
        { header: 'Bed No.', key: 'bedNumber' },
        { header: 'Since', key: 'allocationDate' },
        { header: 'Rent', key: 'monthlyRent' },
        { header: 'Actions', key: 'actions' }
      ]}
      data={allocations}
      loading={loading}
      emptyMessage="No allocations found"
      renderRow={(alloc) => (
        <>
          <td className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {alloc.student?.profile?.firstName} {alloc.student?.profile?.lastName}
                </p>
                <p className="text-xs text-gray-500">{alloc.student?.email}</p>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-gray-600">{alloc.room?.roomNumber}</td>
          <td className="px-4 py-3 text-gray-600">{alloc.room?.block?.name || '-'}</td>
          <td className="px-4 py-3 text-gray-600">{alloc.bedNumber}</td>
          <td className="px-4 py-3 text-gray-600">
            {new Date(alloc.allocationDate).toLocaleDateString()}
          </td>
          <td className="px-4 py-3 text-gray-600">₹{alloc.monthlyRent}</td>
          <td className="px-4 py-3">
            <button
              onClick={() => onVacate(alloc._id)}
              className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
            >
              Vacate
            </button>
          </td>
        </>
      )}
    />
  )
}

// Block Modal
function BlockModal({ isOpen, onClose, onSave, block }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'boys',
    totalFloors: 1,
    contactNumber: '',
    address: '',
    status: 'active'
  })

  useEffect(() => {
    if (block) {
      setFormData(block)
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'boys',
        totalFloors: 1,
        contactNumber: '',
        address: '',
        status: 'active'
      })
    }
  }, [block, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) {
      toast.error('Please fill required fields')
      return
    }
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{block ? 'Edit Block' : 'Add Block'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Block Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Block A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., BLK-A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
              <input
                type="number"
                value={formData.totalFloors}
                onChange={(e) => setFormData({ ...formData, totalFloors: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {block ? 'Update' : 'Add'} Block
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Room Modal
function RoomModal({ isOpen, onClose, onSave, room, blocks }) {
  const [formData, setFormData] = useState({
    block: '',
    roomNumber: '',
    floor: 0,
    roomType: 'double',
    capacity: 2,
    monthlyRent: 0,
    status: 'available'
  })

  useEffect(() => {
    if (room) {
      setFormData({
        ...room,
        block: room.block?._id || room.block
      })
    } else {
      setFormData({
        block: blocks[0]?._id || '',
        roomNumber: '',
        floor: 0,
        roomType: 'double',
        capacity: 2,
        monthlyRent: 0,
        status: 'available'
      })
    }
  }, [room, isOpen, blocks])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.block || !formData.roomNumber) {
      toast.error('Please fill required fields')
      return
    }
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{room ? 'Edit Room' : 'Add Room'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Block *</label>
              <select
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Block</option>
                {blocks.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number *</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <input
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
              <input
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {room ? 'Update' : 'Add'} Room
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Allocation Modal
function AllocationModal({ isOpen, onClose, onSave, rooms, students, loadingStudents }) {
  const [formData, setFormData] = useState({
    roomId: '',
    studentId: '',
    bedNumber: 1,
    academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
    securityDeposit: 0
  })

  const availableRooms = rooms.filter(r => r.occupiedBeds < r.capacity)
  const selectedRoom = rooms.find(r => r._id === formData.roomId)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.roomId || !formData.studentId) {
      toast.error('Please select room and student')
      return
    }
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Allocate Room</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
            <UserSearchSelect
              users={students}
              value={formData.studentId}
              onChange={(value) => setFormData({ ...formData, studentId: value })}
              loading={loadingStudents}
              placeholder="Search student..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room *</label>
            <select
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Room</option>
              {availableRooms.map(r => (
                <option key={r._id} value={r._id}>
                  {r.block?.name} - Room {r.roomNumber} ({r.capacity - r.occupiedBeds} beds free)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
              <input
                type="number"
                value={formData.bedNumber}
                onChange={(e) => setFormData({ ...formData, bedNumber: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                min="1"
                max={selectedRoom?.capacity || 10}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              Allocate
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Mess Menu Section (placeholder)
function MessMenuSection() {
  return (
    <div className="text-center py-12">
      <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Mess Menu management coming soon</p>
    </div>
  )
}

// Visitors Section (placeholder)
function VisitorsSection() {
  return (
    <div className="text-center py-12">
      <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Visitor log management coming soon</p>
    </div>
  )
}

// Complaints Section (placeholder)
function ComplaintsSection() {
  return (
    <div className="text-center py-12">
      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">Complaints management coming soon</p>
    </div>
  )
}
