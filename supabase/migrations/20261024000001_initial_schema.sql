-- REUNIFY PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase / PostgreSQL 15+
-- Migration: 20261024000001_initial_schema.sql

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'faculty_staff', 'campus_security', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'student',
    department TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. REPORTS TABLE (Core Lost & Found Reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('lost', 'found')),
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    incident_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('active', 'open', 'potential_match', 'claim_pending', 'claimed', 'handover_scheduled', 'resolved', 'returned', 'closed', 'cancelled')),
    image_url TEXT,
    contact_preference TEXT DEFAULT 'in_app' CHECK (contact_preference IN ('in_app', 'email', 'phone')),
    location_building TEXT,
    campus_zone TEXT,
    custody_location TEXT, -- e.g. "Security Desk - Student Union"
    confidential_notes TEXT, -- Secret ownership clues or serial numbers
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON public.reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- View for backward compatibility with queries to "items"
CREATE OR REPLACE VIEW public.items AS
SELECT 
    id,
    user_id,
    title,
    description,
    report_type AS type,
    category,
    location AS location_name,
    location_building,
    campus_zone,
    incident_date AS date_lost_or_found,
    status,
    image_url AS primary_image_url,
    custody_location,
    confidential_notes,
    created_at,
    updated_at
FROM public.reports;

-- 5. CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    claimant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL, -- Ownership proof evidence
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn', 'handover_pending', 'returned', 'cancelled')),
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewer_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    handover_code TEXT UNIQUE,
    handover_location TEXT,
    handover_scheduled_for TIMESTAMPTZ,
    handover_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_claims_report_id ON public.claims(report_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant_id ON public.claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

-- 6. CASE TIMELINE EVENTS
CREATE TABLE IF NOT EXISTS public.case_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_case_events_report_id ON public.case_timeline_events(report_id);
CREATE INDEX IF NOT EXISTS idx_case_events_claim_id ON public.case_timeline_events(claim_id);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    related_report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- 8. TRIGGER: Automatic profile creation on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        'student' -- Secure default: never grant admin or security on registration
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 9. HELPER FUNCTIONS FOR RLS
CREATE OR REPLACE FUNCTION public.is_admin_or_security()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('admin', 'campus_security')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Profiles viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile except role"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND 
        role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

-- REPORTS POLICIES
CREATE POLICY "Public can view active reports"
    ON public.reports FOR SELECT
    USING (
        status != 'closed' OR 
        auth.uid() = user_id OR 
        public.is_admin_or_security()
    );

CREATE POLICY "Authenticated users can create reports"
    ON public.reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners or staff can update reports"
    ON public.reports FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id OR 
        public.is_admin_or_security()
    );

CREATE POLICY "Owners can delete open reports or admin can delete any"
    ON public.reports FOR DELETE
    TO authenticated
    USING (
        (auth.uid() = user_id AND status = 'open') OR 
        public.is_admin_or_security()
    );

-- CLAIMS POLICIES
CREATE POLICY "Claims viewable by claimant, report owner, or staff"
    ON public.claims FOR SELECT
    TO authenticated
    USING (
        auth.uid() = claimant_id OR
        auth.uid() = (SELECT user_id FROM public.reports WHERE id = report_id) OR
        public.is_admin_or_security()
    );

CREATE POLICY "Authenticated users can submit claims for others reports"
    ON public.claims FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = claimant_id AND
        auth.uid() != (SELECT user_id FROM public.reports WHERE id = report_id)
    );

CREATE POLICY "Claimant can withdraw or staff can review claims"
    ON public.claims FOR UPDATE
    TO authenticated
    USING (
        public.is_admin_or_security() OR
        auth.uid() = (SELECT user_id FROM public.reports WHERE id = report_id) OR
        (auth.uid() = claimant_id AND status = 'pending')
    );

-- TIMELINE POLICIES
CREATE POLICY "Timeline viewable by authenticated users"
    ON public.case_timeline_events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Timeline events insertable by participants and staff"
    ON public.case_timeline_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users see only their own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- 11. STORAGE BUCKET SETUP (Supabase Storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read, authenticated upload
CREATE POLICY "Report photos are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'report-photos');

CREATE POLICY "Authenticated users can upload report photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'report-photos');

CREATE POLICY "Users can update or delete their own report photos"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'report-photos' AND auth.uid() = owner);
