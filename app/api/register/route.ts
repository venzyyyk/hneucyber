import { site } from "@/content/site";
import { registrationSchema } from "@/lib/registration/schema";
import type { RegisterResponse } from "@/lib/registration/types";
import type { StoredRegistration } from "@/lib/server/format";
import { registrationId } from "@/lib/server/id";
import { allowRequest, clientIp } from "@/lib/server/rate-limit";
import { appendToSheet, sheetsEnabled } from "@/lib/server/sheets";
import { sendToTelegram, telegramEnabled } from "@/lib/server/telegram";

const json = (body: RegisterResponse, status = 200) => Response.json(body, { status });

export async function POST(req: Request) {
  if (site.registration.status !== "open") {
    return json({ ok: false, error: "Реєстрація зараз закрита" }, 403);
  }

  if (!allowRequest(clientIp(req))) {
    return json({ ok: false, error: "Забагато спроб. Спробуй за кілька хвилин." }, 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Некоректний запит" }, 400);
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fields[key]) fields[key] = issue.message;
    }
    return json({ ok: false, error: "Перевір поля форми", fields }, 422);
  }

  const id = registrationId();

  // Honeypot заповнений — це бот. Відповідаємо «ок», нікуди не пишемо.
  if (parsed.data.website) return json({ ok: true, id });

  const registration: StoredRegistration = {
    ...parsed.data,
    id,
    createdAt: new Date().toISOString(),
  };

  const jobs: Promise<void>[] = [];
  if (telegramEnabled) jobs.push(sendToTelegram(registration));
  if (sheetsEnabled) jobs.push(appendToSheet(registration));

  if (jobs.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[register] dev mode, заявка не відправлена нікуди:\n", JSON.stringify(registration, null, 2));
      return json({ ok: true, id });
    }
    console.error("[register] Не задано TELEGRAM_* і SHEETS_* у env");
    return json({ ok: false, error: "Реєстрація тимчасово недоступна" }, 503);
  }

  const results = await Promise.allSettled(jobs);
  const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");
  failed.forEach((f) => console.error("[register]", id, f.reason));

  if (failed.length === results.length) {
    return json({ ok: false, error: "Не вдалося зберегти заявку. Спробуй ще раз." }, 502);
  }

  return json({ ok: true, id });
}
