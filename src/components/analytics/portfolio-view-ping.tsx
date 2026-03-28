"use client";

import { useEffect, useRef } from "react";

const DEVICE_KEY = "portfolio_device_id";

function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_KEY);
    if (existing && existing.length >= 32) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

type Props = { userId: string };

/** Fires a single analytics ping per page mount. No UI rendered. */
export function PortfolioViewPing({ userId }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const deviceId = getOrCreateDeviceId();
    void fetch("/api/public/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, deviceId }),
    }).catch(() => {});
  }, [userId]);

  return null;
}
