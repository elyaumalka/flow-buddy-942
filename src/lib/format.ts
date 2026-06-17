// Shared number / currency formatting helpers.

/**
 * Format a number as ILS currency for display.
 * - Adds thousands separators ("," for values over 999).
 * - Shows agorot (decimals) only when present, e.g. 30.5 -> "₪30.50", 1500 -> "₪1,500".
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  if (n == null || isNaN(n as number)) return "₪0";
  const hasFraction = Math.round((n as number) * 100) % 100 !== 0;
  return `₪${(n as number).toLocaleString("he-IL", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a plain number with thousands separators and optional agorot (no currency sign).
 */
export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  if (n == null || isNaN(n as number)) return "0";
  const hasFraction = Math.round((n as number) * 100) % 100 !== 0;
  return (n as number).toLocaleString("he-IL", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse user input into a number, allowing agorot (e.g. "30.5") and stray commas/spaces.
 * Returns 0 for empty / invalid input.
 */
export function parseAmount(input: string | number | null | undefined): number {
  if (input == null || input === "") return 0;
  if (typeof input === "number") return input;
  const cleaned = input.replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}
