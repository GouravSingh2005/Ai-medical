// AI Chat Interface Component
import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Send, Loader2, AlertCircle, CheckCircle, Calendar, User, Bot } from 'lucide-react';

interface ChatInterfaceProps {
  patientId: string;
  patientName?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ patientId, patientName }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [locationShared, setLocationShared] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    diagnosis,
    appointment,
    isConnected,
    sessionId,
    sendMessage,
    sendLocation,
    startSession,
    endSession,
    isLoading,
  } = useWebSocket('ws://localhost:3001/ws');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Start session when component mounts
  useEffect(() => {
    if (isConnected && !sessionId) {
      startSession(patientId, patientName);
    }
  }, [isConnected, sessionId, patientId, patientName, startSession]);

  // Request geolocation when session starts
  useEffect(() => {
    if (sessionId && !locationShared) {
      requestLocation();
    }
  }, [sessionId]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sendLocation(latitude, longitude);
        setLocationShared(true);
        console.log(`📍 Location captured: ${latitude}, ${longitude}`);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        // Continue without location (non-blocking)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Medical Assistant</h1>
            <p className="text-sm text-gray-600">
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Connected - Session Active
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Connecting...
                </span>
              )}
            </p>
          </div>
          {sessionId && (
            <button
              onClick={endSession}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              End Session
            </button>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'patient' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 shadow-md ${
                message.type === 'patient'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'ai'
                  ? 'bg-white text-gray-800'
                  : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.type === 'ai' && (
                  <Bot className="w-5 h-5 mt-1 flex-shrink-0 text-blue-600" />
                )}
                {message.type === 'patient' && (
                  <User className="w-5 h-5 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Diagnosis Card */}
      {diagnosis && (
        <div className="mx-6 mb-4 bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Diagnosis Summary</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Top Condition:</span>{' '}
                  {diagnosis.diseases[0]?.name} ({diagnosis.diseases[0]?.confidence}% confidence)
                </div>
                <div>
                  <span className="font-semibold">Severity:</span>{' '}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getUrgencyColor(diagnosis.urgencyLevel)}`}>
                    {diagnosis.urgencyLevel.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Recommended Specialty:</span>{' '}
                  {diagnosis.recommendedSpecialty}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Card */}
      {appointment && (
        <div className="mx-6 mb-4 bg-green-50 rounded-xl shadow-lg p-6 border-l-4 border-green-600">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Appointment Scheduled</h3>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                </span>
              </div>
              {appointment.notes && (
                <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex gap-3">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms..."
            disabled={!sessionId || isLoading}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !sessionId || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">
          ⚠️ This is an AI-powered preliminary screening tool. Always consult a real healthcare professional.
        </p>
      </div>
    </div>
  );
};
