ALTER TABLE public.income ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'ללא';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'ללא';