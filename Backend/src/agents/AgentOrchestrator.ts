// Agent Orchestrator - Coordinates all agents and manages workflow
import { DoctorAgent } from './DoctorAgent.js';
import { DiagnosisAgent } from './DiagnosisAgent.js';
import { SpecialtyMapperAgent } from './SpecialtyMapperAgent.js';
import { BookingAgent } from './BookingAgent.js';
import { LoggerAgent } from './LoggerAgent.js';
import { LocationDistanceAgent } from './LocationDistanceAgent.js';
import { ReportCommunicationAgent, type PatientReport } from './ReportCommunicationAgent.js';
import type { ConsultationSession, AgentContext, DiagnosisResult } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';

export class AgentOrchestrator {
  private doctorAgent: DoctorAgent;
  private diagnosisAgent: DiagnosisAgent;
  private specialtyMapper: SpecialtyMapperAgent;
  private bookingAgent: BookingAgent;
  private loggerAgent: LoggerAgent;
  private locationAgent: LocationDistanceAgent;
  private communicationAgent: ReportCommunicationAgent;
  
  private activeSessions: Map<string, ConsultationSession>;

  constructor() {
    this.doctorAgent = new DoctorAgent();
    this.diagnosisAgent = new DiagnosisAgent();
    this.specialtyMapper = new SpecialtyMapperAgent();
    this.bookingAgent = new BookingAgent();
    this.loggerAgent = new LoggerAgent();
    this.locationAgent = new LocationDistanceAgent();
    this.communicationAgent = new ReportCommunicationAgent();
    this.activeSessions = new Map();
  }

  /**
   * Start a new consultation session
   */
  async startSession(patientId: string, patientName?: string): Promise<{
    sessionId: string;
    greeting: string;
  }> {
    const sessionId = uuidv4();
    
    // Create consultation in database
    const consultationId = await this.loggerAgent.createConsultation(patientId, 'Initial consultation');

    // Initialize session
    const session: ConsultationSession = {
      consultationId,
      patientId,
      symptoms: [],
      conversationHistory: [],
      status: 'active',
      startTime: new Date(),
    };

    this.activeSessions.set(sessionId, session);

    // Get greeting from Doctor Agent
    const greeting = await this.doctorAgent.startConsultation(patientName);

    // Log greeting
    await this.loggerAgent.logMessage(consultationId, 'AI_Doctor', greeting);

    this.loggerAgent.logAgentActivity('Orchestrator', 'Session started', { sessionId, patientId });

    return { sessionId, greeting };
  }

