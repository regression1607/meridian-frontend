import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap, Users, BookOpen, Calendar, CreditCard, Bus,
  Library, Building2, Wallet, ClipboardList, PartyPopper, Shield,
  Globe, Brain, ChevronRight, Menu, X, Sparkles, CheckCircle2,
  School, Building, BookOpenCheck, UserCheck, Bell, BarChart3,
  Smartphone, Monitor, ArrowRight, Mail, Phone, MapPin
} from 'lucide-react'
import config from '../../config'

const features = [
  {
    icon: Users,
    title: 'User Management',
    description: 'Hierarchical user roles - Super Admin, Principal, Teachers, Students, Parents & Staff',
    status: 'available',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: GraduationCap,
    title: 'Academic Management',
    description: 'Classes, Sections, Subjects, Timetables & Comprehensive Curriculum Management',
    status: 'available',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: BookOpen,
    title: 'Homework & Assignments',
    description: 'Create, assign, submit & grade assignments with AI-powered content generation',
    status: 'available',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Calendar,
    title: 'Attendance & Leave',
    description: 'Digital attendance tracking, leave management & visual calendar integration',
    status: 'available',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: BookOpenCheck,
    title: 'Examinations',
    description: 'Exam scheduling, AI question paper generation, grading & report cards',
    status: 'available',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: CreditCard,
    title: 'Fee Management',
    description: 'Fee structures, payment tracking, receipts & defaulter management',
    status: 'available',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    icon: UserCheck,
    title: 'Parent Portal',
    description: 'Child progress tracking, fee payment, PTM scheduling & direct communication',
    status: 'available',
    color: 'from-pink-500 to-pink-600'
  },
  {
    icon: Library,
    title: 'Library Management',
    description: 'Book catalog, issue/return tracking, fines & digital resource management',
    status: 'available',
    color: 'from-amber-500 to-amber-600'
  },
  {
    icon: Bus,
    title: 'Transport Management',
    description: 'Bus routes, driver management, student allocation & route planning',
    status: 'available',
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    icon: Building2,
    title: 'Hostel Management',
    description: 'Room allocation, mess menu, visitor logs & complaint management',
    status: 'available',
    color: 'from-rose-500 to-rose-600'
  },
  {
    icon: Wallet,
    title: 'Salary & Payroll',
    description: 'Employee salaries, payroll processing, payslips & tax calculations',
    status: 'available',
    color: 'from-teal-500 to-teal-600'
  },
  {
    icon: ClipboardList,
    title: 'Admission Management',
    description: 'Online applications, document verification, merit lists & enrollment',
    status: 'available',
    color: 'from-violet-500 to-violet-600'
  },
  {
    icon: PartyPopper,
    title: 'Events Management',
    description: 'School events, competitions, registrations & certificate generation',
    status: 'available',
    color: 'from-fuchsia-500 to-fuchsia-600'
  },
  {
    icon: Brain,
    title: 'AI Assistant & Reports',
    description: 'Smart AI chatbot, question paper generation, homework creation & analytics',
    status: 'available',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: Globe,
    title: 'Multi-Language (i18n)',
    description: 'Support for English, Hindi, Spanish, French, Arabic (RTL) & more',
    status: 'coming_soon',
    color: 'from-sky-500 to-sky-600'
  },
  {
    icon: Shield,
    title: 'OTP & 2FA Login',
    description: 'Secure authentication with OTP verification and two-factor authentication',
    status: 'coming_soon',
    color: 'from-slate-500 to-slate-600'
  },
  {
    icon: Bell,
    title: 'Third-Party Integrations',
    description: 'WhatsApp, Zoom, Google Meet, Google Calendar & Razorpay payment gateway',
    status: 'coming_soon',
    color: 'from-indigo-500 to-violet-600'
  }
]

const institutionTypes = [
  { icon: School, name: 'Primary Schools', grades: 'Grades 1-5' },
  { icon: School, name: 'Middle Schools', grades: 'Grades 6-8' },
  { icon: Building, name: 'High Schools', grades: 'Grades 9-12' },
  { icon: GraduationCap, name: 'Colleges', grades: 'Higher Education' },
  { icon: Building2, name: 'Universities', grades: 'Degree Programs' },
  { icon: BookOpen, name: 'Coaching Centers', grades: 'Test Prep' }
]

