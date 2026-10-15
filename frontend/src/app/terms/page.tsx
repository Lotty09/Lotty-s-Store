export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Terms & Conditions and Refund Policy</h1>
        
        <div className="space-y-8 text-gray-600">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. General Overview</h2>
            <p>Welcome to Lotty's Store. By using our website and purchasing our products, you agree to be bound by these terms. All transactions are processed securely.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Shipping and Delivery</h2>
            <p>We process all orders within 24-48 hours. Delivery timelines depend on your location within Nigeria. We are not responsible for delays caused by third-party logistics, but we will always assist in tracking your order.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Returns and Refund Policy</h2>
            <p>Customer satisfaction is our priority. If you receive a defective or incorrect item, you must contact us within 3 days of delivery. To be eligible for a return, your item must be unused and in the exact condition that you received it.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Refunds are processed within 3-5 business days after we receive the returned item.</li>
              <li>Custom designs or finalized variant orders are generally non-refundable unless damaged upon arrival.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Contact Information</h2>
            <p>If you have any questions regarding your order or these terms, please contact our support team:</p>
            <ul className="mt-2 font-medium text-gray-900">
              <li>Email: lottystorrsupoort@gmail.com</li>
              <li>Phone: +234 9018684798</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}