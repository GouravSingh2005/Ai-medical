import React, { useEffect, useRef } from 'react';
import { Loader2, WifiOff, AlertCircle } from 'lucide-react';
import { useMedicalChat } from '../hooks/useMedicalChat.js';
import { MessageBubble } from './MessageBubble.js';
import { PatientInput } from './PatientInput.js';
import { DiagnosisPanel } from './DiagnosisPanel.js';
import { BookingConfirmation } from './BookingConfirmation.js';

interface MedicalChatProps {
  patientId: string;
  patientName?: string;
  onSessionEnd?: () => void;
}

export const MedicalChat: React.FC<MedicalChatProps> = ({ patientId, patientName, onSessionEnd }) => {
  const { state, startSession, sendMessage, sendLocation, endSession } = useMedicalChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [locationRequested, setLocationRequested] = React.useState(false);

  // Start session on mount
  useEffect(() => {
    if (state.isConnected && !state.sessionId) {
      startSession(patientId, patientName);
    }
  }, [state.isConnected, state.sessionId, patientId, patientName, startSession]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  // Request location after session starts
  useEffect(() => {
    if (state.sessionId && !locationRequested && navigator.geolocation) {
      setLocationRequested(true);
    }
  }, [state.sessionId, locationRequested]);

  const handleShareLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendLocation(latitude, longitude);
        setLocationRequested(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setLocationRequested(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleEndSession = () => {
    endSession();
    onSessionEnd?.();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-2">
          {state.isConnected ? (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Connecting...</span>
            </>
          )}
        </div>

        {state.sessionId && (
          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
          >
            End Session
          </button>
        )}
      </div>

      {/* Error Message */}
      {state.error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{state.error}</p>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {state.messages.length === 0 && state.isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Starting consultation...</p>
            </div>
          </div>
        )}

        {state.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {state.isLoading && state.messages.length > 0 && (
          <div className="flex justify-start mb-4">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg rounded-bl-none px-4 py-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">AI Doctor is thinking...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Diagnosis Panel */}
      {state.diagnosis && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 overflow-y-auto max-h-80 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🩺 AI Assessment</h3>
          <DiagnosisPanel diagnosis={state.diagnosis} />
        </div>
      )}

      {/* Appointment Confirmation */}
      {state.appointment && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 overflow-y-auto max-h-80 bg-gray-50 dark:bg-gray-800">
          <BookingConfirmation appointment={state.appointment} />
        </div>
      )}

      {/* Input */}
      <PatientInput
        onSendMessage={sendMessage}
        onShareLocation={handleShareLocation}
        isLoading={state.isLoading}
        isDisabled={!state.isConnected || !state.sessionId}
        locationRequested={locationRequested}
      />
    </div>
  );
};
