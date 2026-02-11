import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Bus, Route, Users, Plus, Search, Filter, Edit2, Trash2, Eye,
  MapPin, Phone, User, Fuel, Calendar, Shield, X, ChevronDown
} from 'lucide-react'
import { transportApi } from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'
import DataTable from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'
import { ApiUserSearchSelect } from '../../../components/ui/SearchableSelect'

const TABS = [
  { id: 'vehicles', label: 'Vehicles', icon: Bus },
  { id: 'routes', label: 'Routes', icon: Route },
  { id: 'allocations', label: 'Student Allocations', icon: Users }
]

const VEHICLE_TYPES = [
  { value: 'bus', label: 'Bus' },
  { value: 'van', label: 'Van' },
  { value: 'mini_bus', label: 'Mini Bus' },
  { value: 'auto', label: 'Auto' }
]

const FUEL_TYPES = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'cng', label: 'CNG' },
  { value: 'electric', label: 'Electric' }
]

export default function TransportManagement() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('vehicles')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  
  // Data states
  const [vehicles, setVehicles] = useState([])
  const [routes, setRoutes] = useState([])
  const [allocations, setAllocations] = useState([])
  
  // Pagination states
  const [vehiclePagination, setVehiclePagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [routePagination, setRoutePagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [allocationPagination, setAllocationPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  
  // Modal states
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Search & filter
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, vehiclesRes, routesRes] = await Promise.all([
        transportApi.getStats(),
        transportApi.getVehicles({ page: vehiclePagination.page, limit: 8, search: searchTerm }),
        transportApi.getRoutes({ page: routePagination.page, limit: 8, search: searchTerm })
      ])

      if (statsRes.success) setStats(statsRes.data)
      if (vehiclesRes.success) {
        setVehicles(vehiclesRes.data || [])
        if (vehiclesRes.pagination) setVehiclePagination(vehiclesRes.pagination)
      }
      if (routesRes.success) {
        setRoutes(routesRes.data || [])
        if (routesRes.pagination) setRoutePagination(routesRes.pagination)
      }

      if (activeTab === 'allocations') {
        const allocRes = await transportApi.getAllocations({ page: allocationPagination.page, limit: 8, search: searchTerm })
        if (allocRes.success) {
          setAllocations(allocRes.data || [])
          if (allocRes.pagination) setAllocationPagination(allocRes.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Vehicle handlers
  const handleSaveVehicle = async (data) => {
    try {
      if (editingItem) {
        await transportApi.updateVehicle(editingItem._id, data)
        toast.success('Vehicle updated successfully')
      } else {
        await transportApi.createVehicle(data)
        toast.success('Vehicle added successfully')
      }
      setShowVehicleModal(false)
      setEditingItem(null)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to save vehicle')
    }
  }

  const handleDeleteVehicle = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return
    try {
      await transportApi.deleteVehicle(id)
      toast.success('Vehicle deleted')
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to delete vehicle')
    }
  }

  // Route handlers
  const handleSaveRoute = async (data) => {
    try {
      if (editingItem) {
        await transportApi.updateRoute(editingItem._id, data)
        toast.success('Route updated successfully')
      } else {
        await transportApi.createRoute(data)
        toast.success('Route added successfully')
      }
      setShowRouteModal(false)
      setEditingItem(null)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to save route')
    }
  }

  const handleDeleteRoute = async (id) => {
    if (!confirm('Are you sure you want to delete this route?')) return
    try {
      await transportApi.deleteRoute(id)
      toast.success('Route deleted')
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to delete route')
    }
  }

  // Allocation handlers
  const handleSaveAllocation = async (data) => {
    try {
      if (editingItem) {
        await transportApi.updateAllocation(editingItem._id, data)
        toast.success('Allocation updated')
      } else {
        await transportApi.allocateTransport(data)
        toast.success('Transport allocated')
      }
      setShowAllocationModal(false)
      setEditingItem(null)
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to save allocation')
    }
  }

  const handleDeleteAllocation = async (id) => {
    if (!confirm('Remove this student from transport?')) return
    try {
      await transportApi.deleteAllocation(id)
      toast.success('Allocation removed')
      fetchData()
    } catch (error) {
      toast.error(error.message || 'Failed to remove allocation')
    }
  }

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Handle page changes
  const handlePageChange = (page) => {
    if (activeTab === 'vehicles') {
      setVehiclePagination(prev => ({ ...prev, page }))
    } else if (activeTab === 'routes') {
      setRoutePagination(prev => ({ ...prev, page }))
    } else {
      setAllocationPagination(prev => ({ ...prev, page }))
    }
  }

  // Refetch on pagination change
  useEffect(() => {
    if (!loading) fetchData()
  }, [vehiclePagination.page, routePagination.page, allocationPagination.page])

  // DataTable columns
  const vehicleColumns = [
    { header: 'Vehicle', key: 'vehicle' },
    { header: 'Driver', key: 'driver' },
    { header: 'Capacity', key: 'capacity' },
    { header: 'Status', key: 'status' },
    { header: 'Actions', key: 'actions', align: 'right' }
  ]

  const routeColumns = [
    { header: 'Route', key: 'route' },
    { header: 'Vehicle', key: 'vehicle' },
    { header: 'Stops', key: 'stops' },
    { header: 'Status', key: 'status' },
    { header: 'Actions', key: 'actions', align: 'right' }
  ]

  const allocationColumns = [
    { header: 'Student', key: 'student' },
    { header: 'Route', key: 'route' },
    { header: 'Stop', key: 'stop' },
    { header: 'Type', key: 'type' },
    { header: 'Fee', key: 'fee' },
    { header: 'Actions', key: 'actions', align: 'right' }
  ]

  const currentPagination = activeTab === 'vehicles' ? vehiclePagination : 
    activeTab === 'routes' ? routePagination : allocationPagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport Management</h1>
          <p className="text-gray-500">Manage vehicles, routes, and student allocations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Bus} label="Total Vehicles" value={stats.totalVehicles || 0} color="blue" />
        <StatCard icon={Bus} label="Active Vehicles" value={stats.activeVehicles || 0} color="green" />
        <StatCard icon={Route} label="Total Routes" value={stats.totalRoutes || 0} color="purple" />
        <StatCard icon={Users} label="Students Allocated" value={stats.activeAllocations || 0} color="orange" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search & Actions */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => {
              setEditingItem(null)
              if (activeTab === 'vehicles') setShowVehicleModal(true)
              else if (activeTab === 'routes') setShowRouteModal(true)
              else setShowAllocationModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add {activeTab === 'vehicles' ? 'Vehicle' : activeTab === 'routes' ? 'Route' : 'Allocation'}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'vehicles' && (
            <DataTable
              columns={vehicleColumns}
              data={vehicles}
              loading={loading}
              emptyMessage="No vehicles found"
              emptyIcon={Bus}
              renderRow={(vehicle) => (
                <>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Bus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.vehicleNumber}</p>
                        <p className="text-sm text-gray-500 capitalize">{vehicle.vehicleType?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{vehicle.driverName}</p>
                    <p className="text-sm text-gray-500">{vehicle.driverPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{vehicle.capacity} seats</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'active' ? 'bg-green-100 text-green-700' :
                      vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditingItem(vehicle); setShowVehicleModal(true) }} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteVehicle(vehicle._id)} className="p-1 text-gray-400 hover:text-red-600 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </>
              )}
            />
          )}
          {activeTab === 'routes' && (
            <DataTable
              columns={routeColumns}
              data={routes}
              loading={loading}
              emptyMessage="No routes found"
              emptyIcon={Route}
              renderRow={(route) => (
                <>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Route className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{route.routeName}</p>
                        <p className="text-sm text-gray-500">{route.routeCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {route.vehicle ? (
                      <div>
                        <p className="text-gray-900">{route.vehicle.vehicleNumber}</p>
                        <p className="text-sm text-gray-500">{route.vehicle.driverName}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600">{route.stops?.length || 0} stops</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      route.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {route.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditingItem(route); setShowRouteModal(true) }} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteRoute(route._id)} className="p-1 text-gray-400 hover:text-red-600 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </>
              )}
            />
          )}
          {activeTab === 'allocations' && (
            <DataTable
              columns={allocationColumns}
              data={allocations}
              loading={loading}
              emptyMessage="No allocations found"
              emptyIcon={Users}
              renderRow={(alloc) => (
                <>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {alloc.student?.profile?.firstName} {alloc.student?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{alloc.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{alloc.route?.routeName}</p>
                    <p className="text-sm text-gray-500">{alloc.route?.routeCode}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{alloc.stop}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-gray-600">{alloc.pickupType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{alloc.monthlyFee}/month</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditingItem(alloc); setShowAllocationModal(true) }} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteAllocation(alloc._id)} className="p-1 text-gray-400 hover:text-red-600 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </>
              )}
            />
          )}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPagination.page}
          totalPages={currentPagination.totalPages}
          totalItems={currentPagination.total}
          itemsPerPage={8}
          onPageChange={handlePageChange}
          itemName={activeTab}
        />
      </div>

      {/* Modals */}
      <VehicleModal
        isOpen={showVehicleModal}
        onClose={() => { setShowVehicleModal(false); setEditingItem(null) }}
        onSave={handleSaveVehicle}
        vehicle={editingItem}
      />
      <RouteModal
        isOpen={showRouteModal}
        onClose={() => { setShowRouteModal(false); setEditingItem(null) }}
        onSave={handleSaveRoute}
        route={editingItem}
        vehicles={vehicles}
      />
      <AllocationModal
        isOpen={showAllocationModal}
        onClose={() => { setShowAllocationModal(false); setEditingItem(null) }}
        onSave={handleSaveAllocation}
        allocation={editingItem}
        routes={routes}
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
    orange: 'bg-orange-50 text-orange-600'
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



// Vehicle Modal
function VehicleModal({ isOpen, onClose, onSave, vehicle }) {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleType: 'bus',
    capacity: 40,
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    conductorName: '',
    conductorPhone: '',
    fuelType: 'diesel',
    status: 'active'
  })

  useEffect(() => {
    if (vehicle) {
      setFormData({ ...vehicle })
    } else {
      setFormData({
        vehicleNumber: '',
        vehicleType: 'bus',
        capacity: 40,
        driverName: '',
        driverPhone: '',
        driverLicense: '',
        conductorName: '',
        conductorPhone: '',
        fuelType: 'diesel',
        status: 'active'
      })
    }
  }, [vehicle, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.vehicleNumber || !formData.driverName || !formData.driverPhone) {
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
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{vehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="KA-01-AB-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {FUEL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Phone *</label>
              <input
                type="text"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conductor Name</label>
              <input
                type="text"
                value={formData.conductorName}
                onChange={(e) => setFormData({ ...formData, conductorName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conductor Phone</label>
              <input
                type="text"
                value={formData.conductorPhone}
                onChange={(e) => setFormData({ ...formData, conductorPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {vehicle ? 'Update' : 'Add'} Vehicle
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Route Modal
function RouteModal({ isOpen, onClose, onSave, route, vehicles }) {
  const [formData, setFormData] = useState({
    routeName: '',
    routeCode: '',
    vehicle: '',
    stops: [{ stopName: '', stopOrder: 1, pickupTime: '', dropTime: '', monthlyFee: 0 }],
    status: 'active'
  })

  useEffect(() => {
    if (route) {
      setFormData({
        ...route,
        vehicle: route.vehicle?._id || route.vehicle || ''
      })
    } else {
      setFormData({
        routeName: '',
        routeCode: '',
        vehicle: '',
        stops: [{ stopName: '', stopOrder: 1, pickupTime: '', dropTime: '', monthlyFee: 0 }],
        status: 'active'
      })
    }
  }, [route, isOpen])

  const addStop = () => {
    setFormData({
      ...formData,
      stops: [...formData.stops, { stopName: '', stopOrder: formData.stops.length + 1, pickupTime: '', dropTime: '', monthlyFee: 0 }]
    })
  }

  const removeStop = (index) => {
    const newStops = formData.stops.filter((_, i) => i !== index)
    setFormData({ ...formData, stops: newStops.map((s, i) => ({ ...s, stopOrder: i + 1 })) })
  }

  const updateStop = (index, field, value) => {
    const newStops = [...formData.stops]
    newStops[index] = { ...newStops[index], [field]: value }
    setFormData({ ...formData, stops: newStops })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.routeName || !formData.routeCode) {
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
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{route ? 'Edit Route' : 'Add Route'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
              <input
                type="text"
                value={formData.routeName}
                onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., North Zone Route"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Route Code *</label>
              <input
                type="text"
                value={formData.routeCode}
                onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., RT-001"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Vehicle</label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Vehicle</option>
                {vehicles.filter(v => v.status === 'active').map(v => (
                  <option key={v._id} value={v._id}>{v.vehicleNumber} - {v.driverName}</option>
                ))}
              </select>
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
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Stops</label>
              <button type="button" onClick={addStop} className="text-sm text-primary-600 hover:text-primary-700">
                + Add Stop
              </button>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {formData.stops.map((stop, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium shrink-0">
                      {stop.stopOrder}
                    </span>
                    <input
                      type="text"
                      value={stop.stopName}
                      onChange={(e) => updateStop(index, 'stopName', e.target.value)}
                      className="flex-1 px-2 py-1.5 border rounded text-sm"
                      placeholder="Stop name"
                    />
                    {formData.stops.length > 1 && (
                      <button type="button" onClick={() => removeStop(index)} className="p-1 text-red-500 hover:bg-red-50 rounded shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pl-8">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-0.5 block">Pickup</label>
                      <input
                        type="time"
                        value={stop.pickupTime}
                        onChange={(e) => updateStop(index, 'pickupTime', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-0.5 block">Drop</label>
                      <input
                        type="time"
                        value={stop.dropTime}
                        onChange={(e) => updateStop(index, 'dropTime', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-gray-500 mb-0.5 block">Fee (₹)</label>
                      <input
                        type="number"
                        value={stop.monthlyFee}
                        onChange={(e) => updateStop(index, 'monthlyFee', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 border rounded text-sm"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {route ? 'Update' : 'Add'} Route
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// Allocation Modal
function AllocationModal({ isOpen, onClose, onSave, allocation, routes }) {
  const [formData, setFormData] = useState({
    student: '',
    route: '',
    stop: '',
    pickupType: 'both',
    monthlyFee: 0,
    academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`
  })

  const [selectedRoute, setSelectedRoute] = useState(null)

  useEffect(() => {
    if (allocation) {
      setFormData({
        student: allocation.student?._id || allocation.student,
        route: allocation.route?._id || allocation.route,
        stop: allocation.stop,
        pickupType: allocation.pickupType,
        monthlyFee: allocation.monthlyFee,
        academicYear: allocation.academicYear
      })
      setSelectedRoute(routes.find(r => r._id === (allocation.route?._id || allocation.route)))
    } else {
      setFormData({
        student: '',
        route: '',
        stop: '',
        pickupType: 'both',
        monthlyFee: 0,
        academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`
      })
      setSelectedRoute(null)
    }
  }, [allocation, isOpen, routes])

  const handleRouteChange = (routeId) => {
    const route = routes.find(r => r._id === routeId)
    setSelectedRoute(route)
    setFormData({ ...formData, route: routeId, stop: '' })
  }

  const handleStopChange = (stopName) => {
    const stop = selectedRoute?.stops?.find(s => s.stopName === stopName)
    setFormData({ ...formData, stop: stopName, monthlyFee: stop?.monthlyFee || 0 })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.student || !formData.route || !formData.stop) {
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
          <h2 className="text-lg font-semibold">{allocation ? 'Edit Allocation' : 'Allocate Transport'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
            {allocation ? (
              <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700">
                {allocation.student?.profile?.firstName} {allocation.student?.profile?.lastName} - {allocation.student?.email}
              </div>
            ) : (
              <ApiUserSearchSelect
                value={formData.student}
                onChange={(value) => setFormData({ ...formData, student: value })}
                filterRoles={['student']}
                placeholder="Search student by name or email..."
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route *</label>
            <select
              value={formData.route}
              onChange={(e) => handleRouteChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Route</option>
              {routes.filter(r => r.status === 'active').map(r => (
                <option key={r._id} value={r._id}>{r.routeName} ({r.routeCode})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stop *</label>
            <select
              value={formData.stop}
              onChange={(e) => handleStopChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={!selectedRoute}
            >
              <option value="">Select Stop</option>
              {selectedRoute?.stops?.map(s => (
                <option key={s.stopName} value={s.stopName}>
                  {s.stopName} - ₹{s.monthlyFee}/month
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Type</label>
              <select
                value={formData.pickupType}
                onChange={(e) => setFormData({ ...formData, pickupType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="both">Both (Pickup & Drop)</option>
                <option value="pickup">Pickup Only</option>
                <option value="drop">Drop Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee</label>
              <input
                type="number"
                value={formData.monthlyFee}
                onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {allocation ? 'Update' : 'Allocate'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
