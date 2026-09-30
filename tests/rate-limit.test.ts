import assert from "node:assert/strict";
import test from "node:test";
import { consumeRateLimit } from "../src/lib/rate-limit";

test("rate limiter allows requests up to the configured limit", () => {
  const key = `test-${crypto.randomUUID()}`;

  assert.equal(consumeRateLimit(key, 2, 60_000).allowed, true);
  assert.equal(consumeRateLimit(key, 2, 60_000).allowed, true);
  assert.equal(consumeRateLimit(key, 2, 60_000).allowed, false);
});
