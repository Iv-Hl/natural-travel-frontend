import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl =
    process.env.BACKEND_API_URL ?? "http://localhost:3000";

  const requestUrl = new URL(request.url);
  const targetUrl = new URL("/api/users", backendUrl);

  targetUrl.search = requestUrl.search;

  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if ([204, 205, 304].includes(upstream.status)) {
      return new Response(null, {
        status: upstream.status,
      });
    }

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ??
          "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "Сервер тимчасово недоступний. Спробуйте пізніше.",
      },
      { status: 502 },
    );
  }
}
