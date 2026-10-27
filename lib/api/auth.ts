import axios from "axios";

type AuthResponse = {
  message?: string;
};

function localizeAuthError(message?: string) {
  if (message === "User with this email already exists") {
    return "РљРѕСЂРёСЃС‚СѓРІР°С‡ С–Р· С‚Р°РєРёРј email СѓР¶Рµ Р·Р°СЂРµС”СЃС‚СЂРѕРІР°РЅРёР№";
  }
  if (message === "Invalid credentials" || message === "Unauthorized") {
    return "РќРµРїСЂР°РІРёР»СЊРЅРёР№ email Р°Р±Рѕ РїР°СЂРѕР»СЊ";
  }
  return (
    message ||
    "РќРµ РІРґР°Р»РѕСЃСЏ РІРёРєРѕРЅР°С‚Рё Р·Р°РїРёС‚. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·."
  );
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
        throw new Error(
          "РќРµ РІРґР°Р»РѕСЃСЏ Р·вЂ™С”РґРЅР°С‚РёСЃСЏ С–Р· СЃРµСЂРІРµСЂРѕРј. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.",
        );
      }
      throw new Error(localizeAuthError(error.response.data?.message));
    }
    throw new Error(
      "РќРµ РІРґР°Р»РѕСЃСЏ РІРёРєРѕРЅР°С‚Рё Р·Р°РїРёС‚. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.",
    );
  }
}