const stats = [
  { value: '17+', label: 'Core Modules' },
  { value: '2 Sec', label: 'Generate Question Papers' },
  { value: '100%', label: 'AI Powered' },
  { value: '24/7', label: 'Cloud Hosted' }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState('')

  const handleNotify = (e) => {
    e.preventDefault()
    if (!email) return
    
    // Create Google Calendar event URL
    const eventTitle = encodeURIComponent('Meridian EMS Demo Request')
    const eventDetails = encodeURIComponent(`Demo request from: ${email}\n\nSchedule a demo call to explore Meridian EMS features.`)
    const eventLocation = encodeURIComponent('Google Meet')
    
    // Set event for next week
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 7)
    startDate.setHours(10, 0, 0, 0)
    const endDate = new Date(startDate)
    endDate.setHours(11, 0, 0, 0)
    
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '')
    const startStr = formatDate(startDate)
    const endStr = formatDate(endDate)
    
    // Google Calendar URL with pre-filled guest
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}&dates=${startStr}/${endStr}&add=${encodeURIComponent(config.demoBookingEmail)},${encodeURIComponent(email)}`
    
    // Open Google Calendar in new tab
    window.open(calendarUrl, '_blank')
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Meridian <span className="text-primary-600">EMS</span></span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition">Pricing</a>
              <a href="#institutions" className="text-gray-600 hover:text-primary-600 transition">Institutions</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 transition">Contact</a>
              <Link to="/login" className="text-gray-600 hover:text-primary-600 transition font-medium">
                Login
              </Link>
              <Link to="/login" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-gray-100 px-4 py-4"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition py-2">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition py-2">Pricing</a>
              <a href="#institutions" className="text-gray-600 hover:text-primary-600 transition py-2">Institutions</a>
              <a href="#contact" className="text-gray-600 hover:text-primary-600 transition py-2">Contact</a>
              <Link to="/login" className="text-gray-600 hover:text-primary-600 transition py-2 font-medium">
                Login
              </Link>
              <Link to="/login" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-center">
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">AI-Powered Education Platform</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
            >
              Smart Education
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                Management System
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Complete solution for Schools, Colleges & Universities. 
              Streamline administration, enhance learning with AI, and connect everyone on one platform.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-full sm:w-80"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center gap-2"
                >
                  Notify Me <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>

            {/* Device Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex justify-center items-center gap-4 text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                <span className="text-sm">Desktop</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span className="text-sm">Mobile Ready</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-primary-50/50 to-transparent -z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Everything You Need
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              17+ comprehensive modules to manage your entire institution
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {feature.status === 'coming_soon' ? (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Available
                    </span>
                  )}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Institution Types */}
      <section id="institutions" className="py-16 md:py-24 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Built for All Institution Types
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-primary-100 max-w-2xl mx-auto"
            >
              One platform that adapts to your institution's unique needs
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {institutionTypes.map((type, index) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition"
              >
                <type.icon className="w-8 h-8 mx-auto mb-2 text-primary-200" />
                <h3 className="font-semibold text-sm mb-1">{type.name}</h3>
                <p className="text-xs text-primary-200">{type.grades}</p>
              </motion.div>
            ))}
          </div>

          {/* Features List */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Multi-Tenant Architecture</h4>
                <p className="text-sm text-primary-200">Complete data isolation for each institution</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Scalable Infrastructure</h4>
                <p className="text-sm text-primary-200">From 50 students to 50,000+ with ease</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Custom Branding</h4>
                <p className="text-sm text-primary-200">Your logo, colors, and domain</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Enabled Platform</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Powered by Advanced AI
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Built with <strong>Advanced AI</strong> for lightning-fast, intelligent education management. Generate question papers in seconds!
              </p>
              <ul className="space-y-3">
                {[
                  'AI Question Paper Generator - Create papers from topics instantly',
                  'AI Homework Creator - Generate assignments with one click',
                  'Smart AI Chatbot - 24/7 assistant for teachers & admins',
                  'Auto-generate Reports & Analytics',
                  'Intelligent Search across all modules',
                  'Coming: Predictive Analytics & Personalized Learning'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition font-medium">
                  Try AI Features <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Brain className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Meridian AI Assistant</h3>
                    <p className="text-sm text-purple-200">Powered by AI • Always ready</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <p className="text-sm text-purple-100 mb-1">You:</p>
                    <p className="text-white">Generate a 10th grade Physics test on Newton's Laws with 20 MCQs</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 ml-4">
                    <p className="text-sm text-purple-200 mb-1">AI Assistant:</p>
                    <p className="text-white text-sm">Creating your question paper with 20 MCQs on Newton's Laws of Motion...</p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-1 bg-green-500/30 text-green-200 text-xs rounded">Easy: 5</span>
                      <span className="px-2 py-1 bg-yellow-500/30 text-yellow-200 text-xs rounded">Medium: 10</span>
                      <span className="px-2 py-1 bg-red-500/30 text-red-200 text-xs rounded">Hard: 5</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-purple-200">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Live & Available Now
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Choose Your Plan
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Flexible pricing for institutions of all sizes
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-3xl font-bold text-gray-900">₹0</div>
                <p className="text-gray-500 text-sm mt-1">Forever free</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Up to 100 students
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Up to 20 staff
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Basic features
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Email support
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-400">
                  <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  No AI features
                </li>
              </ul>
              <button 
                onClick={() => {
                  const eventTitle = encodeURIComponent('Meridian EMS - Free Plan Inquiry')
                  const eventDetails = encodeURIComponent('Inquiry about Meridian EMS Free Plan features and getting started.')
                  const startDate = new Date()
                  startDate.setDate(startDate.getDate() + 7)
                  startDate.setHours(10, 0, 0, 0)
                  const endDate = new Date(startDate)
                  endDate.setHours(11, 0, 0, 0)
                  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '')
                  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${formatDate(startDate)}/${formatDate(endDate)}&add=${encodeURIComponent(config.demoBookingEmail)}`, '_blank')
                }}
                className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Get Started
              </button>
            </motion.div>

            {/* Basic Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="text-3xl font-bold text-gray-900">₹4,999<span className="text-base font-normal text-gray-500">/mo</span></div>
                <p className="text-gray-500 text-sm mt-1">For growing schools</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Up to 500 students
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Up to 50 staff
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  All basic features
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  SMS notifications
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Priority support
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  AI: 10 requests/day
                </li>
              </ul>
              <button 
                onClick={() => {
                  const eventTitle = encodeURIComponent('Meridian EMS - Basic Plan Demo')
                  const eventDetails = encodeURIComponent('Demo request for Meridian EMS Basic Plan (₹4,999/mo)\n\nFeatures: 500 students, 50 staff, SMS notifications, AI 10 requests/day')
                  const startDate = new Date()
                  startDate.setDate(startDate.getDate() + 7)
                  startDate.setHours(10, 0, 0, 0)
                  const endDate = new Date(startDate)
                  endDate.setHours(11, 0, 0, 0)
                  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '')
                  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${formatDate(startDate)}/${formatDate(endDate)}&add=${encodeURIComponent(config.demoBookingEmail)}`, '_blank')
                }}
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Upgrade
              </button>
            </motion.div>

            {/* Premium Plan - Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white relative hover:shadow-xl transition-shadow"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">POPULAR</span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <div className="text-3xl font-bold">₹9,999<span className="text-base font-normal text-primary-200">/mo</span></div>
                <p className="text-primary-200 text-sm mt-1">For large institutions</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" />
                  Up to 2000 students
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" />
                  Up to 200 staff
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" />
                  All premium features
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" />
                  Online payments
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" />
                  24/7 support
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  AI: 20 requests/day
                </li>
              </ul>
              <button 
                onClick={() => {
                  const eventTitle = encodeURIComponent('Meridian EMS - Premium Plan Demo')
                  const eventDetails = encodeURIComponent('Demo request for Meridian EMS Premium Plan (₹9,999/mo)\n\nFeatures: 2000 students, 200 staff, Online payments, 24/7 support, AI 20 requests/day')
                  const startDate = new Date()
                  startDate.setDate(startDate.getDate() + 7)
                  startDate.setHours(10, 0, 0, 0)
                  const endDate = new Date(startDate)
                  endDate.setHours(11, 0, 0, 0)
                  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '')
                  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${formatDate(startDate)}/${formatDate(endDate)}&add=${encodeURIComponent(config.demoBookingEmail)}`, '_blank')
                }}
                className="w-full py-2.5 bg-white text-primary-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Upgrade
              </button>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="text-3xl font-bold">Custom</div>
                <p className="text-gray-400 text-sm mt-1">Tailored for you</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Unlimited students
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Unlimited staff
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  All features
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  Dedicated support
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  White-labeling
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-300">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  Custom AI requests
                </li>
              </ul>
              <button 
                onClick={() => {
                  const eventTitle = encodeURIComponent('Meridian EMS - Enterprise Plan Consultation')
                  const eventDetails = encodeURIComponent('Enterprise Plan consultation for Meridian EMS\n\nFeatures: Unlimited students & staff, Custom integrations, Dedicated support, White-labeling, Custom AI requests')
                  const startDate = new Date()
                  startDate.setDate(startDate.getDate() + 7)
                  startDate.setHours(10, 0, 0, 0)
                  const endDate = new Date(startDate)
                  endDate.setHours(11, 0, 0, 0)
                  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d{3}/g, '')
                  window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&dates=${formatDate(startDate)}/${formatDate(endDate)}&add=${encodeURIComponent(config.demoBookingEmail)}`, '_blank')
                }}
                className="w-full py-2.5 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Contact Sales
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact / Notify Section */}
      <section id="contact" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Schedule a Demo
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Enter your email to schedule a demo call and explore Meridian EMS features
            </p>

            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Book Demo
              </button>
            </form>
            <p className="text-sm text-gray-500 mt-3">
              Opens Google Calendar to schedule a meeting
            </p>

            <div className="mt-12 flex flex-col md:flex-row justify-center items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-600" />
                <span>{config.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary-600" />
                <span>{config.contactPhone}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
                <span className="text-xl font-bold text-white">Meridian <span className="text-primary-400">EMS</span></span>
              </div>
              <p className="text-sm text-gray-500">
                AI-powered education management for modern institutions.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#institutions" className="hover:text-white transition">Institutions</a></li>
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">GDPR Compliance</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <span>{config.contactEmail}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <span>{config.contactPhone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>{config.companyAddress}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Meridian EMS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition">Terms</Link>
              <Link to="/contact" className="hover:text-white transition">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
