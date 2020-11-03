import { getBlock } from './slack';
import {
  cacheNetworkChange,
  cacheServiceQuality,
  cacheSequencer,
  cacheWebApplication,
  cacheTest,
  dataFactory,
} from './appneta';

// Static headers for all responses.
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/**
 * Handle form submission request & respond with a static but contextual JSON response.
 */
async function handleRequest(request: Request): Promise<Response> {
  const data = await request.json();
  try {
    const cacheResult = await dataFactory(data, {
      NETWORK_CHANGE_EVENT: cacheNetworkChange,
      WEB_PATH_SQA_EVENT: cacheWebApplication,
      SEQUENCER_EVENT: cacheSequencer,
      SQA_EVENT: cacheServiceQuality,
      TEST_EVENT: cacheTest,
    });
    if (cacheResult === null) {
      return new Response(JSON.stringify({ message: 'Data matches cached value.', data }), {
        status: 200,
        headers,
      });
    }

    const slackMessage = getBlock(data);
    // return new Response(JSON.stringify({ data: slackMessage }), { status: 200, headers });

    return await fetch(SLACK_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(slackMessage),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
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
    return new Response(null, { headers });
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
