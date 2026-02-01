import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { TableSkeleton } from './Loading'

export default function DataTable({
  columns,
  data,
  loading,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
  selectable = false,
  selectedItems = [],
  onSelectAll,
  onSelectItem,
  getItemId = (item) => item._id || item.id,
  renderRow,
  keyField = '_id'
}) {
  const allSelected = data.length > 0 && selectedItems.length === data.length

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <TableSkeleton rows={5} columns={columns.length + (selectable ? 1 : 0)} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-primary-600"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase ${
                    column.align === 'right' ? 'text-right' : 
                    column.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    {EmptyIcon && (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <EmptyIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <p className="text-gray-500">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => {
                const itemId = getItemId(item)
                const isSelected = selectedItems.includes(itemId)

                return (
                  <tr key={item[keyField] || rowIndex} className="hover:bg-gray-50">
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectItem(itemId)}
                          className="rounded border-gray-300 text-primary-600"
                        />
                      </td>
                    )}
                    {renderRow ? (
                      renderRow(item, rowIndex, isSelected)
                    ) : (
                      columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-4 py-3 ${
                            column.align === 'right' ? 'text-right' : 
                            column.align === 'center' ? 'text-center' : ''
                          }`}
                        >
                          {column.render 
                            ? column.render(item, rowIndex) 
                            : item[column.accessor]
                          }
                        </td>
                      ))
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export function StatusBadge({ active, activeText = 'Active', inactiveText = 'Inactive' }) {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${
      active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {active ? activeText : inactiveText}
    </span>
  )
}

export function RoleBadge({ role, icon: Icon }) {
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

  const formatRole = (r) => r ? r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'User'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-700'}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {formatRole(role)}
    </span>
  )
}

export function ActionButtons({ actions }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {actions.map((action, index) => {
        const Icon = action.icon
        
        if (action.to) {
          return (
            <Link
              key={index}
              to={action.to}
              className={`p-1.5 rounded-lg ${action.className || 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
              title={action.title}
            >
              <Icon className="w-4 h-4" />
            </Link>
          )
        }

        return (
          <button
            key={index}
            onClick={action.onClick}
            className={`p-1.5 rounded-lg ${action.className || 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
            title={action.title}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}

export function UserCell({ name, email, avatar }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?'

  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
          {initial}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
    </div>
  )
}

export function DateCell({ date, format = 'short' }) {
  if (!date) return <span className="text-gray-400">-</span>

  const d = new Date(date)
  const formatted = format === 'short' 
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return <span className="text-sm text-gray-500">{formatted}</span>
}
