import React, { useState } from 'react';
import { MedicalChat } from './MedicalChat.js';
import ThemeToggle from './ThemeToggle.js';
import { LogOut } from 'lucide-react';

interface ConsultationPageNewProps {
  patientId: string;
  patientName?: string;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onLogout: () => void;
}

export const ConsultationPageNew: React.FC<ConsultationPageNewProps> = ({
  patientId,
  patientName,
  isDark,
  setIsDark,
  onLogout,
}) => {
  const [showChat, setShowChat] = useState(false);

  if (!showChat) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
          {/* Header */}
          <div className="absolute top-6 right-6 flex items-center gap-4">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Content */}
          <div className="max-w-2xl w-full text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🏥 AI Medical Assistant
            </h1>

            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
              Get instant medical guidance powered by artificial intelligence
            </p>

            {/* How it Works */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>

              <div className="space-y-4 text-left">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Describe Your Symptoms</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Chat with our AI doctor about your health concerns
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Answer Follow-up Questions</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      The AI will ask relevant questions to understand your condition better
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Receive Diagnosis</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Get AI-analyzed possible conditions with confidence scores
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Book Appointment</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Automatically matched with appropriate specialist based on urgency
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">AI Powered</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Advanced GPT-4 analysis
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Real-time</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  WebSocket powered chat
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Secure</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your data is protected
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Important:</strong> This is an AI-powered preliminary screening tool. It does NOT replace professional medical advice. Always consult qualified healthcare professionals.
              </p>
            </div>

            {/* Start Button */}
            <button
              onClick={() => setShowChat(true)}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Start Consultation
            </button>
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>🔌 Powered by WebSocket Real-time Communication</p>
            <p>🧠 Multi-Agent AI System for Healthcare</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark' : ''}`}>
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowChat(false)}
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Info
          </button>

          <div className="flex items-center gap-4">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Chat */}
        <MedicalChat
          patientId={patientId}
          patientName={patientName}
          onSessionEnd={() => setShowChat(false)}
        />
      </div>
    </div>
  );
};
