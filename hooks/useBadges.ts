import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchBadges, updateBadges, type ApparenceBadge } from '@/lib/api/badges';

export function useBadges() {
  return useQuery({ queryKey: ['admin-badges'], queryFn: fetchBadges });
}

export function useUpdateBadges() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (badges: Record<string, ApparenceBadge>) => updateBadges(badges),
    onSuccess: (data) => qc.setQueryData(['admin-badges'], data),
  });
}
