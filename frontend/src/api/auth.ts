import { apiClient } from "./client";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (data: LoginInput): Promise<{ user: string }> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<{ user: string }> => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },
};
