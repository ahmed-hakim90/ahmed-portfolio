"use server";

import { createOrder } from "@/lib/firebase/orders";
import { notifyAdminNewOrder, sendWelcomeMessage } from "@/lib/kapso/whatsapp";

interface SubscribeInput {
  name: string;
  phone: string; // user enters 01XXXXXXXXX, we normalize
  email?: string;
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return `2${cleaned}`; // 01X -> 201X
  if (cleaned.startsWith("20")) return cleaned;
  return cleaned;
}

export async function subscribeAction(input: SubscribeInput) {
  try {
    const phone = normalizePhone(input.phone);

    // 1) Create pending order
    const orderId = await createOrder({
      status: "pending",
      customer: {
        name: input.name,
        phone,
        email: input.email,
        whatsappId: phone,
      },
      plan: {
        id: "pro_monthly",
        name: "Pro - شهري",
        price: 99,
        currency: "EGP",
      },
      payment: {
        method: "instapay",
      },
      adminNotified: false,
      customerNotified: false,
    });

    // 2) Welcome message to subscriber
    await sendWelcomeMessage(phone, input.name);

    // 3) Notify admin
    await notifyAdminNewOrder({
      customerName: input.name,
      phone,
      planName: "Pro - شهري",
      price: 99,
      orderId,
    });

    return { success: true, orderId };
  } catch (err) {
    console.error("[subscribeAction]", err);
    return { success: false, error: "فيه مشكلة، حاول تاني." };
  }
}
