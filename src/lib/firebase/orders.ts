import { getFirestoreDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { Order } from "@/lib/types/order";

type StoredOrder = Omit<Order, "id" | "createdAt" | "updatedAt"> & {
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  payment?: (Order["payment"] & {
    confirmedAt?: Timestamp | Date;
  }) | null;
};

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return new Date(0);
}

function mapOrder(
  id: string,
  data: FirebaseFirestore.DocumentData,
): Order & { id: string } {
  const row = data as StoredOrder;
  return {
    id,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt),
    status: row.status ?? "pending",
    customer: {
      name: row.customer?.name ?? "",
      phone: row.customer?.phone ?? "",
      email: row.customer?.email,
      whatsappId: row.customer?.whatsappId ?? row.customer?.phone ?? "",
    },
    plan: {
      id: row.plan?.id ?? "",
      name: row.plan?.name ?? "",
      price: typeof row.plan?.price === "number" ? row.plan.price : 0,
      currency: "EGP",
    },
    payment: {
      method: "instapay",
      screenshotUrl: row.payment?.screenshotUrl,
      screenshotMediaId: row.payment?.screenshotMediaId,
      confirmedAt: row.payment?.confirmedAt
        ? toDate(row.payment.confirmedAt)
        : undefined,
      confirmedBy: row.payment?.confirmedBy,
    },
    kapsoMessageId: row.kapsoMessageId,
    adminNotified: row.adminNotified === true,
    customerNotified: row.customerNotified === true,
  };
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt" | "updatedAt">,
): Promise<string> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const ref = await db.collection("orders").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  extra?: Partial<Order["payment"]>,
): Promise<void> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const payload: Record<string, unknown> = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined) continue;
      payload[`payment.${key}`] = value;
    }
  }

  await db.collection("orders").doc(orderId).update(payload);
}

export async function getOrderByPhone(
  phone: string,
): Promise<(Order & { id: string }) | null> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const snap = await db
    .collection("orders")
    .where("customer.phone", "==", phone)
    .where("status", "==", "pending")
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();

  if (snap.empty) return null;
  const row = snap.docs[0]!;
  return mapOrder(row.id, row.data());
}

export async function getAllOrders(): Promise<(Order & { id: string })[]> {
  const db = getFirestoreDb();
  if (!db) {
    throw new Error("Firestore is not configured");
  }

  const snap = await db.collection("orders").orderBy("createdAt", "desc").get();
  return snap.docs.map((doc) => mapOrder(doc.id, doc.data()));
}
