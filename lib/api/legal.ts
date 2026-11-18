import { api } from '@/lib/api';

/** Une page légale telle que le serveur la rend (18/11/2026). */
export interface PageLegale {
  slug: 'confidentialite' | 'conditions';
  titre: string;
  contenu: string;
  version: number;
  majLe: string | null;
  /** Vrai tant que rien n'a été enregistré : c'est la version d'origine. */
  parDefaut: boolean;
}

export async function fetchPagesLegales(): Promise<PageLegale[]> {
  const res = await api.get('/admin/legal');
  return res.data as PageLegale[];
}

/** Enregistre une NOUVELLE VERSION (la version monte, l'audit garde la trace). */
export async function updatePageLegale(
  slug: PageLegale['slug'],
  payload: { titre: string; contenu: string },
): Promise<PageLegale> {
  const res = await api.put(`/admin/legal/${slug}`, payload);
  return res.data as PageLegale;
}
