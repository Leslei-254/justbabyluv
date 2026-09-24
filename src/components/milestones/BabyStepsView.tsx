"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/primitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { MilestoneSheet } from "./MilestoneSheet";
import { formatDayLabel } from "@/lib/utils";
import type { milestones } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";

type Milestone = InferSelectModel<typeof milestones>;

export function BabyStepsView({
  babyId,
  milestones,
}: {
  babyId: string;
  milestones: Milestone[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Milestone | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/milestones/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Couldn't delete that. Please try again.");
        return;
      }
      toast.success("Deleted");
      setDeleteTarget(null);
      router.refresh();
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 sm:pt-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink">Baby Steps</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={22} />}
          title="No Baby Steps yet"
          description="Record first smiles, first steps, and other little milestones as they happen."
          action={
            <Button onClick={() => setOpen(true)}>Add a Baby Step</Button>
          }
        />
      ) : (
        <ol className="relative border-l border-border pl-6 space-y-6">
          {milestones.map((m) => (
            <li key={m.id} className="relative">
              <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-sand ring-4 ring-cream" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg text-ink">{m.title}</p>
                  <p className="text-xs text-ink-faint">{formatDayLabel(m.date)}</p>
                  {m.note && <p className="text-sm text-ink-soft mt-1 break-words">{m.note}</p>}
                  {m.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photoUrl}
                      alt={m.title}
                      className="mt-2 rounded-xl max-h-40 w-full max-w-xs object-cover"
                    />
                  )}
                </div>
                <button
                  aria-label="Delete"
                  onClick={() => setDeleteTarget(m)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-danger hover:bg-danger-soft shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <MilestoneSheet open={open} onClose={() => setOpen(false)} babyId={babyId} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
        title="Delete Baby Step?"
        description={
          deleteTarget
            ? `This will permanently delete "${deleteTarget.title}". This can't be undone.`
            : ""
        }
        loading={deleting}
      />
    </div>
  );
}
