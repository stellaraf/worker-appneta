import { makeTitle } from './title';

/**
 * Map the event type shorthand sent by AppNeta to a more readable string.
 */
export function getEventType(eventType: AppNeta.EventType): string {
  const eventTypeMap = {
    SQA_EVENT: 'Service Quality Event',
    SEQUENCER_EVENT: 'Sequencer Event',
    NETWORK_CHANGE_EVENT: 'Network Change Event',
    TEST_EVENT: 'Test Event',
    WEB_PATH_SQA_EVENT: 'Web Application Event',
  } as { [key in AppNeta.EventType]: string };

  let result = 'Unknown Event Type';

  if (eventType in eventTypeMap) {
    result = eventTypeMap[eventType];
  }

  return makeTitle(result);
}

/**
 * Map the SQA Status shorthand sent by AppNeta to AppNet's description from the docs.
 */
export function getServiceQualityStatus(status: AppNeta.ServiceQuality): string {
  const serviceQualityMap = {
    SQA_NOT_VIOLATED:
      'The target is responding to test packets, and the path is not violating any alert thresholds.',
    INDETERMINATE: 'The path status is unknown.',
    SQA_VIOLATED:
      'The target is responding to test packets, but the path is violating one or more alert thresholds.',
    DISABLED: 'Monitoring is disabled on the path.',
  } as { [key in AppNeta.ServiceQuality]: string };

  let result = 'Unknown Target Status';

  if (status in serviceQualityMap) {
    result = serviceQualityMap[status];
  }

  return result;
}
