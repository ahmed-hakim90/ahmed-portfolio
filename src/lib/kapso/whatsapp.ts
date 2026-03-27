import { WhatsAppClient } from "@kapso/whatsapp-cloud-api";

const KAPSO_BASE_URL =
  process.env.KAPSO_BASE_URL ?? "https://api.kapso.ai/meta/whatsapp";
const KAPSO_PHONE_NUMBER_ID = process.env.KAPSO_PHONE_NUMBER_ID;
const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_NUMBER;

function getKapsoClient(): WhatsAppClient {
  const kapsoApiKey = process.env.KAPSO_API_KEY;
  if (!kapsoApiKey) {
    throw new Error("KAPSO_API_KEY is missing");
  }
  return new WhatsAppClient({
    baseUrl: KAPSO_BASE_URL,
    kapsoApiKey,
  });
}

function requiredPhoneNumberId(): string {
  if (!KAPSO_PHONE_NUMBER_ID) {
    throw new Error("KAPSO_PHONE_NUMBER_ID is missing");
  }
  return KAPSO_PHONE_NUMBER_ID;
}

function requiredAdminPhone(): string {
  if (!ADMIN_PHONE) {
    throw new Error("ADMIN_WHATSAPP_NUMBER is missing");
  }
  return ADMIN_PHONE;
}

async function sendText(to: string, body: string) {
  const client = getKapsoClient();
  return client.messages.sendText({
    phoneNumberId: requiredPhoneNumberId(),
    to,
    body,
  });
}

// رسالة ترحيب للمشترك
export async function sendWelcomeMessage(phone: string, name: string) {
  return sendText(
    phone,
    `أهلاً ${name}

شكراً لاشتراكك في HAKIMO CV Pro.

لتفعيل اشتراكك:
1) حوّل المبلغ على Instapay
2) ابعت صورة الإيصال هنا مباشرة

هنراجع الإيصال ونفعّل حسابك في أقرب وقت.`,
  );
}

// إشعار الأدمن بأوردر جديد
export async function notifyAdminNewOrder(order: {
  customerName: string;
  phone: string;
  planName: string;
  price: number;
  orderId: string;
}) {
  return sendText(
    requiredAdminPhone(),
    `أوردر جديد!

الاسم: ${order.customerName}
الموبايل: ${order.phone}
الباقة: ${order.planName}
المبلغ: ${order.price} جنيه
ID: ${order.orderId}

افتح الداشبورد لتأكيد الأوردر:
https://hakimo-cv.vercel.app/admin/orders`,
  );
}

// إشعار الأدمن بوصول screenshot
export async function notifyAdminScreenshot(phone: string, orderId: string) {
  return sendText(
    requiredAdminPhone(),
    `وصل screenshot من ${phone}
Order: ${orderId}

راجع الداشبورد لتأكيد الدفع:
https://hakimo-cv.vercel.app/admin/orders`,
  );
}

// رسالة تأكيد الاشتراك للمشترك
export async function sendConfirmationMessage(phone: string, name: string) {
  return sendText(
    phone,
    `تم تفعيل اشتراكك!

أهلاً ${name}، HAKIMO CV Pro شغّال دلوقتي.

سجّل دخولك وابدأ تبني بورتفوليو احترافي:
https://hakimo-cv.vercel.app

أي مساعدة — إحنا هنا.`,
  );
}

// رسالة رفض الاشتراك
export async function sendRejectionMessage(phone: string, name: string) {
  return sendText(
    phone,
    `عزيزي ${name}

للأسف مقدرناش نتحقق من الإيصال.
ممكن تبعت صورة أوضح؟ أو تواصل معنا مباشرة.`,
  );
}
