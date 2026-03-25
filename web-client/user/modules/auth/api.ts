import { httpClient } from "@/lib/http";
import { IAuthResponse, ILoginPayload, IRegisterPayload } from "./types";

export const authApi = {
  register: (payload: IRegisterPayload) => {
    return httpClient<IAuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login: (payload: ILoginPayload) => {
    return httpClient<IAuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
