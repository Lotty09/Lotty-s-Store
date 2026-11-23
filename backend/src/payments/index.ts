import paystackProvider from './paystack';
import type { PaymentProvider } from './types';

const providers: Record<string, PaymentProvider> = {
  paystack: paystackProvider,
};

export const getPaymentProvider = (): PaymentProvider | null => {
  const providerName = (process.env.PAYMENT_PROVIDER ?? 'paystack').trim().toLowerCase();
  return providers[providerName] ?? null;
};
