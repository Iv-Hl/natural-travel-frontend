import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL;

export async function GET() {
  if (!API_URL) {
    return NextResponse.json(
      { message: "BACKEND_API_URL is not configured" },
      { status: 500 },
    );
  }

  const baseUrl = API_URL.replace(/\/+$/, "");
  const categoriesUrl = baseUrl.endsWith("/api")
    ? `${baseUrl}/categories`
    : `${baseUrl}/api/categories`;

  try {
    const response = await fetch(categoriesUrl, {
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
    return NextResponse.json(
      { message: "Failed to connect to the backend." },
      { status: 502 },
    );
  }
}
