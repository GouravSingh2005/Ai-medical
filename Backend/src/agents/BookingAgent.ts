// Booking Agent - Handles appointment scheduling with priority-based logic
import type { Appointment, DiagnosisResult, Doctor } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { AGENT_CONFIG } from '../config/llm-config.js';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import { query } from '../db.js';

export class BookingAgent {
  /**
   * Find available doctors by specialty
   */
  async findDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    try {
      const result = await query(
        `SELECT Doctor_ID as id, name, specialty, availability_status as availabilityStatus, 
         experience_years as experienceYears 
         FROM Doctor 
         WHERE specialty = ? AND availability_status = 'Available' 
         ORDER BY experience_years DESC`,
        [specialty]
      );

      return result as Doctor[];
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  }

  /**
   * Schedule appointment based on severity priority
   */
  async scheduleAppointment(
    consultationId: string,
    patientId: string,
    diagnosis: DiagnosisResult
  ): Promise<Appointment | null> {
    try {
      // Find doctors by specialty
      const doctors = await this.findDoctorsBySpecialty(diagnosis.recommendedSpecialty);

      if (doctors.length === 0) {
        console.log('No available doctors found, using fallback');
        // Fallback to General Medicine
        const generalDoctors = await this.findDoctorsBySpecialty('General Medicine');
        if (generalDoctors.length === 0) {
          throw new Error('No doctors available');
        }
        doctors.push(...generalDoctors);
      }

      // Select doctor with most experience
      const selectedDoctor = doctors[0];

      // Calculate appointment date/time based on urgency
      const { date, time } = this.calculateAppointmentSlot(diagnosis.urgencyLevel);

      // Create appointment
      const appointmentId = uuidv4();
      const priority = this.getPriorityFromUrgency(diagnosis.urgencyLevel);

      await query(
        `INSERT INTO Appointment 
        (Appointment_ID, Consultation_ID, Patient_ID, Doctor_ID, appointment_date, 
         appointment_time, severity_priority, status, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Scheduled', ?)`,
        [
          appointmentId,
          consultationId,
          patientId,
          selectedDoctor.id,
          format(date, 'yyyy-MM-dd'),
          time,
          priority,
          `Auto-scheduled based on ${diagnosis.urgencyLevel} urgency`,
        ]
      );

      const appointment: Appointment = {
        appointmentId,
        consultationId,
        patientId,
        doctorId: selectedDoctor.id,
        date,
        time,
        severityPriority: priority,
        status: 'Scheduled',
        notes: `Appointment with Dr. ${selectedDoctor.name} (${selectedDoctor.specialty})`,
      };

      return appointment;
    } catch (error) {
      console.error('BookingAgent Error:', error);
      return null;
    }
  }

  /**
   * Calculate appointment slot based on urgency
   */
  private calculateAppointmentSlot(urgency: 'low' | 'medium' | 'high' | 'critical'): {
    date: Date;
    time: string;
  } {
    const now = new Date();
    let appointmentDate: Date;
    let appointmentTime: string;

    switch (urgency) {
      case 'critical':
        // Same day, ASAP
        appointmentDate = now;
        appointmentTime = format(setMinutes(setHours(now, now.getHours() + 1), 0), 'HH:mm');
        break;

      case 'high':
        // Within 1-2 days
        appointmentDate = addDays(now, 1);
        appointmentTime = '09:00';
        break;

      case 'medium':
        // Within 3-5 days
        appointmentDate = addDays(now, 3);
        appointmentTime = '10:00';
        break;

      case 'low':
      default:
        // Within 7-14 days
        appointmentDate = addDays(now, 7);
        appointmentTime = '14:00';
        break;
    }

    return { date: appointmentDate, time: appointmentTime };
  }

  /**
   * Map urgency to priority number
   */
  private getPriorityFromUrgency(urgency: 'low' | 'medium' | 'high' | 'critical'): number {
    return AGENT_CONFIG.BOOKING_PRIORITY[urgency.toUpperCase() as keyof typeof AGENT_CONFIG.BOOKING_PRIORITY];
  }

  /**
   * Generate booking confirmation message
   */
  generateBookingConfirmation(appointment: Appointment, doctorName: string, specialty: string): string {
    return `✅ **Appointment Scheduled Successfully!**

**Doctor**: Dr. ${doctorName}
**Specialty**: ${specialty}
**Date**: ${format(appointment.date, 'MMMM dd, yyyy')}
**Time**: ${appointment.time}
**Priority**: ${this.getPriorityLabel(appointment.severityPriority)}

You will receive a confirmation email shortly. Please arrive 10 minutes before your appointment time.

**Important Reminders**:
- Bring any relevant medical records
- List your current medications
- Prepare questions you want to ask the doctor

If you need to reschedule, please contact us at least 24 hours in advance.`;
  }

  /**
   * Get priority label from number
   */
  private getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'Critical (Urgent)';
      case 2: return 'High Priority';
      case 3: return 'Medium Priority';
      case 4: return 'Low Priority';
      default: return 'Standard';
    }
  }

  /**
   * Check available slots for a doctor
   */
  async getAvailableSlots(doctorId: string, date: Date): Promise<string[]> {
    try {
      // Get existing appointments for the date
      const existingAppointments = await query(
        `SELECT appointment_time FROM Appointment 
         WHERE Doctor_ID = ? AND appointment_date = ? AND status = 'Scheduled'`,
        [doctorId, format(date, 'yyyy-MM-dd')]
      );

      const bookedTimes = (existingAppointments as any[]).map(a => a.appointment_time);

      // Generate available slots (9 AM - 5 PM, 30-min intervals)
      const allSlots: string[] = [];
      for (let hour = 9; hour < 17; hour++) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }

      // Filter out booked slots
      return allSlots.filter(slot => !bookedTimes.includes(slot));
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }
}
