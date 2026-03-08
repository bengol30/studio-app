// Make.com webhook triggers
// Sends data to Make.com which then sends WhatsApp messages via automation

const MAKE_WEBHOOK_BASE = 'https://hook.eu2.make.com';

type WebhookKey =
  | 'new_booking'
  | 'booking_confirmed'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'event_registered'
  | 'waitlist_registered';

export async function triggerWebhook(
  key: WebhookKey,
  data: Record<string, unknown>
): Promise<void> {
  const secret = process.env.MAKE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn(`[make-webhooks] MAKE_WEBHOOK_SECRET not set, skipping webhook: ${key}`);
    return;
  }

  try {
    await fetch(`${MAKE_WEBHOOK_BASE}/${secret}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: key, ...data }),
    });
  } catch (error) {
    console.error(`[make-webhooks] Failed to trigger webhook ${key}:`, error);
  }
}
