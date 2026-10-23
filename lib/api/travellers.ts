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
  const response = await axios.get<GetTravellerResponse>(
    "/api/users",
    {
      params: { page, limit },
    },
  );

  return response.data;
};