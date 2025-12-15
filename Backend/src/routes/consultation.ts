// Consultation Routes - REST API endpoints for consultation management
import express, { type Request, type Response } from 'express';
import { query } from '../db.js';

const router = express.Router();

/**
 * Get consultation by ID
 */
router.get('/:consultationId', async (req: Request, res: Response) => {
  try {
    const { consultationId } = req.params;

    const consultation = await query(
      `SELECT c.*, 
       p.name as patientName, p.email as patientEmail,
       a.appointment_date, a.appointment_time, a.status as appointmentStatus,
       d.name as doctorName, d.specialty
       FROM Consultation c
       LEFT JOIN Patient p ON c.Patient_ID = p.Patient_ID
       LEFT JOIN Appointment a ON c.Consultation_ID = a.Consultation_ID
       LEFT JOIN Doctor d ON a.Doctor_ID = d.Doctor_ID
       WHERE c.Consultation_ID = ?`,
      [consultationId]
    );

    if (!consultation || (consultation as any[]).length === 0) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    res.json({ consultation: (consultation as any[])[0] });
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get consultation conversation logs
 */
router.get('/:consultationId/logs', async (req: Request, res: Response) => {
  try {
    const { consultationId } = req.params;

    const logs = await query(
      `SELECT * FROM ConversationLog 
       WHERE Consultation_ID = ? 
       ORDER BY timestamp ASC`,
      [consultationId]
    );

    res.json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get patient consultation history
 */
router.get('/patient/:patientId', async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    const consultations = await query(
      `SELECT c.*, 
       a.appointment_date, a.appointment_time, a.status as appointmentStatus,
       d.name as doctorName, d.specialty
       FROM Consultation c
       LEFT JOIN Appointment a ON c.Consultation_ID = a.Consultation_ID
       LEFT JOIN Doctor d ON a.Doctor_ID = d.Doctor_ID
       WHERE c.Patient_ID = ?
       ORDER BY c.session_start DESC`,
      [patientId]
    );

    res.json({ consultations });
  } catch (error) {
    console.error('Error fetching patient consultations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get all active consultations
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const consultations = await query(
      `SELECT c.*, 
       p.name as patientName,
       a.appointment_date, a.appointment_time
       FROM Consultation c
       LEFT JOIN Patient p ON c.Patient_ID = p.Patient_ID
       LEFT JOIN Appointment a ON c.Consultation_ID = a.Consultation_ID
       WHERE c.status = 'Active'
       ORDER BY c.session_start DESC
       LIMIT 50`
    );

    res.json({ consultations });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get diagnosis for consultation
 */
router.get('/:consultationId/diagnosis', async (req: Request, res: Response) => {
  try {
    const { consultationId } = req.params;

    const diagnoses = await query(
      `SELECT * FROM Diagnosis 
       WHERE Consultation_ID = ?
       ORDER BY confidence_score DESC`,
      [consultationId]
    );

    res.json({ diagnoses });
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
