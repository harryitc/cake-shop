import { httpClient } from "@/lib/http";
import { ILoginResponse, IUpdateProfilePayload, IUser } from "./types";

export const authApi = {
  login: (payload: any) => 
    httpClient<ILoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload: any) => 
    httpClient<ILoginResponse>("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => 
    httpClient<IUser>("/auth/me", { method: "GET" }),
  updateProfile: (payload: IUpdateProfilePayload) => 
    httpClient<IUser>("/auth/profile", { method: "PUT", body: JSON.stringify(payload) }),
  changePassword: (payload: any) => 
    httpClient("/auth/change-password", { method: "PUT", body: JSON.stringify(payload) }),
  forgotPassword: (email: string) => 
    httpClient("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) => 
    httpClient(`/auth/reset-password/${token}`, { method: "POST", body: JSON.stringify({ password }) }),
};
