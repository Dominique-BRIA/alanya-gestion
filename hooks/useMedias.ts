import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMediaItems, deleteMedia } from '@/lib/mock-data';

export function useMediaItems() {
  return useQuery({
    queryKey: ['admin-media'],
    queryFn: fetchMediaItems,
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-media'] }),
  });
}
