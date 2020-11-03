/**
 * UPDATED 2020 11 02
 *
 * AppNeta Event Types. See: https://docs.appneta.com/event-integration.html
 *
 * © 2020 AppNeta.
 */
declare namespace AppNeta {
  /**
   * Valid event types.
   */
  type EventType =
    | 'TEST_EVENT'
    | 'SEQUENCER_EVENT'
    | 'SQA_EVENT'
    | 'WEB_PATH_SQA_EVENT'
    | 'NETWORK_CHANGE_EVENT';

  /**
   * Valid statuses for monitoring point alerts.
   */
  type SequencerStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'REMOVED' | 'NEW' | 'BLOCKED';

  /**
   * Valid statuses for Service Quality alerts.
   */
  type ServiceQuality = 'SQA_NOT_VIOLATED' | 'INDETERMINATE' | 'SQA_VIOLATED' | 'DISABLED';

  /**
   * Valid Service Quality parameters.
   */
  type MeasuredServiceParam =
    | 'CONNECTIVITY'
    | 'QOS_CHANGE'
    | 'ROUTE_CHANGE'
    | 'TOTAL_CAPACITY'
    | 'UTILIZED_CAPACITY'
    | 'AVAILABLE_CAPACITY'
    | 'LATENCY'
    | 'DATA_JITTER'
    | 'DATA_LOSS'
    | 'VOICE_JITTER'
    | 'VOICE_LOSS'
    | 'MOS'
    | 'RTT'
    | 'UTILIZATION_PERCENT'
    | 'AVAILABLE_PERCENT'
    | 'TOTAL_CAPACITY_TOLERANCE'
    | 'TOTAL_CAPACITY_TOLERANCE_PERCENT';

  /**
   * Valid Web Application parameters.
   */
  type MeasuredWebParam =
    | 'CONNECTIVITY'
    | 'HTTP_STATUS'
    | 'HTTP_ERRORS'
    | 'WEB_SCRIPT_ERRORS'
    | 'WEB_TOTAL_PAGE_LOAD_TIME'
    | 'WEB_TRANSACTION_TIME'
    | 'WEB_AP_DEX'
    | 'WIRELESS_INTERFACE_ERRORS'
    | 'DHCP_ERRORS'
    | 'HTTP_CONNECTIVITY'
    | 'HTTP_EXPECTED_STATUS'
    | 'HTTP_EXPECTED_RESPONSE'
    | 'HTTP_TOTAL_TIME';

  /**
   * Event importance.
   */
  type Importance = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

  /**
   * Valid Test Event statuses.
   */
  type TestStatus =
    | 'UNKNOWN'
    | 'RUNNING'
    | 'COMPLETED'
    | 'STOPPED'
    | 'STARTED'
    | 'FAILED'
    | 'QUEUED'
    | 'INITIALIZING'
    | 'SKIPPED';

  /**
   * Valid data & voice readiness values.
   */
  type Readiness =
    | 'NA'
    | 'UNKNOWN'
    | 'NO_CONNECTIVITY'
    | 'VERY_POOR'
    | 'POOR'
    | 'MARGINAL'
    | 'GOOD'
    | 'EXCELLENT';

  /**
   * Valid traceroute protocols.
   */
  type TraceRouteProtocol = 'icmp' | 'tcp' | 'udp';

