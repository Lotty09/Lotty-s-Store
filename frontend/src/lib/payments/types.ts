export type PaymentRequest = {
  email: string;
  amount: number;
  reference: string;
};

export type PaymentCallbacks = {
  onSuccess: (reference: string) => void;
  onClose: () => void;
  onError: (message: string) => void;
};

export type StartPayment = (
  request: PaymentRequest,
  callbacks: PaymentCallbacks,
) => void;

export type UsePaymentProvider = (publicKey: string) => StartPayment;
