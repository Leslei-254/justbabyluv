# JustBaby Luv — Baby Care

*Keep track of the little things that matter.*

A mobile-first newborn/baby care tracking app built as a companion product for
the [JustBaby Luv](https://justbabyluv.com/) brand. Parents can log feeds,
diaper changes, sleep, pumping and medicine, set reminders, and record
milestones ("Baby Steps") — all from a calm, one-handed, thumb-friendly UI.

This is a personal activity tracker and reminder tool. **It is not a medical
diagnosis or medical advice application.**

## Main features

- **Baby profile** — name, date of birth, photo, birth weight, notes; friendly
  age display ("12 days old", "2 months, 1 week").
- **Dashboard** — baby header, quick-action buttons, active timers, today's
  summary, upcoming reminders, recent activity.
- **Feeding tracker** — breast / bottle / formula / expressed, amount, side,
  manual or timer-based entry.
- **Diaper tracker** — wet / dirty / both, logged in two taps.
- **Sleep tracker** — start/stop timer or manual entry, today's total sleep.
- **Pumping tracker** — side, amount, timer or manual entry.
- **Medication log & reminders** — the parent enters what was given; the app
  only records and reminds — it never recommends dosages or treatment.
- **Baby Steps (milestones)** — first smile, first bath, first tooth, custom
  milestones, shown as a timeline, with optional photo and note.
- **Timeline** — chronological, filterable by activity type or Baby Steps.
- **Reminders** — one-off or repeating, optional email notification, with
  complete / snooze / edit / delete.
- **Email reminders** — sent via [Resend](https://resend.com) when configured;
  otherwise safely logged to the server console (dev fallback).
- **Settings** — baby profile, units (oz/ml), theme (light/dark/system),
  account, demo data reset.
- **Auth** — email/password sign up, sign in, sign out, protected routes,
  server-side authorization on every request.
- **Dark mode**, responsive layout, accessible focus states, empty/loading/
  error states, and toast feedback throughout.

## Technology stack

- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack)
- **UI:** Tailwind CSS v4, [lucide-react](https://lucide.dev) icons,
  [sonner](https://sonner.emilkowal.ski) toasts
- **Database:** SQLite via [libSQL](https://turso.tech/libsql) +
  [Drizzle ORM](https://orm.drizzle.team) (swap `DATABASE_URL` for a hosted
  Turso database with no code changes)
- **Auth:** [NextAuth.js v5](https://authjs.dev) (Credentials provider, JWT
  sessions, bcrypt password hashing)
- **Validation:** [Zod](https://zod.dev)
- **Email:** [Resend](https://resend.com), with a console-logging fallback

> **Why libSQL instead of Prisma?** Prisma's CLI downloads native query-engine
> binaries from `binaries.prisma.sh` at install/generate time. In network-
> restricted environments (CI runners, sandboxes, some corporate proxies)
> that fetch fails and blocks every Prisma command. Drizzle + libSQL ship as
> plain npm packages with no separate binary download, so the project
> installs and builds reliably anywhere. Drizzle's schema, migrations and
> query API cover the same relational-database needs.

## Local setup

```bash
npm install
cp .env.example .env      # defaults work out of the box for local dev
npm run db:push           # create the local SQLite database from the schema
npm run db:seed           # optional: create a demo account with sample data
npm run dev                # start the dev server at http://localhost:3000
```

## Database setup

The schema lives in `src/db/schema.ts` and covers `users`, `babies`,
`activities` (feed/diaper/sleep/pump/medication, one relational table with
typed columns per activity, related to a baby), `milestones`, and
`reminders`.

- `npm run db:generate` — generate a SQL migration from the current schema
  (output in `drizzle/`)
- `npm run db:push` — apply the schema directly to the local SQLite file at
  `DATABASE_URL` (used for local dev)
- `npm run db:studio` — open Drizzle Studio to browse the local database
- `npm run db:seed` — create/refresh a demo account and baby with sample
  activities, milestones, and reminders

The database file itself (`data/justbabyluv.db`) is **not** committed to
git — running `db:push` (and optionally `db:seed`) recreates it locally.

For production, point `DATABASE_URL` at a hosted libSQL database (e.g. a
free [Turso](https://turso.tech) database) — no code changes are required.

## Environment variables

See `.env.example` for the full list with comments. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | libSQL/SQLite connection string |
| `AUTH_SECRET` | Yes (prod) | Signs NextAuth session tokens — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes (prod) | Base URL of the deployed app |
| `RESEND_API_KEY` | No | Enables real email sending via Resend; omit to use the console fallback |
| `EMAIL_FROM` | No | "From" address for reminder emails |

No secrets are committed to this repository. `.env` is git-ignored;
`.env.example` contains variable names and safe local defaults only.

## Demo account

After running `npm run db:seed`:

- **Email:** `demo@justbabyluv.com`
- **Password:** `demo1234`

This account has a demo baby ("Emma") pre-populated with sample feeds,
diapers, sleep, pumping, a medication log, two milestones, and two
reminders, so the app doesn't look empty on first run. Reset or clear this
data any time from **Settings → Demo data**.

## How email works

Reminders can optionally send an email notification. The email service
(`src/lib/email.ts`) is a single, reusable function:

- If `RESEND_API_KEY` is set, it sends real email via Resend.
- If it is **not** set, the app doesn't fail or throw — it safely logs the
  email (recipient, subject, body) to the server console instead, so every
  flow keeps working in local development without any provider configured.

Each reminder has a "send test email" action (visible when email is
enabled) that exercises this exact path, so you can verify provider/fallback
behavior directly from the UI.

## Development mode

```bash
npm run dev
```

Starts the Next.js dev server with hot reload at `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

`npm run build` runs a full Turbopack production build (including a
TypeScript type check). `npm run start` serves the built app.

## Linting & type checking

```bash
npm run lint
npx tsc --noEmit
```

## Known limitations / next steps

- Timers support **start/stop** rather than full pause/resume (a reasonable
  MVP scope trim — resuming a stopped timer just starts a new one).
- Reminder emails are sent on demand (via the "send test email" action) or
  can be wired to a scheduled job (e.g. a cron-triggered API route or a
  queue) to auto-send at the reminder's due time in production — no
  scheduler is included in this MVP.
- Single parent account/baby profile per the brief; the data model already
  scopes every record through `babyId` → `userId`, so multi-caregiver sharing
  can be added later without a schema rework.
- No automated test suite yet; flows were verified manually against the
  acceptance-test checklist (see project notes).
