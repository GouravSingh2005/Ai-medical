import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, setIsDark }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsDark(!isDark)}
      className="relative w-16 h-8 bg-gray-200 dark:bg-slate-700/50 rounded-full border border-gray-300 dark:border-slate-600/50 backdrop-blur-sm overflow-hidden"
    >
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shadow-lg"
        animate={{
          x: isDark ? 0 : 32,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <motion.div
          initial={false}
          animate={{
            rotate: isDark ? 0 : 180,
          }}
          transition={{
            duration: 0.3
          }}
        >
          {isDark ? (
            <Moon size={12} className="text-white" />
          ) : (
            <Sun size={12} className="text-white" />
          )}
        </motion.div>
      </motion.div>
      
      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <motion.div
          animate={{
            opacity: isDark ? 0.3 : 0.7,
            scale: isDark ? 0.8 : 1
          }}
        >
          <Moon size={14} className="text-slate-400" />
        </motion.div>
        <motion.div
          animate={{
            opacity: isDark ? 0.7 : 0.3,
            scale: isDark ? 1 : 0.8
          }}
        >
          <Sun size={14} className="text-gray-500 dark:text-slate-400" />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;