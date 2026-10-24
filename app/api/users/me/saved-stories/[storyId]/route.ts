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
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

  const targetUrl = new URL(
    `/api/users/me/saved-stories/${encodeURIComponent(storyId)}`,
    backendUrl,
  );

  const cookie = request.headers.get("cookie");

  try {
    const response = await fetch(targetUrl, {
      method,
      headers: cookie ? { Cookie: cookie } : {},
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
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

export async function POST(request: NextRequest, context: RouteContext) {
  const { storyId } = await context.params;
  return proxySavedStory(request, storyId, "POST");
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { storyId } = await context.params;
  return proxySavedStory(request, storyId, "DELETE");
}
