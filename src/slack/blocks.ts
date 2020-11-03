import dayjs from 'dayjs';
import {
  getEventType,
  getServiceQualityStatus,
  makeTitle,
  mdBold,
  mdItalic,
  mdLabel,
} from '../formatting';
import {
  isNetworkChangeEvent,
  isSequencerEvent,
  isServiceQualityEvent,
  isTestEvent,
  isWebApplicationEvent,
} from '../appneta';

import type { MessageAttachment } from '@slack/types';
import type { CommonProperties } from './types';

/**
 * Logo that appears in the Slack message. This was pulled from appneta.com, until they want to
 * provide a better link.
 */
const LOGO_URL =
  'https://www.appneta.com/images/graphics/appneta_branding/android-icon-192x192.png';

/**
 * Status images to indicate a 'good' or 'bad' state. Using these probably violates some kind of
 * license, so we should probably find something more permanent. It's harder than one might think.
 */
const WARN =
  'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/237/warning-sign_26a0.png';
const OK =
  'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/237/white-heavy-check-mark_2705.png';

/**
 * Based on type guard result, appropriately format the AppNeta data as a Slack message.
 */
export function getBlock(data: AppNeta.Events): MessageAttachment {
  if (isTestEvent(data)) {
    return makeTestEventBlock(data);
  } else if (isSequencerEvent(data)) {
    return makeSequencerEventBlock(data);
  } else if (isServiceQualityEvent(data)) {
    return makeServiceQualityBlock(data);
  } else if (isNetworkChangeEvent(data)) {
    return makeNetworkChangeBlock(data);
  } else if (isWebApplicationEvent(data)) {
    return makeWebApplicationEventBlock(data);
  } else {
    throw new Error('Unsupported data type.');
  }
}

/**
 * Extract & format properties that will be shared across all event types.
 */
function parseCommon(data: AppNeta.Events): CommonProperties {
  // Parse EPOCH time to human readable format.
  const dateObj = dayjs(data.eventTime * 1000);
  const time = (dateObj.format('YYYY MM DD HH:mm:ss') + ' UTC') as CommonProperties['time'];

  // Get a friendly name for the event type.
  const eventType = getEventType(data.type) as CommonProperties['eventType'];
  const detail = data.description as CommonProperties['detail'];

  let clear = false as CommonProperties['clear'];

  if (data.description.match(/.*\sclear|clears|cleared.*/gi)) {
    clear = true;
  }
  return { detail, time, eventType, clear };
}

/**
 * Reformat AppNeta's default AS Path field to be more visually friendly.
 */
function formatAsPath(seq: string): string {
  return seq.match(/\d+/g).join(' ');
}

/**
 * Create a Slack Message Block for a Network Change Event.
 */
function makeNetworkChangeBlock(data: AppNeta.NetworkChangeEvent): MessageAttachment {
  const { time, detail, eventType, clear } = parseCommon(data);
  const {
    pathName,
    deepLink,
    oldAsnSequence,
    newAsnSequence,
    tracerouteProtocol,
    sequencerHost,
    target,
  } = data;
  return {
    text: clear
      ? `CLEARED Path change between ${sequencerHost} and ${target}`
      : `Path change between ${sequencerHost} and ${target}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: detail } },
      { type: 'section', text: { type: 'mrkdwn', text: mdItalic(eventType) } },
      {
        type: 'context',
        elements: [
          { type: 'image', image_url: LOGO_URL, alt_text: 'AppNeta' },
          { type: 'mrkdwn', text: pathName },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: mdLabel('Measurement', 'AS Path') },
          { type: 'mrkdwn', text: mdLabel('Protocol', tracerouteProtocol.toUpperCase()) },
          { type: 'mrkdwn', text: mdLabel('Source', sequencerHost) },
          { type: 'mrkdwn', text: mdLabel('Target', target) },
          { type: 'mrkdwn', text: mdLabel('Previous', formatAsPath(oldAsnSequence), true) },
          { type: 'mrkdwn', text: mdLabel('New', formatAsPath(newAsnSequence), true) },
        ],
        accessory: {
          type: 'image',
          image_url: clear ? OK : WARN,
          alt_text: 'Status',
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:arrow_upper_right: *<${deepLink}|Open in AppNeta Portal>*`,
        },
      },
      { type: 'context', elements: [{ type: 'mrkdwn', text: mdBold(time) }] },
    ],
  };
}

/**
 * Create a Slack Message Block for a Service Quality Event.
 */
