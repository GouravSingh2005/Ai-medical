// Report & Communication Agent - Sends medical reports via Email and WhatsApp
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';
import type { DiagnosisResult, Appointment } from '../types/index.js';
import type { DistanceResult } from './LocationDistanceAgent.js';
import { format } from 'date-fns';

dotenv.config();

export interface PatientReport {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  patientAge?: number;
  patientGender?: string;
  symptoms: string;
  conversationHistory: string[];
  diagnosis: DiagnosisResult;
  appointment: Appointment;
  doctorName: string;
  doctorSpecialty: string;
  doctorEmail: string;
  doctorPhone?: string;
  doctorWhatsApp?: string;
  locationInfo?: DistanceResult;
  consultationId: string;
  reportGeneratedAt: Date;
}

export class ReportCommunicationAgent {
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient: any = null;
  private isEmailConfigured: boolean = false;
  private isWhatsAppConfigured: boolean = false;

  constructor() {
    this.initializeEmailService();
    this.initializeWhatsAppService();
  }

  /**
   * Initialize Email Service (Nodemailer)
   */
  private initializeEmailService() {
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        this.isEmailConfigured = true;
        console.log('✅ Email service configured');
      } else {
        console.warn('⚠️ Email service not configured (SMTP credentials missing)');
      }
    } catch (error) {
      console.error('Email service initialization error:', error);
    }
  }

  /**
   * Initialize WhatsApp Service (Twilio)
   */
  private initializeWhatsAppService() {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        this.isWhatsAppConfigured = true;
        console.log('✅ WhatsApp service configured');
      } else {
        console.warn('⚠️ WhatsApp service not configured (Twilio credentials missing)');
      }
    } catch (error) {
      console.error('WhatsApp service initialization error:', error);
    }
  }

  /**
   * Generate comprehensive medical report
   */
  generateMedicalReport(reportData: PatientReport): string {
    const { diagnosis, appointment, locationInfo } = reportData;

    const report = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            MEDICAL CONSULTATION REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Report ID: ${reportData.consultationId}
Generated: ${format(reportData.reportGeneratedAt, 'PPpp')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATIENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:        ${reportData.patientName}
Email:       ${reportData.patientEmail}
Phone:       ${reportData.patientPhone || 'N/A'}
Age:         ${reportData.patientAge || 'N/A'}
Gender:      ${reportData.patientGender || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SYMPTOM SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reportData.symptoms}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI DIAGNOSIS ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Predicted Conditions:
${diagnosis.diseases.map((d, i) => `${i + 1}. ${d.name} (Confidence: ${d.confidence}%, Severity: ${d.severity}/100)`).join('\n')}

Overall Severity Score: ${diagnosis.severityScore}/100
Urgency Level: ${diagnosis.urgencyLevel.toUpperCase()}
Recommended Specialty: ${diagnosis.recommendedSpecialty}

Recommended Actions:
${diagnosis.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Doctor:      ${reportData.doctorName}
Specialty:   ${reportData.doctorSpecialty}
Date:        ${format(appointment.date, 'EEEE, MMMM dd, yyyy')}
Time:        ${appointment.time}
Priority:    ${this.getPriorityLabel(appointment.severityPriority)}

${locationInfo ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLINIC LOCATION & NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Address:          ${locationInfo.clinicAddress}
Distance:         ${locationInfo.distance}
Travel Time:      ${locationInfo.duration}

Navigation Link:  ${locationInfo.navigationUrl}
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reportData.conversationHistory.join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ This is an AI-generated preliminary assessment.
⚠️ Final diagnosis must be confirmed by the consulting doctor.
⚠️ Please bring any relevant medical records to your appointment.
⚠️ Arrive 10 minutes early for registration.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For queries, contact: ${reportData.doctorEmail}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    return report.trim();
  }

  /**
   * Send report to doctor via Email
   */
  async sendEmailToDoctor(reportData: PatientReport): Promise<boolean> {
    if (!this.isEmailConfigured || !this.emailTransporter) {
      console.warn('⚠️ Email service not configured, skipping email');
      return false;
    }

    try {
      const report = this.generateMedicalReport(reportData);
      
      const mailOptions = {
        from: `"AI Medical System" <${process.env.SMTP_USER}>`,
        to: reportData.doctorEmail,
        subject: `New Patient Report - ${reportData.patientName} | Consultation ${reportData.consultationId.substring(0, 8)}`,
        text: report,
        html: this.generateHtmlReport(reportData),
      };

      const info = await this.emailTransporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${reportData.doctorEmail}: ${info.messageId}`);
      
      return true;
    } catch (error: any) {
      console.error('Error sending email:', error.message);
      return false;
    }
  }

  /**
   * Send report to doctor via WhatsApp
   */
  async sendWhatsAppToDoctor(reportData: PatientReport): Promise<boolean> {
    if (!this.isWhatsAppConfigured || !this.twilioClient) {
      console.warn('⚠️ WhatsApp service not configured, skipping WhatsApp');
      return false;
    }

    if (!reportData.doctorWhatsApp) {
      console.warn('⚠️ Doctor WhatsApp number not available');
      return false;
    }

    try {
      const shortReport = this.generateWhatsAppReport(reportData);

      const message = await this.twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
        to: `whatsapp:${reportData.doctorWhatsApp}`,
        body: shortReport,
      });

      console.log(`📱 WhatsApp sent to ${reportData.doctorWhatsApp}: ${message.sid}`);
      return true;
    } catch (error: any) {
      console.error('Error sending WhatsApp:', error.message);
      return false;
    }
  }

  /**
   * Generate WhatsApp-optimized report (shorter version)
   */
  private generateWhatsAppReport(reportData: PatientReport): string {
    const { diagnosis, appointment, locationInfo } = reportData;

    return `🏥 *NEW PATIENT APPOINTMENT*

👤 *Patient*: ${reportData.patientName}
📧 Email: ${reportData.patientEmail}
📞 Phone: ${reportData.patientPhone || 'N/A'}

🩺 *Top Diagnosis*: ${diagnosis.diseases[0]?.name} (${diagnosis.diseases[0]?.confidence}%)
⚠️ *Urgency*: ${diagnosis.urgencyLevel.toUpperCase()}
📊 *Severity Score*: ${diagnosis.severityScore}/100

📅 *Appointment*
Date: ${format(appointment.date, 'MMM dd, yyyy')}
Time: ${appointment.time}
Priority: ${this.getPriorityLabel(appointment.severityPriority)}

${locationInfo ? `📍 *Clinic Distance*: ${locationInfo.distance}
⏱️ *Travel Time*: ${locationInfo.duration}

🗺️ Navigation: ${locationInfo.navigationUrl}
` : ''}
💬 *Symptoms*: ${reportData.symptoms.substring(0, 150)}${reportData.symptoms.length > 150 ? '...' : ''}

📄 Full report sent via email to ${reportData.doctorEmail}

_AI Medical Consultation System_`;
  }

  /**
   * Generate HTML version of report for email
   */
  private generateHtmlReport(reportData: PatientReport): string {
    const { diagnosis, appointment, locationInfo } = reportData;

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
        .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
        .section-title { color: #667eea; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .info-row { display: flex; margin: 8px 0; }
        .label { font-weight: bold; min-width: 150px; }
        .disease-item { padding: 10px; margin: 5px 0; background: white; border-radius: 5px; }
        .urgency-high { color: #e74c3c; font-weight: bold; }
        .urgency-critical { color: #c0392b; font-weight: bold; }
        .urgency-medium { color: #f39c12; font-weight: bold; }
        .urgency-low { color: #27ae60; font-weight: bold; }
        .appointment-box { background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .navigation-button { display: inline-block; background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 Medical Consultation Report</h1>
        <p>Consultation ID: ${reportData.consultationId}</p>
        <p>${format(reportData.reportGeneratedAt, 'PPpp')}</p>
    </div>

    <div class="section">
        <div class="section-title">👤 Patient Information</div>
        <div class="info-row"><span class="label">Name:</span> ${reportData.patientName}</div>
        <div class="info-row"><span class="label">Email:</span> ${reportData.patientEmail}</div>
        <div class="info-row"><span class="label">Phone:</span> ${reportData.patientPhone || 'N/A'}</div>
        <div class="info-row"><span class="label">Age:</span> ${reportData.patientAge || 'N/A'}</div>
        <div class="info-row"><span class="label">Gender:</span> ${reportData.patientGender || 'N/A'}</div>
    </div>

    <div class="section">
        <div class="section-title">🩺 AI Diagnosis</div>
        ${diagnosis.diseases.map((d, i) => `
            <div class="disease-item">
                <strong>${i + 1}. ${d.name}</strong><br>
                Confidence: ${d.confidence}% | Severity: ${d.severity}/100
            </div>
        `).join('')}
        <div style="margin-top: 15px;">
            <strong>Severity Score:</strong> ${diagnosis.severityScore}/100<br>
            <strong>Urgency:</strong> <span class="urgency-${diagnosis.urgencyLevel}">${diagnosis.urgencyLevel.toUpperCase()}</span><br>
            <strong>Recommended Specialty:</strong> ${diagnosis.recommendedSpecialty}
        </div>
    </div>

    <div class="appointment-box">
        <div class="section-title">📅 Appointment Details</div>
        <div class="info-row"><span class="label">Date:</span> ${format(appointment.date, 'EEEE, MMMM dd, yyyy')}</div>
        <div class="info-row"><span class="label">Time:</span> ${appointment.time}</div>
        <div class="info-row"><span class="label">Priority:</span> ${this.getPriorityLabel(appointment.severityPriority)}</div>
    </div>

    ${locationInfo ? `
    <div class="section">
        <div class="section-title">📍 Clinic Location</div>
        <p><strong>Address:</strong> ${locationInfo.clinicAddress}</p>
        <p><strong>Distance:</strong> ${locationInfo.distance} | <strong>Travel Time:</strong> ${locationInfo.duration}</p>
        <a href="${locationInfo.navigationUrl}" class="navigation-button">🗺️ Open in Google Maps</a>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">💬 Symptoms Summary</div>
        <p>${reportData.symptoms}</p>
    </div>

    <div class="footer">
        <p>⚠️ <strong>Important:</strong> This is an AI-generated preliminary assessment. Final diagnosis must be confirmed by the consulting doctor.</p>
        <p>Generated by AI Medical Consultation System</p>
    </div>
</body>
</html>
    `;
  }

  /**
   * Send report to both Email and WhatsApp
   */
  async sendReportToDoctor(reportData: PatientReport): Promise<{ email: boolean; whatsapp: boolean }> {
    console.log(`📬 Sending report for patient ${reportData.patientName} to Dr. ${reportData.doctorName}`);

    const emailResult = await this.sendEmailToDoctor(reportData);
    const whatsappResult = await this.sendWhatsAppToDoctor(reportData);

    return {
      email: emailResult,
      whatsapp: whatsappResult,
    };
  }

  /**
   * Get priority label
   */
  private getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1: return 'CRITICAL (Urgent)';
      case 2: return 'HIGH Priority';
      case 3: return 'MEDIUM Priority';
      case 4: return 'LOW Priority';
      default: return 'Standard';
    }
  }

  /**
   * Check service availability
   */
  getServiceStatus(): { email: boolean; whatsapp: boolean } {
    return {
      email: this.isEmailConfigured,
      whatsapp: this.isWhatsAppConfigured,
    };
  }
}
