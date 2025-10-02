import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, Sun, Moon } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, setIsDark }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Patient Login', path: '/patient-login' },
    { name: 'Doctor Login', path: '/doctor-login' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center"
            >
              <Stethoscope size={18} className="text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              AI Health
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="relative group"
              >
                <motion.span
                  className={`text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-300 ${
                    location.pathname === item.path ? 'text-blue-500 dark:text-blue-400' : ''
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {item.name}
                </motion.span>
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 group-hover:w-full transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                />
              </Link>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;