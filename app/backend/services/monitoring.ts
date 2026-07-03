import { performance } from 'perf_hooks';

export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  labels: Record<string, string>;
}

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  traceId: string;
  service: string;
  metadata?: any;
}

export class MonitoringSystem {
  private metrics: MetricData[] = [];
  private logs: LogEntry[] = [];
  private activeTraces: Map<string, number> = new Map();

  // Metrics Collection
  public recordMetric(name: string, value: number, labels: Record<string, string> = {}) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      labels
    });
  }

  public startTimer(name: string, traceId: string): void {
    this.activeTraces.set(`${name}_${traceId}`, performance.now());
  }

  public endTimer(name: string, traceId: string, labels: Record<string, string> = {}): void {
    const startTime = this.activeTraces.get(`${name}_${traceId}`);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.recordMetric(`${name}_duration_ms`, duration, { ...labels, traceId });
      this.activeTraces.delete(`${name}_${traceId}`);
    }
  }

  // Structured Logging
  public log(level: LogEntry['level'], message: string, traceId: string, service: string, metadata?: any) {
    this.logs.push({
      level,
      message,
      timestamp: Date.now(),
      traceId,
      service,
      metadata
    });

    // Console output for development
    console.log(`[${level.toUpperCase()}] ${service} (${traceId}): ${message}`, metadata || '');
  }

  // Voice Processing Metrics
  public recordVoiceProcessingMetrics(
    operation: string,
    traceId: string,
    latency: number,
    qualityScore: number,
    errorRate: number = 0
  ) {
    this.recordMetric('voice_processing_latency_ms', latency, { operation, traceId });
    this.recordMetric('voice_processing_quality', qualityScore, { operation, traceId });
    this.recordMetric('voice_processing_error_rate', errorRate, { operation, traceId });
  }

  // Productivity Metrics
  public recordProductivityMetrics(
    userId: string,
    traceId: string,
    scoreCalculationTime: number,
    insightCount: number,
    recommendationCount: number
  ) {
    this.recordMetric('productivity_score_calculation_ms', scoreCalculationTime, { userId, traceId });
    this.recordMetric('productivity_insights_generated', insightCount, { userId, traceId });
    this.recordMetric('productivity_recommendations_generated', recommendationCount, { userId, traceId });
  }

  // API Metrics
  public recordAPIMetrics(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    traceId: string
  ) {
    this.recordMetric('api_request_duration_ms', responseTime, { endpoint, method, traceId });
    this.recordMetric('api_request_count', 1, { endpoint, method, status: statusCode.toString(), traceId });
  }

  // Get Metrics for Dashboard
  public getMetrics(timeRange: number = 3600000): MetricData[] {
    const cutoff = Date.now() - timeRange;
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  public getLogs(timeRange: number = 3600000): LogEntry[] {
    const cutoff = Date.now() - timeRange;
    return this.logs.filter(l => l.timestamp > cutoff);
  }

  // Performance Analytics
  public getPerformanceAnalytics() {
    const recentMetrics = this.getMetrics();
    
    const voiceLatency = recentMetrics
      .filter(m => m.name === 'voice_processing_latency_ms')
      .map(m => m.value);
    
    const apiLatency = recentMetrics
      .filter(m => m.name === 'api_request_duration_ms')
      .map(m => m.value);

    return {
      voiceProcessing: {
        avgLatency: voiceLatency.length ? voiceLatency.reduce((a, b) => a + b) / voiceLatency.length : 0,
        maxLatency: voiceLatency.length ? Math.max(...voiceLatency) : 0,
        requestCount: voiceLatency.length
      },
      api: {
        avgLatency: apiLatency.length ? apiLatency.reduce((a, b) => a + b) / apiLatency.length : 0,
        maxLatency: apiLatency.length ? Math.max(...apiLatency) : 0,
        requestCount: apiLatency.length
      },
      errors: this.logs.filter(l => l.level === 'error').length,
      warnings: this.logs.filter(l => l.level === 'warn').length
    };
  }

  // Generate Trace ID
  public generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const monitoring = new MonitoringSystem();