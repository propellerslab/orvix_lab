// lib/whatsapp.ts
import { CartItem } from '@/context/cart-context';

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  taxId?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export function formatOrderWhatsAppMessage({
  orderNumber,
  orderId,
  shipping,
  items,
  subtotal,
  total,
  siteUrl,
}: {
  orderNumber: string;
  orderId: string;
  shipping: ShippingDetails;
  items: CartItem[];
  subtotal: number;
  total: number;
  siteUrl: string;
}): string {
  const lineItemsText = items
    .map((item, idx) => {
      const meta = item.metadata ? Object.entries(item.metadata).map(([k, v]) => `${k}: ${v}`).join(', ') : '';
      return `${idx + 1}. *${item.title}* [x${item.quantity}]
   • SKU: \`${item.sku}\`
   • Unit: $${item.unitPrice.toFixed(2)} | Subtotal: $${(item.unitPrice * item.quantity).toFixed(2)}${meta ? `\n   • Config: [${meta}]` : ''}`;
    })
    .join('\n\n');

  const message = `*ORVIX LAB // FABRICATION ORDER TRANSMISSION*
====================================
*ORDER IDENTIFIER:* \`${orderNumber}\`
*TRACKING REFERENCE:* ${siteUrl}/orders/${orderId}

*OPERATOR CREDENTIALS:*
• *Client Name:* ${shipping.fullName}
• *Email:* ${shipping.email}
• *Phone:* ${shipping.phone}
${shipping.company ? `• *Company:* ${shipping.company}\n` : ''}${shipping.taxId ? `• *Tax / PAN ID:* ${shipping.taxId}\n` : ''}
*DELIVERY DESTINATION:*
${shipping.street}, ${shipping.city}, ${shipping.state} ${shipping.postalCode}, ${shipping.country}
${shipping.notes ? `*NOTES:* _${shipping.notes}_\n` : ''}
====================================
*ITEMIZED MANIFEST (${items.length} LINE ITEMS):*

${lineItemsText}

====================================
*FINANCIAL SUMMARY:*
• *Subtotal:* ${subtotal.toFixed(2)} NPR
• *Estimated Tax / Logistics:* Calculated upon dispatch
• *Total Baseline:* *${total.toFixed(2)} NPR*

_Action: Please confirm laboratory production scheduling and dispatch invoice._`;

  return message;
}

export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
