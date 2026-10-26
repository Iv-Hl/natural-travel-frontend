import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ storyId: string }>;
};

async function proxySavedStory(
  request: NextRequest,
  storyId: string,
  method: "POST" | "DELETE",
) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "Forbidden" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

  const targetUrl = new URL(
    `/api/users/me/saved-stories/${encodeURIComponent(storyId)}`,
    backendUrl,
  );

  const cookies = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part.startsWith("sessionId=") || part.startsWith("accessToken="),
    )
    .join("; ");

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: cookies ? { Cookie: cookies } : {},
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });

    if ([204, 205, 304].includes(response.status)) {
      return new Response(null, {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

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

export async function POST(request: NextRequest, context: RouteContext) {
  const { storyId } = await context.params;
  return proxySavedStory(request, storyId, "POST");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { storyId } = await context.params;
  return proxySavedStory(request, storyId, "DELETE");
}
