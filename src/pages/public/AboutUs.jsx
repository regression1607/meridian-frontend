import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Target, Eye, Heart, Users, Award, Globe,
  Lightbulb, Shield, Zap, GraduationCap
} from 'lucide-react'

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Continuously pushing boundaries with AI-powered solutions for education.',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'Your data security is our top priority with enterprise-grade protection.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Heart,
    title: 'Student-Centric',
    description: 'Every feature is designed to enhance the learning experience.',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: Zap,
    title: 'Simplicity',
    description: 'Powerful features made simple and accessible for everyone.',
    color: 'bg-purple-100 text-purple-600'
  }
]

const stats = [
  { value: '17+', label: 'Core Features' },
  { value: '6+', label: 'Institution Types' },
  { value: '8+', label: 'Languages' },
  { value: '99.9%', label: 'Uptime Target' }
]

const team = [
  {
    name: 'Vision',
    role: 'What We Aim For',
    description: 'To be the most comprehensive and intelligent education management platform globally, empowering institutions of all sizes.',
    icon: Eye
  },
  {
    name: 'Mission',
    role: 'What We Do',
    description: 'To simplify educational administration through innovative technology, enabling educators to focus on what matters most - teaching.',
    icon: Target
  }
]

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-100 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Meridian EMS</h1>
            <p className="text-xl text-primary-100 max-w-2xl">
              Transforming education management with AI-powered innovation
            </p>
          </motion.div>
        </div>
      </header>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Meridian EMS was born from a simple observation: educational institutions spend countless hours 
                  on administrative tasks that could be automated, taking valuable time away from actual education.
                </p>
                <p>
                  We set out to build a comprehensive platform that handles everything from admissions to 
                  alumni management, powered by cutting-edge AI technology. Our goal is to make administrative 
                  work seamless so educators can focus on what they do best - nurturing the next generation.
                </p>
                <p>
                  Today, Meridian EMS is designed to serve institutions of all sizes - from small coaching 
                  centers to large universities - with a unified platform that adapts to their unique needs.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-2xl p-6 text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {team.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-primary-600 font-medium mb-4">{item.role}</p>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition"
              >
                <div className={`w-12 h-12 ${value.color} rounded-xl flex items-center justify-center mb-4`}>
                  <value.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Meridian EMS?</h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              Built for modern educational institutions
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: 'All-in-One Platform', desc: '17+ integrated modules for complete management' },
              { icon: Globe, title: 'Multi-Language Support', desc: 'Serve diverse communities with 8+ languages' },
              { icon: Shield, title: 'Enterprise Security', desc: 'GDPR, FERPA compliant with end-to-end encryption' },
              { icon: Users, title: 'Multi-Tenant Architecture', desc: 'Complete data isolation for each institution' },
              { icon: Zap, title: 'AI-Powered Insights', desc: 'Smart analytics and automation with Google Gemini' },
              { icon: Award, title: 'Scalable Solution', desc: 'From 50 students to 50,000+ with ease' }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
              >
                <item.icon className="w-8 h-8 text-primary-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-primary-200 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Institution?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the waitlist and be among the first to experience Meridian EMS
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Meridian EMS. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
