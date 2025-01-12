import { useEffect, useState } from "react";
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
import { ImagePlus, X } from "lucide-react";
import { Label } from "../../components/ui/label";
import { useLanguage } from "../../context/LanguageContext";
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

// Mock data - move to separate file in production
const sections = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office"];
// const plans = ["Basic", "Standard", "Premium"];
const colors = ["Neutral", "Warm", "Cool", "Bold", "Pastel"];
const FIXED_PRICE = 299.99;

export interface ColorOption {
  hexColor: string;
}

export const colorOptions: ColorOption[] = [
  { hexColor: "#000000" }, // Black
  { hexColor: "#FFFFFF" }, // White
  { hexColor: "#808080" }, // Gray
  { hexColor: "#FF0000" }, // Red
  { hexColor: "#008000" }, // Green
  { hexColor: "#0000FF" }, // Blue
  { hexColor: "#FFFF00" }, // Yellow
  { hexColor: "#00FFFF" }, // Cyan
  { hexColor: "#FF00FF" }, // Magenta
  { hexColor: "#FFA500" }, // Orange
  { hexColor: "#A52A2A" }, // Brown`
  { hexColor: "#FFC0CB" }, // Pink
  { hexColor: "#800080" }, // Purple
  { hexColor: "#8B0000" }, // Dark Red
  { hexColor: "#B22222" }, // Firebrick
  { hexColor: "#DC143C" }, // Crimson
  { hexColor: "#FFA07A" }, // Light Salmon
  { hexColor: "#FF8C00" }, // Dark Orange
  { hexColor: "#FFD700" }, // Gold
  { hexColor: "#808000" }, // Olive
  { hexColor: "#556B2F" }, // Dark Olive Green
  { hexColor: "#7FFF00" }, // Chartreuse
  { hexColor: "#32CD32" }, // Lime Green
  { hexColor: "#228B22" }, // Forest Green
  { hexColor: "#008B8B" }, // Dark Cyan
  { hexColor: "#008080" }, // Teal
  { hexColor: "#4682B4" }, // Steel Blue
  { hexColor: "#4169E1" }, // Royal Blue
  { hexColor: "#9370DB" }, // Medium Purple
  { hexColor: "#4B0082" }, // Indigo
  { hexColor: "#DAA520" }, // Goldenrod
  { hexColor: "#A0522D" }, // Sienna
  { hexColor: "#F5F5DC" }, // Beige
  { hexColor: "#E6E6FA" }, // Lavender
  { hexColor: "#F5FFFA" }, // Mint Cream
  { hexColor: "#708090" }, // Slate Gray
  { hexColor: "#B0C4DE" }, // Light Steel Blue
  { hexColor: "#D3D3D3" }, // Light Gray
  { hexColor: "#C0C0C0" }, // Silver
  { hexColor: "#696969" }, // Dim Gray
  { hexColor: "#A9A9A9" }, // Dark Gray
  { hexColor: "#FFD1DC" }, // Pastel Pink
  { hexColor: "#AEC6CF" }, // Pastel Blue
  { hexColor: "#77DD77" }, // Pastel Green
  { hexColor: "#FDFD96" }, // Pastel Yellow
  { hexColor: "#CDB4DB" }, // Pastel Purple
];

interface FormData {
  section_uuid: string;
  plan_uuid: string;
  area: number;
  prefered_colors: string[];
  phone_number: string;
  email: string;
  address: string;
  city: string;
  area_file: File | null;
  inspiration_files: File[];
  notes: string;
}

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51PZtlYRphJfzdM5XSy9pqvdvPJURAA53MbHA63bwirAI1k5ZNJxqVjXpvKuNpRKjNCX9Zacf2yf3CmI9OxOf1dxh00RJJeYfy6");

