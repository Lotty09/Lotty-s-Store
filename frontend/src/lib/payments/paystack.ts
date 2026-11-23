import { usePaystackPayment } from 'react-paystack';
import type { UsePaymentProvider } from './types';

export const getPaystackPublicKey = () =>
  process.env.NEXT_PUBLIC_PAYMENT_PUBLIC_KEY
  || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  || '';

const usePaystackProvider: UsePaymentProvider = (publicKey) => {
  const initializePayment = usePaystackPayment({ publicKey, email: '', amount: 0 });

  return (request, callbacks) => {
    initializePayment({
      config: {
        email: request.email,
        amount: request.amount,
        reference: request.reference,
      },
      onSuccess: (response?: unknown) => {
        const reference = typeof response === 'string'
          ? response
          : typeof response === 'object' && response !== null && 'reference' in response
            ? response.reference
            : null;

        if (typeof reference !== 'string' || reference.length === 0) {
          callbacks.onError('Payment provider did not return a reference.');
          return;
        }

        callbacks.onSuccess(reference);
      },
      onClose: callbacks.onClose,
    });
  };
};

export default usePaystackProvider;
