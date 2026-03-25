"use client";

import { useEffect } from "react";

export function FolioLandingClient() {
  useEffect(() => {
    const root = document.getElementById("folio-landing-root");
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      root.classList.add("folioLanding--reduceMotion");
    } else {
      root.classList.add("folioLanding--customCursor");
    }

    const nav = root.querySelector<HTMLElement>("#folio-nav");
    const onScroll = () => {
      if (!nav) return;
      nav.classList.toggle("folioNavScrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const cursor = root.querySelector<HTMLElement>("#folio-cursor");
    const ring = root.querySelector<HTMLElement>("#folio-cursor-ring");
    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (cursor) {
        cursor.style.left = `${mx}px`;
        cursor.style.top = `${my}px`;
      }
    };

    const enlarge = (on: boolean) => {
      if (!cursor || !ring) return;
      cursor.style.width = on ? "14px" : "8px";
      cursor.style.height = on ? "14px" : "8px";
      ring.style.width = on ? "52px" : "36px";
      ring.style.height = on ? "52px" : "36px";
    };

    const loop = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      if (ring) {
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
      }
      raf = requestAnimationFrame(loop);
    };

    if (!reduceMotion && cursor && ring) {
      document.addEventListener("mousemove", onMove);
      raf = requestAnimationFrame(loop);
      const interactive = root.querySelectorAll("button, a");
      interactive.forEach((el) => {
        el.addEventListener("mouseenter", () => enlarge(true));
        el.addEventListener("mouseleave", () => enlarge(false));
      });
    }

    const io =
      reduceMotion || typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              entries.forEach((e) => {
                if (!e.isIntersecting) return;
                const t = e.target as HTMLElement;
                if (t.classList.contains("folioReveal")) {
                  t.classList.add("folioRevealShow");
                }
                if (t.classList.contains("folioStep")) {
                  t.classList.add("folioStepShow");
                }
                if (t.classList.contains("folioTcard")) {
                  t.classList.add("folioTcardShow");
                }
                io?.unobserve(t);
              });
            },
            { threshold: 0.12 },
          );

    if (io) {
      root.querySelectorAll(".folioReveal, .folioStep, .folioTcard").forEach(
        (el, i) => {
          const node = el as HTMLElement;
          node.style.transitionDelay = `${(i % 4) * 80}ms`;
          io.observe(node);
        },
      );
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  return null;
}