  /**
   * The Tag object found in the Service Quality Event object and the Network Change Event object.
   */
  interface TagObject {
    /**
     * The tag ID.
     */
    id: number;
    /**
     * The organization ID the tag belongs to.
     */
    orgid: number;
    /**
     * 	The tag category.
     */
    category: string;
    /**
     * 	The tag value.
     */
    value: string;
  }
  /**
   * Base AppNeta event object properties shared by all event types.
   */
  interface EventObject {
    /**
     * 	The event type.
     */
    type: EventType;
    /**
     * 	A description of the event.
     */
    description: string;
    /**
     * The time the event occurred in “UNIX time” (the number of seconds elapsed since midnight
     * (UTC) on January 1, 1970).
     */
    eventTime: number;
    /**
     * The name (in APM) of the Monitoring Point that initiated the diagnostic test.
     */
    sequencerName: string;
    /**
     * The hostname of the Monitoring Point that initiated the diagnostic test.
     */
    sequencerHost: string;
    /**
     * The ID of the organization the Monitoring Point belongs to.
     */
    orgId: number;
    /**
     * The name of the organization the Monitoring Point belongs to.
     */
    orgName: string;
  }
  /**
   * Notifications that a diagnostic test has completed (or was halted).
   */
  interface TestEvent extends EventObject {
    /**
     * The URL of the target for the diagnostic test.
     */
    target: string;
    /**
     * 	The test ID.
     */
    testId: number;
    /**
     * The user-specified name of the test.
     */
    name: string;
    /**
     * The test status.
     */
    testStatus: TestStatus;
    /**
     * The path’s suitability to handle data intensive applications.
     */
    dataReadiness: Readiness;
    /**
     * The path’s suitability to handle voice traffic.
     */
    voiceReadiness: Readiness;
  }
  /**
   * Notifications that APM lost or reestablished connectivity with a Monitoring Point.
   */
  interface SequencerEvent extends EventObject {
    /**
     * Monitoring Point status.
     */
    sequencerStatus: SequencerStatus;
  }
  /**
   * Notifications that a network path alert condition was violated or cleared.
   */
  interface ServiceQualityEvent extends EventObject {
    /**
     * The URL of the network path target.
     */
    target: string;
    /**
     * The ID of the network path the alert occurred on.
     */
    pathId: number;
    /**
     * The name of the network path the alert occurred on.
     */
    pathName: string;
    /**
     * The status of the network path with respect to its Alert Profile.
     */
    pathServiceQuality: ServiceQuality;
    /**
     * The parameter the alert occurred on.
     */
    measuredParam: MeasuredServiceParam;
    /**
     * The value of the parameter when the alert occurred.
     */
    measuredValue: number;
    /**
     * A link to the network path details in APM.
     */
    deepLink: string;
    /**
     * The importance value of the event.
     */
    importance: Importance;
    /**
     * 	An array of Tag objects associated with the network path.
     */
    tags: TagObject[];
  }
  /**
   * Notifications that a web path alert condition was violated or cleared.
   */
  interface WebApplicationEvent extends EventObject {
    /**
     * The URL of the web path target.
     */
    target: string;
    /**
     * The ID of the web app the alert occurred on.
     */
    webAppId: number;
    /**
     * The ID of the web path the alert occurred on.
     */
    webPathId: number;
    /**
     * 	The name of the workflow the alert occurred on.
     */
    workflowName: string;
    /**
     * The name of the workflow milestone the alert occurred on.
     */
    milestoneName: string;
    /**
     * The parameter the alert occurred on.
     */
    measuredParam: MeasuredWebParam;
    /**
     * The value of the parameter when the alert occurred.
     */
    measuredValue: number;
    /**
     * A link to the web path details in APM.
     */
    deepLink: string;
  }
  /**
   * Notifications that a change in the sequence of networks (BGP Autonomous Systems) on the path
   * between a source and a target has occurred.
   */
  interface NetworkChangeEvent extends EventObject {
    /**
     * The URL of the network path target.
     */
    target: string;
    /**
     * The ID of the network path the alert occurred on.
     */
    pathId: number;
    /**
     * The name of the network path the alert occurred on.
     */
    pathName: string;
    /**
     * The protocol this traceroute was run with.
     */
    tracerouteProtocol: TraceRouteProtocol;
    /**
     * The list of AS networks the traceroute took on the previous test.
     */
    oldAsnSequence: string;
    /**
     * 	The list of AS networks the traceroute took on the current test (triggering this event).
     */
    newAsnSequence: string;
    /**
     * 	A link to the network path details in APM.
     */
    deepLink: string;
    /**
     * 	An array of Tag objects associated with the network path.
     */
    tags: TagObject[];
  }
  /**
   * Union of all possible event objects.
   */
  type Events =
    | ServiceQualityEvent
    | SequencerEvent
    | NetworkChangeEvent
    | TestEvent
    | WebApplicationEvent;
}
