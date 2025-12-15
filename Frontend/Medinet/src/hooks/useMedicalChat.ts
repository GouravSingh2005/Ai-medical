import { useState, useEffect, useRef, useCallback } from 'react';
import type { WebSocketMessage, SessionState } from '../types/index.js';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws';
const RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export const useMedicalChat = () => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<SessionState>({
    sessionId: null,
    isConnected: false,
    isLoading: false,
    messages: [],
    diagnosis: null,
    appointment: null,
    error: null,
  });

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    try {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setState((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
        }));
        reconnectAttemptsRef.current = 0;

        startHeartbeat();
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState((prev) => ({
          ...prev,
          error: 'Connection error occurred',
        }));
      };

      ws.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setState((prev) => ({
          ...prev,
          isConnected: false,
        }));

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to connect to server',
      }));
    }
  }, []);

  const handleWebSocketMessage = (data: WebSocketMessage) => {
    switch (data.type) {
      case 'connected':
        console.log('Connected to server:', data.payload?.message);
        break;

      case 'session_started':
        setState((prev) => ({
          ...prev,
          sessionId: data.payload.sessionId,
          isLoading: false,
          messages: [
            {
              id: Date.now().toString(),
              type: 'ai',
              content: data.payload.message,
              timestamp: new Date(data.payload.timestamp),
            },
          ],
        }));
        break;

      case 'message':
        setState((prev) => ({
          ...prev,
          isLoading: false,
          messages: [
            ...prev.messages,
            {
              id: Date.now().toString(),
              type: 'ai',
              content: data.payload.message,
              timestamp: new Date(data.payload.timestamp),
            },
          ],
        }));
        break;

      case 'diagnosis':
        setState((prev) => ({
          ...prev,
          diagnosis: data.payload.diagnosis,
        }));
        break;

      case 'appointment':
        setState((prev) => ({
          ...prev,
          appointment: data.payload.appointment,
        }));
        break;

      case 'history':
        console.log('History:', data.payload.history);
        break;

      case 'error':
        setState((prev) => ({
          ...prev,
          error: data.payload.error,
          isLoading: false,
        }));
        break;

      case 'pong':
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

    heartbeatIntervalRef.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        sendRaw({ type: 'ping' });
      }
    }, 30000);
  };

  const attemptReconnect = () => {
    if (reconnectAttemptsRef.current < RECONNECT_ATTEMPTS) {
      reconnectAttemptsRef.current++;
      console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${RECONNECT_ATTEMPTS})...`);

      setTimeout(() => {
        connect();
      }, RECONNECT_DELAY);
    }
  };

  const sendRaw = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const startSession = useCallback((patientId: string, patientName?: string) => {
    if (!state.isConnected) {
      setState((prev) => ({
        ...prev,
        error: 'Not connected to server',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    sendRaw({
      type: 'start',
      payload: { patientId, patientName },
    });
  }, [state.isConnected]);

  const sendMessage = useCallback((message: string) => {
    if (!state.sessionId) {
      setState((prev) => ({
        ...prev,
        error: 'No active session',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          type: 'patient',
          content: message,
          timestamp: new Date(),
        },
      ],
    }));

    sendRaw({
      type: 'message',
      payload: { message },
    });
  }, [state.sessionId]);

  const sendLocation = useCallback((latitude: number, longitude: number) => {
    if (!state.sessionId) {
      console.warn('No active session for location');
      return;
    }

    sendRaw({
      type: 'location',
      payload: { latitude, longitude },
    });
  }, [state.sessionId]);

  const endSession = useCallback(() => {
    sendRaw({ type: 'end' });
    setState((prev) => ({
      ...prev,
      sessionId: null,
      messages: [],
      diagnosis: null,
      appointment: null,
    }));
  }, []);

  const requestHistory = useCallback((patientId: string) => {
    sendRaw({
      type: 'history',
      payload: { patientId },
    });
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [connect]);

  return {
    state,
    startSession,
    sendMessage,
    sendLocation,
    endSession,
    requestHistory,
  };
};