function makeServiceQualityBlock(data: AppNeta.ServiceQualityEvent): MessageAttachment {
  const { time, detail, clear, eventType } = parseCommon(data);
  const {
    pathName,
    deepLink,
    measuredParam,
    pathServiceQuality,
    sequencerHost,
    target,
    measuredValue,
  } = data;
  const measurement = makeTitle(measuredParam);
  return {
    text: clear ? `CLEARED ${measurement} to ${target}` : `${measurement} to ${target}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: detail } },
      { type: 'section', text: { type: 'mrkdwn', text: mdItalic(eventType) } },
      {
        type: 'context',
        elements: [
          { type: 'image', image_url: LOGO_URL, alt_text: 'AppNeta' },
          { type: 'mrkdwn', text: pathName },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: mdLabel('Measurement', measurement) },
          { type: 'mrkdwn', text: mdLabel('Value', `${measuredValue}%`) },
          { type: 'mrkdwn', text: mdLabel('Source', sequencerHost) },
          { type: 'mrkdwn', text: mdLabel('Target', target) },
        ],
        accessory: {
          type: 'image',
          image_url: clear ? OK : WARN,
          alt_text: 'Status',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: mdLabel('Status', getServiceQualityStatus(pathServiceQuality)),
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:arrow_upper_right: *<${deepLink}|Open in AppNeta Portal>*`,
        },
      },
      { type: 'context', elements: [{ type: 'mrkdwn', text: mdBold(time) }] },
    ],
  };
}

/**
 * Create a Slack Message Block for a Sequencer Event.
 */
function makeSequencerEventBlock(data: AppNeta.SequencerEvent): MessageAttachment {
  const { time, detail, clear, eventType } = parseCommon(data);
  const { sequencerName, sequencerHost, sequencerStatus } = data;
  const status = makeTitle(sequencerStatus);
  return {
    text: clear ? `CLEARED ${sequencerName} is ${status}` : `${sequencerName} is ${status}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: detail } },
      { type: 'section', text: { type: 'mrkdwn', text: mdItalic(eventType) } },
      {
        type: 'context',
        elements: [
          { type: 'image', image_url: LOGO_URL, alt_text: 'AppNeta' },
          { type: 'mrkdwn', text: sequencerName },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: mdLabel('Monitoring Point', sequencerHost) },
          { type: 'mrkdwn', text: mdLabel('Status', status) },
        ],
        accessory: {
          type: 'image',
          image_url:
            sequencerStatus === 'UNAVAILABLE'
              ? WARN
              : sequencerStatus === 'AVAILABLE'
              ? OK
              : clear
              ? OK
              : WARN,
          alt_text: 'Status',
        },
      },
      { type: 'context', elements: [{ type: 'mrkdwn', text: mdBold(time) }] },
    ],
  };
}

/**
 * Create a Slack Message Block for a Test Event.
 */
function makeTestEventBlock(data: AppNeta.TestEvent): MessageAttachment {
  const { time, detail, clear, eventType } = parseCommon(data);
  const { sequencerHost, target, testStatus, name, dataReadiness, voiceReadiness } = data;
  const status = makeTitle(testStatus);
  return {
    text: clear ? `CLEARED ${name} is ${status}` : `${name} is ${status}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: detail } },
      { type: 'section', text: { type: 'mrkdwn', text: mdItalic(eventType) } },
      {
        type: 'context',
        elements: [
          { type: 'image', image_url: LOGO_URL, alt_text: 'AppNeta' },
          { type: 'mrkdwn', text: name },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: mdLabel('Data Readiness', makeTitle(dataReadiness)) },
          { type: 'mrkdwn', text: mdLabel('Voice Readiness', makeTitle(voiceReadiness)) },
          { type: 'mrkdwn', text: mdLabel('Test Status', status) },
          { type: 'mrkdwn', text: mdLabel('Source', sequencerHost) },
          { type: 'mrkdwn', text: mdLabel('Target', target) },
        ],
        accessory: {
          type: 'image',
          image_url:
            testStatus === 'FAILED' ? WARN : testStatus === 'COMPLETED' ? OK : clear ? OK : WARN,
          alt_text: 'Status',
        },
      },
      { type: 'context', elements: [{ type: 'mrkdwn', text: mdBold(time) }] },
    ],
  };
}

/**
 * Create a Slack Message Block for a Web Application Event.
 */
function makeWebApplicationEventBlock(data: AppNeta.WebApplicationEvent): MessageAttachment {
  const { time, detail, clear, eventType } = parseCommon(data);
  const { deepLink, measuredParam, sequencerHost, workflowName, target, measuredValue } = data;
  const measurement = makeTitle(measuredParam);
  return {
    text: clear
      ? `CLEARED ${measurement} to ${target} is ${measuredValue}`
      : `${measurement} to ${target} is ${measuredValue}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: detail } },
      { type: 'section', text: { type: 'mrkdwn', text: mdItalic(eventType) } },
      {
        type: 'context',
        elements: [
          { type: 'image', image_url: LOGO_URL, alt_text: 'AppNeta' },
          { type: 'mrkdwn', text: workflowName },
        ],
      },
      { type: 'divider' },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: mdLabel('Measurement', measurement) },
          { type: 'mrkdwn', text: mdLabel('Value', measuredValue, true) },
          { type: 'mrkdwn', text: mdLabel('Source', sequencerHost) },
          { type: 'mrkdwn', text: mdLabel('Target', target) },
        ],
        accessory: {
          type: 'image',
          image_url: clear ? OK : WARN,
          alt_text: 'Status',
        },
      },
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:arrow_upper_right: *<${deepLink}|Open in AppNeta Portal>*`,
        },
      },
      { type: 'context', elements: [{ type: 'mrkdwn', text: mdBold(time) }] },
    ],
  };
}
