"use client";

import { useActionState } from "react";
import { ArrowRight, CircleAlert, LoaderCircle } from "lucide-react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { buttonClass } from "@/components/ui/ButtonLink";

const initial: LoginState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="mt-8 space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-lilac-100">
          Пароль
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="field"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </div>

      {state.error && (
        <p id="login-error" role="alert" className="flex items-center gap-2 text-sm text-danger">
          <CircleAlert className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClass("primary", "w-full")}>
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        Увійти
        {!pending && <ArrowRight className="size-4" />}
      </button>
    </form>
  );
}
