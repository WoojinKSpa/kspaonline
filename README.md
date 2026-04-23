# Kspa.online

Production-ready Next.js App Router starter for a Korean spa directory.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component structure
- Supabase-ready helpers for auth and data

## Included routes

- `/`
- `/spas`
- `/spas/[slug]`
- `/login`
- `/admin`
- `/admin/spas`
- `/admin/spas/new`
- `/admin/spas/[id]`

## Local setup

1. Install dependencies with your package manager.
2. Copy `.env.example` to `.env.local`.
3. Add your Supabase credentials:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `npm run dev`.

## Notes

- Claim flow is intentionally not implemented yet.
- Payments are intentionally not implemented yet.
- The homepage and some admin placeholder screens still use scaffold data from `lib/mock-data.ts`.
- Public listing pages read published spas with the anon key on the server.
- Admin authentication uses Supabase session cookies plus middleware refresh.
- Service role usage is server-only and exposed through `createSupabaseAdminClient()`.
