import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, Clock, AlertCircle, User, Phone, 
  Mail, Filter, Search, ToggleLeft, ToggleRight, LogOut 
} from 'lucide-react';

import ThemeToggle from './ThemeToggle';

interface Patient {
  id: string;
  name: string;
  age: number;
  symptoms: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
  appointmentTime: string;
  contact: string;
  predictedCondition: string;
}

interface DoctorDashboardProps {
  onLogout: () => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onLogout, isDark, setIsDark }) => {

  const [activeTab, setActiveTab] = useState<'patients' | 'calendar'>('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isAvailable, setIsAvailable] = useState(true);

  const patients: Patient[] = [
    {
      id: '1',
      name: 'Pratik Patil',
      age: 20,
      symptoms: ['Chest pain', 'Fever', 'Fatigue'],
      severity: 'Moderate',
      appointmentTime: 'Today 2:00 PM',
      contact: 'pratikpatil123@email.com',
      predictedCondition: 'Viral Infection'
    },
    {
      id: '2',
      name: 'Mangesh Lavate',
      age: 21,
      symptoms: ['Chest Pain', 'Shortness of Breath'],
      severity: 'Severe',
      appointmentTime: 'Today 3:30 PM',
      contact: 'sarah.j@email.com',
      predictedCondition: 'Cardiac Concern'
    },
    {
      id: '3',
      name: 'Mohan Gawande',
      age: 22,
      symptoms: ['Back Pain', 'Stiffness'],
      severity: 'Mild',
      appointmentTime: 'Tomorrow 10:00 AM',
      contact: 'mohangawandeemail.com',
      predictedCondition: 'Musculoskeletal'
    },
    {
      id: '4',
      name: 'Amit kumar',
      age: 20,
      symptoms: ['Nausea', 'Dizziness', 'Fatigue'],
      severity: 'Moderate',
      appointmentTime: 'Tomorrow 11:30 AM',
      contact: 'Amitkumar@gmail.com',
      predictedCondition: 'Gastroenteritis'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.predictedCondition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || patient.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Mild': return 'text-green-400 bg-green-500/20';
      case 'Moderate': return 'text-yellow-400 bg-yellow-500/20';
      case 'Severe': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 pb-20"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Doctor Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Welcome back, Dr. Sarah Wilson</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Availability Toggle */}
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-slate-700/50 rounded-lg p-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Availability:</span>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAvailable(!isAvailable)}
                  className="flex items-center gap-2"
                >
                  {isAvailable ? (
                    <ToggleRight className="text-green-500 dark:text-green-400" size={24} />
                  ) : (
                    <ToggleLeft className="text-gray-500 dark:text-gray-400" size={24} />
                  )}
                  <span className={`text-sm font-medium ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </motion.button>
              </div>
              
              <div className="flex items-center">
                <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Today's Patients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-500/20 p-3 rounded-lg">
              <Users className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Appointments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-500/20 p-3 rounded-lg">
              <Calendar className="text-yellow-600 dark:text-yellow-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Critical Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
            <div className="bg-red-100 dark:bg-red-500/20 p-3 rounded-lg">
              <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-200 dark:border-slate-700/50 w-fit">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'patients'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Users size={18} />
            Patients
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === 'calendar'
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Calendar size={18} />
            Calendar
          </motion.button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'patients' && (
            <motion.div
              key="patients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Filters */}
              <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg pl-10 pr-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="text-gray-500 dark:text-gray-400" size={18} />
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Severities</option>
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Patient Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredPatients.map((patient, index) => (
                    <motion.div
                      key={patient.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50 hover:border-gray-300 dark:hover:border-slate-600/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Age: {patient.age}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(patient.severity)}`}>
                          {patient.severity}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Predicted Condition:</p>
                          <p className="text-blue-600 dark:text-blue-400 font-medium">{patient.predictedCondition}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Symptoms:</p>
                          <div className="flex flex-wrap gap-2">
                            {patient.symptoms.map((symptom) => (
                              <span
                                key={symptom}
                                className="px-2 py-1 bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700/50">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock size={16} />
                            <span>{patient.appointmentTime}</span>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                            >
                              <Mail size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors"
                            >
                              <Phone size={16} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50"
            >
              <div className="text-center py-12">
                <Calendar size={64} className="mx-auto mb-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Calendar View</h3>
                <p className="text-gray-600 dark:text-gray-400">Calendar integration coming soon</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DoctorDashboard;