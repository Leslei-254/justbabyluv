"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={cn(
          "relative w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl max-h-[88vh] overflow-y-auto shadow-xl",
          className
        )}
      >
        <div className="sticky top-0 bg-surface flex items-center justify-between px-5 pt-5 pb-3 border-b border-border rounded-t-3xl sm:rounded-t-3xl">
          <h2 id="sheet-title" className="font-display text-lg text-ink">
            {title}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 -mr-1.5 rounded-full flex items-center justify-center text-ink-soft hover:bg-cream"
          >
            <X size={18} />
          </button>
        </div>
        <div
          className="p-5"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
