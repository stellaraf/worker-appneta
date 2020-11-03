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
 * Based on type guard result, appropriately format the AppNeta data as a Slack message.
 */
export function dataFactory<D extends AppNeta.Events, ReturnType>(
  data: D,
  callbackMap: { [k in AppNeta.EventType]: DataFactoryCallback<D, ReturnType> },
): ReturnType {
  try {
    return callbackMap[data.type](data);
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error('Unsupported data type.');
    } else {
      throw err;
    }
  }
}
