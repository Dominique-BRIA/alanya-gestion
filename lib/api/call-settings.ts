import { CallSettings, RelaisPrincipal } from '@/types';
import { api } from '@/lib/api';

export async function fetchCallSettings(): Promise<CallSettings> {
  const res = await api.get('/admin/call-settings');
  return res.data as CallSettings;
}

/**
 * Change le relais principal des appels. Réservé au super-admin côté serveur
 * (`settings.write`). Effet sur les appels suivants, sous 10 secondes.
 */
export async function updateCallSettings(
  payload: { relaisPrincipal: RelaisPrincipal },
): Promise<CallSettings> {
  const res = await api.put('/admin/call-settings', payload);
  return res.data as CallSettings;
}
