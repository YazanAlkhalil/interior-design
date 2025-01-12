import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {authFetch} = useAuthenticatedFetch()
  const {t} = useLanguage()

  useEffect(() => {
    const completePayment = async () => {
      try {
        const paymentId = searchParams.get('paymentId');
        const PayerID = searchParams.get('PayerID');
        const payment_uuid = searchParams.get('payment_uuid');


        if (!paymentId || !PayerID || !payment_uuid) {
          throw new Error('Missing required payment parameters');
        }

        const response = await authFetch(
          `payments/paypal-success/?paymentId=${paymentId}&PayerID=${PayerID}&payment_uuid=${payment_uuid}`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error('Payment completion failed');
        }

        // Payment successful, redirect to orders page or show success message
        navigate('/home');
      } catch (err) {
        setError(err instanceof Error ? err.message : t('common.paymentFailed'));
      }
    };

    completePayment();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => navigate('/cart')}
          className="text-blue-500 hover:underline"
        >
          {t('common.returnToCart')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-4">{t('common.processingPayment')}</div>
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
      </div>
    </div>
  );
} 