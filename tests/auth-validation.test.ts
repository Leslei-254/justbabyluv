import assert from "node:assert/strict";
import test from "node:test";
import { signupSchema } from "../src/lib/auth-validation";

test("signup validation normalizes email and accepts a strong password", () => {
  const result = signupSchema.parse({
    name: "Parent",
    email: " PARENT@EXAMPLE.COM ",
    password: "parentpass123",
  });

  assert.equal(result.email, "parent@example.com");
});

test("signup validation rejects short passwords", () => {
  const result = signupSchema.safeParse({
    name: "Parent",
    email: "parent@example.com",
    password: "short123",
  });

  assert.equal(result.success, false);
});

test("signup validation rejects passwords without a number", () => {
  const result = signupSchema.safeParse({
    name: "Parent",
    email: "parent@example.com",
    password: "onlyletters",
  });

  assert.equal(result.success, false);
});
