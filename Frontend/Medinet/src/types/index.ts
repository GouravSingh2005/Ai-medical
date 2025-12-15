export interface ChatMessage {
  id: string;
  type: 'patient' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

export interface Disease {
  name: string;
  confidence: number;
  severity: number;
  description?: string;
}

export interface DiagnosisResult {
  diseases: Disease[];
  severityScore: number;
  recommendedSpecialty: string;
  recommendedActions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Appointment {
  appointmentId: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  date: Date;
  time: string;
  severityPriority: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  notes?: string;
}

// Received message types
export type ReceivedMessageType = 'connected' | 'session_started' | 'message' | 'diagnosis' | 'appointment' | 'history' | 'error' | 'pong';

// Sent message types
export type SentMessageType = 'start' | 'message' | 'location' | 'end' | 'history' | 'ping';

export interface WebSocketMessage {
  type: ReceivedMessageType | SentMessageType;
  payload?: any;
}

export interface SessionState {
  sessionId: string | null;
  isConnected: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  diagnosis: DiagnosisResult | null;
  appointment: Appointment | null;
  error: string | null;
}
