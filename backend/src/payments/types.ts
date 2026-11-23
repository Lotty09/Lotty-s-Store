export type PaymentVerificationInput = {
  reference: string;
  expectedAmount: number;
  email: string;
};

export type PaymentVerificationResult =
  | { ok: true }
  | { ok: false; status: 402 | 502 | 503; error: string };

export interface PaymentProvider {
  verifyPayment(input: PaymentVerificationInput): Promise<PaymentVerificationResult>;
}
