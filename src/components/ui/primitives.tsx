import { HTMLAttributes, LabelHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-3xl p-5 shadow-[0_1px_2px_rgba(42,38,34,0.04)]",
        className
      )}
      {...props}
    />
  );
}

export function Field({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-ink mb-1.5", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-border bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20",
        className
      )}
      {...props}
    />
  );
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-danger">{children}</p>;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-10 px-6">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-rose-soft flex items-center justify-center text-rose">
          {icon}
        </div>
      )}
      <div>
        <p className="font-display text-lg text-ink">{title}</p>
        <p className="text-sm text-ink-soft mt-1 max-w-xs">{description}</p>
      </div>
      {action}
    </div>
  );
}
