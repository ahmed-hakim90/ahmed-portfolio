"use client";

import { useEffect, useRef } from "react";

const STORAGE_KEY = "platform_analytics_device_id";

function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 32) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

type Props = { surface: "public" | "dashboard" };

export function PlatformAnalyticsPing({ surface }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const deviceId = getOrCreateDeviceId();
    const url =
      surface === "public"
        ? "/api/public/analytics/ping"
        : "/api/admin/analytics/ping";
    const body =
      surface === "public"
        ? JSON.stringify({ deviceId, surface: "public" })
        : JSON.stringify({ deviceId, surface: "dashboard" });

    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      credentials: "same-origin",
    }).catch(() => {});
  }, [surface]);

  return null;
}
