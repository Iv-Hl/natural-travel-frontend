import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  const response = await fetch("/api/categories", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Не вдалося завантажити категорії");
  }

  return response.json() as Promise<Category[]>;
}
