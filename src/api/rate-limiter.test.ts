import { describe, expect, it } from 'vitest';
import { RateLimiter } from './rate-limiter.js';

describe('RateLimiter', () => {
  it('starts at full capacity', () => {
    const limiter = new RateLimiter({ capacity: 3, refillPerSecond: 1 });
    expect(limiter.available()).toBe(3);
  });

  it('allows up to capacity consecutive consumes from a fresh bucket', () => {
    const limiter = new RateLimiter({ capacity: 3, refillPerSecond: 1 });
    expect(limiter.consume()).toBe(true);
    expect(limiter.consume()).toBe(true);
    expect(limiter.consume()).toBe(true);
  });

  it('rejects when the bucket is empty', () => {
    const limiter = new RateLimiter({ capacity: 1, refillPerSecond: 0.0001 });
    expect(limiter.consume()).toBe(true);
    expect(limiter.consume()).toBe(false);
  });
});
