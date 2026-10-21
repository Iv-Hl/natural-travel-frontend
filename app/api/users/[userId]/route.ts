import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { userId } = await params;
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(
      new URL(
        `/api/users/${encodeURIComponent(userId)}`,
        backendUrl.replace(/\/+$/, ""),
      ),
      {
        method: "GET",
        cache: "no-store",
      },
    );

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Не вдалося з’єднатися із сервером." },
      { status: 502 },
    );
  }
}
