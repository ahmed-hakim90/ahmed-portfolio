"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  ownerWhatsAppDigits: string;
  /** Public profile slug — required to save the message under that user’s site in Firestore. */
  ownerSlug?: string | null;
};

function digitsOnly(tel: string): string {
  return tel.replace(/[^\d]/g, "");
}

export function PortfolioContactForm({
  ownerWhatsAppDigits,
  ownerSlug,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{
    name: string;
    email: string;
    message: string;
  } | null>(null);

  const waDigits = digitsOnly(ownerWhatsAppDigits);
  const canWhatsApp = waDigits.length >= 8;

  function openOwnerWhatsApp() {
    if (!canWhatsApp) {
      toast.error("رقم واتساب غير مضبوط في بيانات الموقع");
      return;
    }
    const parts: string[] = [];
    if (name.trim()) parts.push(`الاسم: ${name.trim()}`);
    if (email.trim()) parts.push(`البريد: ${email.trim()}`);
    if (message.trim()) parts.push(`الرسالة:\n${message.trim()}`);
    const text =
      parts.length > 0
        ? parts.join("\n\n")
        : "مرحباً، أود التواصل معك بخصوص موقعك.";
    window.open(
      `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = ownerSlug?.trim();
    if (!slug) {
      toast.error("إرسال النموذج غير مفعّل لهذه الصفحة");
      return;
    }
    if (message.length > 500) {
      toast.error("الرسالة ٥٠٠ حرفاً كحد أقصى");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerSlug: slug, name, email, message }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "تعذر الإرسال");
        return;
      }
      setSent({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      toast.error("تعذر الإرسال");
    } finally {
      setSending(false);
    }
  }

  function sendAnother() {
    setSent(null);
  }

  if (sent) {
    return (
      <div
        className="mx-auto flex w-full max-w-[480px] flex-col gap-5 rounded-lg border border-border bg-muted/30 p-6 text-start shadow-sm"
        dir="rtl"
      >
        <div className="space-y-1 text-center">
          <p className="text-lg font-semibold tracking-tight">
            تم استلام رسالتك
          </p>
          <p className="text-sm text-muted-foreground">
            شكراً لتواصلك. هذا ملخص ما أرسلته.
          </p>
        </div>
        <dl className="space-y-4 text-sm">
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground">الاسم</dt>
            <dd className="rounded-md border border-border/80 bg-background px-3 py-2">
              {sent.name}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground">البريد</dt>
            <dd className="rounded-md border border-border/80 bg-background px-3 py-2 break-all">
              {sent.email}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-medium text-muted-foreground">الرسالة</dt>
            <dd className="max-h-[200px] overflow-y-auto whitespace-pre-wrap rounded-md border border-border/80 bg-background px-3 py-2 text-start">
              {sent.message}
            </dd>
          </div>
        </dl>
        <Button type="button" variant="outline" className="w-full" onClick={sendAnother}>
          إرسال رسالة أخرى
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-[480px] flex-col gap-3 text-start"
      dir="rtl"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">الاسم</span>
        <input
          required
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          autoComplete="name"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">البريد</span>
        <input
          required
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted-foreground">الرسالة (حد أقصى ٥٠٠ حرف)</span>
        <textarea
          required
          name="message"
          value={message}
          maxLength={500}
          rows={5}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <span className="text-xs text-muted-foreground">
          {message.length}/500
        </span>
      </label>
      <Button
        type="submit"
        disabled={sending || !ownerSlug?.trim()}
        className="w-full"
      >
        {sending ? "جاري الإرسال…" : "إرسال"}
      </Button>
      {!ownerSlug?.trim() ? (
        <p className="text-center text-xs text-muted-foreground">
          الإرسال عبر النموذج غير مضبوط لهذا العرض؛ استخدم واتساب أو افتح الموقع
          العام للملف الشخصي.
        </p>
      ) : null}
      {canWhatsApp ? (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          onClick={openOwnerWhatsApp}
        >
          <Icons.whatsapp className="size-4 shrink-0 text-[#25D366]" aria-hidden />
          WhatsApp
        </Button>
      ) : null}
    </form>
  );
}
