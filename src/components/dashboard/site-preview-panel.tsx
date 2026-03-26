"use client";

import Navbar from "@/components/navbar";
import { PortfolioHomeView } from "@/components/portfolio-home-view";
import type { SiteJson } from "@/data/site-defaults";
import { getPortfolioHtmlAttrs } from "@/lib/portfolio-display";
import { hydrateSiteJson, mergeSiteJsonForSave } from "@/lib/site-hydrate";
import { useMemo } from "react";

type Props = {
  data: SiteJson;
};

export function SitePreviewPanel({ data }: Props) {
  const mergedData = useMemo(() => {
    return hydrateSiteJson(mergeSiteJsonForSave(data));
  }, [data]);
  const { dir, lang } = getPortfolioHtmlAttrs(mergedData.publicControls.ui);

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-muted/80 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm">
        Live preview (unsaved changes)
      </div>
      <div className="max-h-[min(85vh,920px)] overflow-y-auto overscroll-contain">
        <div
          className="mx-auto w-full max-w-2xl px-4 pt-6 pb-24 [unicode-bidi:isolate]"
          dir={dir}
          lang={lang}
        >
          <PortfolioHomeView data={mergedData} />
        </div>
        <Navbar
          navbar={data.navbar}
          social={data.contact.social}
          blogRouteEnabled={mergedData.publicControls.routes.blog.enabled}
          dockMenuEnabled={mergedData.publicControls.ui.dockMenu}
          themeToggleEnabled={mergedData.publicControls.ui.themeToggle}
        />
      </div>
    </div>
  );
}
