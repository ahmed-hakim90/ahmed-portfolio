"use client";

import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[320px] rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  height?: number;
};

export function BlogMdxEditor({ value, onChange, height = 360 }: Props) {
  return (
    <div
      data-color-mode="auto"
      dir="ltr"
      className="blog-mdx-editor-root w-full overflow-hidden rounded-md border border-input"
      style={{ direction: "ltr" }}
    >
      <MDEditor
        value={value}
        onChange={(v) => onChange(typeof v === "string" ? v : "")}
        height={height}
        visibleDragbar={false}
        direction="ltr"
      />
    </div>
  );
}
