import queryString from 'query-string';
import { formatAsPath } from '../formatting';

const url = 'http://workercache.appneta.com';
const headers = new Headers({ 'Cache-Control': `max-age=${PERSISTENCE_TIME}` });

const CACHE = caches.default;

/**
 * Compare an event's "interesting" data to previous cached events' data. If there is a cache hit,
 * this indicates the alert has already been received & posted to Slack within the
 * PERSISTENCE_TIME, and should therefore be suppressed.
 */
export async function cacheCheck(query: any): Promise<boolean> {
  // Represent the interesting data as a URL, which is required by the cache API.
  const cacheKey = new Request(queryString.stringifyUrl({ url, query }));

  // Check the cache for a match.
  const cached = await CACHE.match(cacheKey);

  // If there is a cached entry matching the new entry, we should return an empty response.
  if (cached) {
    return true;
  }
  // Otherwise, write the entry to the cache.
  else {
    CACHE.put(cacheKey, new Response('', { headers }));
    return false;
  }
}

/**
 * Compare a network change's new AS Path to a cached change's old AS Path. If, within the
 * PERSISTENCE_TIME, they are the same, this indicates oscillation and we should suppress
 * the response so as not to annoy people.
 *
 * Because the Network Change even contains both old and new values per request, and those values
 * need to be cross-examined in the cache, the Network Change Event requires its own cache check
 * function (hence why it doesn't use the generic cache check function above.)
 */
export async function cacheNetworkChange<D extends AppNeta.NetworkChangeEvent>(
  data: D,
): Promise<Nullable<D>> {
  /**
   * Extract interesting values from the event. This ensures we're only suppressing events that are
   * truly duplicated.
   */
  const { newAsnSequence, oldAsnSequence, sequencerHost, target, tracerouteProtocol } = data;
  const newPath = formatAsPath(newAsnSequence);
  const oldPath = formatAsPath(oldAsnSequence);
  const baseKey = { protocol: tracerouteProtocol, source: sequencerHost, target };

  // Interesting values with the NEW AS Path, used for comparison.
  const newKey = { path: newPath, ...baseKey };

  // Interesting values with the OLD AS Path. Written to the cache for the next comparison.
  const oldKey = { path: oldPath, ...baseKey };

  // Check the cache for an entry matching the NEW AS Path.
  const cached = await CACHE.match(new Request(queryString.stringifyUrl({ url, query: newKey })));

  // If there is a cached entry matching the NEW AS Path, we should return an empty response.
  if (cached) {
    return null;
  }
  // Otherwise, write the OLD AS Path to the cache for the next comparison.
  else {
    CACHE.put(
      new Request(queryString.stringifyUrl({ url, query: oldKey })),
      new Response('', { headers }),
    );
  }
  return data;
}

export async function cacheServiceQuality<D extends AppNeta.ServiceQualityEvent>(
  data: D,
): Promise<Nullable<D>> {
  const { pathId, measuredValue } = data;
  const key = { pathId, measuredValue };
  const cached = await cacheCheck(key);
  if (cached) {
    return null;
  } else {
    return data;
  }
}

export async function cacheSequencer<D extends AppNeta.SequencerEvent>(
  data: D,
): Promise<Nullable<D>> {
  const { sequencerHost, sequencerStatus } = data;
  const key = { sequencerHost, sequencerStatus };
  const cached = await cacheCheck(key);
  if (cached) {
    return null;
  } else {
    return data;
  }
}

export async function cacheWebApplication<D extends AppNeta.WebApplicationEvent>(
  data: D,
): Promise<Nullable<D>> {
  const { sequencerHost, webAppId, webPathId, milestoneName, measuredParam, measuredValue } = data;
  const key = { sequencerHost, webAppId, webPathId, milestoneName, measuredParam, measuredValue };
  const cached = await cacheCheck(key);
  if (cached) {
    return null;
  } else {
    return data;
  }
}

export async function cacheTest<D extends AppNeta.TestEvent>(data: D): Promise<Nullable<D>> {
  const { sequencerHost, testId, testStatus } = data;
  const key = { sequencerHost, testId, testStatus };
  const cached = await cacheCheck(key);
  if (cached) {
    return null;
  } else {
    return data;
  }
}
