import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, Calendar, Stethoscope, ArrowRight, 
  Brain, Shield, Clock, Sparkles 
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Chat with AI to Identify Illness',
      description: 'Describe your symptoms in natural language and get instant AI-powered analysis',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Brain,
      title: 'Get Severity and Doctor Suggestions',
      description: 'Receive severity assessment and personalized doctor recommendations',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Calendar,
      title: 'Book Appointment on Calendar',
      description: 'Schedule appointments with recommended doctors seamlessly',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.h1
                className="text-5xl lg:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  Your Personal AI
                </span>
                <br />
                <span className="text-gray-900 dark:text-white">
                  Health Assistant
                </span>
              </motion.h1>
              
              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Chat, Diagnose, and Book Appointments Seamlessly with AI
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/patient-login">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center gap-2"
                  >
                    Get Started
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
                
                <Link to="/doctor-login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                  >
                    Doctor Portal
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Animated Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative w-full max-w-lg mx-auto">
                {/* Main Circle */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-blue-300 dark:border-blue-600"
                />
                
                {/* Center Doctor Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="relative z-10 w-32 h-32 mx-auto bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-2xl"
                >
                  <Stethoscope size={48} className="text-white" />
                </motion.div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Brain size={24} className="text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Shield size={24} className="text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [-5, 15, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute top-1/2 -right-8 w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Sparkles size={20} className="text-white" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of healthcare with our AI-powered platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="bg-white dark:bg-slate-700 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-slate-600 h-full">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon size={32} className="text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Healthcare Experience?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users who trust our AI-powered health assistant
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/patient-login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start as Patient
                </motion.button>
              </Link>
              
              <Link to="/doctor-login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                >
                  Join as Doctor
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Chat Bubble */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="fixed bottom-8 left-8 max-w-sm z-40 hidden lg:block"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-2xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Try typing:</p>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-700 rounded-lg p-2"
              >
                "I have had a sore throat for 3 days"
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;