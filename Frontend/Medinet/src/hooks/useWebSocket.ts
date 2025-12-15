// WebSocket Hook for Real-time Communication
import { useEffect, useRef, useState, useCallback } from 'react';

interface Message {
  id: string;
  type: 'patient' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface DiagnosisResult {
  diseases: Array<{
    name: string;
    confidence: number;
    severity: number;
    description?: string;
  }>;
  severityScore: number;
  recommendedSpecialty: string;
  recommendedActions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface Appointment {
  appointmentId: string;
  doctorId: string;
  date: Date;
  time: string;
  severityPriority: number;
  status: string;
  notes?: string;
}

interface UseWebSocketReturn {
  messages: Message[];
  diagnosis: DiagnosisResult | null;
  appointment: Appointment | null;
  isConnected: boolean;
  sessionId: string | null;
  sendMessage: (message: string) => void;
  sendLocation: (latitude: number, longitude: number) => void;
  startSession: (patientId: string, patientName?: string) => void;
  endSession: () => void;
  getHistory: (patientId: string) => void;
  isLoading: boolean;
}

export const useWebSocket = (wsUrl: string): UseWebSocketReturn => {
  const ws = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const connectWebSocket = () => {
      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsLoading(false);
        };

        ws.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [wsUrl]);

  const handleWebSocketMessage = (data: any) => {
    setIsLoading(false);

    switch (data.type) {
      case 'connected':
        console.log('Connected to server:', data.payload.message);
        break;

      case 'session_started':
        setSessionId(data.payload.sessionId);
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          content: data.payload.message,
          timestamp: new Date(data.payload.timestamp),
        });
        break;

      case 'message':
        addMessage({
          id: Date.now().toString(),
          type: 'ai',
          content: data.payload.message,
          timestamp: new Date(data.payload.timestamp),
        });
        break;

      case 'diagnosis':
        setDiagnosis(data.payload.diagnosis);
        break;

      case 'appointment':
        setAppointment(data.payload.appointment);
        break;

      case 'history':
        // Handle history data
        console.log('History:', data.payload.history);
        break;

      case 'error':
        console.error('Server error:', data.payload.error);
        addMessage({
          id: Date.now().toString(),
          type: 'system',
          content: `Error: ${data.payload.error}`,
          timestamp: new Date(),
        });
        break;

      case 'pong':
        // Keep-alive response
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendMessage = useCallback((message: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    if (!sessionId) {
      console.error('No active session');
      return;
    }

    // Add patient message to UI immediately
    addMessage({
      id: Date.now().toString(),
      type: 'patient',
      content: message,
      timestamp: new Date(),
    });

    // Send to server
    setIsLoading(true);
    ws.current.send(
      JSON.stringify({
        type: 'message',
        payload: { message },
      })
    );
  }, [sessionId]);

  const startSession = useCallback((patientId: string, patientName?: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    // Reset state
    setMessages([]);
    setDiagnosis(null);
    setAppointment(null);
    setIsLoading(true);

    ws.current.send(
      JSON.stringify({
        type: 'start',
        payload: { patientId, patientName },
      })
    );
  }, []);

  const endSession = useCallback(() => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.current.send(
      JSON.stringify({
        type: 'end',
      })
    );

    setSessionId(null);
  }, []);

  const sendLocation = useCallback((latitude: number, longitude: number) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    if (!sessionId) {
      console.error('No active session');
      return;
    }

    ws.current.send(
      JSON.stringify({
        type: 'location',
        payload: { latitude, longitude },
      })
    );

    console.log(`📍 Location sent: ${latitude}, ${longitude}`);
  }, [sessionId]);

  const getHistory = useCallback((patientId: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.current.send(
      JSON.stringify({
        type: 'history',
        payload: { patientId },
      })
    );
  }, []);

  return {
    messages,
    diagnosis,
    appointment,
    isConnected,
    sessionId,
    sendMessage,
    sendLocation,
    startSession,
    endSession,
    getHistory,
    isLoading,
  };
};
