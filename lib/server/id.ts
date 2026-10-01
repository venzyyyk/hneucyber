import "server-only";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Короткий ID заявки без схожих символів: KC-7F3K2Q */
export function registrationId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return `KC-${out}`;
}
