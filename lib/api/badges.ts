import { api } from '@/lib/api';

/** Un badge tel que le serveur le dessine à côté des noms (backend `src/lib/badges.ts`). */
export interface ApparenceBadge {
  actif: boolean;
  /** Chemin servi par le backend (`/badges/…`) ou URL https complète. */
  image: string;
  libelle: string;
}

export interface BadgeConfig extends ApparenceBadge {
  type: 'officiel' | 'verifie';
  defaut: ApparenceBadge;
}

export interface BadgesState {
  baseUrl: string;
  badges: BadgeConfig[];
}

export async function fetchBadges(): Promise<BadgesState> {
  const res = await api.get('/admin/badges');
  return res.data as BadgesState;
}

export async function updateBadges(badges: Record<string, ApparenceBadge>): Promise<BadgesState> {
  const res = await api.put('/admin/badges', { badges });
  return res.data as BadgesState;
}