// Add the CheckoutForm component
const CheckoutForm = ({ orderUuid, subtotal }: { orderUuid: string; subtotal: number }) => {
  const { t } = useLanguage();
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { authFetch } = useAuthenticatedFetch();
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const navigate = useNavigate();

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

interface PaymentFees {
  subtotal: number;
  fee: number;
  total: number;
}

const DesignServiceForm = () => {
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<any[]>([]);
  const [sections, setSections] = useState<{ uuid: string; title: string; }[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const {authFetch} = useAuthenticatedFetch();
  const rtlClass = language === 'ar' ? '[direction:rtl]' : '';

  const [formData, setFormData] = useState<FormData>({
    section_uuid: "",
    plan_uuid: "",
    area: 0,
    prefered_colors: [],
    phone_number: "",
    email: "",
    address: "",
    city: "",
    area_file: null,
    inspiration_files: [],
    notes: "",
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [orderUuid, setOrderUuid] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const files = Array.from(e.target.files || []);
    if (files.length + formData.inspiration_files.length > 5) {
      alert("You can only upload up to 5 images");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      inspiration_files: [...prev.inspiration_files, ...files],
    }));

    // Create URLs for preview
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      inspiration_files: prev.inspiration_files.filter((_, i) => i !== index),
    }));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleColorSelect = (hexValue: string) => {
    if (selectedColors.length < 5) {  // Limit to 5 colors like images
      setSelectedColors(prev => [...prev, hexValue]);
      setFormData(prev => ({
        ...prev,
        prefered_colors: [...prev.prefered_colors, hexValue]
      }));
    } else {
      toast.error(t('errors.maxColorsReached'));
    }
  };

  const removeColor = (index: number) => {
    setSelectedColors(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      prefered_colors: prev.prefered_colors.filter((_, i) => i !== index)
    }));
  };

  useEffect(() => {
    getPlans();
    fetchSections();
  }, []);

  useEffect(() => {
    // Calculate total price when plan or area changes
    const selectedPlan = plans.find(p => p.uuid === formData.plan_uuid);
    if (selectedPlan && formData.area) {
      setTotalPrice(selectedPlan.price * formData.area);
    }
  }, [formData.plan_uuid, formData.area, plans]);

  const fetchSections = async () => {
    try {
      const response = await authFetch("sections/?page_size=100");
      const data = await response.json();
      setSections(data.results || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error(t('errors.failedToFetchSections'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.section_uuid || 
        !formData.plan_uuid || 
        !formData.area || 
        !formData.phone_number || 
        !formData.email || 
        !formData.address ||
        !formData.area_file ||  // Make area_file required
        formData.inspiration_files.length === 0 ||  // Require at least one inspiration file
        formData.prefered_colors.length === 0  // Require at least one color
        ) {
      toast.error(t('errors.fillAllRequired'));
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    
    // Append all form fields
    formDataToSend.append('section_uuid', formData.section_uuid);
    formDataToSend.append('plan_uuid', formData.plan_uuid);
    formDataToSend.append('area', formData.area.toString());
    formDataToSend.append('phone_number', formData.phone_number);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('city', formData.city);
    
    if (formData.area_file) {
      formDataToSend.append('area_file', formData.area_file);
    }

    formData.inspiration_files.forEach((file) => {
      formDataToSend.append('inspiration_files', file);
    });

    formData.prefered_colors.forEach((color) => {
      formDataToSend.append('prefered_colors', color);
    });

    try {
      const response = await authFetch("design-services/", {
        method: "POST",
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setOrderUuid(data.uuid);
      } else {
        toast.error(data.message || t('errors.failedToSubmit'));
      }
    } catch (error) {
      toast.error(t('errors.submissionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, area_file: file }));
  };

  const getPlans = async () => {
    const response = await authFetch('plans/');
    const result = await response.json();
    setPlans(result.data);
  };

  return (
    <div className="container mx-auto py-8">
      {!orderUuid ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{t('services.designServiceBooking')}</CardTitle>
              <CardDescription>
                {t('services.provideYourDetailsForDesignService')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section Selection */}
                <div className="space-y-2">
                  <Label htmlFor="section">{t('services.selectSection')} *</Label>
                  <Select
                    value={formData.section_uuid}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, section_uuid: value }))
                    }
                    required
                  >
                    <SelectTrigger className={rtlClass}>
                      <SelectValue placeholder={t('services.selectSection')} />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.uuid} value={section.uuid}>
                          {section.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>{t('services.uploadImages')}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {formData.inspiration_files.length < 5 && (
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          id="images"
                          onChange={handleImageChange}
                        />
                        <Label
                          htmlFor="images"
                          className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary"
                        >
                          <ImagePlus className="w-6 h-6" />
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Area File Input */}
                <div className="space-y-2">
                  <Label htmlFor="areaFile">{t('services.areaFile')} *</Label>
                  <Input
                    id="areaFile"
                    type="file"
                    onChange={handleFileChange}
                    required
                    className={rtlClass}
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">{t('services.address')} *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    required
                    className={rtlClass}
                  />
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <Label htmlFor="size">{t('services.roomSize')} *</Label>
                  <Input
                    id="size"
                    type="number"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, area: Number(e.target.value) }))
                    }
                    required
                    className={rtlClass}
                  />
                </div>

                {/* Plan Selection */}
                <div className="space-y-2">
                  <Label htmlFor="plan">{t('services.selectPlan')} *</Label>
                  <Select
                    value={formData.plan_uuid}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, plan_uuid: value }))
                    }
                    required
                  >
                    <SelectTrigger className={rtlClass}>
                      <SelectValue placeholder={t('services.selectPlan')} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.uuid} value={plan.uuid}>
                          <div>
                            <div>{plan.title}</div>
                            <div className="text-sm text-gray-500">{plan.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Preference */}
                <div className="space-y-2">
                  <Label>{t('services.selectColorScheme')}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {selectedColors.map((hex, index) => (
                      <div key={index} className="relative">
                        <div 
                          className="w-full h-12 rounded-lg"
                          style={{ backgroundColor: hex }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 w-6 h-6"
                          onClick={() => removeColor(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {selectedColors.length < 5 && (
                      <Select
                        value=""
                        onValueChange={handleColorSelect}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={t('services.addColor')} />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.hexColor} value={color.hexColor}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: color.hexColor }}
                                />
                                {color.hexColor}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
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
                    className={rtlClass}
                    rows={4}
                  />
                </div>

                {/* Phone and Email fields */}
                <div className="space-y-2">
                  <Label htmlFor="phone_number">{t('services.phoneNumber')} *</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone_number: e.target.value }))
                    }
                    required
                    className={rtlClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('services.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    required
                    className={rtlClass}
                  />
                </div>

                {/* City field */}
                <div className="space-y-2">
                  <Label htmlFor="city">{t('services.city')}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('services.processing') : t('services.bookService')}
                  </Button>
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

export default DesignServiceForm;
