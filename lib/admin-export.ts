import { getAdminToken } from '@/lib/auth';
import { API_BASE } from '@/lib/api';

export type ExportFormat = 'pdf' | 'csv';

export const ANALYTICS_EXPORT_SECTIONS = [
  { id: 'summary', label: 'Synthèse KPIs' },
  { id: 'messaging', label: 'Messagerie' },
  { id: 'calls', label: 'Appels' },
  { id: 'stories', label: 'Stories' },
  { id: 'meetings', label: 'Réunions' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'conversations', label: 'Conversations' },
  { id: 'devices', label: 'Appareils' },
  { id: 'heatmap', label: 'Heures de pointe' },
] as const;

export type AnalyticsSectionId = (typeof ANALYTICS_EXPORT_SECTIONS)[number]['id'];

export interface AdminExportParams {
  [key: string]: string | number | undefined;
}

export interface AdminExportResult {
  blob: Blob;
  filename: string;
  bytes: number;
  mimeType: string;
}

/** Chemins backend (fallback serveur) */
const BACKEND_EXPORT_PATHS = {
  users: '/admin/users/export',
  analytics: '/admin/analytics/export',
} as const;

export type ExportResource = keyof typeof BACKEND_EXPORT_PATHS;

function parseFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) return fallback;
  const match = /filename="([^"]+)"/i.exec(contentDisposition);
  return match?.[1] || fallback;
}

function resolveExportUrl(resource: ExportResource, params: AdminExportParams): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') qs.set(key, String(value));
  }
  const query = qs.toString();

  // L'API est à la même origine (alanyavox.com/api) : plus besoin de relais.
  return `${API_BASE}${BACKEND_EXPORT_PATHS[resource]}${query ? `?${query}` : ''}`;
}

async function parseErrorResponse(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const body = await res.json();
      if (body?.error) return String(body.error);
    } catch {
      /* ignore */
    }
  }
  if (res.status === 404) {
    return 'Endpoint d\'export introuvable. Redéployez le backend avec les routes export.';
  }
  if (res.status === 401) {
    return 'Session expirée — reconnectez-vous.';
  }
  return `Export échoué (${res.status})`;
}

/** Récupère un export admin sans déclencher le téléchargement. */
export async function fetchAdminExport(
  resource: ExportResource,
  params: AdminExportParams,
  fallbackFilename: string,
): Promise<AdminExportResult> {
  const token = getAdminToken();
  if (!token) throw new Error('Non authentifié');

  const url = resolveExportUrl(resource, params);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  } catch {
    throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
  }

  if (!res.ok) {
    throw new Error(await parseErrorResponse(res));
  }

  const blob = await res.blob();
  if (blob.size === 0) {
    throw new Error('Le fichier généré est vide.');
  }

  const blobType = blob.type || '';
  if (blobType.includes('json')) {
    try {
      const body = JSON.parse(await blob.text());
      throw new Error(body?.error || 'Export échoué');
    } catch (e) {
      if (e instanceof Error && e.message !== 'Export échoué') throw e;
      throw new Error('Export échoué');
    }
  }

  const filename = parseFilename(res.headers.get('Content-Disposition'), fallbackFilename);
  const mimeType = blob.type || res.headers.get('Content-Type') || 'application/octet-stream';

  return { blob, filename, bytes: blob.size, mimeType };
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

export async function downloadAdminExport(
  resource: ExportResource,
  params: AdminExportParams,
  fallbackFilename: string,
): Promise<{ filename: string; bytes: number }> {
  const result = await fetchAdminExport(resource, params, fallbackFilename);
  triggerBlobDownload(result.blob, result.filename);
  return { filename: result.filename, bytes: result.bytes };
}

export function buildUsersExportParams(
  filters: AdminExportParams,
  options: { format: ExportFormat; limit: number | 'all' },
): AdminExportParams {
  return {
    ...filters,
    format: options.format,
    limit: options.limit === 'all' ? 'all' : options.limit,
  };
}

export function buildAnalyticsExportParams(
  filters: AdminExportParams,
  options: { sections: AnalyticsSectionId[] },
): AdminExportParams {
  return {
    ...filters,
    format: 'pdf',
    sections: options.sections.join(','),
  };
}

export function parseCsvPreview(text: string, maxRows = 12): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { headers: [], rows: [] };

  function splitLine(line: string): string[] {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells;
  }

  const headers = splitLine(lines[0]);
  const rows = lines.slice(1, 1 + maxRows).map(splitLine);
  return { headers, rows };
}

export function formatExportSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
