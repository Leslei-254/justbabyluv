import assert from "node:assert/strict";
import test from "node:test";
import { reminderSchema, reminderUpdateSchema } from "../src/lib/validation";

test("reminder validation accepts a complete reminder", () => {
  const result = reminderSchema.safeParse({
    title: "Feed baby",
    type: "FEED",
    datetime: "2026-10-01T18:30",
    repeat: "daily",
    emailEnabled: true,
    notes: "Evening feed",
  });

  assert.equal(result.success, true);
});

test("reminder validation rejects unsupported reminder types and repeat values", () => {
  assert.equal(
    reminderSchema.safeParse({
      title: "Test",
      type: "INVALID",
      datetime: "2026-10-01T18:30",
      repeat: "daily",
      emailEnabled: false,
    }).success,
    false
  );

  assert.equal(
    reminderSchema.safeParse({
      title: "Test",
      type: "CUSTOM",
      datetime: "2026-10-01T18:30",
      repeat: "monthly",
      emailEnabled: false,
    }).success,
    false
  );
});

test("reminder update validation does not overwrite omitted fields", () => {
  const result = reminderUpdateSchema.safeParse({
    completed: true,
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data, { completed: true });
  }
});

test("reminder update validation accepts an absolute snooze timestamp", () => {
  const result = reminderUpdateSchema.safeParse({
    snoozedUntil: "2026-10-01T16:00:00.000Z",
  });

  assert.equal(result.success, true);
});
