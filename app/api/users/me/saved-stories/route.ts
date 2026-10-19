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
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return Response.json(
      { message: "Сервер тимчасово недоступний." },
      { status: 502 },
    );
  }
}
