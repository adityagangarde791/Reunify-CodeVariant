-- REUNIFY DEVELOPMENT SEED DATA (OPTIONAL)
-- Execute this script manually in the Supabase SQL Editor IF you want to populate demo records for local development.
-- This file is NEVER executed automatically by the production application.

-- NOTE: Ensure at least one user exists in auth.users before running this script, 
-- or create test users via Supabase Studio Auth tab.

DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NOT NULL THEN
        -- Seed Lost Report
        INSERT INTO public.reports (
            id, user_id, title, description, report_type, category, 
            location, location_building, campus_zone, incident_date, status, 
            image_url, contact_preference, confidential_notes
        ) VALUES (
            'a1b2c3d4-0001-4000-8000-000000000001',
            v_user_id,
            'Apple AirPods Pro (2nd Gen) in Navy Silicone Sleeve',
            'AirPods Pro case with a small scratch on rear hinge and a dark navy silicone protective cover with carabiner clip.',
            'lost',
            'electronics',
            'Main Library 2nd Floor Silent Study Desks',
            'Main Library',
            'Central Campus',
            NOW() - INTERVAL '2 days',
            'open',
            'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80',
            'in_app',
            'Initials A.G. etched on inner rim, Bluetooth serial ending in H38Q.'
        ) ON CONFLICT (id) DO NOTHING;

        -- Seed Found Report
        INSERT INTO public.reports (
            id, user_id, title, description, report_type, category, 
            location, location_building, campus_zone, incident_date, status, 
            image_url, custody_location, contact_preference, confidential_notes
        ) VALUES (
            'a1b2c3d4-0002-4000-8000-000000000002',
            v_user_id,
            'White Wireless Earbuds with Dark Blue Protective Case',
            'Found left behind on study desk in Library Quiet Zone. Case has silicone sleeve with small clip.',
            'found',
            'electronics',
            'Main Library 2nd Floor Study Desks',
            'Main Library',
            'Central Campus',
            NOW() - INTERVAL '1 day',
            'open',
            'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
            'Campus Security Office - Custody Locker 3',
            'in_app',
            'Found with approximately 45% charge.'
        ) ON CONFLICT (id) DO NOTHING;

        -- Seed Timeline Events
        INSERT INTO public.case_timeline_events (
            report_id, actor_id, event_type, title, description, created_at
        ) VALUES (
            'a1b2c3d4-0001-4000-8000-000000000001',
            v_user_id,
            'reported',
            'Lost Report Registered',
            'Lost report logged for Apple AirPods Pro at Main Library.',
            NOW() - INTERVAL '2 days'
        ) ON CONFLICT DO NOTHING;

        RAISE NOTICE 'Demo seed records inserted successfully for user %', v_user_id;
    ELSE
        RAISE NOTICE 'No auth.users record found. Create a user via Supabase Auth before seeding.';
    END IF;
END $$;
