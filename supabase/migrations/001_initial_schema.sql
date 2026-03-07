-- Migration: 001_initial_schema
-- Date: 2026-03-07
-- Author: DB-AGENT
-- Description: Create all 12 tables, triggers, indexes, and default data

-- ─── Helper: auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- 1. services
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  is_deleted  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 2. packages
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS packages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id       UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price            INTEGER NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  is_deleted       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 3. service_fields
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS service_fields (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id    UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  field_type    TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'select', 'checkbox')),
  options       JSONB,
  is_required   BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 4. clients
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS clients (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL UNIQUE,
  notes          TEXT,
  payment_status TEXT CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
  is_deleted     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 5. bookings
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id       UUID NOT NULL REFERENCES services(id),
  package_id       UUID NOT NULL REFERENCES packages(id),
  client_name      TEXT NOT NULL,
  client_phone     TEXT NOT NULL,
  booking_date     DATE NOT NULL,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'confirmed', 'cancelled', 'rejected')),
  dynamic_answers  JSONB,
  files_url        TEXT,
  notes_internal   TEXT,
  token            UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  google_event_id  TEXT,
  is_deleted       BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 6. events
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS events (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              TEXT NOT NULL,
  description        TEXT,
  event_type         TEXT NOT NULL
                       CHECK (event_type IN ('jam', 'listening', 'workshop', 'performance', 'podcast', 'other')),
  event_date         DATE NOT NULL,
  event_time         TIME NOT NULL,
  location           TEXT,
  price              INTEGER NOT NULL DEFAULT 0,
  max_attendees      INTEGER,
  current_attendees  INTEGER NOT NULL DEFAULT 0,
  image_url          TEXT,
  host_name          TEXT,
  custom_fields      JSONB,
  status             TEXT NOT NULL DEFAULT 'open'
                       CHECK (status IN ('open', 'full', 'cancelled')),
  google_event_id    TEXT,
  is_deleted         BOOLEAN NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 7. event_registrations
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS event_registrations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_name  TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  answers      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 8. tasks
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'in_progress', 'done')),
  due_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 9. whatsapp_qa
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS whatsapp_qa (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question  TEXT NOT NULL,
  answer    TEXT NOT NULL,
  keywords  TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- 10. whatsapp_templates
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_key TEXT NOT NULL UNIQUE,
  message_he  TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_whatsapp_templates_updated_at
  BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 11. settings
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trigger_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX idx_bookings_token ON bookings(token);
CREATE INDEX idx_bookings_client_phone ON bookings(client_phone);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_service_fields_service_order ON service_fields(service_id, display_order);

-- ═══════════════════════════════════════════════════════════════
-- DEFAULT DATA: whatsapp_templates
-- ═══════════════════════════════════════════════════════════════
INSERT INTO whatsapp_templates (trigger_key, message_he) VALUES
  ('booking_confirmed', 'שלום {{client_name}}! ההזמנה שלך לשירות {{service_name}} בתאריך {{booking_date}} בשעה {{start_time}} אושרה. נתראה באולפן!'),
  ('booking_rejected', 'שלום {{client_name}}, לצערנו ההזמנה שלך לתאריך {{booking_date}} בשעה {{start_time}} נדחתה. אנא צור קשר לתיאום מועד חלופי.'),
  ('reminder_24h', 'היי {{client_name}}! תזכורת: מחר בשעה {{start_time}} יש לך תור ב{{service_name}}. נתראה!'),
  ('event_registered', 'שלום {{client_name}}! נרשמת בהצלחה לאירוע "{{event_title}}" בתאריך {{event_date}}. נתראה שם!'),
  ('event_reminder', 'היי {{client_name}}! תזכורת: מחר מתקיים האירוע "{{event_title}}" בשעה {{event_time}}. נתראה!'),
  ('booking_cancelled', 'שלום {{client_name}}, ההזמנה שלך לתאריך {{booking_date}} בשעה {{start_time}} בוטלה בהצלחה.'),
  ('custom', 'שלום {{client_name}}, {{custom_message}}');

-- ═══════════════════════════════════════════════════════════════
-- DEFAULT DATA: settings
-- ═══════════════════════════════════════════════════════════════
INSERT INTO settings (key, value) VALUES
  ('opening_hours', '{
    "sunday":    {"open": "09:00", "close": "22:00", "active": true},
    "monday":    {"open": "09:00", "close": "22:00", "active": true},
    "tuesday":   {"open": "09:00", "close": "22:00", "active": true},
    "wednesday": {"open": "09:00", "close": "22:00", "active": true},
    "thursday":  {"open": "09:00", "close": "22:00", "active": true},
    "friday":    {"open": "09:00", "close": "14:00", "active": true},
    "saturday":  {"open": "00:00", "close": "00:00", "active": false}
  }'::jsonb),
  ('buffer_minutes', '10'::jsonb),
  ('cancellation_hours', '48'::jsonb),
  ('terms_of_service', '"תנאי השימוש של אולפן קריית שמונה – Bengo Productions. בהזמנת תור הנך מאשר/ת את תנאי השימוש."'::jsonb),
  ('studio_info', '{
    "name": "אולפן קריית שמונה",
    "business": "Bengo Productions",
    "address": "קריית שמונה",
    "phone": "",
    "whatsapp": ""
  }'::jsonb);
