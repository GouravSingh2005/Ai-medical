// src/routes/patient.routes.ts
import { Router, type Request, type Response } from "express";
import { pool } from "../db.js"; // ✅ Use MySQL pool like DoctorRouter
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid"; // ✅ UUID for Patient_ID

const PatientRouter = Router();
const saltRounds = 10;

// Password validation schema
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
    message: "Password must contain at least one special character",
  });

// Signup schema
const patientSignupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: passwordSchema,
});

// Signin schema
const patientSigninSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ✅ Signup endpoint
PatientRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = patientSignupSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const patientId = uuidv4(); // ✅ Generate UUID for Patient_ID

    const [result] = await pool.query(
      "INSERT INTO Patient (Patient_ID, email, password) VALUES (?, ?, ?)",
      [patientId, email, hashedPassword]
    );

    res.status(201).json({
      message: "Patient signed up successfully",
      patient: { patient_id: patientId, email }
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.issues,
      });
    }
    if ((err as any).code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Signin endpoint
PatientRouter.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = patientSigninSchema.parse(req.body);

    const [rows] = await pool.query(
      "SELECT * FROM Patient WHERE email = ?",
      [email]
    );

    const patients = rows as any[];

    if (patients.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patient = patients[0];
    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({
      message: "Signin successful",
      patient: {
        patient_id: patient.Patient_ID,
        email: patient.email
      }
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.issues,
      });
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default PatientRouter;
