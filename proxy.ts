import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin/session";

/** Перший рубіж для /admin і /api/admin. Кожна дія адмінки додатково перевіряє сесію сама. */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname === "/admin/login") {
    if (authed) return NextResponse.redirect(new URL("/admin", req.url));
    return noindex(NextResponse.next());
  }

  if (authed) return noindex(NextResponse.next());

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ ok: false, error: "Потрібен вхід" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

function noindex(res: NextResponse) {
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
