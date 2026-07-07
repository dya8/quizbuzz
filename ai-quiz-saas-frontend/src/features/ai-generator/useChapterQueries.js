import { useMutation } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';

export const useUploadChapter = () => {
  return useMutation({
    mutationFn: async ({ file, title, subject }) => {
      const formData = new FormData();

      formData.append('pdf', file);
      formData.append('title', title);
      formData.append('subject', subject);

      console.log({
  fileName: file?.name,
  title,
  subject
});
      const response = await apiClient.post(
        '/chapters/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
  });
};