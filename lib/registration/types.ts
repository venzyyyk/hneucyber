export type RegisterResponse =
  | { ok: true; id: string }
  | { ok: false; error: string; fields?: Record<string, string> };
