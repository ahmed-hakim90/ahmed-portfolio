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
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { RegisterOnboardingStepActionsFn } from "../onboarding-step-actions";

type Props = {
  siteData: SiteJson;
  onSave: (patch: Partial<SiteJson>) => Promise<void>;
  onSkip: () => void;
  saving: boolean;
  /** Disables controls without showing save spinner (e.g. wizard navigation). */
  controlsLocked?: boolean;
  registerActions: RegisterOnboardingStepActionsFn;
};

export function StepPersonal({
  siteData,
  onSave,
  onSkip,
  saving,
  controlsLocked = false,
  registerActions,
}: Props) {
  const busy = saving || controlsLocked;
  const [name, setName] = useState(siteData.name);
  const [initials, setInitials] = useState(siteData.initials);
  const [location, setLocation] = useState(siteData.location);
  const [locationLink, setLocationLink] = useState(siteData.locationLink);
  const [description, setDescription] = useState(siteData.description);
  const [summary, setSummary] = useState(siteData.summary);

  useEffect(() => {
    setName(siteData.name);
    setInitials(siteData.initials);
    setLocation(siteData.location);
    setLocationLink(siteData.locationLink);
    setDescription(siteData.description);
    setSummary(siteData.summary);
  }, [siteData]);

  useEffect(() => {
    registerActions({
      kind: "form",
      save: () =>
        void onSave({
          name,
          initials,
          location,
          locationLink,
          description,
          summary,
        }),
      skip: onSkip,
    });
    return () => registerActions(null);
  }, [
    registerActions,
    onSave,
    onSkip,
    name,
    initials,
    location,
    locationLink,
    description,
    summary,
  ]);

  return (
    <Card className="w-full border-border/80 shadow-lg">
      <CardHeader className="space-y-1 px-5 pb-2 pt-6 text-center sm:px-8 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl">المعلومات الشخصية</CardTitle>
        <CardDescription>
          الاسم، الموقع، العنوان الوظيفي، ونبذة عنك — كل الحقول اختيارية.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-6 pt-2 sm:px-8 sm:pb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">الاسم الظاهر</label>
          <input
            className={authFieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسمك الكامل"
            disabled={busy}
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
            className={authFieldClass}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مطوّر واجهات، مهندس برمجيات…"
            disabled={busy}
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
          <Button type="button" variant="ghost" onClick={onSkip} disabled={busy}>
            تخطّي
          </Button>
          <Button
            type="button"
            onClick={() =>
              void onSave({
                name,
                initials,
                location,
                locationLink,
                description,
                summary,
              })
            }
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
