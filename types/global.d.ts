/**
 * Slack Webhook URL.
 */
declare const SLACK_ENDPOINT: string;

/**
 * Deployment environment type.
 */
declare const ENVIRONMENT: 'production' | 'development';

/**
 * Number of seconds to cache events. Events will be cached based on properties specific to the
 * event type. On each new event, if a cached entry still exists matching the new event's
 * properties, no Slack notification will be sent.
 */
declare const PERSISTENCE_TIME: number;

/**
 * Nullable generic type.
 */
type Nullable<T> = T | null;

type DataFactoryCallback<D, R> = (d: D) => R;
