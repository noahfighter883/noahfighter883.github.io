const { logEvent, clip } = require('./_log');

const ALLOWED_ORIGINS = [
  'https://noahfighter883.github.io',
  'https://noahfighter883-github-io.vercel.app',
];
const BOT_PATTERN = /bot|crawl|spider|preview|slurp|headless|monitor/i;
const HOST_PATTERN = /^[A-Za-z0-9.-]*$/;

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

  const path = clip(data.path, 100);
  const referrer = clip(data.referrer, 100);
  const host = clip(data.host, 100);
  const lang = clip(data.lang, 20);

  if (!/^[\w\-./%~]*$/.test(path) || !HOST_PATTERN.test(referrer) || !HOST_PATTERN.test(host) || !/^[A-Za-z-]*$/.test(lang)) {
    res.status(204).end();
    return;
  }

  await logEvent({
    type: 'view',
    path,
    referrer,
    host,
    device: data.mobile ? 'mobile' : 'desktop',
    lang,
    country: clip(req.headers['x-vercel-ip-country'], 4),
  });

  res.status(204).end();
};
