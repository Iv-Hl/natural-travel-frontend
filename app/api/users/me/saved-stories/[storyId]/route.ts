import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ storyId: string }> };

async function updateSavedStory(
  request: Request,
  context: RouteContext,
  method: "POST" | "DELETE",
) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json(
      { message: "Недозволений запит" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { storyId } = await context.params;
  if (!storyId || storyId.includes("/")) {
    return NextResponse.json(
      { message: "Некоректний ідентифікатор історії" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
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

  try {
    const upstream = await fetch(
      new URL(
        `/api/users/me/saved-stories/${encodeURIComponent(storyId)}`,
        backendUrl,
      ),
      {
        method,
        headers: cookies ? { Cookie: cookies } : {},
        cache: "no-store",
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      },
    );
    if ([204, 205, 304].includes(upstream.status)) {
      return new Response(null, {
        status: upstream.status,
        headers: { "Cache-Control": "no-store" },
      });
    }
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
      { message: "Не вдалося підключитися до бекенду" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  return updateSavedStory(request, context, "POST");
}
export async function DELETE(request: Request, context: RouteContext) {
  return updateSavedStory(request, context, "DELETE");
}
