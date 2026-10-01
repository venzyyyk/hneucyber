"use client";

import { useId, type ReactNode } from "react";
import { ArrowDown, ArrowUp, CircleAlert, Plus, Trash2 } from "lucide-react";

/* ---------- каркас ---------- */

export function PageTitle({ title, children, actions }: { title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        {children && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mute">{children}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, hint, children, actions }: { title?: string; hint?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-ink-2/80 p-5 sm:p-6">
      {(title || actions) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-base font-semibold text-white">{title}</h2>}
            {hint && <p className="mt-1 text-xs leading-relaxed text-mute-2">{hint}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "error" | "ok"; children: ReactNode }) {
  const tones = {
    info: "border-lilac-300/25 bg-lilac-300/[0.06] text-lilac-100",
    warn: "border-amber-300/30 bg-amber-300/[0.07] text-amber-100",
    error: "border-danger/40 bg-danger/10 text-danger",
    ok: "border-ok/30 bg-ok/10 text-ok",
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${tones[tone]}`}>{children}</div>;
}

/* ---------- кнопки ---------- */

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";
const btnVariants = {
  primary: "bg-lilac-300 px-4 py-2 text-ink hover:bg-lilac-200",
  outline: "border border-line-strong px-4 py-2 text-lilac-100 hover:border-lilac-300/60 hover:bg-white/5",
  ghost: "px-3 py-2 text-mute hover:bg-white/5 hover:text-white",
  danger: "border border-danger/40 px-4 py-2 text-danger hover:bg-danger/10",
  icon: "size-8 text-mute hover:bg-white/5 hover:text-white",
};

export function Btn({
  variant = "outline",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof btnVariants }) {
  return <button type="button" {...props} className={`${btnBase} ${btnVariants[variant]} ${className}`} />;
}

export function RowTools({
  index,
  count,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Btn variant="icon" aria-label={`${label}: вище`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp className="size-4" />
      </Btn>
      <Btn variant="icon" aria-label={`${label}: нижче`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown className="size-4" />
      </Btn>
      <Btn variant="icon" aria-label={`${label}: видалити`} onClick={onRemove} className="hover:!text-danger">
        <Trash2 className="size-4" />
      </Btn>
    </div>
  );
}

export function AddButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-lilac-300/35 px-4 py-3 text-sm text-lilac-200 transition hover:border-lilac-300 hover:bg-lilac-300/5 disabled:opacity-40"
    >
      <Plus className="size-4" />
      {children}
    </button>
  );
}

export const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

/* ---------- поля ---------- */

type FieldBase = { label: string; error?: string; hint?: string; className?: string };

function FieldShell({ id, label, error, hint, className = "", children }: FieldBase & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-mute">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-danger">
          <CircleAlert className="size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-mute-2">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  ...base
}: FieldBase & { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <input
        id={id}
        className="field !py-2 !text-sm"
        value={value ?? ""}
        placeholder={placeholder}
        aria-invalid={base.error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  ...base
}: FieldBase & { value: string; onChange: (v: string) => void; rows?: number }) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <textarea
        id={id}
        rows={rows}
        className="field resize-y !py-2 !text-sm leading-relaxed"
        value={value ?? ""}
        aria-invalid={base.error ? true : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  ...base
}: FieldBase & { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        className="field !py-2 !text-sm"
        value={Number.isFinite(value) ? value : ""}
        aria-invalid={base.error ? true : undefined}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
    </FieldShell>
  );
}

export function SelectInput<V extends string>({
  value,
  onChange,
  options,
  ...base
}: FieldBase & { value: V; onChange: (v: V) => void; options: { value: V; label: string }[] }) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <select id={id} className="field !py-2 !text-sm" value={value} onChange={(e) => onChange(e.target.value as V)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-3 text-sm text-lilac-100">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-5 w-9 rounded-full border border-line-strong bg-ink-3 transition peer-checked:border-lilac-300 peer-checked:bg-lilac-300/80 peer-focus-visible:ring-2 peer-focus-visible:ring-lilac-300 after:absolute after:left-0.5 after:top-0.5 after:size-3.5 after:rounded-full after:bg-lilac-100 after:transition peer-checked:after:translate-x-4 peer-checked:after:bg-ink" />
      {label}
    </label>
  );
}

/** Список рядків (фішки локації, пункти правил). */
export function StringList({
  label,
  values,
  onChange,
  errors,
  errorPrefix,
  addLabel = "Додати",
  multiline = false,
  max = 30,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  errors: Record<string, string>;
  errorPrefix: string;
  addLabel?: string;
  multiline?: boolean;
  max?: number;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-mute">{label}</p>
      <ul className="space-y-2">
        {values.map((v, i) => {
          const error = errors[`${errorPrefix}.${i}`];
          return (
            <li key={i}>
              <div className="flex items-start gap-2">
                <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-[11px] text-mute-2">{i + 1}</span>
                {multiline ? (
                  <textarea
                    rows={2}
                    aria-label={`${label} ${i + 1}`}
                    className="field resize-y !py-2 !text-sm leading-relaxed"
                    value={v}
                    aria-invalid={error ? true : undefined}
                    onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                ) : (
                  <input
                    aria-label={`${label} ${i + 1}`}
                    className="field !py-2 !text-sm"
                    value={v}
                    aria-invalid={error ? true : undefined}
                    onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                )}
                <RowTools
                  index={i}
                  count={values.length}
                  label={`${label} ${i + 1}`}
                  onMove={(from, to) => onChange(move(values, from, to))}
                  onRemove={() => onChange(values.filter((_, j) => j !== i))}
                />
              </div>
              {error && <p className="ml-7 mt-1 text-xs text-danger">{error}</p>}
            </li>
          );
        })}
      </ul>
      <div className="mt-2 pl-7">
        <AddButton onClick={() => onChange([...values, ""])} disabled={values.length >= max}>
          {addLabel}
        </AddButton>
      </div>
    </div>
  );
}
