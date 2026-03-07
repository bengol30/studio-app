-- Migration: 002_rls_policies
-- Date: 2026-03-07
-- Author: SECURITY-AGENT
-- Description: Enable RLS and create policies for all tables
-- Status: RLS APPROVED

-- ═══════════════════════════════════════════════════════════════
-- Enable RLS on ALL tables
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- services: Anonymous SELECT, Admin ALL
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "services_public_select" ON services
  FOR SELECT USING (is_deleted = false AND is_active = true);

CREATE POLICY "services_admin_all" ON services
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- packages: Anonymous SELECT, Admin ALL
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "packages_public_select" ON packages
  FOR SELECT USING (is_deleted = false AND is_active = true);

CREATE POLICY "packages_admin_all" ON packages
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- service_fields: Anonymous SELECT, Admin ALL
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "service_fields_public_select" ON service_fields
  FOR SELECT USING (true);

CREATE POLICY "service_fields_admin_all" ON service_fields
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- bookings: Anonymous INSERT, Token-based SELECT, Admin ALL
-- ═══════════════════════════════════════════════════════════════

-- Anonymous can INSERT new bookings
CREATE POLICY "bookings_public_insert" ON bookings
  FOR INSERT WITH CHECK (true);

-- Anyone can SELECT their own booking by token (via API route, not direct)
-- This is restrictive: anonymous can only see non-deleted bookings
CREATE POLICY "bookings_token_select" ON bookings
  FOR SELECT USING (
    is_deleted = false AND (
      (SELECT auth.role()) = 'authenticated'
      -- Token-based access is handled at API route level, not RLS
    )
  );

-- Admin full access
CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- clients: Admin only
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "clients_admin_all" ON clients
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- events: Anonymous SELECT, Admin ALL
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "events_public_select" ON events
  FOR SELECT USING (is_deleted = false);

CREATE POLICY "events_admin_all" ON events
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- event_registrations: Anonymous INSERT, Admin ALL
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "event_registrations_public_insert" ON event_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "event_registrations_admin_all" ON event_registrations
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- tasks: Admin only
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "tasks_admin_all" ON tasks
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- whatsapp_qa: Admin only
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "whatsapp_qa_admin_all" ON whatsapp_qa
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- whatsapp_templates: Admin only
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "whatsapp_templates_admin_all" ON whatsapp_templates
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );

-- ═══════════════════════════════════════════════════════════════
-- settings: Anonymous SELECT, Admin ALL
-- ═══════════════════════════════════════════════════════════════
CREATE POLICY "settings_public_select" ON settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_all" ON settings
  FOR ALL USING (
    (SELECT auth.role()) = 'authenticated'
  );
