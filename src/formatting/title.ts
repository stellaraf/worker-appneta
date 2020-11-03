import title from 'title';

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
