import { HDate, gematriya } from "@hebcal/hdate";

const hebrewMonths: Record<number, string> = {
  1: "ניסן",
  2: "אייר",
  3: "סיוון",
  4: "תמוז",
  5: "אב",
  6: "אלול",
  7: "תשרי",
  8: "חשוון",
  9: "כסלו",
  10: "טבת",
  11: "שבט",
  12: "אדר",
  13: "אדר ב׳",
};

/**
 * Returns Hebrew date string for display (no special emphasis).
 * Example: "ה׳ בסיוון תשפ"ה" or "15 בטבת תשפ"ה"
 */
export function formatHebrewDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    const hd = new HDate(d);
    const day = gematriya(hd.getDate());
    const month = hebrewMonths[hd.getMonth()] || "";
    const year = gematriya(hd.getFullYear());
    return `${day} ב${month} ${year}`;
  } catch {
    return "";
  }
}

/**
 * Combines Gregorian and Hebrew date for report tables.
 * Returns "dd/MM/yyyy (ה׳ בסיוון תשפ"ה)"
 */
export function gregWithHebrew(dateStr: string | Date): string {
  if (!dateStr) return "";
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);
  const g = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  const h = formatHebrewDate(d);
  return h ? `${g} (${h})` : g;
}
