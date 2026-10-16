import { useQuery } from '@tanstack/react-query';
import { fetchUserDetail, fetchUserActivity, fetchUserLogins } from '@/lib/mock-data';

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: () => fetchUserDetail(id),
    enabled: !!id,
  });
}

export function useUserActivity(id: string) {
  return useQuery({
    queryKey: ['admin-user-activity', id],
    queryFn: () => fetchUserActivity(id),
    enabled: !!id,
  });
}

export function useUserLogins(id: string) {
  return useQuery({
    queryKey: ['admin-user-logins', id],
    queryFn: () => fetchUserLogins(id),
    enabled: !!id,
  });
}
