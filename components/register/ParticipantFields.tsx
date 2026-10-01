"use client";

import type { ReactNode } from "react";
import { get, useFormContext, type FieldValues } from "react-hook-form";
import { COURSES, INSTITUTES } from "@/lib/registration/options";
import { Field, ariaFor, fieldId } from "./fields";

type Props = {
  formId: string;
  /** Шлях у формі: "player", "players.0", "substitute" */
  prefix: string;
  title: string;
  badge?: string;
  action?: ReactNode;
};

export function ParticipantFields({ formId, prefix, title, badge, action }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<FieldValues>();

  const name = (field: string) => `${prefix}.${field}`;
  const err = (field: string): string | undefined => get(errors, name(field))?.message;
  const id = (field: string) => fieldId(formId, name(field));

  return (
    <fieldset className="rounded-2xl border border-line bg-ink-2/70 p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3" aria-hidden>
          <span className="font-display text-sm font-semibold text-white">{title}</span>
          {badge && (
            <span className="rounded-md bg-lilac-300/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-lilac-300">
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id("fullName")} label="ПІБ" error={err("fullName")} className="sm:col-span-2">
          <input
            {...register(name("fullName"))}
            {...ariaFor(id("fullName"), err("fullName"))}
            className="field"
            autoComplete="name"
            placeholder="Прізвище Ім'я По батькові"
          />
        </Field>

        <Field id={id("group")} label="Група" error={err("group")}>
          <input
            {...register(name("group"))}
            {...ariaFor(id("group"), err("group"))}
            className="field"
            autoComplete="off"
            placeholder="Як у розкладі"
          />
        </Field>

        <Field id={id("course")} label="Курс" error={err("course")}>
          <select {...register(name("course"))} {...ariaFor(id("course"), err("course"))} className="field" defaultValue="" required>
            <option value="" disabled>
              Обери курс
            </option>
            {COURSES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id={id("institute")} label="Інститут" error={err("institute")} className="sm:col-span-2">
          <select
            {...register(name("institute"))}
            {...ariaFor(id("institute"), err("institute"))}
            className="field"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Обери інститут
            </option>
            {INSTITUTES.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id={id("email")} label="Пошта" error={err("email")}>
          <input
            {...register(name("email"))}
            {...ariaFor(id("email"), err("email"))}
            className="field"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@gmail.com"
          />
        </Field>

        <Field id={id("telegram")} label="Telegram" error={err("telegram")}>
          <input
            {...register(name("telegram"))}
            {...ariaFor(id("telegram"), err("telegram"))}
            className="field"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="@username"
          />
        </Field>

        <Field
          id={id("nickname")}
          label="Нік у грі / Steam"
          error={err("nickname")}
          optional
          className="sm:col-span-2"
        >
          <input
            {...register(name("nickname"))}
            {...ariaFor(id("nickname"), err("nickname"))}
            className="field"
            autoComplete="off"
            spellCheck={false}
            placeholder="Твій нік у CS2"
          />
        </Field>
      </div>
    </fieldset>
  );
}
