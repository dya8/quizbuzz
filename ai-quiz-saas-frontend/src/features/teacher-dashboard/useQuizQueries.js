import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';

export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizData) => {

   
      const response = await apiClient.post('/quizzes', quizData);

      return response.data;
    },

    onError: (err) => {
      console.log("QUIZ ERROR:", err.response?.data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
};
export const usePublishQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quizId, isPublished }) => {
      const response = await apiClient.patch(`/quizzes/${quizId}/publish`, { isPublished });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', variables.quizId] });
    },
  });
};

export const useGetAnalytics = (role, id = null) => {
  return useQuery({
    queryKey: ['analytics', role, id],
    queryFn: async () => {
      const url = role === 'teacher'
        ? '/teacher/analytics'
        : id
          ? `/analytics/${role}/${id}`
          : `/analytics/${role}`;
      const response = await apiClient.get(url);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useGetTeacherDashboard = () => {
  return useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/teacher/dashboard');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useGetQuizzes = () => {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const response = await apiClient.get('/quizzes/my');
      return response.data;
    },
  });
};
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId) => {
      await apiClient.delete(`/quizzes/${quizId}`);
      return quizId;
    },

    onSuccess: (quizId) => {
      queryClient.setQueryData(["quizzes"], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: oldData.data.filter(
            (quiz) => quiz._id !== quizId
          ),
        };
      });
    },
  });
};