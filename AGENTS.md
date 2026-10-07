## Project context
We are building the Infinity Hack '26 "AI Project Manager" CRM (3-hour hackathon MVP).
The full spec is in `docs/PROBLEM_STATEMENT.md`. Read it before planning or coding.

## Non-negotiables (from the spec)
- Roles: ADMIN / MANAGER / AGENT. Enforce access in the backend/data layer, not just the UI.
- Current user comes from the session, never from a client-supplied role or ID.
- Only ADMIN can run Create from Transcript.
- Transcript -> AI -> validate fully -> save in ONE transaction (all-or-nothing).
- AI output must come from a real LLM call. Never hardcode the answer.
- Never send passwords to the AI. The AI gets only id, name, role, skills.
- Seeder is idempotent (upsert by email); passwords hashed. Demo password: Demo123!
- App code generates project/task IDs; the AI returns only user references.
- No signup, forgot password, user management, cost, or progress features.
- API keys only via env vars, backend only. Provide `.env.example`. Never commit secrets.
- The README must follow `README_Template.md`.

## Working style
- MVP first; get the core flow working end to end before polish.
- Keep changes small and runnable after each step.




## Stack (fixed, do not change)
Next.js App Router + TypeScript, Tailwind, shadcn/ui, lucide-react.
Backend: Next.js route handlers, zod for all validation.
DB: Supabase Postgres. Auth: Supabase Auth (@supabase/ssr).
AI: OpenRouter (model from env). Deploy: Vercel + Supabase.

## Rules
- Server auth: always supabase.auth.getUser(), never getSession() or client-sent ids/roles.
- Service-role key and OpenRouter key are server-only, never NEXT_PUBLIC_.
- All access control lives in lib/access.ts and is used by every route handler.
- RLS is enabled on all tables with no public policies.
- The AI sees only ref, name, role, specialization, skills (never email/passwords/UUIDs).
- Transcript save is atomic via a Postgres function (rpc), not multiple inserts.
- Read docs/PROGRESS.md before starting; update it after each task.

Before starting, read docs/PROGRESS.md. After finishing a task, update it.
