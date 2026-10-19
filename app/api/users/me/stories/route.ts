import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  const { searchParams } = request.nextUrl;

  try {
    const response = await fetch(
      `${API_URL}/api/users/me/stories?${searchParams.toString()}`,
      {
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Не вдалося підключитися до бекенду" },
      { status: 502 },
    );
  }
}
