// src/index.ts - Main server with WebSocket support
import express, { type Request, type Response, type Router } from "express";
import cors from "cors";
import { createServer } from "http";
import dotenv from "dotenv";
import PatientRouter from "./routes/Patient.js";
import DoctorRouter from "./routes/doctor.js";
import { MedicalWebSocketServer } from "./websocket/WebSocketServer.js";

// @ts-ignore - TypeScript module resolution issue with consultation.ts
import ConsultationRouter from "./routes/consultation.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Enable CORS for frontend connection
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// ✅ Middleware to parse JSON requests
app.use(express.json());

// ✅ Mount routers
app.use("/patient", PatientRouter);
app.use("/doctor", DoctorRouter);
app.use("/consultation", ConsultationRouter);

// ✅ Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Agentic AI Medical System",
  });
});

// ✅ Default route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to Agentic AI Medical Assistance System",
    version: "1.0.0",
    endpoints: {
      websocket: "ws://localhost:" + PORT + "/ws",
      rest: {
        patients: "/patient",
        doctors: "/doctor",
        consultations: "/consultation",
      },
    },
  });
});

// ✅ Create HTTP server for WebSocket integration
const server = createServer(app);

// ✅ Initialize WebSocket server
const wsServer = new MedicalWebSocketServer(server);

// ✅ WebSocket stats endpoint
app.get("/ws/stats", (_req: Request, res: Response) => {
  res.json(wsServer.getStats());
});

// ✅ Start server
server.listen(PORT, () => {
  console.log(`🚀 HTTP Server running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server running at ws://localhost:${PORT}/ws`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
