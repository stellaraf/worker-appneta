import title from 'title';

const eventTypeMap = {
  SQA_EVENT: 'Service Quality Event',
  SEQUENCER_EVENT: 'Sequencer Event',
  NETWORK_CHANGE_EVENT: 'Network Change Event',
  TEST_EVENT: 'Test Event',
  WEB_PATH_SQA_EVENT: 'Web Application Event',
} as { [key in AppNeta.EventType]: string };

const serviceQualityMap = {
  SQA_NOT_VIOLATED:
    'The target is responding to test packets, and the path is not violating any alert thresholds.',
  INDETERMINATE: 'The path status is unknown.',
  SQA_VIOLATED:
    'The target is responding to test packets, but the path is violating one or more alert thresholds.',
  DISABLED: 'Monitoring is disabled on the path.',
} as { [key in AppNeta.ServiceQuality]: string };

/**
 * Map the event type shorthand sent by AppNeta to a more readable string.
 */
export function getEventType(eventType: AppNeta.EventType): string {
  let result = 'Unknown Event Type';
  if (eventType in Object.keys(eventTypeMap)) {
    result = eventTypeMap[eventType];
  }
  return makeTitle(result);
}

/**
 * Map the SQA Status shorthand sent by AppNeta to AppNet's description from the docs.
 */
export function getServiceQualityStatus(status: AppNeta.ServiceQuality): string {
  let result = 'Unknown Target Status';
  if (status in Object.keys(serviceQualityMap)) {
    result = serviceQualityMap[status];
  }
  return makeTitle(result);
}

/**
 * Determine if the event is a Test Event.
 */
export function isTestEvent(event: AppNeta.Events): event is AppNeta.TestEvent {
  return event.type === 'TEST_EVENT';
}

/**
 * Determine if the event is a Sequencer Event.
 */
export function isSequencerEvent(event: AppNeta.Events): event is AppNeta.SequencerEvent {
  return event.type === 'SEQUENCER_EVENT';
}

/**
 * Determine if the event is a Service Quality Event.
 */
export function isServiceQualityEvent(event: AppNeta.Events): event is AppNeta.ServiceQualityEvent {
  return event.type === 'SQA_EVENT';
}

/**
 * Determine if the event is a Service Quality Event.
 */
export function isNetworkChangeEvent(event: AppNeta.Events): event is AppNeta.NetworkChangeEvent {
  return event.type === 'NETWORK_CHANGE_EVENT';
}

/**
 * Determine if the event is a Service Quality Event.
 */
export function isWebApplicationEvent(event: AppNeta.Events): event is AppNeta.WebApplicationEvent {
  return event.type === 'WEB_PATH_SQA_EVENT';
}

/**
 * Correctly capitalize a string, with special overrides for known terminology.
 */
export function makeTitle(source: string): string {
  if (typeof source !== 'string') {
    return '';
  }
  return title(source.replaceAll('_', ' '), {
    special: ['MOS', 'RTT', 'QoS', 'HTTP', 'DHCP', 'SQA', 'NA', 'IP', 'IPv4', 'IPv6', 'BGP', 'ASN'],
  });
}
