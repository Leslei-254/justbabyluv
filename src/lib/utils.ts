import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Friendly baby age, e.g. "12 days old" or "2 months, 1 week" */
export function formatBabyAge(dob: Date, timeZone?: string): string {
  const now = new Date();
  const diffMs = now.getTime() - dob.getTime();
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  if (days < 14) {
    return `${days} ${days === 1 ? "day" : "days"} old`;
  }

  if (days < 60) {
    const weeks = Math.floor(days / 7);
    const remDays = days % 7;
    let out = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    if (remDays > 0) out += `, ${remDays} ${remDays === 1 ? "day" : "days"}`;
    return out + " old";
  }

  const nowParts = timeZone ? getCalendarParts(now, timeZone) : { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const dobParts = timeZone ? getCalendarParts(dob, timeZone) : { year: dob.getFullYear(), month: dob.getMonth() + 1, day: dob.getDate() };
  const months =
    (nowParts.year - dobParts.year) * 12 +
    (nowParts.month - dobParts.month) -
    (nowParts.day < dobParts.day ? 1 : 0);

  const anchor = new Date(dob);
  anchor.setMonth(anchor.getMonth() + months);
  const remDays = Math.floor(
    (now.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weeks = Math.floor(remDays / 7);

  if (months < 24) {
    let out = `${months} ${months === 1 ? "month" : "months"}`;
    if (weeks > 0) out += `, ${weeks} ${weeks === 1 ? "week" : "weeks"}`;
    return out + " old";
  }

  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  let out = `${years} ${years === 1 ? "year" : "years"}`;
  if (remMonths > 0) out += `, ${remMonths} ${remMonths === 1 ? "month" : "months"}`;
  return out + " old";
}

/** "42 minutes ago" / "just now" / "2 hours ago" / "3 days ago" */
export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** "1h 12m" */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalMinutes = Math.round(ms / (1000 * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

type CalendarParts = { year: number; month: number; day: number };

export function getCalendarParts(date: Date, timeZone: string): CalendarParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

export function getTimeZoneDateKey(date: Date, timeZone: string): string {
  const p = getCalendarParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function formatClockTime(date: Date, timeZone = "UTC"): string {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDayLabel(date: Date, timeZone = "UTC"): string {
  const todayKey = getTimeZoneDateKey(new Date(), timeZone);
  const dateKey = getTimeZoneDateKey(date, timeZone);
  if (dateKey === todayKey) return "Today";

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (dateKey === getTimeZoneDateKey(yesterday, timeZone)) return "Yesterday";

  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Convert a datetime-local wall-clock value into an absolute instant in an
 * IANA timezone. This keeps DB timestamps timezone-neutral while interpreting
 * user-entered reminder times in the user's saved timezone.
 */
export function zonedDateTimeToUtc(value: string, timeZone: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) throw new Error("Invalid local date/time");

  const [, year, month, day, hour, minute, second = "00"] = match;
  let candidate = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  for (let i = 0; i < 3; i += 1) {
    const p = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(candidate));
    const get = (type: string) => Number(p.find((part) => part.type === type)?.value);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    const offset = asUtc - candidate;
    const next = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    ) - offset;
    if (next === candidate) break;
    candidate = next;
  }

  const result = new Date(candidate);
  const check = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(result).replace(", ", "T");
  const normalized = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  if (check !== normalized) throw new Error("That local time does not exist in the selected timezone.");
  return result;
}

export function startOfDay(date: Date, timeZone?: string): Date {
  if (!timeZone) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const key = getTimeZoneDateKey(date, timeZone);
  return zonedDateTimeToUtc(`${key}T00:00:00`, timeZone);
}

export function endOfDay(date: Date, timeZone?: string): Date {
  if (!timeZone) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  const key = getTimeZoneDateKey(date, timeZone);
  const start = zonedDateTimeToUtc(`${key}T00:00:00`, timeZone);
  const nextDay = new Date(start.getTime() + 36 * 60 * 60 * 1000);
  const nextKey = getTimeZoneDateKey(nextDay, timeZone);
  const nextStart = zonedDateTimeToUtc(`${nextKey}T00:00:00`, timeZone);
  return new Date(nextStart.getTime() - 1);
}
