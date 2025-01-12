import { useEffect, useState } from 'react';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { useLanguage } from '../context/LanguageContext';
import { Button } from "../components/ui/button";

interface OrderItem {
  uuid: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface Order {
  uuid: string;
  type: string;
  paid: boolean;
  reference_number: string;
  status: string;
  created_at: string;
  address: string | null;
  phone: string;
  email: string | null;
  city: string;
  notes: string | null;
  items: OrderItem[] | null;
  amount: number;
  payable: boolean;
  payment_uuids: string;
}

const OrdersPage = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const { authFetch, isLoading } = useAuthenticatedFetch();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authFetch('combined-orders/');
        if (response.ok) {
          const result = await response.json();
          setOrders(result.data.results);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [authFetch]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500 text-yellow-50';
      case 'PROCESSING':
        return 'bg-blue-500 text-blue-50';
      case 'COMPLETED':
        return 'bg-green-500 text-green-50';
      default:
        return 'bg-gray-500 text-gray-50';
    }
  };

  const handleRefund = async (paymentUuid: string) => {
    try {
      const response = await authFetch(`payments/${paymentUuid}/refund/`, {
        method: 'POST',
      });
      if (response.ok) {
        const ordersResponse = await authFetch('combined-orders/');
        if (ordersResponse.ok) {
          const result = await ordersResponse.json();
          setOrders(result.data);
        }
      } else {
        console.error('Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  const isWithin24Hours = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
        <Badge variant="outline">
          {t('orders.total')}: {orders.length}
        </Badge>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.uuid} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div>
                    <CardTitle className="text-lg">{order.reference_number}</CardTitle>
                    <CardDescription>
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant={order.paid ? "default" : "destructive"} className='text-white'>
                    {order.paid ? t('cart.paymentCompleted') : t('cart.paymentPending')}
                  </Badge>
                  <Badge className={getStatusColor(order.status)}>
                    {t(`orders.status.${order.status.toLowerCase()}`)}
                  </Badge>
                  {order.paid && order.payable && order.status !== 'REFUNDED' && isWithin24Hours(order.created_at) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRefund(order.payment_uuids)}
                    >
                      {t('orders.refund')}
                    </Button>
                  )}
                </div>
                <div className="text-2xl font-bold">
                  ${order.amount}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-8">
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">{t('common.type')}:</span> {order.type}
                      </div>
                      <div>
                        <span className="font-medium">{t('cart.phone')}:</span> {order.phone}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">{t('cart.city')}:</span> {order.city}
                      </div>
                      <div>
                        <span className="font-medium">{t('cart.address')}:</span> {order.address || 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">{t('cart.email')}:</span> {order.email || 'N/A'}
                      </div>
                      {order.notes && (
                        <div>
                          <span className="font-medium">{t('services.additionalNotes')}:</span> {order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('common.products')}</TableHead>
                            <TableHead className="text-right">{t('cart.quantity')}</TableHead>
                            <TableHead className="text-right">{t('cart.unitPrice')}</TableHead>
                            <TableHead className="text-right">{t('cart.total')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item) => (
                            <TableRow key={item.uuid}>
                              <TableCell>{item.product_name}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">${item.unit_price}</TableCell>
                              <TableCell className="text-right">${item.total_price}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;