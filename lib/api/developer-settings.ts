import { DeveloperSettings } from '@/types';
import { api } from '@/lib/api';

export async function fetchDeveloperSettings(): Promise<DeveloperSettings> {
  const res = await api.get('/admin/developer-settings');
  return res.data as DeveloperSettings;
}

/**
 * Change le nombre d'enseignes qu'une personne peut créer dans l'espace
 * développeur. Réservé au super-admin côté serveur (`settings.write`).
 * Effet immédiat sur les créations suivantes.
 */
export async function updateDeveloperSettings(enseignesParPersonne: number): Promise<DeveloperSettings> {
  const res = await api.put('/admin/developer-settings', { enseignesParPersonne });
  return res.data as DeveloperSettings;
}
