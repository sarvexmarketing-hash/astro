/**
 * Razorpay Standard Web Checkout Integration
 *
 * Dynamically loads checkout.js from Razorpay CDN (never bundled or self-hosted)
 * and opens the standard checkout modal for server-created orders.
 */

import { getToken } from './api-client';

export interface CheckoutPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface OpenCheckoutParams {
  amount: number; // in smallest currency subunit (e.g. paise for INR: 100 paise = ₹1)
  currency?: string; // ISO 4217 code (default 'INR')
  name?: string;
  description?: string;
  prefill?: CheckoutPrefill;
  notes?: Record<string, any>;
  themeColor?: string;
  onSuccess: (data: { status: string; message: string; order_id: string; payment_id: string }) => void;
  onError: (errorMessage: string) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically injects checkout.js from Razorpay CDN via a script tag.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay Standard Web Checkout:
 * 1. Calls POST /api/create-order to create order server-side
 * 2. Opens checkout modal with server-returned key_id and order_id
 * 3. On success, calls POST /api/verify-payment for server-side HMAC validation
 * 4. Handles modal dismissal and payment failure events safely
 */
export async function openRazorpayStandardCheckout(params: OpenCheckoutParams): Promise<void> {
  const {
    amount,
    currency = 'INR',
    name = 'Astrowave',
    description = 'Astrowave Consultation & Services',
    prefill = {},
    notes = {},
    themeColor = '#F7C93E',
    onSuccess,
    onError,
    onDismiss,
  } = params;

  // 1. Ensure checkout.js script is loaded from CDN
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !(window as any).Razorpay) {
    onError('Unable to load Razorpay payment gateway. Please check your internet connection.');
    return;
  }

  // 2. Call backend to create Razorpay Order
  let createOrderData: { order_id: string; amount: number; currency: string; key_id: string };
  try {
    const token = getToken();
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: reqHeaders,
      credentials: 'include',
      body: JSON.stringify({
        amount,
        currency,
        notes: {
          ...notes,
          order_id: notes.order_id || `order_${Date.now()}`,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.order_id) {
      onError(data.error || 'Failed to create payment order. Please try again.');
      return;
    }
    createOrderData = data;
  } catch (err: any) {
    onError(err.message || 'Network error while initiating payment.');
    return;
  }

  // 3. Configure Checkout modal options with key_id and order_id from backend
  const options = {
    key: createOrderData.key_id,
    amount: createOrderData.amount,
    currency: createOrderData.currency || 'INR',
    name,
    description,
    order_id: createOrderData.order_id,
    prefill: {
      name: prefill.name || '',
      email: prefill.email || '',
      contact: prefill.contact || '',
    },
    notes: {
      ...notes,
      order_id: createOrderData.order_id,
    },
    theme: {
      color: themeColor,
    },
    handler: async (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
      try {
        // 4. Verify signature server-side before confirming payment to customer
        const token = getToken();
        const verifyHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          verifyHeaders['Authorization'] = `Bearer ${token}`;
        }

        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: verifyHeaders,
          credentials: 'include',
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && (verifyData.status === 'success' || verifyData.success)) {
          onSuccess(verifyData);
        } else {
          onError(verifyData.error || 'Payment signature verification failed. Please contact support if amount was debited.');
        }
      } catch (err: any) {
        onError(err.message || 'Error communicating with server during payment verification.');
      }
    },
    modal: {
      ondismiss: () => {
        // Customer closed modal — treated as cancelled, not an error
        if (onDismiss) {
          onDismiss();
        }
      },
    },
  };

  const rzp = new (window as any).Razorpay(options);

  // 5. Register payment failure listener: allow customer to retry, DO NOT verify
  rzp.on('payment.failed', (failureResponse: any) => {
    const errorDescription = failureResponse?.error?.description || 'Payment was unsuccessful. You may try again.';
    onError(errorDescription);
  });

  rzp.open();
}

