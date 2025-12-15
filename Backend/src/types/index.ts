// Type definitions for the Agentic AI Medical System

export interface Message {
  id: string;
  type: 'patient' | 'ai_doctor' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Symptom {
  description: string;
  duration?: string;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface Disease {
  name: string;
  confidence: number;
  severity: number;
  description?: string;
}

export interface ConsultationSession {
  consultationId: string;
  patientId: string;
  symptoms: Symptom[];
  conversationHistory: Message[];
  currentQuestion?: string;
  diagnosisResult?: DiagnosisResult;
  patientLocation?: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'completed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
}

export interface DiagnosisResult {
  diseases: Disease[];
  severityScore: number;
  recommendedSpecialty: string;
  recommendedActions: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AppointmentSlot {
  date: Date;
  time: string;
  available: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availabilityStatus: 'Available' | 'Busy' | 'Offline';
  experienceYears: number;
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

export interface AgentContext {
  sessionId: string;
  patientId: string;
  conversationHistory: Message[];
  currentState: 'greeting' | 'questioning' | 'diagnosis' | 'booking' | 'completed';
}
