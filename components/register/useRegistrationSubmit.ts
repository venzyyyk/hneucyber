"use client";

import { useState } from "react";
import type { RegisterResponse } from "@/lib/registration/types";

type SetFieldError = (path: string, message: string) => void;

export function useRegistrationSubmit(onSuccess: (id: string) => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(payload: unknown, setFieldError: SetFieldError) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as RegisterResponse | null;

      if (data?.ok) {
        onSuccess(data.id);
        return;
      }
      if (data && !data.ok) {
        Object.entries(data.fields ?? {}).forEach(([path, message]) => {
          if (path && path !== "type") setFieldError(path, message);
        });
        setError(data.error);
        return;
      }
      setError("Сервер не відповідає. Спробуй ще раз за хвилину.");
    } catch {
      setError("Немає з'єднання. Перевір інтернет і спробуй ще раз.");
    } finally {
      setPending(false);
    }
  }

  return { pending, error, submit };
}
