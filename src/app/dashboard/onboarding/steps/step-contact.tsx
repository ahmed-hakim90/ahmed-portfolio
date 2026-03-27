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
import {
  buildWaMeUrl,
  parseWaMeDigitsFromUrl,
} from "@/lib/whatsapp-wa-me";
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
};

function mailtoFromEmail(email: string) {
  const t = email.trim();
  if (!t) return "";
  return `mailto:${t}`;
}

export function StepContact({
  siteData,
  onSave,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
}: Props) {
  const busy = saving || controlsLocked;
  const social = siteData.contact.social;
  const [email, setEmail] = useState(siteData.contact.email);
  const [tel, setTel] = useState(siteData.contact.tel);
  const [github, setGithub] = useState(social.GitHub?.url ?? "");
  const [linkedin, setLinkedin] = useState(social.LinkedIn?.url ?? "");
  const [x, setX] = useState(social.X?.url ?? "");
  const [youtube, setYoutube] = useState(social.Youtube?.url ?? "");
  const [whatsapp, setWhatsapp] = useState(() =>
    parseWaMeDigitsFromUrl(social.WhatsApp?.url ?? ""),
  );

  useEffect(() => {
    setEmail(siteData.contact.email);
    setTel(siteData.contact.tel);
    const s = siteData.contact.social;
    setGithub(s.GitHub?.url ?? "");
    setLinkedin(s.LinkedIn?.url ?? "");
    setX(s.X?.url ?? "");
    setYoutube(s.Youtube?.url ?? "");
    setWhatsapp(parseWaMeDigitsFromUrl(s.WhatsApp?.url ?? ""));
  }, [siteData]);

  const patch = useMemo((): Partial<SiteJson> => {
    const mail = mailtoFromEmail(email);
    const socialWithoutWhatsApp = { ...siteData.contact.social };
    delete socialWithoutWhatsApp.WhatsApp;
    const waUrl = buildWaMeUrl(whatsapp);
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
  }, [
    email,
    tel,
    github,
    linkedin,
    x,
    youtube,
    whatsapp,
    siteData.contact,
  ]);

  useEffect(() => {
    registerActions({
      kind: "form",
      save: () => void onSave(patch),
      skip: onSkip,
    });
    return () => registerActions(null);
  }, [registerActions, onSave, onSkip, patch]);

  return (
    <Card className="w-full border-border/80 shadow-lg">
      <CardHeader className="space-y-1 px-5 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl">التواصل والشبكات</CardTitle>
        <CardDescription>
          البريد والهاتف وروابط GitHub و LinkedIn و X وغيرها.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">البريد الإلكتروني</label>
          <input
            type="email"
            className={authFieldClass}
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الهاتف / واتساب</label>
          <input
            className={authFieldClass}
            dir="ltr"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="+20..."
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">GitHub</label>
          <input
            className={authFieldClass}
            dir="ltr"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="https://github.com/..."
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">LinkedIn</label>
          <input
            className={authFieldClass}
            dir="ltr"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">X (Twitter)</label>
          <input
            className={authFieldClass}
            dir="ltr"
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder="https://x.com/..."
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">YouTube</label>
          <input
            className={authFieldClass}
            dir="ltr"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="https://youtube.com/..."
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">رقم واتساب</label>
          <input
            className={authFieldClass}
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="2010…"
            disabled={busy}
          />
          <p className="text-xs text-muted-foreground">
            يُحفظ تلقائياً كرابط wa.me
          </p>
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
