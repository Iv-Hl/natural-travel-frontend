import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

  const requestUrl = new URL(request.url);

  const targetUrl = new URL("/api/users/me/saved-stories", backendUrl);

  requestUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const headers = new Headers({
    Accept: "application/json",
  });

  const cookie = request.headers.get("cookie");

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Сервер тимчасово недоступний. Спробуйте пізніше." },
      { status: 502 },
    );
  }
}
