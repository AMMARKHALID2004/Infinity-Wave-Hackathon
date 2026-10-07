# NovaWorks AI Project Manager

Infinity Wave's Infinity Hack '26 CRM foundation. This repository currently has the schema, demo account setup, Supabase Auth, and a login screen. Project views and AI transcript creation are the next build steps.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, lucide-react, Zod, Supabase Postgres and Auth, OpenRouter (planned), Vercel (planned).

## Setup

1. Create a Supabase project. In **Project Settings → API**, copy the project URL, anon key, and service role key.
2. Run `cp .env.example .env.local`. Replace the placeholders with your keys. Keep `.env.local` private. OpenRouter variables are reserved for the transcript flow.
3. Apply [0001_init.sql](supabase/migrations/0001_init.sql) in **Supabase Dashboard → SQL Editor → New query → Run**. Run it once on a fresh project before seeding.
4. Run `npm ci`, then `npm run db:seed`.
5. Run `npm run auth:verify` to check the admin password against Supabase Auth.
6. Run `npm run dev` and open [http://localhost:3000/login](http://localhost:3000/login).

After the transcript flow creates projects, run `npm run test:access` with the dev server running. It checks manager and agent filtering and the transcript role gate. When no projects exist, it skips the project/task count assertions.

Use the SQL Editor for this initial migration. Run it once on a fresh project before seeding; running it again will fail because the tables already exist. Supabase CLI migrations normally use timestamped filenames, while this task requested `0001_init.sql`.

## Demo accounts

All passwords: `Demo123!`. Admin: `admin@novaworks.example`. Managers: `ayesha@novaworks.example`, `bilal@novaworks.example`, `hina@novaworks.example`. Agents: `ali@novaworks.example`, `hamza@novaworks.example`, `sara@novaworks.example`, `usman@novaworks.example`, `zain@novaworks.example`, `maryam@novaworks.example`.

Run `npm run db:seed` again safely; existing auth users are reused and their demo passwords are restored to `Demo123!`. `npm run db:reset-demo` deletes all projects and tasks while keeping accounts.

## Transcript test and deployment

The transcript creation flow is not implemented yet. Once available, log in as admin, paste the full meeting in [the problem statement](docs/PROBLEM_STATEMENT.md), and check for three projects and twelve tasks. The expected role checks are described there.

Deployment target: Vercel with a Supabase hosted project. Add all environment variables from `.env.example` to Vercel, deploy the Next.js app, and apply the database migration and seed to the same Supabase project. Live URL and demo video: pending.

Known limitations: project/task screens and OpenRouter transcript conversion are pending. The foundation login has no post-login dashboard yet.
