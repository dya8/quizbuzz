import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';

export const useGenerateQuestions = () => {
  return useMutation({
 mutationFn: async ({
  chapterId,
  numQuestions,
  difficulty,
  quizType,
}) => {



  const payload = {
    chapterId,
    type: quizType,
    difficulty,
    count: numQuestions,
  };

  const response = await apiClient.post(
    '/questions/generate',
    payload
  );

  return response.data;
},

    onError: (err) => {
      console.log('ERROR RESPONSE:', err.response?.data);
    },
  });
};
export const useGetQuestionsByBatch = (batchId) => {
  return useQuery({
    queryKey: ['questions', batchId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/questions?generationBatchId=${batchId}`
      );

      return response.data;
    },
    enabled: !!batchId,
  });
};