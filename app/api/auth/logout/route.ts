
export const runtime = "nodejs";

const ERROR_MESSAGE = "Не вдалося вийти. Спробуйте ще раз.";

function errorResponse(status: number, headers = new Headers()) {
  headers.set("Cache-Control", "no-store");

  return Response.json(
    { message: ERROR_MESSAGE },
    { status, headers },
  );
}

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return errorResponse(403);
  }

  try {
    const backend = new URL(
      "/api/auth/logout",
      process.env.BACKEND_API_URL ?? "http://localhost:3000",
    );

    if (!["http:", "https:"].includes(backend.protocol) ||
        backend.username || backend.password) {
      return errorResponse(502);
    }

    const cookies = (request.headers.get("cookie") ?? "")
      .split(";")
      .map((part) => part.trim())
      .filter((part) =>
        part.startsWith("sessionId=") ||
        part.startsWith("accessToken="),
      )
      .join("; ");

    const response = await fetch(backend, {
      method: "POST",
      headers: cookies ? { Cookie: cookies } : {},
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });

    const headers = new Headers({ "Cache-Control": "no-store" });

    const getSetCookie = (
      response.headers as Headers & {
        getSetCookie?: () => string[];
      }
    ).getSetCookie;

    if (response.headers.has("set-cookie") && !getSetCookie) {
      return errorResponse(502);
    }

    for (const cookie of getSetCookie?.call(response.headers) ?? []) {
      headers.append("Set-Cookie", cookie);
    }

    if (response.status === 204) {
      return new Response(null, { status: 204, headers });
    }

    const status =
      response.status >= 400 && response.status < 600
        ? response.status
        : 502;

    return errorResponse(status, headers);
  } catch {
    return errorResponse(502);
  }
}

