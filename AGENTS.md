# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 14 portfolio website** (single service). No databases, Docker, or external services required.

### Quick reference

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Build | `npm run build` |

### Notes

- The lockfile is `package-lock.json` — use **npm**, not pnpm/yarn.
- Portfolio content lives in `src/data/resume.tsx`; blog posts are MDX files in `content/`.
- `firebase` is listed as a dependency but is **not configured or used** in source code — no Firebase setup needed.
- `README.md` may contain a git merge conflict marker (`<<<<<<< HEAD`) on the `main` branch; this does not affect the app.
- The bottom dock navbar uses icons only (no text labels). Blog is accessible at `/blog` but there is no dedicated blog icon in the dock.
- Theme toggle (light/dark) is the sun/moon icon in the dock navbar.
