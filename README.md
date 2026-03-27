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

Create `.env.local` in the project root (never commit secrets).  
For production on **Vercel**, set the same keys in:
**Project → Settings → Environment Variables**.

> Use [`.env.example`](./.env.example) as the source of truth.

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `ADMIN_DASHBOARD_SECRET` | Yes (prod) | Server | Secret for signing admin session cookies; **>= 16 chars**. |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Yes (if using Firebase APIs on Vercel) | Server | Full Firebase service account JSON (single-line string with escaped `\n`). |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Client | Firebase Web App config. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Client | Firebase Web App config. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Client | Firebase Web App config. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Client | Firebase Web App config. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Recommended | Client | Firebase Web App config (optional in some setups). |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Recommended | Client | Firebase Web App config (optional in some setups). |
| `FIREBASE_STORAGE_BUCKET` | Recommended | Server | Bucket used by server-side upload APIs. |
| `SIGNUP_INVITE_SECRET` | Optional | Server | Secret used to validate invite-based signup requests. |
| `ADMIN_BOOTSTRAP_SECRET` | Recommended | Server | Preferred bootstrap auth for first owner setup. |
| `ADMIN_BOOTSTRAP_USERNAME` | Optional | Server | Legacy bootstrap auth (if secret is not used). |
| `ADMIN_BOOTSTRAP_PASSWORD` | Optional | Server | Legacy bootstrap auth (if secret is not used). |
| `KAPSO_API_KEY` | Yes for WhatsApp flow | Server | Kapso API key for outbound WhatsApp messages. |
| `KAPSO_PHONE_NUMBER_ID` | Yes for WhatsApp flow | Server | WhatsApp phone number ID used in sends. |
| `KAPSO_WEBHOOK_VERIFY_TOKEN` | Yes for WhatsApp flow | Server | Verification token for `GET /api/kapso/webhook`. |
| `ADMIN_WHATSAPP_NUMBER` | Yes for WhatsApp flow | Server | Admin WhatsApp in international digits format (e.g. `2015XXXXXXXX`). |
| `KAPSO_BASE_URL` | Optional | Server | Defaults to `https://api.kapso.ai/meta/whatsapp`. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Client+Server | Public base URL (metadata/share URLs). |
| `CONTACT_SITE_OWNER_SLUG` | Optional | Server | Needed only for default `/portfolio` contact routing. |

Adjust values to match Firebase/Kapso dashboards and your security policy.

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

### Vercel + Kapso (WhatsApp Pro flow) quick checklist

1. Add all Kapso variables in Vercel:
   - `KAPSO_API_KEY`
   - `KAPSO_PHONE_NUMBER_ID`
   - `KAPSO_WEBHOOK_VERIFY_TOKEN`
   - `ADMIN_WHATSAPP_NUMBER`
   - `KAPSO_BASE_URL` (optional)
2. In Kapso/Meta webhook settings, set callback URL to:
   - `https://<your-domain>/api/kapso/webhook`
3. Use exactly the same verify token value in both places:
   - Kapso webhook config == `KAPSO_WEBHOOK_VERIFY_TOKEN`
4. Subscribe webhook events that include inbound messages (image receipts).
5. Ensure Firestore has an `orders` collection write/read permissions for server runtime.
6. Test end-to-end once on production domain:
   - Subscribe -> pending order created
   - Welcome message delivered
   - Screenshot received -> status becomes `screenshot_received`
   - Admin confirm/reject action sends customer notification

For a go-live checklist and "what is still missing", see:
- [`docs/vercel-kapso-setup.md`](./docs/vercel-kapso-setup.md)

---

## Changelog

See [**CHANGELOG.md**](./CHANGELOG.md) for version history and release notes.

---

## License

This project is licensed under the [MIT License](./LICENSE) (see file for copyright notice).

---

## Acknowledgments

UI patterns and tooling inspired by the wider Next.js and shadcn/ui communities; prior template lineage may be reflected in the license file.
