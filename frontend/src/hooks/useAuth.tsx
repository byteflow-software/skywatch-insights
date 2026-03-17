import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { setTokens, clearTokens, getAccessToken, getValidAccessToken } from '@/services/api';
import type { RegisterFormData, LoginFormData } from '@/lib/schemas/auth';
import type { UserProfile } from '@/lib/schemas/user';

export function useAuth() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/me');
      return data;
    },
    enabled: !!getValidAccessToken(),
    retry: 2,
    retryDelay: 500,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
  });

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    clearTokens();
    queryClient.clear();
    window.location.href = '/login';
  };

  return {
    user: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isAuthenticated: !!getValidAccessToken() && !!profileQuery.data,
    login: loginMutation,
    register: registerMutation,
    logout,
  };
}
