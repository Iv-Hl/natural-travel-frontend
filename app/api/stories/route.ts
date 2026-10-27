import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const backendUrl = process.env.BACKEND_API_URL ?? "http://localhost:3000";

  const requestUrl = new URL(request.url);
  const targetUrl = new URL("/api/stories", backendUrl);

  targetUrl.search = requestUrl.search;

  try {
    const upstream = await fetch(targetUrl, {
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

export async function POST(request: Request) {
  // Перевіряємо Origin до читання та обробки тіла запиту.
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);

  // Відхиляємо запит, якщо Origin відсутній
  // або не збігається з origin поточного запиту.
  if (!origin || origin !== requestUrl.origin) {
    return NextResponse.json(
      { message: "Forbidden: invalid Origin" },
      { status: 403 },
    );
  }

  // Отримуємо адресу бекенду та прибираємо кінцеві слеші.
  const backendUrl = (
    process.env.BACKEND_API_URL ?? "http://localhost:3000"
  ).replace(/\/+$/, "");

  // Підтримуємо обидва формати BACKEND_API_URL:
  // із /api наприкінці та без нього.
  const targetUrl = backendUrl.endsWith("/api")
    ? `${backendUrl}/stories`
    : `${backendUrl}/api/stories`;

  try {
    // Читаємо FormData, що містить текстові поля та файл зображення.
    const formData = await request.formData();

    // Отримуємо cookies, які браузер передав цьому запиту.
    const cookieHeader = request.headers.get("cookie") ?? "";

    // Залишаємо тільки sessionId та accessToken.
    // refreshToken та всі сторонні cookies відкидаємо.
    const allowedCookies = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .filter((cookie) => {
        // Знаходимо роздільник між назвою cookie та її значенням.
        const separatorIndex = cookie.indexOf("=");

        // Пропускаємо некоректні записи.
        if (separatorIndex === -1) return false;

        const name = cookie.slice(0, separatorIndex).trim();

        // Дозволяємо передавати лише cookies, потрібні для авторизації.
        return name === "sessionId" || name === "accessToken";
      });

    // Створюємо заголовки для запиту до бекенду.
    const headers = new Headers({
      Accept: "application/json",
    });

    // Додаємо Cookie лише тоді, коли є дозволені cookies.
    if (allowedCookies.length > 0) {
      headers.set("Cookie", allowedCookies.join("; "));
    }

    // Передаємо дані форми та дозволені cookies бекенду.
    const upstream = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: formData,
      cache: "no-store",

      // Перериваємо запит, якщо він триває понад 15 секунд.
      signal: AbortSignal.timeout(15_000),

      // Не переходимо автоматично за перенаправленням бекенду.
      redirect: "manual",
    });

    // Повертаємо відповідь бекенду зі статусом і типом вмісту.
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    // Обробляємо недоступність бекенду, timeout
    // та помилки під час читання або пересилання запиту.
    return NextResponse.json(
      { message: "Сервер тимчасово недоступний. Спробуйте пізніше." },
      { status: 502 },
    );
  }
}
