# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **إنشاء عميل (المالك)** — في [`/dashboard/users`](./src/app/dashboard/(admin)/users/page.tsx): حقول الاسم الظاهر، الهاتف، ومسار الموقع (`slug`) مع تحقق فوري من التوفر عبر [`GET /api/admin/users/slug-availability`](./src/app/api/admin/users/slug-availability/route.ts)، ثم بذرة [`sites/{uid}`](./src/lib/site-data.tsx) بالاسم والهاتف و`mailto` للتواصل.
- **تسجيل عام متوافق** — [`POST /api/public/signup`](./src/app/api/public/signup/route.ts) يستخدم [`registerClientProfileAfterAuth`](./src/lib/admin-users.ts) بنفس منطق العميل (بدون تكرار قالب افتراضي خاطئ عند الفشل الجزئي).
- **تحقق عام من الـ slug** — [`GET /api/public/slug-availability`](./src/app/api/public/slug-availability/route.ts) لصفحة [`/signup`](./src/app/(public)/(site)/signup/page.tsx).
- **دوال مساعدة** — [`validateNewClientProfileInput`](./src/lib/admin-users.ts)، [`registerClientProfileAfterAuth`](./src/lib/admin-users.ts)، وتراجع Firestore-only عند فشل بذرة الموقع.
- **قائمة المستخدمين** — عمود الاسم الظاهر من `sites`؛ أزرار إرسال بريد وواتساب عند توفر رقم.
- **AuthShell** — خاصية [`contentMaxWidthClass`](./src/components/auth/auth-shell.tsx) لعرض أوسع (مثل نموذج التسجيل).
- **سجل دفعات تلقائي** — [`CHANGELOG_PUSHES.md`](./CHANGELOG_PUSHES.md) يُحدَّث بكل push عبر [`.github/workflows/changelog-log.yml`](./.github/workflows/changelog-log.yml) وسكربت [`scripts/append-push-changelog.mjs`](./scripts/append-push-changelog.mjs).

### Changed

- **طباعة السيرة (CV)** — [`/dashboard/cv-print`](./src/app/dashboard/(admin)/cv-print/page.tsx) يقرأ [`getMergedSiteDataForUser(session.sub)`](./src/lib/site-data.tsx) بدل الإعداد العام `config/site`.
- **جلب الموقع في لوحة التحكم** — `fetch` مع `cache: "no-store"`؛ [`GET /api/admin/site`](./src/app/api/admin/site/route.ts) و[`GET /api/admin/profile`](./src/app/api/admin/profile/route.ts) مع `dynamic = "force-dynamic"`.
- **`getUserSiteJsonFromFirestore`** — إيقاف كتابة [`DEFAULT_SITE_JSON`](./src/data/site-defaults.ts) تلقائياً في Firestore عند غياب المستند (يُدمج القالب في الذاكرة فقط عبر [`getEffectiveSiteJsonForUser`](./src/lib/site-data.tsx)).

### Fixed

- **عرض بيانات العميل** — تجنب سباق كان يعرض قالب المنصة بدل بيانات العميل عند أول تحميل للمحرر بعد التسجيل/الإنشاء.

### UX

- **صفحة التسجيل** (`/signup`) — أقسام مرقّمة، Google أولاً ثم البريد، معاينة رابط عام، وأيقونات حالة للـ slug ([`signup-form.tsx`](./src/app/(public)/(site)/signup/signup-form.tsx)).

---

### Planned

- (اختياري) ربط سجل الدفعات بإصدار semver عند وضع علامة `git tag`.

---

## [0.1.0] - 2026-03-25

### Added

- **Public portfolio** — Landing page, customizable portfolio view, and responsive layout with dark/light theme support ([next-themes](https://github.com/pacocoursey/next-themes)).
- **Site content model** — `SiteJson`-driven content (hero, about, work, education, skills, projects, contact, optional custom sections) with defaults in [`src/data/site-defaults.ts`](./src/data/site-defaults.ts) and hydration via [`src/lib/site-data.tsx`](./src/lib/site-data.tsx).
- **Multi-tenant public URLs** — User-scoped routes under `/[slug]` with blog posts and Open Graph image support.
- **Blog** — MDX-oriented content pipeline with public blog listing and post pages; admin CRUD via API routes under `/api/admin/posts`.
- **Admin dashboard** — Cookie-based session (JWT via [`jose`](https://github.com/panva/jose)), protected by [`src/middleware.ts`](./src/middleware.ts) for `/dashboard/*` (except login).
- **Site editor** — Dashboard UI to edit live site data, visibility toggles (sections, blog, dock, theme), work/projects editors, and preview.
- **CV print** — Dedicated print view and toolbar for exporting/printing the CV (`src/app/dashboard/(admin)/cv-print/page.tsx`).
- **User management** — Owner-only `/dashboard/users` with role checks in middleware.
- **Public signup** — Invite-based signup flow with [`SIGNUP_INVITE_SECRET`](./README.md#environment-variables) validation.
- **Firebase** — [Firebase Admin](https://firebase.google.com/docs/admin/setup) integration for server-side data ([`src/lib/firebase-admin.ts`](./src/lib/firebase-admin.ts)); optional Firestore seed script [`scripts/seed-firestore.mjs`](./scripts/seed-firestore.mjs).
- **Bootstrap admin** — First-time admin creation via [`/api/admin/bootstrap`](./src/app/api/admin/bootstrap/route.ts) using `ADMIN_BOOTSTRAP_*` environment variables.
- **E2E tests** — [Playwright](https://playwright.dev/) configuration with Chromium and dev-server orchestration ([`playwright.config.ts`](./playwright.config.ts)).

### Changed

- N/A (initial tracked release).

### Fixed

- N/A (initial tracked release).

### Security

- Admin sessions require `ADMIN_DASHBOARD_SECRET` (minimum 16 characters in production login path).
- Dashboard routes redirect unauthenticated users to `/dashboard/login` with `next` query preservation.

[Unreleased]: https://github.com/ahmed-hakim90/ahmed-portfolio/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ahmed-hakim90/ahmed-portfolio/releases/tag/v0.1.0
