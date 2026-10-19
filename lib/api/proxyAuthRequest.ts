import { NextResponse } from "next/server";

export async function proxyAuthRequest(
  request: Request,
  endpoint: "/api/auth/register" | "/api/auth/login",
) {
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { message: "Некоректні дані запиту" },
      { status: 400 },
    );
  }

  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

  try {
    const upstream = await fetch(
      new URL(endpoint, `${backendUrl.replace(/\/+$/, "")}/`),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      },
    );

    const headers = new Headers({
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
    });
    const getSetCookie = (
      upstream.headers as Headers & { getSetCookie?: () => string[] }
    ).getSetCookie;

    for (const cookie of getSetCookie?.call(upstream.headers) ?? []) {
      headers.append("Set-Cookie", cookie);
    }

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers,
    });
  } catch {
    return NextResponse.json(
      { message: "Сервер авторизації зараз недоступний. Спробуйте пізніше." },
      { status: 502 },
    );
  }
}
