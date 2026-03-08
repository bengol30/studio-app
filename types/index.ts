// ─── Enums ───────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected';
export type EventStatus = 'open' | 'full' | 'cancelled';
export type TaskStatus = 'open' | 'in_progress' | 'done';
export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type EventType = 'jam' | 'listening' | 'workshop' | 'performance' | 'podcast' | 'other';

// ─── Services ────────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  packages?: Package[];
  fields?: ServiceField[];
}

export interface Package {
  id: string;
  service_id: string;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceField {
  id: string;
  service_id: string;
  label: string;
  field_type: FieldType;
  options: string[] | null;
  is_required: boolean;
  display_order: number;
  created_at: string;
}

// ─── Bookings ────────────────────────────────────────────────
export interface Booking {
  id: string;
  service_id: string;
  package_id: string;
  client_name: string;
  client_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  dynamic_answers: Record<string, string> | null;
  files_url: string | null;
  notes_internal: string | null;
  token: string;
  google_event_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joined relations (optional)
  service?: Service;
  package?: Package;
}

export interface CreateBookingInput {
  service_id: string;
  package_id: string;
  client_name: string;
  client_phone: string;
  booking_date: string;
  start_time: string;
  dynamic_answers?: Record<string, string>;
  files_url?: string;
}

// ─── Clients ─────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  phone: string;
  notes: string | null;
  payment_status: PaymentStatus | null;
  tags: string[] | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Events ──────────────────────────────────────────────────
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  event_date: string;
  event_time: string;
  location: string | null;
  price: number;
  max_attendees: number | null;
  current_attendees: number;
  image_url: string | null;
  host_name: string | null;
  custom_fields: ServiceField[] | null;
  status: EventStatus;
  google_event_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  client_name: string;
  client_phone: string;
  answers: Record<string, string> | null;
  created_at: string;
}

// ─── Tasks ───────────────────────────────────────────────────
export interface Task {
  id: string;
  client_id: string | null;
  booking_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations (optional)
  client?: Client;
  booking?: Booking;
}

// ─── WhatsApp ────────────────────────────────────────────────
export interface WhatsAppTemplate {
  id: string;
  trigger_key: string;
  message_he: string;
  updated_at: string;
}

export interface WhatsAppQA {
  id: string;
  question: string;
  answer: string;
  keywords: string[] | null;
  is_active: boolean;
  created_at: string;
}

// ─── Settings ────────────────────────────────────────────────
export interface Settings {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface OpeningHoursDay {
  open: string;
  close: string;
  active: boolean;
}

export interface OpeningHours {
  sunday: OpeningHoursDay;
  monday: OpeningHoursDay;
  tuesday: OpeningHoursDay;
  wednesday: OpeningHoursDay;
  thursday: OpeningHoursDay;
  friday: OpeningHoursDay;
  saturday: OpeningHoursDay;
}

export interface StudioInfo {
  name: string;
  business: string;
  address: string;
  phone: string;
  whatsapp: string;
}

// ─── Google Calendar ─────────────────────────────────────────
export interface ExternalEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
}
