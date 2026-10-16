/**
 * Console de gestion d'Alanya Work, servie sous https://alanyavox.com/gestion
 * (process pm2 `alanya-gestion`, port 3002, relayé par nginx).
 *
 * ⚠️ `/gestion` ET NON UN SOUS-DOMAINE (décision du 15/10/2026) : l'API est
 * à la même origine (`/api/...`), donc ni CORS ni cookie inter-domaines.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/gestion',
};

export default nextConfig;
