"use server";

import { updateOrderStatus } from "@/lib/firebase/orders";
import {
  sendConfirmationMessage,
  sendRejectionMessage,
} from "@/lib/kapso/whatsapp";

export async function confirmOrder(
  orderId: string,
  customerPhone: string,
  customerName: string,
  adminUid: string,
) {
  await updateOrderStatus(orderId, "confirmed", {
    method: "instapay",
    confirmedAt: new Date(),
    confirmedBy: adminUid,
  });
  await sendConfirmationMessage(customerPhone, customerName);
  return { success: true };
}

export async function rejectOrder(
  orderId: string,
  customerPhone: string,
  customerName: string,
) {
  await updateOrderStatus(orderId, "rejected");
  await sendRejectionMessage(customerPhone, customerName);
  return { success: true };
}
