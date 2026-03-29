import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./api";
import { mapUserToModel } from "./mapper";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useMeQuery = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const data = await authApi.getMe();
      return mapUserToModel(data);
    },
    retry: false,
  });
};

export const useUpdateProfileMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => 
      authApi.resetPassword(token, password),
  });
};
