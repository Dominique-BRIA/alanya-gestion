// pm2 : `pm2 start ecosystem.config.js && pm2 save`, depuis ~/alanya-gestion sur le VPS.
module.exports = {
  apps: [{
    name: 'alanya-gestion',
    script: 'npm',
    args: 'start -- -p 3002',
    cwd: '/home/ubuntu/alanya-gestion',
    env: { NODE_ENV: 'production', PORT: 3002 },
  }],
};
