// src/index.ts
import express, { type Request, type Response } from "express";
import cors from "cors"; // ✅ import cors properly
import PatientRouter from "./routes/Patient.js";
import DoctorRouter from "./routes/doctor.js";

const app = express();
const PORT = 3001;

// ✅ Enable CORS for frontend connection
// You can restrict origin if needed: origin: "http://localhost:3000"
app.use(
  cors({
    origin: "*", // For development allow all, in production replace with frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Middleware to parse JSON requests
app.use(express.json());

// ✅ Mount routers
app.use("/patient", PatientRouter);
app.use("/doctor", DoctorRouter);

// ✅ Default route
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the main API!");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
