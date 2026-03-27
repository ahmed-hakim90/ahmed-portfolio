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
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
  onClearPersonalFieldHint?: (field: "name" | "description") => void;
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

  const personalPatch = useCallback(
    (): Partial<SiteJson> => ({
      name,
      initials,
      location,
      locationLink,
      description,
      summary,
      avatarUrl,
    }),
    [
      name,
      initials,
      location,
      locationLink,
      description,
      summary,
      avatarUrl,
    ],
  );

  const runSave = useCallback(() => {
    void onSave(personalPatch());
  }, [onSave, personalPatch]);

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
        <CardTitle className="text-xl sm:text-2xl">المعلومات الشخصية</CardTitle>
        <CardDescription>
          لنشر المحفظة للزوار لاحقاً يلزم الاسم الظاهر والعنوان الوظيفي (السطر الرئيسي)
          في هذه الخطوة؛ باقي الحقول اختيارية.
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
          />
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
            }}
            placeholder="مطوّر واجهات، مهندس برمجيات…"
            disabled={busy}
            aria-invalid={invalidDescription || undefined}
          />
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
