-- =====================================================================
-- Schema changes to support the requested fixes (admin / customer).
-- Idempotent: safe to re-run.
-- =====================================================================

-- ---------- Income / Expenses: description + number of payments ----------
ALTER TABLE public.income   ADD COLUMN IF NOT EXISTS description  text;
ALTER TABLE public.income   ADD COLUMN IF NOT EXISTS num_payments integer NOT NULL DEFAULT 1;
ALTER TABLE public.income   ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'ללא';

ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS description  text;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS num_payments integer NOT NULL DEFAULT 1;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'ללא';

-- ---------- Goals: category + reduce-expenses support ----------
ALTER TABLE public.goals ADD COLUMN IF NOT EXISTS category text;

-- ---------- Customers: customer code (from 1000), subscription, credit ----------
CREATE SEQUENCE IF NOT EXISTS public.customer_code_seq START 1000;

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_code       integer;
ALTER TABLE public.customers ALTER COLUMN customer_code SET DEFAULT nextval('public.customer_code_seq');
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS subscription_months integer NOT NULL DEFAULT 1;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS subscription_end    date;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS credit_card_last4   text;
UPDATE public.customers SET customer_code = nextval('public.customer_code_seq') WHERE customer_code IS NULL;

-- ---------- Payments: customer code + billing day ----------
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS customer_code integer;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS billing_day   integer;

-- ---------- Collections (הו"ק לטיפול): customer code + active line ----------
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS customer_code integer;
ALTER TABLE public.collections ADD COLUMN IF NOT EXISTS line_active   boolean NOT NULL DEFAULT true;

-- ---------- Profiles: demographics + preferences blob ----------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age                     integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marital_status          text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_type         text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS income_range            text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS children_count          integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS marriages_count         integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS financial_month_start_day integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences             jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ---------- Customer-defined categories ----------
CREATE TABLE IF NOT EXISTS public.categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name          text NOT NULL,
  kind          text NOT NULL DEFAULT 'expense',   -- income | expense | liability | asset
  category_type text NOT NULL DEFAULT 'משתנה',      -- קבוע | משתנה
  period        text,                               -- חודשי | שנתי (for variable)
  extension     text,                               -- שלוחה בקו
  tithe_liable  boolean NOT NULL DEFAULT true,      -- income liable for maaser
  tithe_offset  boolean NOT NULL DEFAULT false,     -- expense offsets maaser (e.g. charity)
  archived      boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own categories" ON public.categories;
CREATE POLICY "Users manage own categories" ON public.categories
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Customer inquiries (צור קשר / פניות) ----------
CREATE TABLE IF NOT EXISTS public.inquiries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject        text NOT NULL,
  description    text,
  status         text NOT NULL DEFAULT 'פתוח',     -- פתוח | סגור
  attachment_url text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own inquiries" ON public.inquiries;
CREATE POLICY "Users manage own inquiries" ON public.inquiries
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admin view all inquiries" ON public.inquiries;
CREATE POLICY "Admin view all inquiries" ON public.inquiries
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------- Global system settings (admin) ----------
-- Single-row blob: price, fax limit, payment popup config, etc.
CREATE TABLE IF NOT EXISTS public.system_settings (
  id         integer PRIMARY KEY DEFAULT 1,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_singleton CHECK (id = 1)
);
INSERT INTO public.system_settings (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone authenticated can read settings" ON public.system_settings;
CREATE POLICY "Anyone authenticated can read settings" ON public.system_settings
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin manage settings" ON public.system_settings;
CREATE POLICY "Admin manage settings" ON public.system_settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- Call tracking (callers -> leads) ----------
CREATE TABLE IF NOT EXISTS public.call_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       text NOT NULL,
  caller_name text,
  call_count  integer NOT NULL DEFAULT 1,
  total_seconds integer NOT NULL DEFAULT 0,
  last_call_at timestamptz NOT NULL DEFAULT now(),
  converted_lead boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage call logs" ON public.call_logs;
CREATE POLICY "Admin manage call logs" ON public.call_logs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------- Storage bucket for inquiry attachments ----------
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated upload attachments" ON storage.objects;
CREATE POLICY "Authenticated upload attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');
DROP POLICY IF EXISTS "Public read attachments" ON storage.objects;
CREATE POLICY "Public read attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');
