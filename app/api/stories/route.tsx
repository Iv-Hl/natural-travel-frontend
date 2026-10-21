import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export async function GET(request: Request) {
  try {
    if (!BACKEND_API_URL) {
      return NextResponse.json(
        { message: "BACKEND_API_URL не налаштовано" },
        { status: 500 },
      );
    }

    const requestUrl = new URL(request.url);

    const backendBaseUrl = BACKEND_API_URL.replace(/\/+$/, "");
    const backendUrl = `${backendBaseUrl}/api/stories${requestUrl.search}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Помилка отримання популярних статей:", error);

    return NextResponse.json(
      { message: "Не вдалося підключитися до backend" },
      { status: 500 },
    );
  }
}
