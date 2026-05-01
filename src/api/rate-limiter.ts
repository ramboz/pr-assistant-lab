export interface RateLimiterOptions {
  capacity: number;
  refillPerSecond: number;
}

/**
 * Token-bucket rate limiter for the GitHub client. Capacity sets the
 * burst size; refillPerSecond sets the steady-state rate. Call
 * `consume()` before each API call; if it returns false, back off.
 */
export class RateLimiter {
  private readonly capacity: number;
  private readonly refillPerSecond: number;
  private tokens: number;
  private lastRefill: number;

  constructor(options: RateLimiterOptions) {
    this.capacity = options.capacity;
    this.refillPerSecond = options.refillPerSecond;
    this.tokens = options.capacity;
    this.lastRefill = Date.now();
  }

  consume(): boolean {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSecond);
    if (this.tokens >= 1) {
      this.tokens -= 1;
      this.lastRefill = now;
      return true;
    }
    return false;
  }

  available(): number {
    return Math.floor(this.tokens);
  }
}
