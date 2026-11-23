import type { PaymentProvider, PaymentVerificationResult } from './types';

type PaystackVerification = {
  status: boolean;
  data?: {
    status?: string;
    amount?: number;
    currency?: string;
    customer?: { email?: string };
  };
};

const paystackProvider: PaymentProvider = {
  async verifyPayment({ reference, expectedAmount, email }): Promise<PaymentVerificationResult> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return { ok: false, status: 503, error: 'Payment verification is not configured.' };
    }

    let response: Response;
    try {
      response = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${secretKey}` } },
      );
    } catch {
      return { ok: false, status: 502, error: 'Unable to reach the payment provider.' };
    }

    if (!response.ok) {
      return { ok: false, status: 502, error: 'Unable to verify payment.' };
    }

    let verification: PaystackVerification;
    try {
      verification = await response.json() as PaystackVerification;
    } catch {
      return { ok: false, status: 502, error: 'Payment provider returned an invalid response.' };
    }

    const data = verification.status ? verification.data : undefined;
    if (!data || data.status !== 'success') {
      return { ok: false, status: 402, error: 'Payment was not successful.' };
    }

    if (data.currency !== 'NGN'
      || !Number.isFinite(data.amount)
      || data.amount !== expectedAmount) {
      return { ok: false, status: 402, error: 'Payment amount could not be verified.' };
    }

    if (data.customer?.email?.toLowerCase() !== email.toLowerCase()) {
      return { ok: false, status: 402, error: 'Payment email does not match the checkout details.' };
    }

    return { ok: true };
  },
};

export default paystackProvider;
