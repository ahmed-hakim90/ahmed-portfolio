"use client";

import { authFieldClass } from "@/components/auth/auth-shell";
import { DriveUrlField } from "@/components/dashboard/drive-url-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_SITE_JSON, type SiteJson } from "@/data/site-defaults";
import {
  type SiteValidationErrors,
  validateSiteForSave,
} from "@/lib/site-validation";
import { cn } from "@/lib/utils";
import {
  buildWaMeUrl,
  parseWaMeDigitsFromUrl,
} from "@/lib/whatsapp-wa-me";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

const TEMPLATE_AVATAR = DEFAULT_SITE_JSON.avatarUrl.trim();

type Props = {
  siteData: SiteJson;
  onSave: (patch: Partial<SiteJson>) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
  invalidName?: boolean;
  invalidDescription?: boolean;
  invalidContact?: boolean;
  onClearPersonalFieldHint?: (
    field: "name" | "description" | "contact",
  ) => void;
};

export function StepPersonal({
  siteData,
  onSave,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
  invalidName = false,
  invalidDescription = false,
  invalidContact = false,
  onClearPersonalFieldHint,
}: Props) {
  const busy = saving || controlsLocked;
  const [name, setName] = useState(siteData.name);
  const [initials, setInitials] = useState(siteData.initials);
  const [location, setLocation] = useState(siteData.location);
  const [locationLink, setLocationLink] = useState(siteData.locationLink);
  const [description, setDescription] = useState(siteData.description);
  const [summary, setSummary] = useState(siteData.summary);
  const [avatarUrl, setAvatarUrl] = useState(siteData.avatarUrl);
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
  const [fieldErrors, setFieldErrors] = useState<SiteValidationErrors>({});

  const personalPatch = useMemo((): Partial<SiteJson> => {
    const socialWithoutWhatsApp = { ...siteData.contact.social };
    delete socialWithoutWhatsApp.WhatsApp;
    const mail = email.trim() ? `mailto:${email.trim()}` : "";
    const waUrl = buildWaMeUrl(whatsapp);

    return {
      name,
      initials,
      location,
      locationLink,
      description,
      summary,
      avatarUrl,
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
    name,
    initials,
    location,
    locationLink,
    description,
    summary,
    avatarUrl,
    email,
    tel,
    github,
    linkedin,
    x,
    youtube,
    whatsapp,
    siteData.contact,
  ]);

  const runSave = useCallback(() => {
    const merged = {
      ...siteData,
      ...personalPatch,
      contact: personalPatch.contact ?? siteData.contact,
    } as SiteJson;
    const errors = validateSiteForSave(merged);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    void onSave(personalPatch);
  }, [onSave, personalPatch, siteData]);

  const runSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  useEffect(() => {
    setName(siteData.name);
    setInitials(siteData.initials);
    setLocation(siteData.location);
    setLocationLink(siteData.locationLink);
    setDescription(siteData.description);
    setSummary(siteData.summary);
    setAvatarUrl(siteData.avatarUrl);
    setEmail(siteData.contact.email);
    setTel(siteData.contact.tel);
    const s = siteData.contact.social;
    setGithub(s.GitHub?.url ?? "");
    setLinkedin(s.LinkedIn?.url ?? "");
    setX(s.X?.url ?? "");
    setYoutube(s.Youtube?.url ?? "");
    setWhatsapp(parseWaMeDigitsFromUrl(s.WhatsApp?.url ?? ""));
    setFieldErrors({});
  }, [siteData]);

  useEffect(() => {
    registerActions({
      kind: "form",
      save: runSave,
      skip: runSkip,
    });
    return () => registerActions(null);
  }, [registerActions, runSave, runSkip]);

  const hasPhoto =
    avatarUrl.trim() !== "" && avatarUrl.trim() !== TEMPLATE_AVATAR;

  return (
    <Card className="w-full border-border/80 shadow-lg">
      <CardHeader className="space-y-1 px-5 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl">بيانات الموقع الأساسية</CardTitle>
        <CardDescription>
          أكمِل بياناتك الشخصية والتواصل في خطوة واحدة. مطلوب: الاسم الظاهر + العنوان
          الوظيفي + وسيلة تواصل واحدة على الأقل.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">الاسم الظاهر</label>
          <input
            className={cn(
              authFieldClass,
              invalidName && "border-destructive ring-1 ring-destructive",
            )}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              onClearPersonalFieldHint?.("name");
              setFieldErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="اسمك الكامل"
            disabled={busy}
            aria-invalid={invalidName || undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الأحرف الأولى (مثال: أح)</label>
          <input
            className={authFieldClass}
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            placeholder="AH"
            maxLength={8}
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الموقع الجغرافي</label>
          <input
            className={authFieldClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="القاهرة، مصر"
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">رابط الخريطة (اختياري)</label>
          <input
            className={authFieldClass}
            dir="ltr"
            value={locationLink}
            onChange={(e) => setLocationLink(e.target.value)}
            placeholder="https://maps.google.com/..."
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.locationLink) || undefined}
          />
          {fieldErrors.locationLink ? (
            <p className="text-xs text-destructive">{fieldErrors.locationLink}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">العنوان الوظيفي / السطر الرئيسي</label>
          <input
            className={cn(
              authFieldClass,
              invalidDescription && "border-destructive ring-1 ring-destructive",
            )}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              onClearPersonalFieldHint?.("description");
              setFieldErrors((prev) => ({ ...prev, description: undefined }));
            }}
            placeholder="مطوّر واجهات، مهندس برمجيات…"
            disabled={busy}
            aria-invalid={invalidDescription || undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">البريد الإلكتروني</label>
          <input
            type="email"
            className={cn(
              authFieldClass,
              (invalidContact || fieldErrors.email || fieldErrors.contact) &&
                "border-destructive ring-1 ring-destructive",
            )}
            dir="ltr"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onClearPersonalFieldHint?.("contact");
              setFieldErrors((prev) => ({
                ...prev,
                email: undefined,
                contact: undefined,
              }));
            }}
            placeholder="name@example.com"
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.email || fieldErrors.contact) || undefined}
          />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">الهاتف</label>
          <input
            className={cn(
              authFieldClass,
              (invalidContact || fieldErrors.tel || fieldErrors.contact) &&
                "border-destructive ring-1 ring-destructive",
            )}
            dir="ltr"
            value={tel}
            onChange={(e) => {
              setTel(e.target.value);
              onClearPersonalFieldHint?.("contact");
              setFieldErrors((prev) => ({
                ...prev,
                tel: undefined,
                contact: undefined,
              }));
            }}
            placeholder="+20..."
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.tel || fieldErrors.contact) || undefined}
          />
          {fieldErrors.tel ? (
            <p className="text-xs text-destructive">{fieldErrors.tel}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">GitHub</label>
          <input
            className={cn(
              authFieldClass,
              (invalidContact || fieldErrors.social || fieldErrors.contact) &&
                "border-destructive ring-1 ring-destructive",
            )}
            dir="ltr"
            value={github}
            onChange={(e) => {
              setGithub(e.target.value);
              onClearPersonalFieldHint?.("contact");
              setFieldErrors((prev) => ({
                ...prev,
                social: undefined,
                contact: undefined,
              }));
            }}
            placeholder="https://github.com/..."
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.social || fieldErrors.contact) || undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">LinkedIn</label>
          <input
            className={cn(
              authFieldClass,
              (invalidContact || fieldErrors.social || fieldErrors.contact) &&
                "border-destructive ring-1 ring-destructive",
            )}
            dir="ltr"
            value={linkedin}
            onChange={(e) => {
              setLinkedin(e.target.value);
              onClearPersonalFieldHint?.("contact");
              setFieldErrors((prev) => ({
                ...prev,
                social: undefined,
                contact: undefined,
              }));
            }}
            placeholder="https://linkedin.com/in/..."
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.social || fieldErrors.contact) || undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">X (Twitter)</label>
          <input
            className={cn(
              authFieldClass,
              (invalidContact || fieldErrors.social || fieldErrors.contact) &&
                "border-destructive ring-1 ring-destructive",
            )}
            dir="ltr"
            value={x}
            onChange={(e) => {
              setX(e.target.value);
              onClearPersonalFieldHint?.("contact");
              setFieldErrors((prev) => ({
                ...prev,
                social: undefined,
                contact: undefined,
              }));
            }}
            placeholder="https://x.com/..."
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.social || fieldErrors.contact) || undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">YouTube</label>
          <input
            className={cn(
              authFieldClass,
              (invalidContact || fieldErrors.social || fieldErrors.contact) &&
                "border-destructive ring-1 ring-destructive",
            )}
            dir="ltr"
            value={youtube}
            onChange={(e) => {
              setYoutube(e.target.value);
              onClearPersonalFieldHint?.("contact");
              setFieldErrors((prev) => ({
                ...prev,
                social: undefined,
                contact: undefined,
              }));
            }}
            placeholder="https://youtube.com/..."
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.social || fieldErrors.contact) || undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">رقم واتساب</label>
          <input
            className={cn(
              authFieldClass,
              (invalidContact || fieldErrors.social || fieldErrors.contact) &&
                "border-destructive ring-1 ring-destructive",
            )}
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value);
              onClearPersonalFieldHint?.("contact");
              setFieldErrors((prev) => ({
                ...prev,
                social: undefined,
                contact: undefined,
              }));
            }}
            placeholder="2010…"
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.social || fieldErrors.contact) || undefined}
          />
          <p className="text-xs text-muted-foreground">يُحفظ تلقائياً كرابط wa.me</p>
          {fieldErrors.social ? (
            <p className="text-xs text-destructive">{fieldErrors.social}</p>
          ) : null}
          {fieldErrors.contact ? (
            <p className="text-xs text-destructive">{fieldErrors.contact}</p>
          ) : null}
        </div>
        <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-3">
          <p className="text-sm font-medium">صورة الملف الشخصية (اختياري)</p>
          {hasPhoto ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt=""
                className="size-14 rounded-full border border-border object-cover"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                disabled={busy}
                onClick={() => setAvatarUrl("")}
              >
                إزالة الصورة
              </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد صورة مضافة حالياً.</p>
          )}
          <DriveUrlField
            id="onboarding-avatar-url"
            label=""
            value={avatarUrl}
            onChange={setAvatarUrl}
            uploadKind="avatar"
            disabled={busy}
            maskDefaultValue={DEFAULT_SITE_JSON.avatarUrl}
            urlInDetails
            detailsSummary="رابط أو Google Drive (اختياري)"
            hideDriveHintInLabel
            className="pt-1"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">نبذة أطول (اختياري)</label>
          <textarea
            className={`${authFieldClass} min-h-[120px] resize-y py-3`}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="اكتب عن خبرتك وما يميزك…"
            disabled={busy}
          />
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="ghost" onClick={runSkip} disabled={busy}>
            تخطّي
          </Button>
          <Button
            type="button"
            onClick={runSave}
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
