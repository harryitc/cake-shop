import { useMutation } from "@tanstack/react-query";
import { authApi } from "./api";
import { ILoginPayload } from "./types";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: ILoginPayload) => authApi.login(payload),
  });
};
