import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchGroups, fetchGroupDetail, deleteGroup } from '@/lib/mock-data';

export function useGroups() {
  return useQuery({
    queryKey: ['admin-groups'],
    queryFn: fetchGroups,
  });
}

export function useGroupDetail(id: string) {
  return useQuery({
    queryKey: ['admin-group-detail', id],
    queryFn: () => fetchGroupDetail(id),
    enabled: !!id,
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGroup(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-groups'] }),
  });
}
