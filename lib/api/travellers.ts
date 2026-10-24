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
  stories: import("@/components/stories/StoryCard").Story[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export const getTravellerStories = async (
  userId: string,
  page = 1,
  perPage = 6,
): Promise<GetTravellerStoriesResponse> => {
  const response = await axios.get<GetTravellerStoriesResponse>(
    `/api/users/${encodeURIComponent(userId)}`,
    {
      params: { page, perPage },
    },
  );

  return response.data;
};
