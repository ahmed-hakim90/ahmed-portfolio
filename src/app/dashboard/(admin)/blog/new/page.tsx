"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState("");
  const [mdx, setMdx] = useState("---\ntitle: \npublishedAt: \nsummary: \n---\n\n");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          title,
          publishedAt,
          summary,
          image: image || undefined,
          mdx,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Failed to create");
        return;
      }
      router.replace(`/dashboard/blog/${encodeURIComponent(data.slug)}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/blog">← كل المقالات</Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">New post</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Slug</label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-post"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Published at</label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            placeholder="2025-01-15"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">Title</label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">Summary</label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">
            Image path (optional)
          </label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/og.png"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">MDX body</label>
          <textarea
            className="font-mono min-h-[280px] w-full rounded-md border border-input bg-background p-3 text-xs"
            value={mdx}
            onChange={(e) => setMdx(e.target.value)}
          />
        </div>
      </div>
      {message ? (
        <p className="text-sm text-destructive" role="alert">
          {message}
        </p>
      ) : null}
      <Button type="button" onClick={save} disabled={saving || !slug.trim()}>
        {saving ? "Creating…" : "Create post"}
      </Button>
    </div>
  );
}
