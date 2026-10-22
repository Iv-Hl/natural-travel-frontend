export class LogoutError extends Error {
  constructor(public readonly status: number | null) {
    super(
      status === 401
        ? "Сесію не підтверджено. Потрібне відновлення авторизації."
        : "Не вдалося вийти. Спробуйте ще раз.",
    );

    this.name = "LogoutError";
  }
}

export async function logoutUser(): Promise<void> {
  let response: Response;

  try {
    response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      redirect: "error",
    });
  } catch {
    throw new LogoutError(null);
  }

  if (response.status !== 204) {
    throw new LogoutError(response.status);
  }
}