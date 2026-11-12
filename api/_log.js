function clip(value, max) {
  return String(value == null ? '' : value).slice(0, max);
}

async function logEvent(event) {
  const url = process.env.LOG_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: JSON.stringify({
        secret: process.env.LOG_WEBHOOK_SECRET || '',
        time: new Date().toISOString(),
        ...event,
      }),
    });
  } catch (err) {
    console.error('Log webhook failed', err);
  }
}

module.exports = { logEvent, clip };
