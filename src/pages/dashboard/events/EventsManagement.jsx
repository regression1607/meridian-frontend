import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import {
  Calendar, Plus, Search, Edit2, Trash2, X, ChevronLeft, ChevronRight,
  Users, MapPin, Clock, Tag, Eye, Download
} from 'lucide-react'
import { eventsApi } from '../../../services/api'
import DataTable from '../../../components/ui/DataTable'
import Pagination from '../../../components/ui/Pagination'
import { generateCSV, downloadCSV, CSV_TEMPLATES } from '../../../utils/csvUtils'

const EVENT_TYPES = [
  { value: 'academic', label: 'Academic', color: 'bg-blue-100 text-blue-700' },
  { value: 'cultural', label: 'Cultural', color: 'bg-purple-100 text-purple-700' },
  { value: 'sports', label: 'Sports', color: 'bg-green-100 text-green-700' },
  { value: 'holiday', label: 'Holiday', color: 'bg-red-100 text-red-700' },
  { value: 'exam', label: 'Exam', color: 'bg-orange-100 text-orange-700' },
  { value: 'meeting', label: 'Meeting', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'workshop', label: 'Workshop', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'seminar', label: 'Seminar', color: 'bg-pink-100 text-pink-700' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' }
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function EventsManagement() {
  const [view, setView] = useState('list')
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [viewingEvent, setViewingEvent] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarEvents, setCalendarEvents] = useState([])

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (view === 'list') fetchEvents()
    else fetchCalendarEvents()
  }, [view, pagination.page, searchTerm, typeFilter, currentDate])

  const fetchStats = async () => {
    try {
      const res = await eventsApi.getStats()
      if (res.success) setStats(res.data || {})
    } catch (err) { console.error(err) }
  }

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const res = await eventsApi.getAll({ page: pagination.page, limit: 10, search: searchTerm, type: typeFilter || undefined })
      if (res.success) {
        setEvents(res.data || [])
        if (res.meta) setPagination(p => ({ ...p, ...res.meta }))
      }
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const fetchCalendarEvents = async () => {
    try {
      const res = await eventsApi.getCalendar(currentDate.getFullYear(), currentDate.getMonth() + 1)
      if (res.success) setCalendarEvents(res.data || [])
    } catch (err) { console.error(err) }
  }

  const handleSave = async (data) => {
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent._id, data)
        toast.success('Event updated')
      } else {
        await eventsApi.create(data)
        toast.success('Event created')
      }
      setShowModal(false)
      setEditingEvent(null)
      fetchEvents()
      fetchStats()
    } catch (err) { toast.error(err.message || 'Failed to save') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    try {
      await eventsApi.delete(id)
      toast.success('Event deleted')
      fetchEvents()
      fetchStats()
    } catch (err) { toast.error(err.message) }
  }

  // Export handler
  const [exporting, setExporting] = useState(false)
  const handleExport = () => {
    if (events.length === 0) {
      toast.warning('No events to export')
      return
    }
    setExporting(true)
    try {
      const exportData = events.map(e => ({
        title: e.title || '',
        type: e.type || '',
        startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
        endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : '',
        location: e.location || '',
        description: e.description || '',
        organizer: e.organizer?.name || e.organizer || '',
        attendees: e.attendees?.length || 0,
        status: e.status || 'scheduled'
      }))
      const headers = CSV_TEMPLATES.events.headers
      const csvContent = generateCSV(exportData, headers)
      downloadCSV(csvContent, `events_${new Date().toISOString().split('T')[0]}`)
      toast.success('Events exported successfully')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const getTypeColor = (type) => EVENT_TYPES.find(t => t.value === type)?.color || 'bg-gray-100 text-gray-700'

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-500">Manage school events and calendar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || events.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {exporting ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            Export
          </button>
          <button onClick={() => { setEditingEvent(null); setShowModal(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Plus className="w-4 h-4" />Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Events" value={stats.total || 0} color="blue" />
        <StatCard icon={Clock} label="Upcoming" value={stats.upcoming || 0} color="green" />
        <StatCard icon={Tag} label="This Month" value={stats.thisMonth || 0} color="purple" />
        <StatCard icon={Users} label="Academic" value={stats.byType?.academic || 0} color="orange" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>List</button>
            <button onClick={() => setView('calendar')} className={`px-3 py-1.5 rounded-lg text-sm ${view === 'calendar' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>Calendar</button>
          </div>
          {view === 'list' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-48" />
              </div>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded-lg">
                <option value="">All Types</option>
                {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {view === 'list' ? (
          <div className="p-4">
            <DataTable
              columns={[{ header: 'Event', key: 'title' }, { header: 'Type', key: 'type' }, { header: 'Date', key: 'date' }, { header: 'Location', key: 'location' }, { header: 'Status', key: 'status' }, { header: 'Actions', key: 'actions' }]}
              data={events}
              loading={loading}
              emptyMessage="No events found"
              renderRow={(item) => (
                <>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{item.title}</p><p className="text-xs text-gray-500 truncate max-w-xs">{item.description}</p></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}>{item.type}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(item.startDate)}{item.endDate !== item.startDate && ` - ${formatDate(item.endDate)}`}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.location || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'published' ? 'bg-green-100 text-green-700' : item.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => setViewingEvent(item)} className="p-1.5 hover:bg-blue-50 rounded"><Eye className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => { setEditingEvent(item); setShowModal(true) }} className="p-1.5 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-gray-400" /></button>
                  </td>
                </>
              )}
            />
            {pagination.totalPages > 1 && <div className="mt-4"><Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={(page) => setPagination(p => ({ ...p, page }))} /></div>}
          </div>
        ) : (
          <CalendarView currentDate={currentDate} setCurrentDate={setCurrentDate} events={calendarEvents} onEventClick={setViewingEvent} getTypeColor={getTypeColor} />
        )}
      </div>

      <EventModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingEvent(null) }} onSave={handleSave} event={editingEvent} />
      <EventViewModal isOpen={!!viewingEvent} onClose={() => setViewingEvent(null)} event={viewingEvent} getTypeColor={getTypeColor} />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600' }
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}

function CalendarView({ currentDate, setCurrentDate, events, onEventClick, getTypeColor }) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const getEventsForDay = (day) => {
    if (!day) return []
    const date = new Date(year, month, day)
    return events.filter(e => {
      const start = new Date(e.startDate)
      const end = new Date(e.endDate)
      return date >= new Date(start.setHours(0,0,0,0)) && date <= new Date(end.setHours(23,59,59,999))
    })
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
        <h3 className="text-lg font-semibold">{MONTHS[month]} {year}</h3>
        <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="p-2 text-center text-sm font-medium text-gray-500">{d}</div>)}
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day)
          const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString()
          return (
            <div key={i} className={`min-h-[80px] p-1 border rounded ${day ? 'bg-white' : 'bg-gray-50'} ${isToday ? 'ring-2 ring-primary-500' : ''}`}>
              {day && <span className={`text-sm ${isToday ? 'bg-primary-500 text-white px-1.5 py-0.5 rounded-full' : ''}`}>{day}</span>}
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map(e => (
                  <button key={e._id} onClick={() => onEventClick(e)} className={`w-full text-left text-xs px-1 py-0.5 rounded truncate ${getTypeColor(e.type)}`}>{e.title}</button>
                ))}
                {dayEvents.length > 2 && <span className="text-xs text-gray-500">+{dayEvents.length - 2} more</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EventModal({ isOpen, onClose, onSave, event }) {
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'other', startDate: '', endDate: '', startTime: '', endTime: '',
    location: '', isAllDay: false, targetAudience: ['all'], status: 'draft', color: '#3B82F6'
  })

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : ''
      })
    } else {
      setFormData({ title: '', description: '', type: 'other', startDate: '', endDate: '', startTime: '', endTime: '', location: '', isAllDay: false, targetAudience: ['all'], status: 'draft', color: '#3B82F6' })
    }
  }, [event, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.startDate) {
      toast.error('Please fill required fields')
      return
    }
    onSave({ ...formData, endDate: formData.endDate || formData.startDate })
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{event ? 'Edit' : 'Add'} Event</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div><label className="block text-sm font-medium mb-1">Title *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={3} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Type</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">{EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="draft">Draft</option><option value="published">Published</option><option value="cancelled">Cancelled</option></select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Start Date *</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          {!formData.isAllDay && (
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Start Time</label><input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium mb-1">End Time</label><input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="allDay" checked={formData.isAllDay} onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })} className="rounded" />
            <label htmlFor="allDay" className="text-sm">All day event</label>
          </div>
          <div><label className="block text-sm font-medium mb-1">Location</label><input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Auditorium, Ground" /></div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  )
}

function EventViewModal({ isOpen, onClose, event, getTypeColor }) {
  if (!isOpen || !event) return null
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ margin: 0 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Event Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(event.type)}`}>{event.type}</span>
            <h3 className="text-xl font-semibold mt-2">{event.title}</h3>
            {event.description && <p className="text-gray-600 mt-1">{event.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600"><Calendar className="w-4 h-4" />{new Date(event.startDate).toLocaleDateString()}</div>
            {event.startTime && <div className="flex items-center gap-2 text-gray-600"><Clock className="w-4 h-4" />{event.startTime} - {event.endTime}</div>}
            {event.location && <div className="flex items-center gap-2 text-gray-600 col-span-2"><MapPin className="w-4 h-4" />{event.location}</div>}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-700' : event.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{event.status}</span>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
