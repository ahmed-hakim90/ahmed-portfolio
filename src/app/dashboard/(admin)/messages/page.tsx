import { ContactMessagesClient } from "@/components/dashboard/contact-messages-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "رسائل التواصل",
};

export default function ContactMessagesPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          رسائل التواصل
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          الرسائل المرسلة من نموذج «Get in Touch» في موقعك العام (المسار{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            /اسمك
          </code>
          ). يمكنك تعليمها كمقروءة بعد الاطلاع.
        </p>
      </div>
      <ContactMessagesClient />
    </div>
  );
}
