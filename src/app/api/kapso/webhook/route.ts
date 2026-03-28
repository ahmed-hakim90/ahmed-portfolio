import { NextRequest, NextResponse } from "next/server";
import { getOrderByPhone, updateOrderStatus } from "@/lib/firebase/orders";
import { notifyAdminScreenshot } from "@/lib/kapso/whatsapp";

export const runtime = "nodejs";

// GET — Webhook verification (Kapso/Meta handshake)
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.KAPSO_WEBHOOK_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// POST — Receive events from Kapso
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return NextResponse.json({ status: "no_message" });

    const senderPhone: string = message.from ?? "";
    const messageType: string = message.type ?? "";

    // Subscriber sent screenshot image
    if (messageType === "image" && senderPhone) {
      const mediaId: string = message.image?.id ?? "";

      // Find pending order by sender phone
      const order = await getOrderByPhone(senderPhone);
      if (order) {
        await updateOrderStatus(order.id, "screenshot_received", {
          method: "instapay",
          screenshotMediaId: mediaId,
        });
        await notifyAdminScreenshot(senderPhone, order.id);
      } else {
        // No pending order for this sender, admin follows up manually
        await notifyAdminScreenshot(senderPhone, "UNKNOWN - manual check needed");
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[Kapso Webhook]", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
