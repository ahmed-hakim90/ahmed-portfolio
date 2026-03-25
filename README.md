<div align="center">

<img alt="Portfolio preview" src="https://github.com/ahmed-hakim90/ahmed-portfolio/assets/16860528/57ffca81-3f0a-4425-b31d-094f61725455" width="90%">

# Ahmed Portfolio

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ahmed-hakim90/ahmed-portfolio)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

**A full-stack personal portfolio and mini-CMS** — public site, blog, per-user slugs, and a protected admin dashboard — built with **Next.js 14** (App Router), **React 18**, **Tailwind CSS**, **shadcn/ui**, **Framer Motion**, and **Firebase**. Designed for deployment on [Vercel](https://vercel.com/).

[العربية](#arabic) · [Features](#features) · [Stack](#tech-stack) · [Setup](#getting-started) · [Changelog](./CHANGELOG.md)

</div>

---

<a id="arabic"></a>

## نبذة بالعربية

مشروع **موقع شخصي ولوحة تحكم** لإدارة المحتوى (السيرة، المشاريع، المدونة، وإعدادات الظهور) مع دعم **مسارات عامة لكل مستخدم** وطباعة السيرة. مبني على **Next.js** و**Firebase**، ومناسب للنشر على **Vercel**. راجع [سجل التغييرات](./CHANGELOG.md) لمعرفة الإصدارات والميزات بالتفصيل.

---

## Features

| Area | Details |
|------|---------|
| **Public site** | Landing, portfolio sections (hero, about, work, education, skills, projects, contact), optional custom Markdown sections, theme toggle, responsive layout. |
| **Blog** | Public blog routes and MDX-oriented content; admin APIs for creating and editing posts. |
| **Per-user URLs** | Public pages under `/[slug]` including blog and Open Graph metadata. |
| **Admin dashboard** | Login, site editor, CV print view, blog management, user list (owner role). |
| **Data** | Site configuration merged from defaults + Firestore-backed JSON; seed script available. |
| **Quality** | ESLint (Next.js config), Playwright e2e tests. |

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router), React 18  
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)  
- **UI:** [shadcn/ui](https://ui.shadcn.com/) (Radix primitives), [Lucide](https://lucide.dev/) icons  
- **Motion:** [Framer Motion](https://www.framer.com/motion/), [Motion](https://motion.dev/)  
- **Content:** [react-markdown](https://github.com/remarkjs/react-markdown), [MDX utilities](https://mdxjs.com/), [Shiki](https://shiki.style/) (syntax highlighting)  
- **Backend / auth:** [Firebase](https://firebase.google.com/) + [Firebase Admin](https://firebase.google.com/docs/admin/setup), [jose](https://github.com/panva/jose) (JWT), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)  
- **Testing:** [Playwright](https://playwright.dev/)  

---

## Prerequisites

- **Node.js** 18+ (20 LTS recommended)  
- **npm** (lockfile included) or **pnpm** / **yarn**  
- A **Firebase** project with Firestore (and service account for server APIs) if you use cloud data  
- **Vercel** account (optional) for one-click deploy  

---

## Environment variables

Create `.env.local` in the project root (never commit secrets). Typical variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_DASHBOARD_SECRET` | Yes (prod) | Secret for signing admin session cookies; **≥ 16 characters** recommended. |
| `FIREBASE_PROJECT_ID` | For Firebase | GCP / Firebase project ID (from service account JSON). |
| `FIREBASE_CLIENT_EMAIL` | For Firebase | Service account client email (`client_email` in JSON). |
| `FIREBASE_PRIVATE_KEY` | For Firebase | Service account private key (`private_key` in JSON). Use `\n` for line breaks when pasting into Vercel. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public site URL (no trailing slash), e.g. `https://your-app.vercel.app`. |
| `ADMIN_BOOTSTRAP_USERNAME` | Bootstrap | Username for the one-time `/api/admin/bootstrap` flow. |
| `ADMIN_BOOTSTRAP_PASSWORD` | Bootstrap | Password for bootstrap (use strong values). |
| `SIGNUP_INVITE_SECRET` | For public signup | Secret used to validate invite-based sign-up requests. |

Adjust values to match your Firebase console and security requirements.

---

## Getting started

1. **Clone the repository**

   ```bash
   git clone https://github.com/ahmed-hakim90/ahmed-portfolio.git
   cd ahmed-portfolio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Copy or create `.env.local` and set the variables from the table above.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Visit [http://localhost:3000](http://localhost:3000).

6. **Customize content**

   - Site shape and defaults: [`src/data/site-defaults.ts`](./src/data/site-defaults.ts) and related JSON.  
   - Re-exports and helpers: [`src/data/resume.tsx`](./src/data/resume.tsx).  

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js in development mode. |
| `npm run build` | Production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run test:e2e` | Run Playwright end-to-end tests. |
| `npm run seed:firestore` | Run the Firestore seed script (`scripts/seed-firestore.mjs`). |

---

## Deployment

1. Push the repository to GitHub.  
2. Import the project in [Vercel](https://vercel.com/) and set the same environment variables as in `.env.local`.  
3. Use the **Deploy with Vercel** button at the top of this README for a quick fork-and-deploy flow.  

---

## Changelog

See [**CHANGELOG.md**](./CHANGELOG.md) for version history and release notes.

---

## License

This project is licensed under the [MIT License](./LICENSE) (see file for copyright notice).

---

## Acknowledgments

UI patterns and tooling inspired by the wider Next.js and shadcn/ui communities; prior template lineage may be reflected in the license file.
