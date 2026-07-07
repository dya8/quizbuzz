import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';

export const useGetStudentDashboard = () => {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/student/dashboard');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useGetStudentQuizzes = (filters = {}) => {
  return useQuery({
    queryKey: ['student-quizzes', filters],
    queryFn: async () => {
      const response = await apiClient.get('/student/quizzes', { params: filters });
      return response.data;
    },
  });
};

export const useAttemptQuiz = (quizId) => {
  return useQuery({
    queryKey: ['quiz-attempt', quizId],
    queryFn: async () => {
      const response = await apiClient.get(`/student/quiz/${quizId}/start`);
      return response.data;
    },
    enabled: !!quizId,
    refetchOnWindowFocus: false,
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ quizId, answers, timeSpent }) => {
      const response = await apiClient.post(`/student/quiz/${quizId}/submit`, { answers, timeSpent });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-results', variables.quizId] });
    },
  });
};

export const useGetQuizResults = (attemptId) => {
  return useQuery({
    queryKey: ['quiz-results', attemptId],
    queryFn: async () => {
      const response = await apiClient.get(`/student/results/${attemptId}`);
      return response.data;
    },
    enabled: !!attemptId,
    refetchOnWindowFocus: false,
  });
};
