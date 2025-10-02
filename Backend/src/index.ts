import express, { type Request, type Response } from "express";

// Import routers correctly
import  PatientRouter from "./routes/Patient.js";
import DoctorRouter from "./routes/doctor.js";

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Mount routers
app.use("/patient", PatientRouter);
app.use("/doctor", DoctorRouter);

// Default route
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the main API!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
