/**
 * Format a stringable object as Markdown code.
 */
export function mdCode(source: string | number): string {
  return ['`', String(source), '`'].join('');
}

/**
 * Format a stringable object as Markdown bold.
 */
export function mdBold(source: string | number): string {
  return ['*', String(source), '*'].join('');
}

/**
 * Format a stringable object as Markdown italic.
 */
export function mdItalic(source: string | number): string {
  return ['_', String(source), '_'].join('');
}

/**
 * Format two stringable objects as a bold label & standard (or code) value.
 */
export function mdLabel(label: string | number, value: string | number, code: boolean = false) {
  if (code) {
    value = mdCode(value);
  }
  return `${mdBold(label)}:\n${value}`;
}
