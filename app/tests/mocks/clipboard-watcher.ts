export class ClipboardWatcher {
  private monitoring = false;
  private callbacks: Array<(item: any) => void> = [];
  private interval: any = null;
  private pollInterval = 100;

  async start() {
    this.monitoring = true;
    this.interval = setInterval(() => {
      try {
        this.checkClipboard();
      } catch (error) {
        console.error(error);
        this.monitoring = false;
        clearInterval(this.interval);
      }
    }, this.pollInterval);
  }

  async stop() {
    this.monitoring = false;
    if (this.interval) clearInterval(this.interval);
    this.interval = null;
  }

  isMonitoring() {
    return this.monitoring;
  }

  onChange(callback: (item: any) => void) {
    this.callbacks.push(callback);
  }

  setPollInterval(value: number) {
    this.pollInterval = value;
  }

  async checkClipboard() {
    const item = { id: `clip-${Date.now()}`, content: "Test clipboard content", timestamp: new Date().toISOString(), format: "text" };
    this.callbacks.forEach((callback) => callback(item));
    return item;
  }

  async simulateChange(content: string) {
    const item = { id: `clip-${Date.now()}`, content, timestamp: new Date().toISOString(), format: "text" };
    this.callbacks.forEach((callback) => callback(item));
    return item;
  }
}
