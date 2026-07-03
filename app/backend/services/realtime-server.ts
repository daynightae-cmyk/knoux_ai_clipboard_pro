import WebSocket from 'ws';
import { RealtimeVoiceEvent } from '../../shared/voice-contracts';

export class RealtimeServer {
  private wss: WebSocket.Server;
  private sessions: Map<string, WebSocket> = new Map();

  constructor(port: number = 8080) {
    this.wss = new WebSocket.Server({ port });
    this.setupHandlers();
  }

  private setupHandlers() {
    this.wss.on('connection', (ws, req) => {
      const sessionId = this.generateSessionId();
      this.sessions.set(sessionId, ws);

      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.handleMessage(sessionId, message);
      });

      ws.on('close', () => {
        this.sessions.delete(sessionId);
      });

      ws.send(JSON.stringify({ type: 'connected', sessionId }));
    });
  }

  private handleMessage(sessionId: string, message: any) {
    switch (message.type) {
      case 'voice-chunk':
        this.processVoiceChunk(sessionId, message.data);
        break;
      case 'start-realtime':
        this.startRealtimeProcessing(sessionId, message.profileId);
        break;
      case 'stop-realtime':
        this.stopRealtimeProcessing(sessionId);
        break;
    }
  }

  private async processVoiceChunk(sessionId: string, audioData: ArrayBuffer) {
    const startTime = Date.now();
    
    // Process audio chunk (mock implementation)
    const qualityScore = Math.random() * 0.3 + 0.7; // 0.7-1.0
    const latency = Date.now() - startTime;

    const event: RealtimeVoiceEvent = {
      type: 'chunk-processed',
      sessionId,
      timestamp: Date.now(),
      data: {
        chunkId: this.generateChunkId(),
        latencyMs: latency,
        qualityScore
      }
    };

    this.broadcast(sessionId, event);
  }

  private startRealtimeProcessing(sessionId: string, profileId: string) {
    const event: RealtimeVoiceEvent = {
      type: 'profile-changed',
      sessionId,
      timestamp: Date.now(),
      data: { profileId }
    };
    this.broadcast(sessionId, event);
  }

  private stopRealtimeProcessing(sessionId: string) {
    // Cleanup processing resources
  }

  public broadcast(sessionId: string, event: RealtimeVoiceEvent) {
    const ws = this.sessions.get(sessionId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  public broadcastProductivityUpdate(userId: string, scoreData: any) {
    this.sessions.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'score-updated',
          userId,
          data: scoreData,
          timestamp: Date.now()
        }));
      }
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChunkId(): string {
    return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}