import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getClientAddress } from "@/lib/rate-limit";

const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const SIGNUP_LIMIT = 5;
const SIGNUP_WINDOW_MS = 60 * 60 * 1000;

export function proxy(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.next();
  }

  const address = getClientAddress(req);
  const path = req.nextUrl.pathname;

  const rule =
    path === "/api/signup"
      ? {
          key: `signup:${address}`,
          limit: SIGNUP_LIMIT,
          windowMs: SIGNUP_WINDOW_MS,
        }
      : path === "/api/auth/callback/credentials"
        ? {
            key: `login:${address}`,
            limit: LOGIN_LIMIT,
            windowMs: LOGIN_WINDOW_MS,
          }
        : null;

  if (!rule) return NextResponse.next();

  const result = consumeRateLimit(rule.key, rule.limit, rule.windowMs);
  if (result.allowed) return NextResponse.next();

  return NextResponse.json(
    { error: "Too many attempts. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    }
  );
}

export const config = {
  matcher: ["/api/signup", "/api/auth/callback/credentials"],
};
