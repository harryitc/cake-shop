import { httpClient } from "@/lib/http";
import { ILoginPayload, ILoginResponse, IRegisterPayload, IUser, IChangePasswordPayload, IUpdateProfilePayload } from "./types";

export const authApi = {
  login: (payload: ILoginPayload) =>
    httpClient.post<ILoginResponse>("/auth/login", payload),
    
  register: (payload: IRegisterPayload) =>
    httpClient.post<ILoginResponse>("/auth/register", payload),
    
  getMe: () => 
    httpClient.get<IUser>("/auth/me"),
    
  updateProfile: (payload: IUpdateProfilePayload) =>
    httpClient.put<IUser>("/auth/profile", payload),
    
  changePassword: (payload: IChangePasswordPayload) =>
    httpClient.put("/auth/change-password", payload),
    
  forgotPassword: (email: string) =>
    httpClient.post("/auth/forgot-password", { email }),
    
  resetPassword: (token: string, password: string) =>
    httpClient.post(`/auth/reset-password/${token}`, { password }),
};
