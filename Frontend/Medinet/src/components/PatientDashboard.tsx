import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Plus, Send, Calendar, LogOut, FileText, Camera, 
  MicIcon, AlertCircle, Clock, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface PatientDashboardProps {
  onLogout: () => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ onLogout, isDark, setIsDark }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI Health Assistant. Please describe your symptoms, and I\'ll help analyze them.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mock extracted data
  const [extractedSymptoms] = useState(['Headache', 'Fever', 'Fatigue']);
  const [predictedDisease] = useState('Viral Infection');
  const [severity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [doctorSpecialization] = useState(['General Medicine', 'Internal Medicine']);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: inputText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      setIsTyping(true);

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'Thank you for providing that information. Based on your symptoms, I\'ve updated the analysis. Please review the extracted symptoms and disease prediction on the right panel.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        <div className="flex justify-between items-center bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-slate-700/50">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Dashboard</h1>
          <div className="flex gap-4">
            <div className="flex items-center">
              <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/booking')}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
            >
              <Calendar size={18} />
              Book Appointment
            </motion.button>
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

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Chat Interface - Left Side */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-slate-700/50 h-[600px] flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/25'
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="bg-gray-200 dark:bg-slate-700 px-4 py-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-green-500 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                {/* Plus Menu */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    className="p-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-full transition-colors"
                  >
                    <Plus size={20} className={`transition-transform ${showPlusMenu ? 'rotate-45' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showPlusMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute bottom-full mb-2 bg-white dark:bg-slate-800 rounded-lg p-2 border border-gray-200 dark:border-slate-700 shadow-xl"
                      >
                        <div className="flex flex-col gap-1">
                          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-sm text-gray-700 dark:text-gray-300">
                            <FileText size={16} />
                            Upload File
                          </button>
                          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-sm text-gray-700 dark:text-gray-300">
                            <Camera size={16} />
                            Take Photo
                          </button>
                          <button className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded text-sm text-gray-700 dark:text-gray-300">
                            <MicIcon size={16} />
                            Record Audio
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Input Field */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Speak your symptoms or type..."
                    className="w-full bg-gray-100 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600/50 rounded-xl px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Voice Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                      : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'
                  }`}
                  animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
                  transition={isRecording ? { duration: 1, repeat: Infinity } : {}}
                >
                  <Mic size={20} />
                </motion.button>

                {/* Send Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Panel - Right Side */}
        <div className="space-y-6">
          {/* Extracted Symptoms */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="text-blue-500 dark:text-blue-400" size={20} />
              Extracted Symptoms
            </h3>
            <div className="space-y-2">
              {extractedSymptoms.map((symptom, index) => (
                <motion.div
                  key={symptom}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700/50 rounded-lg p-2"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{symptom}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Predicted Disease */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="text-yellow-500 dark:text-yellow-400" size={20} />
              Predicted Condition
            </h3>
            <div className="space-y-3">
              <p className="text-xl font-medium text-blue-600 dark:text-blue-400">{predictedDisease}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Severity:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  severity === 'Mild' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' :
                  severity === 'Moderate' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'
                }`}>
                  {severity}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Doctor Specialization */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommended Specialization</h3>
            <div className="flex flex-wrap gap-2">
              {doctorSpecialization.map((spec, index) => (
                <motion.span
                  key={spec}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs"
                >
                  {spec}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Doctor Suggestion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recommended Doctor</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Dr. Sarah Wilson</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Internal Medicine</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock size={16} />
                <span>Available: Today 2:00 PM - 6:00 PM</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/booking')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-2 rounded-lg transition-all duration-300"
              >
                Book Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PatientDashboard;