// Logger Agent - Records all interactions and maintains audit trail
import type { Message, ConsultationSession, DiagnosisResult } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';

export class LoggerAgent {
  /**
   * Log a conversation message
   */
  async logMessage(
    consultationId: string,
    messageType: 'Patient' | 'AI_Doctor' | 'System',
    messageText: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await query(
        `INSERT INTO ConversationLog (Log_ID, Consultation_ID, message_type, message_text, metadata) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          consultationId,
          messageType,
          messageText,
          metadata ? JSON.stringify(metadata) : null,
        ]
      );
    } catch (error) {
      console.error('Error logging message:', error);
    }
  }

  /**
   * Create consultation session
   */
  async createConsultation(
    patientId: string,
    symptoms: string
  ): Promise<string> {
    try {
      const consultationId = uuidv4();
      
      await query(
        `INSERT INTO Consultation (Consultation_ID, Patient_ID, symptoms, status) 
         VALUES (?, ?, ?, 'Active')`,
        [consultationId, patientId, symptoms]
      );

      return consultationId;
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  }

  /**
   * Update consultation with diagnosis results
   */
  async updateConsultationWithDiagnosis(
    consultationId: string,
    diagnosis: DiagnosisResult
  ): Promise<void> {
    try {
      await query(
        `UPDATE Consultation 
         SET predicted_diseases = ?, severity_score = ?, specialty_recommended = ?, status = 'Completed'
         WHERE Consultation_ID = ?`,
        [
          JSON.stringify(diagnosis.diseases),
          diagnosis.severityScore,
          diagnosis.recommendedSpecialty,
          consultationId,
        ]
      );

      // Log each predicted disease
      for (const disease of diagnosis.diseases) {
        await query(
          `INSERT INTO Diagnosis (Diagnosis_ID, Consultation_ID, disease_name, confidence_score, 
           severity_level, recommended_actions) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            consultationId,
            disease.name,
            disease.confidence,
            diagnosis.urgencyLevel.charAt(0).toUpperCase() + diagnosis.urgencyLevel.slice(1),
            JSON.stringify(diagnosis.recommendedActions),
          ]
        );
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
    }
  }

  /**
   * Log system event
   */
  async logSystemEvent(
    consultationId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      await this.logMessage(
        consultationId,
        'System',
        `System Event: ${eventType}`,
        eventData
      );
    } catch (error) {
      console.error('Error logging system event:', error);
    }
  }

  /**
   * Get consultation history
   */
  async getConsultationHistory(consultationId: string): Promise<Message[]> {
    try {
      const logs = await query(
        `SELECT Log_ID as id, message_type as type, message_text as content, 
         timestamp, metadata 
         FROM ConversationLog 
         WHERE Consultation_ID = ? 
         ORDER BY timestamp ASC`,
        [consultationId]
      );

      return (logs as any[]).map(log => ({
        id: log.id,
        type: log.type.toLowerCase() as 'patient' | 'ai_doctor' | 'system',
        content: log.content,
        timestamp: new Date(log.timestamp),
        metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching consultation history:', error);
      return [];
    }
  }

  /**
   * Get patient consultation list
   */
  async getPatientConsultations(patientId: string): Promise<any[]> {
    try {
      const consultations = await query(
        `SELECT c.Consultation_ID as id, c.session_start as startTime, 
         c.session_end as endTime, c.symptoms, c.severity_score as severityScore,
         c.specialty_recommended as specialty, c.status,
         a.appointment_date as appointmentDate, a.appointment_time as appointmentTime
         FROM Consultation c
         LEFT JOIN Appointment a ON c.Consultation_ID = a.Consultation_ID
         WHERE c.Patient_ID = ?
         ORDER BY c.session_start DESC`,
        [patientId]
      );

      return consultations as any[];
    } catch (error) {
      console.error('Error fetching patient consultations:', error);
      return [];
    }
  }

  /**
   * Log agent activity
   */
  logAgentActivity(agentName: string, action: string, details?: any): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${agentName}: ${action}`, details || '');
  }

  /**
   * Close consultation session
   */
  async closeConsultation(consultationId: string): Promise<void> {
    try {
      await query(
        `UPDATE Consultation 
         SET session_end = NOW(), status = 'Completed' 
         WHERE Consultation_ID = ?`,
        [consultationId]
      );
    } catch (error) {
      console.error('Error closing consultation:', error);
    }
  }
}