  /**
   * Process patient message through the agent pipeline
   */
  async processMessage(sessionId: string, patientMessage: string): Promise<{
    response: string;
    state: AgentContext['currentState'];
    diagnosis?: DiagnosisResult;
    appointment?: any;
  }> {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    const messageCount = session.conversationHistory.filter(m => m.type === 'patient').length + 1;
    console.log(`\n${'*'.repeat(60)}`);
    console.log(`[Orchestrator] 🔄 Processing Patient Message #${messageCount}`);
    console.log(`Session: ${sessionId.substring(0, 8)}...`);
    console.log(`Patient: "${patientMessage.substring(0, 50)}${patientMessage.length > 50 ? '...' : ''}"`);
    console.log(`${'*'.repeat(60)}\n`);

    // Log patient message
    await this.loggerAgent.logMessage(
      session.consultationId,
      'Patient',
      patientMessage
    );

    // Step 1: Doctor Agent processes message
    console.log(`[Orchestrator] Processing message for session ${sessionId}`);
    this.loggerAgent.logAgentActivity('DoctorAgent', 'Processing patient response');
    
    const doctorResponse = await this.doctorAgent.processPatientResponse(
      session,
      patientMessage
    );

    console.log(`[Orchestrator] Doctor response received, diagnosis ready: ${doctorResponse.isDiagnosisReady}`);

    // Log doctor response
    await this.loggerAgent.logMessage(
      session.consultationId,
      'AI_Doctor',
      doctorResponse.message
    );

    // If diagnosis is ready, proceed to next agents
    if (doctorResponse.isDiagnosisReady) {
      console.log(`\n${'█'.repeat(60)}`);
      console.log(`[Orchestrator] ✅ DIAGNOSIS PHASE ACTIVATED`);
      console.log(`Total Messages: ${session.conversationHistory.length}`);
      console.log(`Patient Messages: ${session.conversationHistory.filter(m => m.type === 'patient').length}`);
      console.log(`${'█'.repeat(60)}\n`);
      
      this.loggerAgent.logAgentActivity('Orchestrator', 'Moving to diagnosis phase');
      
      // Step 2: Diagnosis Agent analyzes symptoms
      console.log('[Orchestrator] 🔬 Step 2: Calling DiagnosisAgent...');
      this.loggerAgent.logAgentActivity('DiagnosisAgent', 'Analyzing symptoms');
      
      const diagnosis = await this.diagnosisAgent.analyzeSymptomsAndDiagnose(
        session.conversationHistory
      );
      
      console.log(`[Orchestrator] ✅ Diagnosis received: ${diagnosis.diseases.length} diseases identified`);

      // Step 3: Specialty Mapper determines specialty
      console.log('[Orchestrator] 🏥 Step 3: Calling SpecialtyMapper...');
      this.loggerAgent.logAgentActivity('SpecialtyMapper', 'Mapping to specialty');
      
      const specialty = await this.specialtyMapper.mapToSpecialty(diagnosis.diseases);
      diagnosis.recommendedSpecialty = specialty;
      console.log(`[Orchestrator] ✅ Specialty mapped: ${specialty}`);

      // Update consultation with diagnosis
      await this.loggerAgent.updateConsultationWithDiagnosis(
        session.consultationId,
        diagnosis
      );

      // Step 4: Generate diagnosis summary
      console.log('[Orchestrator] 📝 Step 4: Generating diagnosis summary...');
      const diagnosisSummary = this.diagnosisAgent.generateSummary(diagnosis);
      
      await this.loggerAgent.logMessage(
        session.consultationId,
        'System',
        diagnosisSummary,
        { diagnosis }
      );

      // Step 5: Booking Agent schedules appointment
      console.log('[Orchestrator] 📅 Step 5: Calling BookingAgent...');
      this.loggerAgent.logAgentActivity('BookingAgent', 'Scheduling appointment');
      
      const appointment = await this.bookingAgent.scheduleAppointment(
        session.consultationId,
        session.patientId,
        diagnosis
      );
      
      if (appointment) {
        console.log(`[Orchestrator] ✅ Appointment booked with Doctor ID: ${appointment.doctorId}`);
      }

      let finalResponse = doctorResponse.message + '\n\n' + diagnosisSummary;
      let locationInfo = null;

      if (appointment) {
        const doctors = await this.bookingAgent.findDoctorsBySpecialty(specialty);
        const doctor = doctors.find(d => d.id === appointment.doctorId);
        
        const bookingConfirmation = this.bookingAgent.generateBookingConfirmation(
          appointment,
          doctor?.name || 'Available Doctor',
          specialty
        );

        finalResponse += '\n\n' + bookingConfirmation;

        await this.loggerAgent.logSystemEvent(
          session.consultationId,
          'AppointmentScheduled',
          { appointment }
        );

        // Step 6: Location & Distance Agent - Calculate distance if location data available
        if (session.patientLocation && doctor) {
          this.loggerAgent.logAgentActivity('LocationAgent', 'Calculating distance to clinic');
          
          try {
            // Fetch full doctor details with clinic location
            const doctorDetails = await this.getDoctorWithLocation(doctor.id);
            
            if (doctorDetails?.clinic_latitude && doctorDetails?.clinic_longitude) {
              locationInfo = await this.locationAgent.calculateDistance(
                {
                  latitude: session.patientLocation.latitude,
                  longitude: session.patientLocation.longitude
                },
                {
                  latitude: doctorDetails.clinic_latitude,
                  longitude: doctorDetails.clinic_longitude
                },
                doctorDetails.clinic_address || `${doctorDetails.name}'s Clinic`
              );

              // Add location info to response
              if (locationInfo) {
                const locationMessage = `\n\n📍 Clinic Location:\nDistance: ${locationInfo.distance}\nTravel Time: ${locationInfo.duration}\n🗺️ Navigation: ${locationInfo.navigationUrl}`;
                finalResponse += locationMessage;

                await this.loggerAgent.logSystemEvent(
                  session.consultationId,
                  'LocationCalculated',
                  { locationInfo }
                );
              }
            }
          } catch (error: any) {
            console.error('Location calculation error:', error.message);
          }
        }

        // Step 7: Report & Communication Agent - Send report to doctor
        this.loggerAgent.logAgentActivity('CommunicationAgent', 'Sending report to doctor');
        
        try {
          // Fetch patient details
          const patientDetails = await this.getPatientDetails(session.patientId);
          
          if (patientDetails && doctor) {
            const doctorDetails = await this.getDoctorWithLocation(doctor.id);
            
            const reportData: PatientReport = {
              consultationId: session.consultationId,
              patientName: patientDetails.name,
              patientEmail: patientDetails.email,
              patientPhone: patientDetails.phone_number,
              patientAge: patientDetails.age,
              patientGender: patientDetails.gender,
              symptoms: session.conversationHistory.map(m => m.content).join(' | '),
              conversationHistory: session.conversationHistory.map(m => m.content),
              diagnosis,
              appointment,
              doctorName: doctor.name,
              doctorSpecialty: specialty,
              doctorEmail: doctorDetails?.email || 'doctor@example.com',
              doctorPhone: doctorDetails?.phone_number,
              doctorWhatsApp: doctorDetails?.whatsapp_number,
              locationInfo: locationInfo || undefined,
              reportGeneratedAt: new Date(),
            };

            const sendResult = await this.communicationAgent.sendReportToDoctor(reportData);
            
            await this.loggerAgent.logSystemEvent(
              session.consultationId,
              'ReportSent',
              { emailSent: sendResult.email, whatsappSent: sendResult.whatsapp }
            );

            // Notify user about report sharing
            if (sendResult.email || sendResult.whatsapp) {
              const notificationChannels = [];
              if (sendResult.email) notificationChannels.push('email');
              if (sendResult.whatsapp) notificationChannels.push('WhatsApp');
              
              finalResponse += `\n\n✅ Medical report has been sent to Dr. ${doctor.name} via ${notificationChannels.join(' and ')}.`;
            }
          }
        } catch (error: any) {
          console.error('Communication error:', error.message);
        }
      }

      // Close session
      session.status = 'completed';
      await this.loggerAgent.closeConsultation(session.consultationId);
      
      this.loggerAgent.logAgentActivity('Orchestrator', 'Session completed', {
        sessionId,
        diagnosis: diagnosis.diseases[0].name,
        urgency: diagnosis.urgencyLevel,
      });

      return {
        response: finalResponse,
        state: 'completed',
        diagnosis,
        appointment,
      };
    }

    // Continue conversation
    console.log(`\n[Orchestrator] ↩️  Continuing conversation (Question phase)\n`);
    return {
      response: doctorResponse.message,
      state: 'questioning',
    };
  }  /**
   * Get session data
   */
  getSession(sessionId: string): ConsultationSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      session.status = 'completed';
      await this.loggerAgent.closeConsultation(session.consultationId);
      this.activeSessions.delete(sessionId);
      
