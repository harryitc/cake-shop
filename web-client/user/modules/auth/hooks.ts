import { useMutation } from "@tanstack/react-query";
import { authApi } from "./api";
import { ILoginPayload, IRegisterPayload } from "./types";

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (payload: IRegisterPayload) => authApi.register(payload),
  });
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: ILoginPayload) => authApi.login(payload),
  });
};
