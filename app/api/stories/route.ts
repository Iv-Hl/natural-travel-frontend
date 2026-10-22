import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL;

export async function POST(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "BACKEND_API_URL is not configured" },
      { status: 500 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid form data." },
      { status: 400 },
    );
  }

  const baseUrl = API_URL.replace(/\/+$/, "");
  const storiesUrl = baseUrl.endsWith("/api")
    ? `${baseUrl}/stories`
    : `${baseUrl}/api/stories`;

  try {
    const response = await fetch(storiesUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        cookie: request.headers.get("cookie") ?? "",
      },
      body: formData,
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
