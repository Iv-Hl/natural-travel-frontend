import axios from "axios";

export interface Traveller {
  _id: string;
  name: string;
  avatarUrl: string;
  articlesAmount: number;
}

export interface GetTravellerResponse {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  users: Traveller[];
}

export const getTravellers = async (
  page = 1,
  limit = 12,
): Promise<GetTravellerResponse> => {
  const response = await axios.get<GetTravellerResponse>("/api/users", {
    params: { page, limit },
  });

  return response.data;
};

export interface GetTravellerByIdResponse {
  user: Traveller;
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export const getTravellerById = async (
  userId: string,
): Promise<GetTravellerByIdResponse> => {
  const response = await axios.get<GetTravellerByIdResponse>(
    `/api/users/${encodeURIComponent(userId)}`,
  );

  return response.data;
};
// Додаэмо для публічного тревел пейдж
export interface GetTravellerStoriesResponse {
  user: Traveller;
  stories: TravellerStory[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

// Окремий тип історії, яку повертає бекенд
export interface TravellerStory {
  _id: string;
  title: string;
  img: string;
  date: string;
  ownerId: string;
  rate: number;
}

export const getTravellerStories = async (
  userId: string,
  page = 1,
  perPage = 6,
  signal?: AbortSignal,
) => {
  const response = await axios.get<GetTravellerStoriesResponse>(
    `/api/users/${encodeURIComponent(userId)}`,
    {
      params: { page, perPage },
      signal,
    },
  );

  return response.data;
};
