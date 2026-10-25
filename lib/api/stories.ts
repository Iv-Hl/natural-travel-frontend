import axios from "axios";

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
