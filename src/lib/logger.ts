export type LogSeverity = "info" | "warn" | "error";

type LogInput = {
  severity: LogSeverity;
  event: string;
  route?: string;
  requestId?: string | null;
  userId?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
  error?: unknown;
};

function sanitizeText(value: string) {
  return value
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(password|token|secret|authorization|api[_-]?key)=?[^\s&]+/gi, "$1=[redacted]")
    .slice(0, 500);
}

function serializeError(error: unknown) {
  if (!(error instanceof Error)) return { name: "UnknownError" };

  const result: Record<string, string> = { name: error.name || "Error" };
  if (process.env.NODE_ENV !== "production") {
    result.message = sanitizeText(error.message || "");
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code === "string") result.code = code.slice(0, 100);
  return result;
}

export function logServerEvent(input: LogInput) {
  const payload = {
    timestamp: new Date().toISOString(),
    severity: input.severity,
    event: input.event,
    ...(input.route ? { route: input.route } : {}),
    ...(input.requestId ? { requestId: input.requestId } : {}),
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.metadata ? { metadata: input.metadata } : {}),
    ...(input.error ? { error: serializeError(input.error) } : {}),
  };

  const output = JSON.stringify(payload);
  if (input.severity === "error") console.error(output);
  else if (input.severity === "warn") console.warn(output);
  else console.info(output);
}

export function logServerError(input: Omit<LogInput, "severity">) {
  logServerEvent({ ...input, severity: "error" });
}
