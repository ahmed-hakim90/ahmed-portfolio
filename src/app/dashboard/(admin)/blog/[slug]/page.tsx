"use client";

import { BlogMdxEditor } from "@/components/dashboard/blog-mdx-editor";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.slug === "string" ? params.slug : params.slug?.[0] ?? "";

  const [title, setTitle] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState("");
  const [mdx, setMdx] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/admin/posts/${encodeURIComponent(slug)}`,
        );
        if (!res.ok) {
          if (!cancelled) setMessage("Post not found");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setTitle(data.title ?? "");
          setPublishedAt(data.publishedAt ?? "");
          setSummary(data.summary ?? "");
          setImage(data.image ?? "");
          setMdx(data.mdx ?? "");
        }
      } catch {
        if (!cancelled) setMessage("Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function save() {
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          publishedAt,
          summary,
          image,
          mdx,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Save failed");
        return;
      }
      setMessage("Saved.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete “${slug}”? This cannot be undone.`)) return;
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setMessage("Delete failed");
        return;
      }
      router.replace("/dashboard/blog");
      router.refresh();
    } catch {
      setMessage("Delete failed");
    }
  }

  if (!slug) {
    return <p className="text-sm text-muted-foreground">Invalid slug</p>;
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/blog">← Back</Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Edit: {slug}</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Published at</label>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
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
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">MDX / markdown</label>
          <BlogMdxEditor value={mdx} onChange={setMdx} height={400} />
        </div>
      </div>
      {message ? (
        <p
          className={
            message === "Saved."
              ? "text-sm text-muted-foreground"
              : "text-sm text-destructive"
          }
          role="status"
        >
          {message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="destructive" onClick={remove}>
          Delete
        </Button>
      </div>
    </div>
  );
}
