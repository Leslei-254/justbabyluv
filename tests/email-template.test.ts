import assert from "node:assert/strict";
import test from "node:test";
import { buildWelcomeEmail } from "../src/lib/email-templates";

test("welcome email includes the user's first name and onboarding link", () => {
  const email = buildWelcomeEmail("Leslei Makori");

  assert.equal(email.subject, "Welcome to JustBaby Luv");
  assert.match(email.text, /Hi Leslei,/);
  assert.match(email.text, /\/onboarding/);
  assert.match(email.html, /Welcome, Leslei\./);
  assert.match(email.html, /JustBaby Luv/);
});

test("welcome email escapes HTML in the user's name", () => {
  const email = buildWelcomeEmail("<script>alert(1)</script>");

  assert.doesNotMatch(email.html, /<script>/);
  assert.match(email.html, /&lt;script&gt;/);
  assert.doesNotMatch(email.text, /&lt;script&gt;/);
});

test("welcome email is explicitly transactional", () => {
  const email = buildWelcomeEmail("Parent");

  assert.match(email.text, /transactional account email/i);
  assert.match(email.html, /transactional account email/i);
});
