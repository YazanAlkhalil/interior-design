import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "../components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
interface CartItem {
  uuid: string;
  product_uuid: string;
  product_name: string;
  product_image: string | null;
  color_hex: string;
  quantity: number;
  price: string;
  subtotal: string;
}

interface CartResponse {
  uuid: string;
  items: CartItem[];
  total_items: number;
  subtotal: string;
}

// Initialize Stripe with your publishable key
const stripePromise = loadStripe("pk_test_51PZtlYRphJfzdM5XSy9pqvdvPJURAA53MbHA63bwirAI1k5ZNJxqVjXpvKuNpRKjNCX9Zacf2yf3CmI9OxOf1dxh00RJJeYfy6");

const CheckoutForm = ({ orderUuid }: { orderUuid: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { authFetch } = useAuthenticatedFetch();
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'PAYPAL'>('STRIPE');
  const { clearCart } = useCart();
  const navigate = useNavigate()
  const {t} = useLanguage()
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const intentRes = await authFetch('payments/create-intent/', {
        method: 'POST',
        body: JSON.stringify({
          payment_method: paymentMethod,
          order_type: "order",
          order_uuid: orderUuid,
          platform: "web",
        })
      });

      const intentData = await intentRes.json();

      if (paymentMethod === 'PAYPAL') {
        // Redirect to PayPal
        window.location.href = intentData.approval_url;
        return;
      }

      // Continue with Stripe payment flow
      if (!stripe || !elements) return;
      
      const result = await stripe.confirmCardPayment(intentData.client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });
      console.log(result,'res');
      if (result.error) {
        setError(result.error.message ?? "Payment failed");
      } else if (result.paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        navigate('/home')
        clearCart()
        // const res = await authFetch('payments/paypal_success/?paymentId')
        // You might want to redirect to an order confirmation page here
      }
    } catch (err) {
      setError("Something went wrong with the payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4 mb-4">
        <Button
          type="button"
          variant={paymentMethod === 'STRIPE' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('STRIPE')}
          className={`flex-1 ${paymentMethod === 'STRIPE' ? 'text-white' : ''}`}
        >
          {t('cart.creditCard')}
        </Button>
        <Button
          type="button"
          variant={paymentMethod === 'PAYPAL' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('PAYPAL')}
          className={`flex-1 ${paymentMethod === 'PAYPAL' ? 'text-white' : ''}`}
        >
          {t('cart.paypal')}
        </Button>
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
          {loading ? t('cart.processing') : paymentMethod === 'PAYPAL' ? t('cart.payWithPaypal') : t('cart.payWithCard')}
      </Button>
    </form>
  );
};

const Cart = () => {
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ uuid: string; color_hex: string } | null>(null);
  const [orderUuid, setOrderUuid] = useState<string | null>(null);
  const {t, language} = useLanguage()
  const [shippingInfo, setShippingInfo] = useState({
    phone: "",
    email: "",
    address: "",
    city: "",
    postal_code: ""
  });

  const { authFetch } = useAuthenticatedFetch();
  
  async function getCartItems() {
    try {
      const res = await authFetch('cart/');
      if (res.ok) {
        const data = await res.json();
        setCartData(data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }

  useEffect(() => {
    getCartItems();
  }, []);


  const handleCheckout = async () => {
    console.log("Creating order");
    const res = await authFetch('order/create/', {
      method: 'POST',
      body: JSON.stringify({
        ...shippingInfo
      })
    });

    if (res.status === 201) {
      console.log("Order created");
      const data = await res.json();
      setOrderUuid(data.data.uuid);
      
    }
  }

  const removeFromCart = async (uuid: string, color_hex: string) => {
    setDeletingItem({ uuid, color_hex });
  };

  const confirmDeleteItem = async () => {
    if (!deletingItem) return;
    
    const res = await authFetch(`cart/item/${deletingItem.uuid}/`, {
      method: 'DELETE',
    });
    if (res.status === 204 ) {
      toast.success('Item removed from cart');
      getCartItems(); // Refresh cart data
    }
    setDeletingItem(null);
  };

  const updateQuantity = async (uuid: string, color_hex: string, newQuantity: number) => {
    try {
      const res = await authFetch(`cart/item/${uuid}/`, {
        method: 'PUT',
        body: JSON.stringify({
          quantity: newQuantity
        })
      });

      if (res.status === 200) {
        toast.success('Quantity updated');
        getCartItems(); // Refresh cart data
      } else {
        toast.error('Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.shoppingCart')}</h1>

      {!cartData?.items?.length ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{t('cart.yourCartIsEmpty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ScrollArea className={`h-[600px] ${language === 'ar' ? '[direction:rtl]' : '[direction:ltr]'}`}>
              {cartData.items.map((item, index) => (
                <motion.div
                  key={item.uuid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 border-b py-4"
                >
                  <img
                    src={item.product_image || '/placeholder-image.jpg'}
                    alt={item.product_name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product_name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                     {t('cart.color')}: <span className="inline-block w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: item.color_hex }} />
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.uuid, item.color_hex, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.uuid, item.color_hex, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.uuid, item.color_hex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${parseFloat(item.subtotal).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </ScrollArea>
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 space-y-4 sticky top-24">
              <h3 className="text-xl font-semibold">{t('cart.orderSummary')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')}</span>
                  <span>${parseFloat(cartData.subtotal).toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>{t('cart.total')}</span>
                    <span>${parseFloat(cartData.subtotal).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {!orderUuid && (
                <div className="space-y-3">
                  <Input
                    placeholder={t('cart.email')}
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    placeholder={t('cart.phone')}
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    placeholder={t('cart.address')}
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                  <Input
                    placeholder={t('cart.city')}
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                  />
                  <Input
                    placeholder={t('cart.postalCode')}
                    value={shippingInfo.postal_code}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, postal_code: e.target.value }))}
                  />
                </div>
              )}

              {orderUuid ? (
                <Elements stripe={stripePromise}>
                  <CheckoutForm orderUuid={orderUuid} />
                </Elements>
              ) : (
                <Button 
                  className="w-full text-white bg-primary" 
                  size="lg" 
                  onClick={handleCheckout}
                  disabled={!shippingInfo.email || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postal_code}
                >
                  {t('cart.proceedToCheckout')}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cart.confirmDeletion')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{t('cart.areYouSureYouWantToRemoveThisItemFromYourCartThisActionCannotBeUndone')}</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletingItem(null)}>
                {t('cart.cancel')}
              </Button>
              <Button variant="destructive" onClick={confirmDeleteItem}>
                {t('cart.delete')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart; 