// WebSocket Server for Real-time Communication
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { AgentOrchestrator } from '../agents/AgentOrchestrator.js';
import { v4 as uuidv4 } from 'uuid';

interface WSMessage {
  type: 'start' | 'message' | 'end' | 'history' | 'ping' | 'location';
  payload?: any;
}

interface WSResponse {
  type: 'connected' | 'session_started' | 'message' | 'diagnosis' | 'appointment' | 'history' | 'error' | 'pong';
  payload?: any;
}

export class MedicalWebSocketServer {
  private wss: WebSocketServer;
  private orchestrator: AgentOrchestrator;
  private clientSessions: Map<WebSocket, string>; // Map client to sessionId

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.orchestrator = new AgentOrchestrator();
    this.clientSessions = new Map();

    this.initialize();
    this.startCleanupInterval();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('\n' + '='.repeat(80));
      console.log('🎉 NEW WEBSOCKET CONNECTION ESTABLISHED!!!');
      console.log('Client IP:', req.socket.remoteAddress);
      console.log('Time:', new Date().toLocaleString());
      console.log('='.repeat(80) + '\n');

      // Send welcome message
      this.sendMessage(ws, {
        type: 'connected',
        payload: { message: 'Connected to Medical AI System' },
      });

      // Handle messages
      ws.on('message', async (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error processing message:', error);
          this.sendMessage(ws, {
            type: 'error',
            payload: { error: 'Invalid message format' },
          });
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        const sessionId = this.clientSessions.get(ws);
        if (sessionId) {
          this.orchestrator.endSession(sessionId);
          this.clientSessions.delete(ws);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log('🚀 WebSocket server initialized on /ws');
  }

  private async handleMessage(ws: WebSocket, message: WSMessage) {
    console.log(`\n🔔 [WebSocket] Message received: ${message.type}`);
    console.log(`Payload:`, JSON.stringify(message.payload, null, 2));
    
    switch (message.type) {
      case 'start':
        await this.handleStartSession(ws, message.payload);
        break;

      case 'message':
        await this.handlePatientMessage(ws, message.payload);
        break;

      case 'location':
        await this.handleLocationUpdate(ws, message.payload);
        break;

      case 'end':
        await this.handleEndSession(ws);
        break;

      case 'history':
        await this.handleGetHistory(ws, message.payload);
        break;

      case 'ping':
        this.sendMessage(ws, { type: 'pong' });
        break;

      default:
        this.sendMessage(ws, {
          type: 'error',
          payload: { error: 'Unknown message type' },
        });
    }
  }

  private async handleStartSession(ws: WebSocket, payload: any) {
    try {
      const { patientId, patientName } = payload;

      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      // Start session with orchestrator
      const { sessionId, greeting } = await this.orchestrator.startSession(
        patientId,
        patientName
      );

      // Store session mapping
      this.clientSessions.set(ws, sessionId);

      // Send session started response
      this.sendMessage(ws, {
        type: 'session_started',
        payload: {
          sessionId,
          message: greeting,
          timestamp: new Date(),
        },
      });

      console.log(`📝 Session started: ${sessionId} for patient: ${patientId}`);
    } catch (error: any) {
      console.error('Error starting session:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { error: error.message || 'Failed to start session' },
      });
    }
  }

  private async handlePatientMessage(ws: WebSocket, payload: any) {
    try {
      const sessionId = this.clientSessions.get(ws);

      if (!sessionId) {
        throw new Error('No active session. Please start a session first.');
      }

      const { message } = payload;

      if (!message) {
        throw new Error('Message content is required');
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`[WebSocket] 📨 Received patient message`);
      console.log(`Session ID: ${sessionId}`);
      console.log(`Message: "${message}"`);
      console.log(`${'='.repeat(60)}\n`);

      // Process message through orchestrator
      const result = await this.orchestrator.processMessage(sessionId, message);
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`[WebSocket] 📤 Sending response to patient`);
      console.log(`State: ${result.state}`);
      console.log(`Has Diagnosis: ${!!result.diagnosis}`);
      console.log(`Has Appointment: ${!!result.appointment}`);
      console.log(`${'='.repeat(60)}\n`);

      // Send AI response
      this.sendMessage(ws, {
        type: 'message',
        payload: {
          message: result.response,
          state: result.state,
          timestamp: new Date(),
        },
      });

      // If diagnosis is complete, send additional data
      if (result.diagnosis) {
        this.sendMessage(ws, {
          type: 'diagnosis',
          payload: {
            diagnosis: result.diagnosis,
            timestamp: new Date(),
          },
        });
      }

      if (result.appointment) {
        this.sendMessage(ws, {
          type: 'appointment',
          payload: {
            appointment: result.appointment,
            timestamp: new Date(),
          },
        });
      }

      console.log(`💬 Message processed for session: ${sessionId}`);
    } catch (error: any) {
      console.error('Error processing message:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { error: error.message || 'Failed to process message' },
      });
    }
  }

  private async handleLocationUpdate(ws: WebSocket, payload: any) {
    try {
      const sessionId = this.clientSessions.get(ws);

      if (!sessionId) {
        throw new Error('No active session. Please start a session first.');
      }

      const { latitude, longitude } = payload;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new Error('Invalid location coordinates');
      }

      // Update patient location in session
      this.orchestrator.updatePatientLocation(sessionId, latitude, longitude);

      this.sendMessage(ws, {
        type: 'message',
        payload: {
          message: '📍 Location received successfully',
          timestamp: new Date(),
        },
      });

      console.log(`📍 Location updated for session: ${sessionId} (${latitude}, ${longitude})`);
    } catch (error: any) {
      console.error('Error updating location:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { error: error.message || 'Failed to update location' },
      });
    }
  }

  private async handleEndSession(ws: WebSocket) {
    try {
      const sessionId = this.clientSessions.get(ws);

      if (sessionId) {
        await this.orchestrator.endSession(sessionId);
        this.clientSessions.delete(ws);

        this.sendMessage(ws, {
          type: 'message',
          payload: {
            message: 'Thank you for using our service. Take care! 👋',
            state: 'completed',
            timestamp: new Date(),
          },
        });

        console.log(`✅ Session ended: ${sessionId}`);
      }
    } catch (error: any) {
      console.error('Error ending session:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { error: error.message || 'Failed to end session' },
      });
    }
  }

  private async handleGetHistory(ws: WebSocket, payload: any) {
    try {
      const { patientId } = payload;

      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      const history = await this.orchestrator.getPatientHistory(patientId);

      this.sendMessage(ws, {
        type: 'history',
        payload: { history },
      });
    } catch (error: any) {
      console.error('Error fetching history:', error);
      this.sendMessage(ws, {
        type: 'error',
        payload: { error: error.message || 'Failed to fetch history' },
      });
    }
  }

  private sendMessage(ws: WebSocket, response: WSResponse) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(response));
    }
  }

  private startCleanupInterval() {
    // Cleanup inactive sessions every 10 minutes
    setInterval(() => {
      this.orchestrator.cleanupInactiveSessions();
    }, 10 * 60 * 1000);
  }

  /**
   * Broadcast message to all connected clients (for future use)
   */
  broadcast(message: WSResponse) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connections: this.wss.clients.size,
      activeSessions: this.clientSessions.size,
    };
  }
}
