import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

  try {
    const upstream = await fetch(new URL("/api/categories", backendUrl), {
      headers: {
        Accept: "application/json",
      },
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
