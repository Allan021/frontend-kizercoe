import type { ContactFormData, ContactResponse } from '@/types';

const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:3001';

export async function submitContact(data: ContactFormData): Promise<ContactResponse> {
  const res = await fetch(`${API_URL}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Error sending message');
  }

  return res.json() as Promise<ContactResponse>;
}
