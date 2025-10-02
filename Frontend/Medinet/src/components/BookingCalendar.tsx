import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface BookingCalendarProps {
  onLogout: () => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ isDark, setIsDark }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timeSlots: TimeSlot[] = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: false },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '11:30 AM', available: true },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
    { time: '03:00 PM', available: false },
    { time: '03:30 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '04:30 PM', available: true },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
  };

  const handleBooking = () => {
    setShowConfirmModal(true);
  };

  const confirmBooking = () => {
    setShowConfirmModal(false);
    // Here you would typically make an API call
    setTimeout(() => {
      navigate('/patient-dashboard');
    }, 1500);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 pb-20"
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-slate-700/50">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/patient-dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </motion.button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar size={28} />
              Book Appointment
            </h1>
          </div>
          <div className="flex items-center">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </motion.button>
            
            <motion.h2 
              key={currentDate.getMonth()}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </motion.h2>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-gray-600 dark:text-gray-400 text-sm font-medium p-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <motion.div 
            key={currentDate.getMonth()}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-7 gap-2"
          >
            {getDaysInMonth(currentDate).map((day, index) => (
              <motion.div
                key={index}
                whileHover={day ? { scale: 1.05 } : {}}
                whileTap={day ? { scale: 0.95 } : {}}
                onClick={() => day && handleDateSelect(day)}
                className={`aspect-square flex items-center justify-center rounded-lg cursor-pointer transition-all ${
                  day
                    ? selectedDate?.toDateString() === day.toDateString()
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : day < new Date()
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white'
                    : ''
                }`}
              >
                {day ? day.getDate() : ''}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Time Slots */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-700/50">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock size={24} />
            Available Time Slots
          </h3>

          {selectedDate ? (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <AnimatePresence>
                  {timeSlots.map((slot, index) => (
                    <motion.button
                      key={slot.time}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={slot.available ? { scale: 1.05 } : {}}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                      onClick={() => slot.available && handleSlotSelect(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        slot.available
                          ? selectedSlot === slot.time
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                            : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white'
                          : 'bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                      {!slot.available && (
                        <span className="block text-xs mt-1">Booked</span>
                      )}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-100 dark:bg-slate-700/50 rounded-lg p-4 mb-4"
                >
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Appointment Summary</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Doctor: Dr. Sarah Wilson</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date: {selectedDate.toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Time: {selectedSlot}</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBooking}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-2 rounded-lg transition-all duration-300"
                  >
                    Confirm Booking
                  </motion.button>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400 py-12">
              <Calendar size={48} className="mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-600" />
              <p>Please select a date to view available time slots</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-gray-200 dark:border-slate-700 shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle size={32} className="text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Booking Confirmed!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your appointment has been successfully booked with Dr. Sarah Wilson
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmBooking}
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg transition-colors"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BookingCalendar;