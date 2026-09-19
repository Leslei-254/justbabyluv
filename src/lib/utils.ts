import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Friendly baby age, e.g. "12 days old" or "2 months, 1 week" */
export function formatBabyAge(dob: Date): string {
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

  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth()) -
    (now.getDate() < dob.getDate() ? 1 : 0);
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

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
