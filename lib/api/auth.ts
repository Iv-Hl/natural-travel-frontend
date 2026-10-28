import axios from "axios";

type AuthResponse = {
  message?: string;
};

function localizeAuthError(message?: string) {
  if (message === "User with this email already exists") {
    return "Користувач із таким email уже зареєстрований";
  }
  if (message === "Invalid credentials" || message === "Unauthorized") {
    return "Неправильний email або пароль";
  }
  return message || "Не вдалося виконати запит. Спробуйте ще раз.";
}

export async function submitAuthForm(
  endpoint: "/api/auth/register" | "/api/auth/login",
  values: Record<string, string>,
) {
  try {
    await axios.post<AuthResponse>(endpoint, values, {
      withCredentials: true,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (axios.isAxiosError<AuthResponse>(error)) {
      if (!error.response) {
        throw new Error("Не вдалося з’єднатися із сервером. Спробуйте ще раз.");
      }
      throw new Error(localizeAuthError(error.response.data?.message));
    }
    throw new Error("Не вдалося виконати запит. Спробуйте ще раз.");
  }
}
