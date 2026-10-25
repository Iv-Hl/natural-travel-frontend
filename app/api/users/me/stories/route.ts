import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";
  const targetUrl = new URL("/api/users/me/stories", backendUrl);
  targetUrl.search = request.nextUrl.search;
  const cookie = request.headers.get("cookie");

  try {
    const response = await fetch(targetUrl, {
      headers: cookie ? { Cookie: cookie } : {},
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Не вдалося підключитися до бекенду" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
