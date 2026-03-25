"use client";

import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useState } from "react";

type UserRow = {
  id: string;
  email: string;
  username: string;
  slug: string;
  role: "owner" | "client";
  disabled: boolean;
  createdAt: string;
  phone: string | null;
};

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [selfId, setSelfId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        setMessage("Could not load users");
        return;
      }
      const data = (await res.json()) as UserRow[];
      setUsers(data);
    } catch {
      setMessage("Could not load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/profile");
        if (!res.ok) return;
        const data = (await res.json()) as { id?: string };
        if (typeof data.id === "string") setSelfId(data.id);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          password: newPass,
          role: "client",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Create failed");
        return;
      }
      setNewEmail("");
      setNewPass("");
      await load();
      setMessage("User created.");
    } finally {
      setBusy(false);
    }
  }

  async function setDisabled(id: string, disabled: boolean) {
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Update failed");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(id: string) {
    if (
      !window.confirm(
        "Delete this user and their saved site data (including blog posts)? This cannot be undone.",
      )
    ) {
      return;
    }
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Delete failed");
        return;
      }
      await load();
      setMessage("User deleted.");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(id: string, password: string) {
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }
    setMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Password update failed");
        return;
      }
      setMessage("Password updated.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Admin users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create Firebase accounts (email + password), view each user&apos;s public
          URL and phone, open their site as visitors see it, disable access, reset
          password, or delete an account.
        </p>
      </div>

      {message ? (
        <p className="text-sm text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}

      <form
        onSubmit={createUser}
        className="space-y-3 rounded-lg border border-border bg-muted/20 p-4"
      >
        <h2 className="text-sm font-medium">New user</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[180px] flex-1 space-y-1">
            <label htmlFor="nu" className="text-xs text-muted-foreground">
              Email
            </label>
            <input
              id="nu"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              required
            />
          </div>
          <div className="min-w-[160px] flex-1 space-y-1">
            <label htmlFor="np" className="text-xs text-muted-foreground">
              Password (min 8)
            </label>
            <input
              id="np"
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" size="sm" disabled={busy}>
            Add user
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Username</th>
              <th className="px-3 py-2 font-medium">Slug</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserActionsRow
                key={u.id}
                user={u}
                busy={busy}
                onToggleDisabled={() => setDisabled(u.id, !u.disabled)}
                onSetPassword={(pw) => changePassword(u.id, pw)}
                onDelete={() => deleteUser(u.id)}
                canDelete={selfId === null || u.id !== selfId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserActionsRow({
  user,
  busy,
  onToggleDisabled,
  onSetPassword,
  onDelete,
  canDelete,
}: {
  user: UserRow;
  busy: boolean;
  onToggleDisabled: () => void;
  onSetPassword: (pw: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [pw, setPw] = useState("");
  const publicPath = `/${encodeURIComponent(user.slug)}`;

  return (
    <tr className="border-b border-border last:border-0">
      <td className="max-w-[200px] truncate px-3 py-2 text-xs text-muted-foreground">
        {user.email}
      </td>
      <td className="px-3 py-2 font-mono text-xs">{user.username}</td>
      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
        {user.slug}
      </td>
      <td className="max-w-[140px] truncate px-3 py-2 text-xs text-muted-foreground">
        {user.phone ?? "—"}
      </td>
      <td className="px-3 py-2">
        {user.disabled ? (
          <span className="text-destructive">Disabled</span>
        ) : (
          <span className="text-muted-foreground">Active</span>
        )}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground">{user.role}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {user.createdAt}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() =>
              window.open(publicPath, "_blank", "noopener,noreferrer")
            }
          >
            View site
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onToggleDisabled}
          >
            {user.disabled ? "Enable" : "Disable"}
          </Button>
          {canDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={busy}
              onClick={onDelete}
            >
              Delete
            </Button>
          ) : null}
          <div className="flex flex-wrap items-center gap-1">
            <input
              type="password"
              placeholder="New password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-36 rounded-md border border-input bg-background px-2 py-1 text-xs"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => {
                onSetPassword(pw);
                setPw("");
              }}
            >
              Set password
            </Button>
          </div>
        </div>
      </td>
    </tr>
  );
}
