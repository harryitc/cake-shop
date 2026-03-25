import { httpClient } from "@/lib/http";
import { IAuthResponse, ILoginPayload } from "./types";

export const authApi = {
  login: (payload: ILoginPayload) => {
    return httpClient<IAuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
