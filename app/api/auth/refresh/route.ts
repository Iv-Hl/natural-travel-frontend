import { NextResponse } from "next/server";

export const runtime = "nodejs";

function errorResponse(status: number, message: string) {
  return NextResponse.json(
    { message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return errorResponse(403, "Недозволений запит");
  }

  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(
      (part) => part.startsWith("sessionId=") || part.startsWith("refreshToken="),
    )
    .join("; ");

  try {
    const upstream = await fetch(new URL("/api/auth/refresh", backendUrl), {
      method: "POST",
      headers: cookies ? { Cookie: cookies } : {},
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });

    const headers = new Headers({
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    });
    const getSetCookie = (
      upstream.headers as Headers & { getSetCookie?: () => string[] }
    ).getSetCookie;

    if (upstream.headers.has("set-cookie") && !getSetCookie) {
      return errorResponse(502, "Не вдалося оновити cookies сесії");
    }

    for (const cookie of getSetCookie?.call(upstream.headers) ?? []) {
      headers.append("Set-Cookie", cookie);
    }

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers,
    });
  } catch {
    return errorResponse(502, "Сервер авторизації зараз недоступний");
  }
}
