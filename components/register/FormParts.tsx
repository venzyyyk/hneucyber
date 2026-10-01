"use client";

import Link from "next/link";
import { get, useFormContext, type FieldValues } from "react-hook-form";
import { ArrowRight, CircleAlert, LoaderCircle } from "lucide-react";
import { IN_KHARKIV } from "@/lib/registration/options";
import { buttonClass } from "@/components/ui/ButtonLink";
import { FieldMessage, fieldId } from "./fields";

export function KharkivChoice({ formId, label }: { formId: string; label: string }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FieldValues>();
  const error: string | undefined = get(errors, "inKharkiv")?.message;
  const id = fieldId(formId, "inKharkiv");

  return (
    <fieldset aria-describedby={error ? `${id}-msg` : undefined}>
      <legend className="mb-2 text-sm font-medium text-lilac-100">{label}</legend>
      <div className="grid grid-cols-2 gap-2">
        {IN_KHARKIV.map((opt) => (
          <label
            key={opt.value}
            className="relative flex cursor-pointer items-center gap-3 rounded-xl border border-line-strong bg-ink-2 px-4 py-3 text-sm text-lilac-100 transition hover:border-lilac-300/50 has-[:checked]:border-lilac-300 has-[:checked]:bg-lilac-300/10 has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lilac-300"
          >
            <input type="radio" value={opt.value} {...register("inKharkiv")} className="peer sr-only" />
            <span className="grid size-4 shrink-0 place-items-center rounded-full border border-lilac-300/60 peer-checked:[&>span]:scale-100">
              <span className="size-2 scale-0 rounded-full bg-lilac-300 transition-transform" />
            </span>
            {opt.label}
          </label>
        ))}
      </div>
      <FieldMessage id={id} error={error} />
    </fieldset>
  );
}

export function ConsentCheckbox({ formId }: { formId: string }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FieldValues>();
  const error: string | undefined = get(errors, "consent")?.message;
  const id = fieldId(formId, "consent");

  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-mute">
        <input
          id={id}
          type="checkbox"
          {...register("consent")}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-msg` : undefined}
          className="checkbox mt-0.5"
        />
        <span>
          Я ознайомився(-лась) з{" "}
          <Link href="#rules" className="text-lilac-300 underline-offset-4 hover:underline">
            правилами турніру
          </Link>{" "}
          і погоджуюсь на обробку вказаних даних для організації турніру.
        </span>
      </label>
      <FieldMessage id={id} error={error} />
    </div>
  );
}

/** Приманка для ботів: прихована від людей, скрінрідерів і автозаповнення. */
export function Honeypot() {
  const { register } = useFormContext<FieldValues>();
  return (
    <div aria-hidden className="absolute -left-[9999px] top-auto size-px overflow-hidden">
      <label>
        Website
        <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </label>
    </div>
  );
}

export function SubmitBar({ pending, error, label }: { pending: boolean; error: string | null; label: string }) {
  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full !py-4 text-base")}>
        {pending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            Відправляємо…
          </>
        ) : (
          <>
            {label}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </div>
  );
}
