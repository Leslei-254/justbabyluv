import assert from "node:assert/strict";
import test from "node:test";
import {
  endOfDay,
  formatClockTime,
  getTimeZoneDateKey,
  isValidTimeZone,
  startOfDay,
  zonedDateTimeToUtc,
} from "../src/lib/utils";

test("timezone conversion preserves the user's wall-clock time", () => {
  const cases = [
    ["Africa/Nairobi", "2026-10-01T18:30", "2026-10-01T15:30:00.000Z"],
    ["Europe/London", "2026-10-01T18:30", "2026-10-01T17:30:00.000Z"],
    ["America/New_York", "2026-10-01T18:30", "2026-10-01T22:30:00.000Z"],
  ] as const;

  for (const [timeZone, value, expected] of cases) {
    const date = zonedDateTimeToUtc(value, timeZone);
    assert.equal(date.toISOString(), expected);
    assert.equal(formatClockTime(date, timeZone), "6:30 PM");
    assert.equal(getTimeZoneDateKey(date, timeZone), "2026-10-01");
  }
});

test("timezone validation accepts IANA zones and rejects invalid values", () => {
  assert.equal(isValidTimeZone("Africa/Nairobi"), true);
  assert.equal(isValidTimeZone("America/New_York"), true);
  assert.equal(isValidTimeZone("Not/A-Timezone"), false);
});

test("timezone conversion rejects nonexistent DST local times", () => {
  assert.throws(
    () => zonedDateTimeToUtc("2026-03-08T02:30", "America/New_York"),
    /does not exist/
  );
});

test("timezone day boundaries remain correct across DST", () => {
  const date = new Date("2026-11-01T18:00:00.000Z");
  const start = startOfDay(date, "America/New_York");
  const end = endOfDay(date, "America/New_York");

  assert.equal(start.toISOString(), "2026-11-01T04:00:00.000Z");
  assert.equal(end.toISOString(), "2026-11-02T04:59:59.999Z");
  assert.equal(getTimeZoneDateKey(end, "America/New_York"), "2026-11-01");
});
