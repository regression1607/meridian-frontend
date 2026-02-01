import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import config from '../../config'
import {
  HelpCircle, Book, MessageCircle, Mail, Phone, ChevronDown,
  ChevronRight, Search, ExternalLink, FileText, Video, Users,
  CreditCard, Calendar, GraduationCap, ClipboardList, Bus,
  Building, BookOpen, Utensils, BarChart3, Settings, Bell
} from 'lucide-react'

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('getting-started')
  const [expandedFaq, setExpandedFaq] = useState(null)

  const categories = [
    { id: 'getting-started', label: 'Getting Started', icon: Book },
    { id: 'students', label: 'Student Management', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: ClipboardList },
    { id: 'fees', label: 'Fees & Payments', icon: CreditCard },
    { id: 'exams', label: 'Exams & Results', icon: GraduationCap },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'transport', label: 'Transport', icon: Bus },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const faqs = {
    'getting-started': [
      {
        q: 'How do I log in to the system?',
        a: 'Use your registered email and password on the login page. If you forgot your password, click "Forgot Password" to reset it via email.'
      },
      {
        q: 'How do I change my password?',
        a: 'Go to Profile > Security Settings > Change Password. Enter your current password and then your new password twice to confirm.'
      },
      {
        q: 'What are the different user roles?',
        a: 'The system has several roles: Platform Admin (manages all institutions), Institution Admin (manages one school), Teachers (manage classes and grades), Students (view their data), and Parents (view their children\'s data).'
      },
      {
        q: 'How do I update my profile information?',
        a: 'Click on your profile picture in the top right corner, then select "Profile". You can update your personal information, contact details, and profile picture.'
      }
    ],
    'students': [
      {
        q: 'How do I add a new student?',
        a: 'Go to Users > Students > Add Student. Fill in the required information including personal details, parent information, and class assignment.'
      },
      {
        q: 'How do I assign a student to a class?',
        a: 'When adding or editing a student, select the appropriate class and section from the dropdown menus. You can also bulk assign students from the Classes page.'
      },
      {
        q: 'How do I view a student\'s complete profile?',
        a: 'Go to Users > Students, find the student in the list, and click on their name or the "View" button to see their complete profile including attendance, grades, and fee status.'
      },
      {
        q: 'Can I import students in bulk?',
        a: 'Yes, go to Users > Students > Import. Download the template Excel file, fill in the student data, and upload it back to import multiple students at once.'
      }
    ],
    'attendance': [
      {
        q: 'How do I mark attendance?',
        a: 'Go to Attendance, select the class, section, and date. You\'ll see a list of students - mark each as Present, Absent, or Late, then click Save.'
      },
      {
        q: 'Can I edit past attendance records?',
        a: 'Yes, select the date you want to edit from the calendar. You can modify attendance records for up to 7 days in the past (configurable by admin).'
      },
      {
        q: 'How do I view attendance reports?',
        a: 'Go to Reports > Attendance Reports. You can filter by class, section, date range, and export the data to Excel or PDF.'
      },
      {
        q: 'Are parents notified about absences?',
        a: 'Yes, if enabled in Settings > Notifications, parents receive automatic alerts via email/SMS when their child is marked absent.'
      }
    ],
    'fees': [
      {
        q: 'How do I create a fee structure?',
        a: 'Go to Fees > Fee Structures > Add Structure. Define the fee components (tuition, transport, etc.), amounts, and applicable classes.'
      },
      {
        q: 'How do I record a fee payment?',
        a: 'Go to Fees > Payments > Record Payment. Select the student, fee type, amount, and payment method. A receipt will be generated automatically.'
      },
      {
        q: 'Can students pay fees online?',
        a: 'Yes, if Razorpay integration is enabled, students/parents can pay fees through the student portal using cards, UPI, or net banking.'
      },
      {
        q: 'How do I send fee reminders?',
        a: 'Go to Fees > Payments, filter for pending payments, select students, and click "Send Reminder". You can also set up automatic reminders in Settings.'
      }
    ],
    'exams': [
      {
        q: 'How do I create an exam?',
        a: 'Go to Exams > Exam Management > Create Exam. Set the exam name, type, date range, and assign subjects with their schedules.'
      },
      {
        q: 'How do I enter exam results?',
        a: 'Go to Exams > Results > Enter Results. Select the exam, class, and subject. Enter marks for each student and save.'
      },
      {
        q: 'How do I generate report cards?',
        a: 'Go to Exams > Report Cards. Select the class, term, and academic year. Click "Generate" to create report cards for all students.'
      },
      {
        q: 'Can I use AI to generate question papers?',
        a: 'Yes! Go to Exams > Question Generator. Select subject, class, topics, and question types. The AI will generate a complete question paper that you can edit and print.'
      }
    ],
    'timetable': [
      {
        q: 'How do I create a class timetable?',
        a: 'Go to Academics > Timetable. Select the class and click "Edit". Drag and drop subjects into time slots, assign teachers, and save.'
      },
      {
        q: 'How do I handle substitutions?',
        a: 'In the timetable view, click on a period and select "Substitute". Choose the replacement teacher and the system will notify them.'
      },
      {
        q: 'Can teachers view their own timetable?',
        a: 'Yes, teachers can see their personalized timetable on their dashboard showing all their classes and periods for each day.'
      }
    ],
    'transport': [
      {
        q: 'How do I add a new bus route?',
        a: 'Go to Transport > Routes > Add Route. Enter the route name, stops with timings, assign a vehicle and driver.'
      },
      {
        q: 'How do I assign students to routes?',
        a: 'Go to Transport > Students. Select students and assign them to their pickup/drop routes and stops.'
      },
      {
        q: 'Can parents track the bus location?',
        a: 'Real-time GPS tracking will be available in a future update. Currently, parents can view route schedules and stop timings.'
      }
    ],
    'library': [
      {
        q: 'How do I add books to the library?',
        a: 'Go to Library > Books > Add Book. Enter book details including title, author, ISBN, and number of copies.'
      },
      {
        q: 'How do I issue a book to a student?',
        a: 'Go to Library > Issue Book. Search for the book and student, then click Issue. The due date will be set automatically based on library rules.'
      },
      {
        q: 'How do I track overdue books?',
        a: 'Go to Library > Issued Books and filter by "Overdue". You can send reminder notifications to students with overdue books.'
      }
    ],
    'reports': [
      {
        q: 'What reports are available?',
        a: 'The system offers reports for Attendance, Fee Collection, Exam Results, Student Performance, and Custom Analytics.'
      },
      {
        q: 'Can I export reports?',
        a: 'Yes, all reports can be exported to PDF or Excel format. Click the Export button on any report page.'
      },
      {
        q: 'How do I create custom reports?',
        a: 'Go to Reports > Custom Reports. Select the data fields you need, apply filters, and generate your custom report.'
      }
    ],
    'settings': [
      {
        q: 'How do I change institution branding?',
        a: 'Go to Settings > Branding. Upload your logo, favicon, and set primary/secondary colors for your institution.'
      },
      {
        q: 'How do I configure notifications?',
        a: 'Go to Settings > Notifications. Toggle on/off email, SMS, and push notifications for various events.'
      },
      {
        q: 'How do I set up integrations?',
        a: 'Integration setup for WhatsApp, Zoom, Google Meet, Google Calendar, and Razorpay will be available in upcoming updates.'
      }
    ]
  }

  const quickLinks = [
    { title: 'User Guide', desc: 'Complete documentation', icon: FileText, href: '#' },
    { title: 'Video Tutorials', desc: 'Step-by-step videos', icon: Video, href: '#' },
    { title: 'FAQs', desc: 'Frequently asked questions', icon: HelpCircle, href: '#' },
    { title: 'Contact Support', desc: 'Get help from our team', icon: MessageCircle, href: '#' }
  ]

  const filteredFaqs = searchQuery
    ? Object.entries(faqs).flatMap(([category, items]) =>
        items.filter(faq =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(faq => ({ ...faq, category }))
      )
    : faqs[activeCategory] || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-500 mt-2">Find answers to your questions and learn how to use Meridian EMS</p>
        
        {/* Search */}
        <div className="mt-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <motion.a
            key={link.title}
            href={link.href}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mb-3">
              <link.icon className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{link.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
          </motion.a>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Categories Sidebar */}
        {!searchQuery && (
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2 sticky top-24">
              <h3 className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Categories</h3>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                    activeCategory === cat.id
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchQuery ? `Search Results (${filteredFaqs.length})` : categories.find(c => c.id === activeCategory)?.label}
              </h2>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <div key={index} className="p-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full flex items-start justify-between text-left"
                    >
                      <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`} />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                          {searchQuery && faq.category && (
                            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {categories.find(c => c.id === faq.category)?.label}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-1">Try different keywords or browse categories</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-8 text-white"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
          <p className="text-primary-100 mb-6">Our support team is here to assist you</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <Mail className="w-6 h-6 mx-auto mb-2" />
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-primary-100 mt-1">{config.supportEmail}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Phone className="w-6 h-6 mx-auto mb-2" />
              <h3 className="font-semibold">Phone Support</h3>
              <p className="text-sm text-primary-100 mt-1">{config.supportPhone}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <MessageCircle className="w-6 h-6 mx-auto mb-2" />
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-primary-100 mt-1">Coming Soon</p>
            </div>
          </div>

          <p className="text-sm text-primary-200 mt-6">Support hours: Monday - Friday, 9 AM - 6 PM IST</p>
        </div>
      </motion.div>
    </div>
  )
}
