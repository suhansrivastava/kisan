-- ==============================================================
-- KISAN AI FOR FARMERS - SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- ==============================================================

-- 1. Table for Disease Detection Scans
CREATE TABLE IF NOT EXISTS crop_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    crop_name TEXT NOT NULL,
    disease_name TEXT NOT NULL,
    pathogen TEXT,
    severity TEXT,
    confidence_score NUMERIC(5, 2),
    confidence_str TEXT,
    symptoms TEXT,
    causes TEXT,
    chemical_treatment JSONB DEFAULT '[]'::jsonb,
    organic_solution JSONB DEFAULT '[]'::jsonb,
    is_healthy BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    farmer_location TEXT DEFAULT 'India'
);

-- 2. Table for Chat Conversations with HAL
CREATE TABLE IF NOT EXISTS hal_chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sender TEXT NOT NULL CHECK (sender IN ('user', 'hal')),
    message TEXT NOT NULL,
    suggested_actions JSONB DEFAULT '[]'::jsonb
);

-- 3. Table for Mandi Market Rate History
CREATE TABLE IF NOT EXISTS mandi_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    market TEXT NOT NULL,
    commodity TEXT NOT NULL,
    variety TEXT,
    min_price NUMERIC(10, 2),
    max_price NUMERIC(10, 2),
    modal_price NUMERIC(10, 2),
    unit TEXT DEFAULT '₹ / Quintal',
    trend TEXT DEFAULT 'stable',
    arrival_tons NUMERIC(10, 2)
);

-- 4. Enable Row Level Security (RLS) & Public Access Policies for Farmers
ALTER TABLE crop_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE hal_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandi_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on crop_scans" 
    ON crop_scans FOR SELECT USING (true);
CREATE POLICY "Allow public insert on crop_scans" 
    ON crop_scans FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on hal_chat_logs" 
    ON hal_chat_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on hal_chat_logs" 
    ON hal_chat_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on mandi_prices" 
    ON mandi_prices FOR SELECT USING (true);
CREATE POLICY "Allow public insert on mandi_prices" 
    ON mandi_prices FOR INSERT WITH CHECK (true);
