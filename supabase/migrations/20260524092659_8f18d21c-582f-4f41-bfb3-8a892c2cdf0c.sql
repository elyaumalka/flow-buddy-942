ALTER TABLE public.goals 
  ADD COLUMN savings_location text,
  ADD COLUMN has_commission boolean NOT NULL DEFAULT false;