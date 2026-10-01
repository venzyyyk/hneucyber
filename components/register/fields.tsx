"use client";

import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

export const fieldId = (formId: string, name: string) => `${formId}-${name.replace(/\./g, "-")}`;

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
};

export function Field({ id, label, error, hint, optional, className = "", children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-medium text-lilac-100">
        <span>{label}</span>
        {optional && <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-2">необов&apos;язково</span>}
      </label>
      {children}
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-msg`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">
        <CircleAlert className="size-3.5 shrink-0" />
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-msg`} className="mt-1.5 text-xs text-mute-2">
        {hint}
      </p>
    );
  }
  return null;
}

/** aria-атрибути для інпута з помилкою/підказкою */
export const ariaFor = (id: string, error?: string, hint?: string) => ({
  id,
  "aria-invalid": error ? (true as const) : undefined,
  "aria-describedby": error || hint ? `${id}-msg` : undefined,
});
