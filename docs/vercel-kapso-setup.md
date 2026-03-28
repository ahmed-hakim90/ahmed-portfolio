# Vercel + Kapso Setup Checklist (HAKIMO CV Pro)

This checklist is for enabling the Pro subscription WhatsApp flow end-to-end:

`Subscribe -> Welcome WA message -> Customer sends screenshot -> Admin confirms/rejects -> Customer notified`

## 1) Vercel environment variables

Set these in **Vercel -> Project -> Settings -> Environment Variables** for **Production** (and Preview if needed).

### Core app variables (existing platform)

- `ADMIN_DASHBOARD_SECRET` (required)
- `FIREBASE_SERVICE_ACCOUNT_JSON` (required for server Firestore/Admin)
- `NEXT_PUBLIC_SITE_URL` (recommended)
- `NEXT_PUBLIC_FIREBASE_API_KEY` (required)
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` (required)
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` (required)
- `NEXT_PUBLIC_FIREBASE_APP_ID` (required)
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` (recommended)
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (recommended)
- `FIREBASE_STORAGE_BUCKET` (recommended for uploads)
- `SIGNUP_INVITE_SECRET` (optional, based on your signup policy)
- `ADMIN_BOOTSTRAP_SECRET` or (`ADMIN_BOOTSTRAP_USERNAME` + `ADMIN_BOOTSTRAP_PASSWORD`) for bootstrap

### Kapso WhatsApp variables (new)

- `KAPSO_API_KEY` (required)
- `KAPSO_PHONE_NUMBER_ID` (required)
- `KAPSO_WEBHOOK_VERIFY_TOKEN` (required, must match webhook setup in Kapso/Meta)
- `ADMIN_WHATSAPP_NUMBER` (required, international digits format: `201XXXXXXXXX`)
- `KAPSO_BASE_URL` (optional; default in code: `https://api.kapso.ai/meta/whatsapp`)

> Never commit real values to git. Keep them only in Vercel and local `.env.local`.

---

## 2) Kapso webhook endpoint

Configure webhook URL in Kapso/Meta to:

- `https://<your-domain>/api/kapso/webhook`

Verification token must equal:

- `KAPSO_WEBHOOK_VERIFY_TOKEN`

---

## 3) Firestore readiness

Ensure Firestore is enabled and service account has access.

Collection used by this flow:

- `orders`

Expected order states:

- `pending`
- `screenshot_received`
- `confirmed`
- `rejected`

---

## 4) Admin operations still needed in UI

Already implemented server-side:

- `confirmOrder(orderId, customerPhone, customerName, adminUid)`
- `rejectOrder(orderId, customerPhone, customerName)`
- `getAllOrders()`

Still needed (if not yet added in UI):

- Admin orders page/table (`/admin/orders` or dashboard route)
- Buttons to trigger confirm/reject actions
- Optional filtering by status and latest-first sorting

---

## 5) Go-live smoke test

1. Trigger `subscribeAction` from app UI/form.
2. Confirm order doc created in Firestore (`status = pending`).
3. Verify welcome message reaches subscriber.
4. Verify admin receives "new order" message.
5. Send image from subscriber WhatsApp.
6. Confirm webhook updates order to `screenshot_received`.
7. Confirm admin screenshot notification is received.
8. Confirm/reject from admin action.
9. Verify customer gets final confirmation/rejection message.

---

## 6) Common misconfigurations

- Missing `KAPSO_PHONE_NUMBER_ID` -> outbound send will fail.
- Mismatch in webhook verify token -> GET verification returns 403.
- Non-international admin/customer phone formats -> WhatsApp delivery issues.
- Missing Firebase Admin JSON on Vercel -> Firestore actions fail at runtime.
