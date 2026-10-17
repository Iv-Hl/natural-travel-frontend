type AuthResponse = {
  message?: string;
};

export async function submitAuthForm(
  endpoint: "/api/auth/register" | "/api/auth/login",
  values: Record<string, string>,
) {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(values),
    });
  } catch {
    throw new Error("Не вдалося з’єднатися із сервером. Спробуйте ще раз.");
  }

  const result = (await response.json().catch(() => ({}))) as AuthResponse;

  if (!response.ok) {
    const message = result.message;
    const localizedMessage =
      message === "User with this email already exists"
        ? "Користувач із таким email уже зареєстрований"
        : message === "Invalid credentials"
          ? "Неправильний email або пароль"
          : message || "Не вдалося виконати запит. Спробуйте ще раз.";

    throw new Error(localizedMessage);
  }
}
