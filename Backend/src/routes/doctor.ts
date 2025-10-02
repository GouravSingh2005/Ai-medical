// src/routes/doctor.routes.ts
import { Router, type Request, type Response } from "express";
import { pool } from "../db.js"; // MySQL pool
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid"; // ✅ Import UUID

const DoctorRouter = Router();
const saltRounds = 10;

// Password validation schema
const passwordSchema = z.string()
  .min(6, "Password must be at least 6 characters")
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
    message: "Password must contain at least one special character",
  });

// Signup schema
const doctorSignupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: passwordSchema
});

// Signin schema
const doctorSigninSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// ✅ Signup endpoint
DoctorRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password } = doctorSignupSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const doctorId = uuidv4(); // ✅ Generate UUID for Doctor_ID

    const [result] = await pool.query(
      "INSERT INTO Doctor (Doctor_ID, email, password) VALUES (?, ?, ?)",
      [doctorId, email, hashedPassword]
    );

    res.status(201).json({
      message: "Doctor signed up successfully",
      doctor: { doctor_id: doctorId, email }
    });

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.issues
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
DoctorRouter.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = doctorSigninSchema.parse(req.body);

    const [rows] = await pool.query(
      "SELECT * FROM Doctor WHERE email = ?",
      [email]
    );

    const doctors = rows as any[];

    if (doctors.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const doctor = doctors[0];
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({
      message: "Signin successful",
      doctor: {
        doctor_id: doctor.Doctor_ID,
        email: doctor.email
      }
    });

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.issues
      });
    }
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default DoctorRouter;
