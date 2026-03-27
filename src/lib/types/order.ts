export type OrderStatus =
  | "pending"
  | "screenshot_received"
  | "confirmed"
  | "rejected";

export interface Order {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: OrderStatus;
  customer: {
    name: string;
    phone: string; // International format: 201XXXXXXXXX
    email?: string;
    whatsappId: string;
  };
  plan: {
    id: string; // e.g. "pro_monthly"
    name: string; // e.g. "Pro - شهري"
    price: number; // EGP
    currency: "EGP";
  };
  payment: {
    method: "instapay";
    screenshotUrl?: string;
    screenshotMediaId?: string; // Kapso media ID
    confirmedAt?: Date;
    confirmedBy?: string; // Admin uid
  };
  kapsoMessageId?: string;
  adminNotified: boolean;
  customerNotified: boolean;
}
