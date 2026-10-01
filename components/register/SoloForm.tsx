"use client";

import { useId } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { emptyParticipant, soloFormSchema } from "@/lib/registration/schema";
import { ParticipantFields } from "./ParticipantFields";
import { ConsentCheckbox, Honeypot, KharkivChoice, SubmitBar } from "./FormParts";
import { useRegistrationSubmit } from "./useRegistrationSubmit";

type In = z.input<typeof soloFormSchema>;
type Out = z.output<typeof soloFormSchema>;

export function SoloForm({ onSuccess }: { onSuccess: (id: string) => void }) {
  const formId = useId();
  const methods = useForm<In, unknown, Out>({
    resolver: zodResolver(soloFormSchema),
    defaultValues: { player: emptyParticipant(), website: "" },
    mode: "onTouched",
  });
  const { pending, error, submit } = useRegistrationSubmit(onSuccess);

  const onSubmit = methods.handleSubmit((data) =>
    submit({ type: "solo", ...data }, (path, message) =>
      methods.setError(path as FieldPath<In>, { type: "server", message }),
    ),
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} noValidate className="relative space-y-6">
        <Honeypot />
        <p className="text-sm leading-relaxed text-mute">
          Немає команди? Реєструйся сам — організатори зберуть соло-гравців у мікс-команди.
        </p>
        <ParticipantFields formId={formId} prefix="player" title="Твої дані" badge="Соло" />
        <KharkivChoice formId={formId} label="Ти зараз у Харкові?" />
        <ConsentCheckbox formId={formId} />
        <SubmitBar pending={pending} error={error} label="Відправити заявку" />
      </form>
    </FormProvider>
  );
}
