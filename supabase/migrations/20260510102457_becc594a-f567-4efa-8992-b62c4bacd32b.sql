ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS customer_id uuid,
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'מזומן',
  ADD COLUMN IF NOT EXISTS period_month text,
  ADD COLUMN IF NOT EXISTS period_start date,
  ADD COLUMN IF NOT EXISTS period_end date,
  ADD COLUMN IF NOT EXISTS notes text;