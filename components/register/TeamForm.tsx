"use client";

import { useId, useMemo, useRef, useState } from "react";
import { FormProvider, get, useForm, useWatch, type FieldPath, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { UserPlus, X } from "lucide-react";
import { site } from "@/content/site";
import { emptyParticipant, teamFormSchema } from "@/lib/registration/schema";
import { ParticipantFields } from "./ParticipantFields";
import { ConsentCheckbox, Honeypot, KharkivChoice, SubmitBar } from "./FormParts";
import { Field, ariaFor, fieldId } from "./fields";
import { useRegistrationSubmit } from "./useRegistrationSubmit";

type In = z.input<typeof teamFormSchema>;
type Out = z.output<typeof teamFormSchema>;
type Draft = Partial<Record<"fullName" | "group" | "course" | "institute" | "email" | "telegram", string>>;

const TEAM_SIZE = site.tournament.teamSize;
const REQUIRED: (keyof Draft)[] = ["fullName", "group", "course", "institute", "email", "telegram"];
const isFilled = (p?: Draft) => Boolean(p && REQUIRED.every((k) => String(p[k] ?? "").trim()));

export function TeamForm({ onSuccess }: { onSuccess: (id: string) => void }) {
  const formId = useId();
  const [withSub, setWithSub] = useState(false);
  const withSubRef = useRef(false);

  // Запасний валідується лише коли його додали; інакше поле викидається з даних.
  const resolver = useMemo<Resolver<In, unknown, Out>>(() => {
    const base = zodResolver(teamFormSchema);
    return (values, ctx, options) =>
      base(withSubRef.current ? values : { ...values, substitute: undefined }, ctx, options);
  }, []);

  const methods = useForm<In, unknown, Out>({
    resolver,
    defaultValues: {
      teamName: "",
      players: Array.from({ length: TEAM_SIZE }, emptyParticipant),
      substitute: emptyParticipant(),
      website: "",
    },
    mode: "onTouched",
  });
  const {
    register,
    control,
    formState: { errors },
  } = methods;

  const players = useWatch({ control, name: "players" }) as Draft[] | undefined;
  const substitute = useWatch({ control, name: "substitute" }) as Draft | undefined;

  const { pending, error, submit } = useRegistrationSubmit(onSuccess);

  const toggleSub = (value: boolean) => {
    withSubRef.current = value;
    setWithSub(value);
    if (!value) methods.clearErrors("substitute");
  };

  const onSubmit = methods.handleSubmit((data) =>
    submit({ type: "team", ...data }, (path, message) =>
      methods.setError(path as FieldPath<In>, { type: "server", message }),
    ),
  );

  const teamNameId = fieldId(formId, "teamName");
  const teamNameError: string | undefined = get(errors, "teamName")?.message;

  const slots = [
    ...Array.from({ length: TEAM_SIZE }, (_, i) => ({
      key: `players.${i}`,
      label: String(i + 1),
      filled: isFilled(players?.[i]),
      invalid: Boolean(get(errors, `players.${i}`)),
      sub: false,
    })),
    ...(withSub
      ? [{ key: "substitute", label: "З", filled: isFilled(substitute), invalid: Boolean(errors.substitute), sub: true }]
      : []),
  ];
  const filledCount = slots.filter((s) => s.filled).length;

  const scrollTo = (key: string) =>
    document.getElementById(fieldId(formId, `${key}.fullName`))?.focus({ preventScroll: false });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate className="relative space-y-6">
        <Honeypot />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id={teamNameId} label="Назва команди" error={teamNameError} className="sm:col-span-2">
            <input
              {...register("teamName")}
              {...ariaFor(teamNameId, teamNameError)}
              className="field"
              autoComplete="off"
              placeholder="Наприклад, KHNUE Wolves"
            />
          </Field>
          <div className="sm:col-span-2">
            <KharkivChoice formId={formId} label="Команда зараз у Харкові?" />
          </div>
        </div>

        {/* Мінімапа складу */}
        <div className="sticky top-20 z-10 -mx-1 rounded-2xl border border-line bg-ink/90 p-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute">
              Склад <span className="text-lilac-300">{filledCount}</span>/{slots.length}
            </p>
            <ul className="flex gap-1.5">
              {slots.map((s) => (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => scrollTo(s.key)}
                    title={s.sub ? "Запасний" : `Гравець ${s.label}`}
                    className={`grid size-8 place-items-center rounded-lg border font-mono text-xs font-semibold transition ${
                      s.invalid
                        ? "border-danger/70 bg-danger/10 text-danger"
                        : s.filled
                          ? "border-lilac-300 bg-lilac-300 text-ink"
                          : "border-line-strong text-mute hover:border-lilac-300/60"
                    } ${s.sub ? "border-dashed" : ""}`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {Array.from({ length: TEAM_SIZE }, (_, i) => (
          <ParticipantFields
            key={i}
            formId={formId}
            prefix={`players.${i}`}
            title={`Гравець ${i + 1}`}
            badge={i === 0 ? "Капітан" : undefined}
          />
        ))}

        {site.tournament.substitutes === 0 ? null : withSub ? (
          <ParticipantFields
            formId={formId}
            prefix="substitute"
            title="Запасний гравець"
            badge="Запас"
            action={
              <button
                type="button"
                onClick={() => toggleSub(false)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-mute transition hover:bg-white/5 hover:text-danger"
              >
                <X className="size-3.5" />
                Прибрати
              </button>
            }
          />
        ) : (
          <button
            type="button"
            onClick={() => toggleSub(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-lilac-300/40 px-5 py-5 text-sm font-medium text-lilac-200 transition hover:border-lilac-300 hover:bg-lilac-300/5"
          >
            <UserPlus className="size-4" />
            Додати запасного гравця
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-2">необов&apos;язково</span>
          </button>
        )}

        <ConsentCheckbox formId={formId} />
        <SubmitBar pending={pending} error={error} label="Зареєструвати команду" />
      </form>
    </FormProvider>
  );
}
