"use client";

import { authFieldClass } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SiteJson } from "@/data/site-defaults";
import { cn } from "@/lib/utils";
import { buildWaMeUrl, parseWaMeDigitsFromUrl } from "@/lib/whatsapp-wa-me";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

type Props = {
  siteData: SiteJson;
  onSave: (patch: Partial<SiteJson>) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
  highlightContactInvalid?: boolean;
  onClearCompletionHints?: () => void;
};

function mailtoFromEmail(email: string) {
  const t = email.trim();
  if (!t) return "";
  return `mailto:${t}`;
}

function initialTelFromContact(contact: SiteJson["contact"]): string {
  const saved = contact.tel.trim();
  if (saved) return saved;
  return parseWaMeDigitsFromUrl(contact.social?.WhatsApp?.url ?? "");
}

export function StepContact({
  siteData,
  onSave,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
  highlightContactInvalid = false,
  onClearCompletionHints,
}: Props) {
  const busy = saving || controlsLocked;
  const social = siteData.contact.social;
  const [email, setEmail] = useState(siteData.contact.email);
  const [tel, setTel] = useState(() => initialTelFromContact(siteData.contact));
  const [github, setGithub] = useState(social.GitHub?.url ?? "");
  const [linkedin, setLinkedin] = useState(social.LinkedIn?.url ?? "");
  const [x, setX] = useState(social.X?.url ?? "");
  const [youtube, setYoutube] = useState(social.Youtube?.url ?? "");

  useEffect(() => {
    setEmail(siteData.contact.email);
    setTel(initialTelFromContact(siteData.contact));
    const s = siteData.contact.social;
    setGithub(s.GitHub?.url ?? "");
    setLinkedin(s.LinkedIn?.url ?? "");
    setX(s.X?.url ?? "");
    setYoutube(s.Youtube?.url ?? "");
  }, [siteData]);

  const patch = useMemo((): Partial<SiteJson> => {
    const mail = mailtoFromEmail(email);
    const waUrl = buildWaMeUrl(tel);
    const socialWithoutWhatsApp = { ...siteData.contact.social };
    delete socialWithoutWhatsApp.WhatsApp;
    return {
      contact: {
        ...siteData.contact,
        email: email.trim(),
        tel: tel.trim(),
        social: {
          ...socialWithoutWhatsApp,
          ...(github.trim()
            ? {
                GitHub: {
                  name: "GitHub",
                  url: github.trim(),
                  icon: "github" as const,
                  navbar: true,
                  enabled: true,
                },
              }
            : {}),
          ...(linkedin.trim()
            ? {
                LinkedIn: {
                  name: "LinkedIn",
                  url: linkedin.trim(),
                  icon: "linkedin" as const,
                  navbar: true,
                  enabled: true,
                },
              }
            : {}),
          ...(x.trim()
            ? {
                X: {
                  name: "X",
                  url: x.trim(),
                  icon: "x" as const,
                  navbar: true,
                  enabled: true,
                },
              }
            : {}),
          ...(youtube.trim()
            ? {
                Youtube: {
                  name: "Youtube",
                  url: youtube.trim(),
                  icon: "youtube" as const,
                  navbar: false,
                  enabled: true,
                },
              }
            : {}),
          ...(waUrl
            ? {
                WhatsApp: {
                  name: "WhatsApp",
                  url: waUrl,
                  icon: "whatsapp" as const,
                  navbar: false,
                  enabled: true,
                },
              }
            : {}),
          ...(mail
            ? {
                email: {
                  name: "Send Email",
                  url: mail,
                  icon: "email" as const,
                  navbar: true,
                  enabled: true,
                },
              }
            : {}),
        },
      },
    };
  }, [email, tel, github, linkedin, x, youtube, siteData.contact]);

  useEffect(() => {
    registerActions({
      kind: "form",
      save: () => void onSave(patch),
      skip: onSkip,
    });
    return () => registerActions(null);
  }, [registerActions, onSave, onSkip, patch]);

  const contactFieldClass = cn(
    authFieldClass,
    highlightContactInvalid && "border-destructive ring-1 ring-destructive",
  );

  return (
    <Card className="w-full border-border/80 shadow-lg">
      <CardHeader className="space-y-1 px-5 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl">التواصل والشبكات</CardTitle>
        <CardDescription>
          للنشر العام يلزم طريقة تواصل واحدة على الأقل: بريد أو هاتف أو رابط شبكة
          (إن لم تكن مضافة من التسجيل).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">البريد الإلكتروني</label>
          <input
            type="email"
            className={contactFieldClass}
            dir="ltr"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onClearCompletionHints?.();
            }}
            placeholder="name@example.com"
            disabled={busy}
            aria-invalid={highlightContactInvalid ? true : undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">رقم الهاتف / واتساب</label>
          <input
            className={contactFieldClass}
            dir="ltr"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={tel}
            onChange={(e) => {
              setTel(e.target.value);
              onClearCompletionHints?.();
            }}
            placeholder="+201234567890"
            disabled={busy}
            aria-invalid={highlightContactInvalid ? true : undefined}
          />
          <p className="text-xs text-muted-foreground">
            يُستخدم أيضاً لزر واتساب في صفحتك.
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">GitHub</label>
          <input
            className={contactFieldClass}
            dir="ltr"
            value={github}
            onChange={(e) => {
              setGithub(e.target.value);
              onClearCompletionHints?.();
            }}
            placeholder="https://github.com/..."
            disabled={busy}
            aria-invalid={highlightContactInvalid ? true : undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">LinkedIn</label>
          <input
            className={contactFieldClass}
            dir="ltr"
            value={linkedin}
            onChange={(e) => {
              setLinkedin(e.target.value);
              onClearCompletionHints?.();
            }}
            placeholder="https://linkedin.com/in/..."
            disabled={busy}
            aria-invalid={highlightContactInvalid ? true : undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">X (Twitter)</label>
          <input
            className={contactFieldClass}
            dir="ltr"
            value={x}
            onChange={(e) => {
              setX(e.target.value);
              onClearCompletionHints?.();
            }}
            placeholder="https://x.com/..."
            disabled={busy}
            aria-invalid={highlightContactInvalid ? true : undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">YouTube</label>
          <input
            className={contactFieldClass}
            dir="ltr"
            value={youtube}
            onChange={(e) => {
              setYoutube(e.target.value);
              onClearCompletionHints?.();
            }}
            placeholder="https://youtube.com/..."
            disabled={busy}
            aria-invalid={highlightContactInvalid ? true : undefined}
          />
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={onSkip} disabled={busy}>
            تخطّي
          </Button>
          <Button
            type="button"
            onClick={() => void onSave(patch)}
            disabled={busy}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                جاري الحفظ…
              </>
            ) : (
              "حفظ ومتابعة"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
