let refreshPromise: Promise<number | null> | null = null;

async function refreshSession(): Promise<number | null> {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((response) => response.status)
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function fetchWithAuth(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const requestInit: RequestInit = {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  };

  const response = await fetch(input, requestInit);
  if (response.status !== 401) return response;

  const refreshStatus = await refreshSession();

  if (refreshStatus === 401) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return response;
  }

  if (refreshStatus === null || refreshStatus < 200 || refreshStatus >= 300) {
    const status =
      refreshStatus !== null && refreshStatus >= 500 ? refreshStatus : 502;
    return Response.json(
      { message: "Не вдалося оновити сесію. Спробуйте ще раз." },
      { status },
    );
  }

  const retriedResponse = await fetch(input, requestInit);
  if (retriedResponse.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth:expired"));
  }
  return retriedResponse;
}
