import { motion } from 'framer-motion'

// Full page loader
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <motion.div
            className="absolute inset-0 border-4 border-primary-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Inline spinner
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  }

  return (
    <div
      className={`${sizes[size]} border-gray-200 border-t-primary-600 rounded-full animate-spin ${className}`}
    />
  )
}

// Button loader
export function ButtonLoader({ size = 'sm' }) {
  return (
    <div className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} border-2 border-white/30 border-t-white rounded-full animate-spin`} />
  )
}

// Skeleton loader for content
export function Skeleton({ className = '', variant = 'text' }) {
  const baseClass = 'bg-gray-200 animate-pulse rounded'
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'w-10 h-10 rounded-full',
    thumbnail: 'w-16 h-16 rounded-lg',
    card: 'h-32 w-full rounded-xl',
    button: 'h-10 w-24 rounded-lg'
  }

  return <div className={`${baseClass} ${variants[variant]} ${className}`} />
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="title" className="w-1/2" />
        </div>
        <Skeleton variant="thumbnail" className="w-12 h-12" />
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <Skeleton variant="text" className="w-48" />
      </div>
      <div className="divide-y divide-gray-50">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 p-4">
            <Skeleton variant="avatar" />
            {[...Array(cols - 1)].map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Stats skeleton
export function StatsSkeleton({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton variant="title" className="w-48" />
          <Skeleton variant="text" className="w-32" />
        </div>
        <Skeleton variant="button" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <Skeleton variant="title" className="mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="avatar" />
                <div className="flex-1 space-y-1">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" className="w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <Skeleton variant="title" className="mb-4" />
          <Skeleton variant="card" className="h-48" />
        </div>
      </div>
    </div>
  )
}

// Loading overlay for sections
export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-2" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  )
}

export default {
  PageLoader,
  Spinner,
  ButtonLoader,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  StatsSkeleton,
  DashboardSkeleton,
  LoadingOverlay,
  EmptyState
}
