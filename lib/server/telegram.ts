import "server-only";
import { toTelegramMessage, type StoredRegistration } from "./format";

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const threadId = process.env.TELEGRAM_THREAD_ID;

export const telegramEnabled = Boolean(token && chatId);

export async function sendToTelegram(reg: StoredRegistration): Promise<void> {
  if (!telegramEnabled) throw new Error("Telegram не налаштований");

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      ...(threadId ? { message_thread_id: Number(threadId) } : {}),
      text: toTelegramMessage(reg),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    }),
    signal: AbortSignal.timeout(8000),
  });

  const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
  if (!res.ok || !data?.ok) {
    throw new Error(`Telegram: ${data?.description ?? res.statusText}`);
  }
}
