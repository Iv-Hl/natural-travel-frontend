import { proxyAuthRequest } from "@/lib/api/proxyAuthRequest";

export async function POST(request: Request) {
  return proxyAuthRequest(request, "/api/auth/login");
}
