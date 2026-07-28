-- Migration: Add currency column to quotes table
-- Run this in Supabase SQL Editor (Dashboard → SQL → New Query)

-- Add the currency column if it doesn't exist
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';

-- Also add cv_quantity column if it doesn't exist (from earlier migration)
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS cv_quantity integer DEFAULT 1;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
AND column_name IN ('currency', 'cv_quantity');
