"use client";

import { Sheet } from "./Sheet";
import { Button } from "./Button";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Delete this?",
  description,
  confirmLabel = "Delete",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title} className="sm:max-w-sm">
      <p className="text-sm text-ink-soft">{description}</p>
      <div className="mt-5 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </Sheet>
  );
}
