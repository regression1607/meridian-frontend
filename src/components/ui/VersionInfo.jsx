import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Info, X, Package, Server, Globe, Calendar, Code } from 'lucide-react'
import { motion } from 'framer-motion'

const VERSION_DATA = {
  app: {
    name: 'Meridian EMS',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
    buildDate: '2026-02-10'
  },
  frontend: {
    framework: 'React',
    version: '18.2.0',
    bundler: 'Vite',
    bundlerVersion: '5.0.0',
    ui: 'TailwindCSS 3.4'
  },
  backend: {
    runtime: 'Node.js',
    framework: 'Express.js',
    database: 'MongoDB',
    apiVersion: 'v1'
  },
  features: [
    'User Management',
    'Attendance Tracking',
    'Class & Section Management',
    'Subject Management',
    'Examination System',
    'Fee Management',
    'Transport Management',
    'Library Management',
    'AI Assistant'
  ]
}

export default function VersionInfo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
        title="Version Info"
      >
        <Info className="w-5 h-5" />
      </button>

      {isOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" 
          style={{ margin: 0 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-xl"
          >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary-600 to-primary-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{VERSION_DATA.app.name}</h2>
                    <p className="text-sm text-white/80">Version {VERSION_DATA.app.version}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                {/* Environment Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    VERSION_DATA.app.environment === 'production' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {VERSION_DATA.app.environment.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Build: {VERSION_DATA.app.buildDate}
                  </span>
                </div>

                {/* Frontend Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Frontend</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Framework</p>
                      <p className="font-medium text-gray-900">{VERSION_DATA.frontend.framework} {VERSION_DATA.frontend.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bundler</p>
                      <p className="font-medium text-gray-900">{VERSION_DATA.frontend.bundler} {VERSION_DATA.frontend.bundlerVersion}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">UI Framework</p>
                      <p className="font-medium text-gray-900">{VERSION_DATA.frontend.ui}</p>
                    </div>
                  </div>
                </div>

                {/* Backend Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Server className="w-4 h-4 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Backend</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Runtime</p>
                      <p className="font-medium text-gray-900">{VERSION_DATA.backend.runtime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Framework</p>
                      <p className="font-medium text-gray-900">{VERSION_DATA.backend.framework}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Database</p>
                      <p className="font-medium text-gray-900">{VERSION_DATA.backend.database}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">API Version</p>
                      <p className="font-medium text-gray-900">{VERSION_DATA.backend.apiVersion}</p>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-4 h-4 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">Features</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {VERSION_DATA.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-gray-400 pt-2">
                  <p>© 2026 Meridian Education Management System</p>
                  <p className="mt-1">All rights reserved</p>
                </div>
              </div>
            </motion.div>
          </div>,
        document.body
      )}
    </>
  )
}
