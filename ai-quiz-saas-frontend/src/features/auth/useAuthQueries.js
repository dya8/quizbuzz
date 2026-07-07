import { useMutation } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';

export const useLogin = () => {
  const { login } = useAuth();
  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    },
   onSuccess: (data) => {
  login(
    data.data.user,
    data.data.accessToken,
    data.data.refreshToken
  );
},
  });
};

export const useRegister = () => {
  const { login } = useAuth();
  return useMutation({
    mutationFn: async ({ name, email, password, role }) => {
      const response = await apiClient.post('/auth/register', { name, email, password, role });
      return response.data;
    },
    onSuccess: (data) => {
  login(
    data.data.user,
    data.data.accessToken,
    data.data.refreshToken
  );
},
  });
};
