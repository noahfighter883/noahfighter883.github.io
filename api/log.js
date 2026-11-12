const { logEvent, clip } = require('./_log');

const ALLOWED_ORIGINS = [
  'https://noahfighter883.github.io',
  'https://noahfighter883-github-io.vercel.app',
];
const BOT_PATTERN = /bot|crawl|spider|preview|slurp|headless|monitor/i;

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ALLOWED_ORIGINS.indexOf(origin) !== -1;

  if (allowed) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST' || !allowed || BOT_PATTERN.test(req.headers['user-agent'] || '')) {
    res.status(204).end();
    return;
  }

  let data = req.body;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (err) {
      data = {};
    }
  }
  data = data || {};

  await logEvent({
    type: 'view',
    path: clip(data.path, 100),
    referrer: clip(data.referrer, 100),
    host: clip(data.host, 100),
    device: data.mobile ? 'mobile' : 'desktop',
    lang: clip(data.lang, 20),
    country: clip(req.headers['x-vercel-ip-country'], 4),
  });

  res.status(204).end();
};