      this.loggerAgent.logAgentActivity('Orchestrator', 'Session ended manually', { sessionId });
    }
  }

  /**
   * Get patient consultation history
   */
  async getPatientHistory(patientId: string): Promise<any[]> {
    return this.loggerAgent.getPatientConsultations(patientId);
  }

  /**
   * Update patient location for distance calculation
   */
  updatePatientLocation(sessionId: string, latitude: number, longitude: number): void {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      session.patientLocation = { latitude, longitude };
      this.loggerAgent.logAgentActivity('Orchestrator', 'Patient location updated', {
        sessionId,
        latitude,
        longitude,
      });
    }
  }

  /**
   * Get patient details from database
   */
  private async getPatientDetails(patientId: string): Promise<any> {
    try {
      const result = await query(
        'SELECT * FROM Patient WHERE id = ?',
        [patientId]
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return null;
    }
  }

  /**
   * Get doctor details with clinic location
   */
  private async getDoctorWithLocation(doctorId: string): Promise<any> {
    try {
      const result = await query(
        'SELECT * FROM Doctor WHERE id = ?',
        [doctorId]
      );
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      return null;
    }
  }

  /**
   * Get service status for communication agent
   */
  getCommunicationServiceStatus(): { email: boolean; whatsapp: boolean } {
    return this.communicationAgent.getServiceStatus();
  }

  /**
   * Cleanup inactive sessions (called periodically)
   */
  cleanupInactiveSessions(): void {
    const now = new Date().getTime();
    const TIMEOUT = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const sessionAge = now - session.startTime.getTime();
      
      if (sessionAge > TIMEOUT && session.status === 'active') {
        this.loggerAgent.logAgentActivity('Orchestrator', 'Session timed out', { sessionId });
        this.endSession(sessionId);
      }
    }
  }
}
