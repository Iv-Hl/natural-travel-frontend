import axios from "axios";
import { fetchWithAuth } from "@/lib/api/fetchWithAuth";

export interface Category {
  id: string;
  category: string;
}

export interface Story {
  _id: string;
  img: string;
  title: string;
  article: string;
  category: string;
  rate: number;
  ownerId: {
    _id: string;
    name: string;
  };
  date: string;
}

export interface StoriesMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface StoriesResponse {
  status: string;
  code: number;
  data: {
    stories: Story[];
    meta: StoriesMeta;
  };
}

export async function getCategories(): Promise<Category[]> {
  const response = await axios.get<Category[]>("/api/categories");
  return response.data;
}

export async function getStories({
  page = 1,
  limit = 10,
  category,
}: {
  page?: number;
  limit?: number;
  category?: string;
} = {}): Promise<StoriesResponse["data"]> {
  const response = await axios.get<StoriesResponse>("/api/stories", {
    params: {
      page,
      limit,
      ...(category ? { category } : {}),
    },
  });

  return response.data.data;
}

export async function createStory(formData: FormData): Promise<unknown> {
  const response = await fetchWithAuth("/api/stories", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message ?? "Не вдалося створити історію");
  }

  return data;
}
