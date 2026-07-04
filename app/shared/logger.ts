import { IPC_CHANNELS } from './constants';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  module: string;
  data?: unknown;
  stack?: string;
  correlationId?: string;
  sessionId?: string;
}

export interface LogTransport {
  enabled: boolean;
  level: LogLevel;
  format?: (entry: LogEntry) => string;
}

export interface ConsoleTransport extends LogTransport {
  colors: boolean;
  timestamps: boolean;
}

export interface FileTransport extends LogTransport {
  path: string;
  maxSize: number;
  maxFiles: number;
  compress: boolean;
  rotation: boolean;
}

export interface IPCTransport extends LogTransport {
  channel: string;
  includeData: boolean;
}

export interface LoggerConfig {
  level: LogLevel;
  module: string;
  transports: {
    console: ConsoleTransport;
    file: FileTransport;
    ipc: IPCTransport;
  };
  metadata: {
    appVersion: string;
    sessionId: string;
    environment: string;
  };
}

type IpcBridge = { send?: (channel: string, payload: unknown) => void };

const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.TRACE]: 'TRACE',
};

const browserRuntime = typeof window !== 'undefined';
const nowMs = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
const envName = typeof process !== 'undefined' && process.env?.NODE_ENV ? process.env.NODE_ENV : 'development';

function sessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function inspectData(data: unknown): string {
  if (data === undefined) return '';
  if (typeof data === 'string') return data;
  try { return JSON.stringify(data); } catch { return String(data); }
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  module: 'main',
  transports: {
    console: { enabled: true, level: LogLevel.INFO, colors: false, timestamps: true },
    file: { enabled: false, level: LogLevel.DEBUG, path: '', maxSize: 10485760, maxFiles: 5, compress: false, rotation: false },
    ipc: { enabled: false, level: LogLevel.WARN, channel: IPC_CHANNELS.EVENTS.SYSTEM_EVENT, includeData: false },
  },
  metadata: { appVersion: '1.0.0', sessionId: sessionId(), environment: envName },
};

class KnouxLogger {
  private config: LoggerConfig;
  private queue: LogEntry[] = [];
  private processing = false;
  private ipcRenderer: IpcBridge | null = null;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      transports: {
        ...DEFAULT_CONFIG.transports,
        ...(config.transports || {}),
        console: { ...DEFAULT_CONFIG.transports.console, ...(config.transports?.console || {}) },
        file: { ...DEFAULT_CONFIG.transports.file, ...(config.transports?.file || {}) },
        ipc: { ...DEFAULT_CONFIG.transports.ipc, ...(config.transports?.ipc || {}) },
      },
      metadata: { ...DEFAULT_CONFIG.metadata, ...(config.metadata || {}) },
    };

    if (browserRuntime) {
      try {
        const electronApi = (window as unknown as { require?: (name: string) => { ipcRenderer?: IpcBridge } }).require?.('electron');
        this.ipcRenderer = electronApi?.ipcRenderer || null;
      } catch {
        this.ipcRenderer = null;
      }
    }
  }

  private format(entry: LogEntry): string {
    const ts = this.config.transports.console.timestamps ? `${entry.timestamp.toISOString()} ` : '';
    const payload = entry.data !== undefined ? ` ${inspectData(entry.data)}` : '';
    const stack = entry.stack ? `\n${entry.stack}` : '';
    return `${ts}${LEVEL_NAMES[entry.level]} [${entry.module}] ${entry.message}${payload}${stack}`;
  }

  private processEntry(entry: LogEntry): void {
    const consoleConfig = this.config.transports.console;
    const ipcConfig = this.config.transports.ipc;

    if (consoleConfig.enabled && entry.level <= consoleConfig.level) {
      const method = entry.level === LogLevel.ERROR ? 'error' : entry.level === LogLevel.WARN ? 'warn' : entry.level === LogLevel.INFO ? 'info' : 'log';
      console[method](consoleConfig.format ? consoleConfig.format(entry) : this.format(entry));
    }

    if (ipcConfig.enabled && entry.level <= ipcConfig.level && this.ipcRenderer?.send) {
      this.ipcRenderer.send(ipcConfig.channel, {
        type: 'log',
        level: LEVEL_NAMES[entry.level],
        message: entry.message,
        module: entry.module,
        timestamp: entry.timestamp.toISOString(),
        ...(ipcConfig.includeData ? { data: entry.data } : {}),
      });
    }
  }

  private drain(): void {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length) {
      const entry = this.queue.shift();
      if (entry) this.processEntry(entry);
    }
    this.processing = false;
  }

  private log(level: LogLevel, message: string, data?: unknown, error?: Error): void {
    if (level > this.config.level) return;
    this.queue.push({ timestamp: new Date(), level, message, module: this.config.module, data, stack: error?.stack, correlationId: Math.random().toString(36).slice(2), sessionId: this.config.metadata.sessionId });
    setTimeout(() => this.drain(), 0);
  }

  public error(message: string, error?: Error, data?: unknown): void { this.log(LogLevel.ERROR, message, data, error); }
  public warn(message: string, data?: unknown): void { this.log(LogLevel.WARN, message, data); }
  public info(message: string, data?: unknown): void { this.log(LogLevel.INFO, message, data); }
  public debug(message: string, data?: unknown): void { this.log(LogLevel.DEBUG, message, data); }
  public trace(message: string, data?: unknown): void { this.log(LogLevel.TRACE, message, data); }
  public child(module: string): KnouxLogger { return new KnouxLogger({ ...this.config, module: `${this.config.module}.${module}` }); }
  public updateConfig(config: Partial<LoggerConfig>): void { this.config = { ...this.config, ...config, transports: { ...this.config.transports, ...(config.transports || {}) }, metadata: { ...this.config.metadata, ...(config.metadata || {}) } }; }
  public getConfig(): LoggerConfig { return { ...this.config }; }
  public async flush(): Promise<void> { this.drain(); }
  public async close(): Promise<void> { await this.flush(); }
}

export function createLogger(config: Partial<LoggerConfig> = {}): KnouxLogger { return new KnouxLogger(config); }
export function getLogger(module: string): KnouxLogger { return createLogger({ module }); }
export const logger = createLogger();

export function createTimer(label: string): () => number {
  const start = nowMs();
  return () => {
    const duration = nowMs() - start;
    logger.debug(`${label} completed`, { duration: `${duration.toFixed(2)}ms` });
    return duration;
  };
}

export function logExecutionTime<T>(func: () => T | Promise<T>, label: string, level: LogLevel = LogLevel.DEBUG): T | Promise<T> {
  const start = nowMs();
  const done = () => {
    const duration = `${(nowMs() - start).toFixed(2)}ms`;
    if (level === LogLevel.ERROR) logger.error(`${label} execution time`, undefined, { duration });
    else if (level === LogLevel.WARN) logger.warn(`${label} execution time`, { duration });
    else if (level === LogLevel.INFO) logger.info(`${label} execution time`, { duration });
    else if (level === LogLevel.TRACE) logger.trace(`${label} execution time`, { duration });
    else logger.debug(`${label} execution time`, { duration });
  };
  const result = func();
  if (result instanceof Promise) return result.finally(done) as Promise<T>;
  done();
  return result;
}

export function createScopedLogger(scope: string, parent?: KnouxLogger): KnouxLogger {
  return (parent || logger).child(scope);
}

export default logger;
