export async function captureAndSharePortfolioImage(
  element: HTMLElement | null,
  options: { slug: string; publicUrl: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!element) {
    return { ok: false, error: "No card to capture" };
  }
  const { default: html2canvas } = await import("html2canvas");
  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
    });
  } catch (e) {
    console.error("html2canvas", e);
    return { ok: false, error: "Could not render card image" };
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png", 0.95),
  );
  if (!blob) {
    return { ok: false, error: "Could not create image" };
  }

  const safeSlug = options.slug.replace(/[^\w\-]+/g, "-") || "portfolio";
  const filename = `portfolio-card-${safeSlug}.png`;
  const file = new File([blob], filename, { type: "image/png" });

  const shareData: ShareData = {
    title: "بطاقة الموقع",
    text: options.publicUrl,
    url: options.publicUrl,
  };

  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
    try {
      const withFiles = { ...shareData, files: [file] };
      if (navigator.canShare(withFiles)) {
        await navigator.share(withFiles);
        return { ok: true };
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        return { ok: true };
      }
      console.warn("navigator.share with file failed, falling back", e);
    }
  }

  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    return { ok: true };
  } catch (e) {
    console.error("download", e);
    return { ok: false, error: "Could not save image" };
  }
}
