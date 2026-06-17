// Shared domain constants for the customer finance flows.

/** How a transaction was executed. Used in entry forms and filters. */
export const PAYMENT_METHODS = [
  "אשראי",
  "מזומן",
  "בנקאי",
  'הו״ק',
  "תווי קנייה",
  "אחר",
  "ללא",
] as const;

/** Transaction recurrence type. "קבוע" = a fixed/standing transaction. */
export const ENTRY_TYPES = ["חודשי", "חד פעמי", "קבוע"] as const;

/** Approval status of a transaction. */
export const ENTRY_STATUSES = ["מאושר", "לאישור", "צפוי"] as const;

/** Kind of a customer-defined category. */
export const CATEGORY_KINDS = [
  { value: "income", label: "הכנסה" },
  { value: "expense", label: "הוצאה" },
  { value: "liability", label: "התחייבות" },
  { value: "asset", label: "נכס" },
] as const;

/** Whether a category is fixed or variable, and if variable its period. */
export const CATEGORY_TYPES = ["קבוע", "משתנה"] as const;
export const CATEGORY_PERIODS = ["חודשי", "שנתי"] as const;

/** Tithe (maaser) rate options. "עשירית" = 10%, "חומש" = 20%. */
export const TITHE_RATES = [
  { value: 10, label: "עשירית (10%)" },
  { value: 20, label: "חומש (20%)" },
] as const;

/** Default fallback category names, used before the user defines their own. */
export const DEFAULT_INCOME_CATEGORIES = ["משכורת", "עסק", "קצבה", "מתנה", "אחר"];
export const DEFAULT_EXPENSE_CATEGORIES = ["מזון", "דיור", "רכב", "חינוך", "בריאות", "צדקה", "אחר"];
