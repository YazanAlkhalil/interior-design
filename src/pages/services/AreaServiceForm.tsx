import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51PZtlYRphJfzdM5XSy9pqvdvPJURAA53MbHA63bwirAI1k5ZNJxqVjXpvKuNpRKjNCX9Zacf2yf3CmI9OxOf1dxh00RJJeYfy6");

interface FormData {
  phoneNumber: string;  
  email: string;
  address: string;
  notes: string;
  city: string;
}

// Add this interface above the CheckoutForm component
interface PaymentFees {
  subtotal: number;
  fee: number;
  total: number;
}

// Add this utility function to calculate fees
const calculatePaymentFees = (subtotal: number, paymentMethod: 'STRIPE' | 'PAYPAL'): PaymentFees => {
  let fee = 0;
  
  if (paymentMethod === 'PAYPAL') {
    // PayPal: 3.49% + $0.49
    fee = (subtotal * 0.0349) + 0.49;
  } else {
    // Stripe: 2.9% + $0.30
    fee = (subtotal * 0.029) + 0.30;
  }

  return {
    subtotal,
    fee: Number(fee.toFixed(2)),
    total: Number((subtotal + fee).toFixed(2))
  };
};

// Add CheckoutForm component
const CheckoutForm = ({ orderUuid, subtotal }: { orderUuid: string; subtotal: number }) => {
  const { t } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { authFetch } = useAuthenticatedFetch();
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const navigate = useNavigate();

  // Calculate fees whenever payment method changes
  const fees = calculatePaymentFees(subtotal, paymentMethod);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const intentRes = await authFetch('payments/create-intent/', {
        method: 'POST',
        body: JSON.stringify({
          payment_method: paymentMethod,
          order_type: "service_order",  
          order_uuid: orderUuid,
          platform: "web",
        })
      });

      const intentData = await intentRes.json();

      if (paymentMethod === 'PAYPAL') {
        window.location.href = intentData.approval_url;
        return;
      }

      if (!stripe || !elements) return;
      
      const result = await stripe.confirmCardPayment(intentData.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message ?? "Payment failed");
      } else if (result.paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        navigate('/home');
      }
    } catch (err) {
      setError("Something went wrong with the payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('payment.completePayment')}</CardTitle>
        <CardDescription>{t('payment.choosePaymentMethod')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={paymentMethod === 'STRIPE' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('STRIPE')}
              className={`flex-1 ${paymentMethod === 'STRIPE' ? 'text-white' : ''}`}
            >
              {t('payment.creditCard')}
            </Button>
            <Button
              type="button"
              variant={paymentMethod === 'PAYPAL' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('PAYPAL')}
              className={`flex-1 ${paymentMethod === 'PAYPAL' ? 'text-white' : ''}`}
            >
              PayPal
            </Button>
          </div>

          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>{t('payment.subtotal')}:</span>
              <span>${fees.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('payment.processingFee')} ({paymentMethod === 'PAYPAL' ? 'PayPal' : t('payment.creditCard')}):</span>
              <span>${fees.fee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>{t('payment.total')}:</span>
                <span>${fees.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {paymentMethod === 'STRIPE' && (
            <div className="border rounded-lg p-4">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                }}
              />
            </div>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <Button 
            type="submit" 
            disabled={paymentMethod === 'STRIPE' ? (!stripe || loading) : loading} 
            className="w-full text-white"
          >
            {loading ? t('payment.processing'): `${t('payment.pay')} $${fees.total.toFixed(2)} ${t('payment.with')} ${paymentMethod === 'PAYPAL' ? 'PayPal' : 'Card'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AreaServiceForm = () => {
  const { t, language } = useLanguage();
  const rtlClass = language === 'ar' ? '[direction:rtl]' : '';
  const { authFetch } = useAuthenticatedFetch();
  const [areaServiceCost, setAreaServiceCost] = useState('');
  const [orderUuid, setOrderUuid] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add city field to formData
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: "",
    email: "",
    address: "",
    notes: "",
    city: "", // Add city field
  });

  // Fetch area service cost on component mount
  useEffect(() => {
    const fetchServiceCost = async () => {
      try {
        const response = await authFetch("service-settings/");
        const data = await response.json();
        setAreaServiceCost(data.area_service_cost);
      } catch (error) {
        toast.error("Failed to fetch service cost");
      }
    };
    fetchServiceCost();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await authFetch("area-services/", {
        method: "POST",
        body: JSON.stringify({
          notes: formData.notes,
          phone_number: formData.phoneNumber,
          email: formData.email,
          address: formData.address,
          city: formData.city,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setOrderUuid(data.uuid);
      } else {
        toast.error(data.message || "Failed to create service order");
      }
    } catch (error) {
      toast.error("An error occurred while creating the service order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {!orderUuid ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{t('services.areaServiceBooking')}</CardTitle>
              <CardDescription>
                {t('services.areaServiceDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">{t('services.phoneNumber')}</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                    }
                    placeholder={t('services.enterPhoneNumber')}
                    required
                    className={rtlClass}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('services.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder={t('services.enterEmail')}
                    required
                    className={rtlClass}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">{t('services.address')}</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder={t('services.enterAddress')}
                    required
                    className={rtlClass}
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">{t('services.city')}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder={t('services.enterCity')}
                    required
                    className={rtlClass}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">{t('services.additionalNotes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder={t('services.anySpecificRequirementsOrPreferences')}
                    rows={4}
                    className={rtlClass}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-xl font-semibold">
                    {t('services.serviceFee')}: ${areaServiceCost}
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('services.processing') : t('services.bookNow')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm orderUuid={orderUuid} subtotal={Number(areaServiceCost)} />
        </Elements>
      )}
    </div>
  );
};

export default AreaServiceForm; 