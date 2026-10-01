import { isAdmin } from "@/lib/admin/auth";
import { StoreError, assertSafePath, getStore } from "@/lib/admin/store";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

/** Віддає картинку прямо зі сховища — щоб адмінка бачила фото ще до передеплою сайту. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const store = getStore();
  if (!store) return new Response("Storage not configured", { status: 503 });

  const raw = new URL(req.url).searchParams.get("path") ?? "";
  let path: string;
  try {
    path = assertSafePath(raw);
  } catch {
    return new Response("Bad path", { status: 400 });
  }
  const type = TYPES[path.split(".").pop()?.toLowerCase() ?? ""];
  if (!path.startsWith("public/") || !type) return new Response("Bad path", { status: 400 });

  try {
    const bytes = await store.readBinary(path);
    if (!bytes) return new Response("Not found", { status: 404 });
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "private, max-age=300",
        "X-Content-Type-Options": "nosniff",
        // SVG не зможе виконати скрипти, навіть якщо відкрити напряму
        "Content-Security-Policy": "default-src 'none'; img-src data:; style-src 'unsafe-inline'",
      },
    });
  } catch (err) {
    return new Response(err instanceof StoreError ? err.message : "Error", { status: 502 });
  }
}
