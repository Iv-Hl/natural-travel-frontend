import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ storyId: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { storyId } = await params;
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

  try {
    const targetUrl = new URL(
      `/api/stories/${encodeURIComponent(storyId)}/recommendations`,
      backendUrl,
    );
    targetUrl.searchParams.set("limit", "3");

    const upstream = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
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
