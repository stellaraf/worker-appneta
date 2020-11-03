import { getBlock } from './slack';

// Static headers for all responses.
const RES_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Handle form submission request & respond with a static but contextual JSON response.
 */
async function handleRequest(request: Request): Promise<Response> {
  const data = await request.json();
  const slackMessage = getBlock(data);
  return await fetch(SLACK_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(slackMessage),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  });
}

/**
 * Handle CORS preflight.
 */
async function handleCors(request: Request): Promise<Response> {
  if (
    request.headers.get('Origin') &&
    request.headers.get('Access-Control-Request-Method') &&
    request.headers.get('Access-Control-Request-Headers')
  ) {
    return new Response(null, { headers: RES_HEADERS });
  } else {
    return new Response(null, { headers: { Allow: 'POST, OPTIONS' } });
  }
}

/**
 * Worker event listener.
 */
addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(handleCors(event.request));
  } else {
    event.respondWith(handleRequest(event.request));
  }
});
