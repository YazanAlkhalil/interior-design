import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Calendar } from "../../components/ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { CalendarIcon } from "lucide-react";
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

// Mock data - Move to a separate file in production


interface Employee {

  uuid: string;

  user: {
    first_name: string;
    last_name: string;

  }
  specialization: string;
}

interface ConsultationMethod {
  uuid: string;
  name: string;
  is_available: boolean;
}

interface TimeSlot {
  time: string;
  end_time: string;
}

interface PaymentFees {
  subtotal: number;
  fee: number;
  total: number;
}

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

// Mock employees data
// const employees: Employee[] = [
//   { id: "1", name: "John Smith", specialization: "Interior Designer" },
//   { id: "2", name: "Sarah Johnson", specialization: "Color Specialist" },
//   { id: "3", name: "Mike Brown", specialization: "Space Planning" },
// ];

// Add CheckoutForm component
const CheckoutForm = ({ orderUuid, subtotal }: { orderUuid: string; subtotal: number }) => {
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
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>Choose your payment method</CardDescription>
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
              Credit Card
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

          {/* Add payment breakdown */}
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${fees.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Processing Fee ({paymentMethod === 'PAYPAL' ? 'PayPal' : 'Credit Card'}):</span>
              <span>${fees.fee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
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
            {loading ? "Processing..." : `Pay $${fees.total.toFixed(2)} with ${paymentMethod === 'PAYPAL' ? 'PayPal' : 'Card'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ConsultationServiceForm = () => {
  const { t, language } = useLanguage();
  const rtlClass = language === 'ar' ? '[direction:rtl]' : '';
  const { authFetch } = useAuthenticatedFetch();
  const [formData, setFormData] = useState({
    section: "",
    employeeId: "",
    date: null as Date | null,
    minutes: "",
    timeSlot: "",
    method: "",
    phoneNumber: "",
    notes: "",
    address: "",
    city: "",
    email: "",
  });

  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [methods, setMethods] = useState<ConsultationMethod[]>([]);
  const [employees,setEmployees] = useState([])
  const [consulting_hourly_rate,setConsultingHourlyRate] = useState('')
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [orderUuid, setOrderUuid] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAvailableHours = async () => {
    const response = await authFetch(`consulting-services/available_slots/?consultant_uuid=${formData.employeeId}&date=${format(formData.date!, "yyyy-MM-dd")}&duration=${formData.minutes}`)
    const data = await response.json()
    setAvailableHours(data.slots);
  }

  // Fetch available hours based on employee and date selection
  useEffect(() => {
    if (formData.employeeId && formData.date && formData.minutes) {
      fetchAvailableHours()
    }
  }, [formData.employeeId, formData.date,formData.minutes]);

  // Add new useEffects for fetching methods and consultants
  useEffect(() => {
    fetchMethods();
    fetchConsultants();
    fetchHours()
  }, []);

  const fetchHours = async () => {
    try {
      const response = await authFetch("service-settings/");
      const data = await response.json();
      setConsultingHourlyRate(data.consulting_hourly_rate);
    } catch (error) {
      toast.error("Failed to fetch Hourly rate");
    }
  };

  const fetchMethods = async () => {
    try {
      const response = await authFetch("service-methods/available/");
      const data = await response.json();
      setMethods(data.data.filter((method: ConsultationMethod) => method.is_available));
    } catch (error) {
      toast.error("Failed to fetch consultation methods");
    }
  };

  const fetchConsultants = async () => {
    try {
      const response = await authFetch("employees/?is_consultable=true");
      const data = await response.json();
      setEmployees(data.data);
    } catch (error) {
      toast.error("Failed to fetch consultants");
    }
  };

  // Update the time slots fetching logic
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (formData.employeeId && formData.date && formData.minutes) {
        setIsLoadingSlots(true);
        try {
          const response = await authFetch(`consulting-services/available_slots/?consultant_uuid=${formData.employeeId}&date=${format(formData.date, "yyyy-MM-dd")}&duration=${formData.minutes}`);
          
          const data = await response.json();
          if (response.ok) {
            setAvailableTimeSlots(data.slots);
          } else {
            toast.error("Failed to fetch available time slots");
          }
        } catch (error) {
          toast.error("Failed to fetch available time slots");
        } finally {
          setIsLoadingSlots(false);
        }
      }
    };

    fetchTimeSlots();
  }, [formData.employeeId, formData.date, formData.minutes]);

  // Calculate total price
  useEffect(() => {
    if (formData.minutes) {
      setTotalPrice(parseInt(formData.minutes) * Number(consulting_hourly_rate) / 60);
    }
  }, [formData.minutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await authFetch("consulting-services/", {
        method: "POST",
        body: JSON.stringify({
          section_uuid: formData.section,
          consultant_uuid: formData.employeeId,
          scheduled_date: format(formData.date!, "yyyy-MM-dd"),
          scheduled_time: formData.timeSlot,
          duration: formData.minutes,
          method_uuid: formData.method,
          phone_number: formData.phoneNumber,
          notes: formData.notes,
          address: formData.address,
          email: formData.email,
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
    <div className="max-w-2xl mx-auto p-6">
      {!orderUuid ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{t('services.consultationServiceBooking')}</CardTitle>
              <CardDescription>
                {t('services.scheduleConsultation')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="employee">{t('services.selectConsultant')}</Label>
                    <Select
                      value={formData.employeeId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, employeeId: value }))
                      }
                    >
                      <SelectTrigger className={rtlClass}>
                        <SelectValue placeholder={t('services.selectConsultantPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee:Employee) => (
                          <SelectItem key={employee.uuid} value={employee.uuid}>
                            {employee.user.first_name} - {employee.user.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label>{t('services.selectDate')}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.date ? format(formData.date, "PPP") : t('services.pickDate')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.date!}
                          onSelect={(date) =>
                            setFormData((prev:any) => ({ ...prev, date }))
                          }
                          disabled={(date) =>
                            date < new Date() || date > new Date(2025, 10, 1)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="minutes">{t('services.duration')}</Label>
                    <Input
                      id="minutes"
                      type="number"
                      value={formData.minutes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, minutes: e.target.value }))
                      }
                      placeholder={t('services.enterDuration')}
                      min="1"
                      required
                      disabled={!formData.date || !formData.employeeId}
                      className={rtlClass}
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="time">{t('services.selectTime')}</Label>
                    <Select
                      value={formData.timeSlot}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, timeSlot: value }))
                      }
                      disabled={!formData.minutes || isLoadingSlots}
                    >
                      <SelectTrigger className={rtlClass}>
                        <SelectValue placeholder={isLoadingSlots ? t('common.loading') : t('services.selectTimeSlot')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map((slot) => (
                          <SelectItem key={slot.time} value={slot.time}>
                            {slot.time} - {slot.end_time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Method Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="method">{t('services.consultationMethod')}</Label>
                    <Select
                      value={formData.method}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, method: value }))
                      }
                    >
                      <SelectTrigger className={rtlClass}>
                        <SelectValue placeholder={t('services.selectMethod')} />
                      </SelectTrigger>
                      <SelectContent>
                        {methods.map((method) => (
                          <SelectItem key={method.uuid} value={method.uuid}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contact Information */}
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

                  <div className="space-y-2">
                    <Label htmlFor="address">{t('services.address')}</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      placeholder={t('services.enterAddress')}
                      required
                      className={rtlClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">{t('services.city')}</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder={t('services.enterCity')}
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

                  {/* Submit Button with Price */}
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-xl font-semibold">
                      {t('services.total')}: ${totalPrice}
                    </div>
                    <Button 
                      type="submit"
                      className="text-white"
                      size="lg"
                      disabled={
                        !formData.employeeId ||
                        !formData.date ||
                        !formData.minutes ||
                        !formData.timeSlot ||
                        !formData.method ||
                        !formData.phoneNumber ||
                        !formData.email ||
                        !formData.address ||
                        isSubmitting
                      }
                    >
                      {isSubmitting ? t('services.booking') : t('services.bookConsultation')}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm orderUuid={orderUuid} subtotal={totalPrice} />
        </Elements>
      )}
    </div>
  );
};

export default ConsultationServiceForm; 