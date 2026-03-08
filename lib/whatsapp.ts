// Generic Make.com Webhook for WhatsApp

const WHATSAPP_WEBHOOK_URL = 'https://hook.us2.make.com/f2jsjitosbx3ceeyd1u9emgydc9ou9a4';

/**
 * Formats an Israeli phone number to the required 972... format
 */
export function formatIsraelPhoneForWhatsApp(phone: string): string {
    let cleaned = phone.replace(/[^\d]/g, '');

    // If it starts with 0, replace with 972
    if (cleaned.startsWith('0')) {
        cleaned = '972' + cleaned.substring(1);
    } else if (!cleaned.startsWith('972')) {
        // If it doesn't have an international code and doesn't start with 0, assume it's just missing the prefix
        cleaned = '972' + cleaned;
    }

    return cleaned;
}

/**
 * Sends a generic WhatsApp message via a Make.com webhook.
 * Expected Make.com structure: { name, phone, message, action }
 */
export async function sendGenericWhatsAppMessage(name: string, phone: string, message: string, action: string): Promise<boolean> {
    const formattedPhone = formatIsraelPhoneForWhatsApp(phone);

    if (!formattedPhone || formattedPhone.length < 10) {
        console.error('[whatsapp] Invalid phone number:', phone);
        return false;
    }

    try {
        const response = await fetch(WHATSAPP_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                phone: formattedPhone,
                message,
                action, // Added action field
            }),
        });

        if (!response.ok) {
            let text = '';
            try {
                text = await response.text();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                // Ignored
            }
            console.error('[whatsapp] Webhook responded with error:', response.status, text);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[whatsapp] Failed to trigger webhook:', error);
        return false;
    }
}
