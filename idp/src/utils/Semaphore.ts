
export default class Semaphore {
  private count: number;
  private waiting: Array<() => void> = [];

  constructor(count: number = 50) {
    this.count = count;
  }

  acquire(): Promise<void> {
    if (this.count > 0) {
      this.count--;
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      this.waiting.push(resolve);
    });
  }

  release(): void {
    this.count++;
    
    if (this.waiting.length > 0 && this.count > 0) {
      this.count--;
      const next = this.waiting.shift();
      next?.();
    }
  }
}

