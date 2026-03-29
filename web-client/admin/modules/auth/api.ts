import { httpClient } from "@/lib/http";
import { ILoginPayload, ILoginResponse, IRegisterPayload, IUser, IChangePasswordPayload, IUpdateProfilePayload } from "./types";

export const authApi = {
  login: (payload: ILoginPayload) =>
    httpClient.post<ILoginResponse>("/auth/login", payload) as any,
    
  register: (payload: IRegisterPayload) =>
    httpClient.post<ILoginResponse>("/auth/register", payload) as any,
    
  getMe: () => 
    httpClient.get<IUser>("/auth/me") as any,
    
  updateProfile: (payload: IUpdateProfilePayload) =>
    httpClient.put<IUser>("/auth/profile", payload) as any,
    
  changePassword: (payload: IChangePasswordPayload) =>
    httpClient.put("/auth/change-password", payload) as any,
    
  forgotPassword: (email: string) =>
    httpClient.post("/auth/forgot-password", { email }) as any,
    
  resetPassword: (token: string, password: string) =>
    httpClient.post(`/auth/reset-password/${token}`, { password }) as any,
};
