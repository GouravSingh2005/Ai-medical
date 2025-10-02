import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import PatientDashboard from './components/PatientDashboard';
import BookingCalendar from './components/BookingCalendar';
import DoctorDashboard from './components/DoctorDashboard';

export type UserType = 'patient' | 'doctor' | null;

const AppContent: React.FC = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (type: UserType) => {
    setUserType(type);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserType(null);
    setIsLoggedIn(false);
  };

  // Don't show navbar on dashboard pages for cleaner experience
  const showNavbar = !location.pathname.includes('dashboard') && !location.pathname.includes('booking');

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-300">
        {showNavbar && <Navbar isDark={isDark} setIsDark={setIsDark} />}
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/patient-login" 
              element={
                !isLoggedIn ? (
                  <LoginPage onLogin={handleLogin} userType="patient" />
                ) : userType === 'patient' ? (
                  <Navigate to="/patient-dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/doctor-login" 
              element={
                !isLoggedIn ? (
                  <LoginPage onLogin={handleLogin} userType="doctor" />
                ) : userType === 'doctor' ? (
                  <Navigate to="/doctor-dashboard" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/patient-dashboard" 
              element={
                isLoggedIn && userType === 'patient' ? (
                  <PatientDashboard onLogout={handleLogout} isDark={isDark} setIsDark={setIsDark} />
                ) : (
                  <Navigate to="/patient-login" replace />
                )
              } 
            />
            <Route 
              path="/booking" 
              element={
                isLoggedIn && userType === 'patient' ? (
                  <BookingCalendar onLogout={handleLogout} isDark={isDark} setIsDark={setIsDark} />
                ) : (
                  <Navigate to="/patient-login" replace />
                )
              } 
            />
            <Route 
              path="/doctor-dashboard" 
              element={
                isLoggedIn && userType === 'doctor' ? (
                  <DoctorDashboard onLogout={handleLogout} isDark={isDark} setIsDark={setIsDark} />
                ) : (
                  <Navigate to="/doctor-login" replace />
                )
              } 
            />
          </Routes>
        </AnimatePresence>

        <footer className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-slate-700/50 p-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <p className="mb-2 sm:mb-0">Made with ❤️ by your AI Health Companion</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;