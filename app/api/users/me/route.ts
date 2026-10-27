import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";
  const cookies = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part.startsWith("sessionId=") || part.startsWith("accessToken="),
    )
    .join("; ");

  try {
    const upstream = await fetch(new URL("/api/users/me", backendUrl), {
      headers: cookies ? { Cookie: cookies } : {},
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Не вдалося з’єднатися із сервером." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function PATCH(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "Недозволений запит" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";
  const cookies = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part.startsWith("sessionId=") || part.startsWith("accessToken="),
    )
    .join("; ");
  const contentType = request.headers.get("content-type");

  if (!contentType?.startsWith("multipart/form-data;")) {
    return NextResponse.json(
      { message: "Очікується форма з даними профілю." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const upstream = await fetch(new URL("/api/users/me", backendUrl), {
      method: "PATCH",
      headers: {
        ...(cookies ? { Cookie: cookies } : {}),
        "Content-Type": contentType,
      },
      body: await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(30_000),
    });

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Не вдалося з’єднатися із сервером." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
