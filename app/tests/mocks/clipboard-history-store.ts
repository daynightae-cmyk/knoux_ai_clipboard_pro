export class HistoryStore {
  private items: any[] = [];
  private maxSize = Infinity;

  async save(item: any) {
    this.items = [item, ...this.items.filter((existing) => existing.id !== item.id)];
    this.enforceLimit();
  }

  async get(id: string) {
    return this.items.find((item) => item.id === id);
  }

  async getAll() {
    return [...this.items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, this.maxSize);
  }

  async getPaginated({ limit, offset }: { limit: number; offset: number }) {
    const all = await this.getAll();
    return { items: all.slice(offset, offset + limit), total: all.length };
  }

  async search(query: string) {
    const lower = query.toLowerCase();
    return (await this.getAll()).filter((item) => item.content.toLowerCase().includes(lower));
  }

  async getByTag(tag: string) {
    return (await this.getAll()).filter((item) => item.tags?.includes(tag));
  }

  async delete(id: string) {
    this.items = this.items.filter((item) => item.id !== id);
  }

  async clear() {
    this.items = [];
  }

  setMaxSize(value: number) {
    this.maxSize = value;
    this.enforceLimit();
  }

  private enforceLimit() {
    this.items = this.items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, this.maxSize);
  }
}
