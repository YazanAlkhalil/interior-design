import React, { useState } from 'react';
import { 
  Eye, 
  CheckCircle, 
  Clock, 
  Search,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Define interfaces for our data structures
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  date: string;
  status: 'pending' | 'completed';
  total: number;
  items: OrderItem[];
  address: string;
  phone: string;
}

const OrderManagement = () => {
  // Sample initial data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      customerName: "أحمد محمد",
      date: "2024-03-15",
      status: "pending",
      total: 1500,
      items: [
        { id: 1, name: "كنبة جلد", quantity: 1, price: 1000 },
        { id: 2, name: "طاولة قهوة", quantity: 2, price: 250 },
      ],
      address: "شارع الملك فهد، الرياض",
      phone: "0501234567"
    },
    {
      id: "2",
      customerName: "نورة عبدالله",
      date: "2024-03-14",
      status: "completed",
      total: 2000,
      items: [
        { id: 3, name: "سرير كينج", quantity: 1, price: 2000 }
      ],
      address: "شارع التحلية، جدة",
      phone: "0559876543"
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order =>
      order.id === orderId
        ? { ...order, status: newStatus }
        : order
    ));
  };

  const filteredOrders = orders.filter(order =>
    order.customerName.includes(searchTerm) ||
    order.id.includes(searchTerm)
  );

  const getStatusColor = (status:string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status:string) => {
    switch (status) {
      case 'completed':
        return 'تم التنفيذ';
      case 'pending':
        return 'قيد التنفيذ';
      default:
        return 'غير معروف';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">إدارة الطلبات</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث عن طلب..."
                className="w-full pr-10 pl-4 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <Card key={order.id} className="border">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedOrder(
                          expandedOrder === order.id ? null : order.id
                        )}
                      >
                        {expandedOrder === order.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="text-lg font-semibold">طلب رقم: {order.id}</h3>
                        <p className="text-sm text-gray-500">{order.customerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`${getStatusColor(order.status)} text-sm`}>
                        {getStatusText(order.status)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                  
                  {expandedOrder === order.id && (
                    <div className="mt-4 pr-12">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">تفاصيل الطلب:</h4>
                          <div className="space-y-2">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between">
                                <span>{item.name} × {item.quantity}</span>
                                <span>{item.price} ريال</span>
                              </div>
                            ))}
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-semibold">
                                <span>الإجمالي:</span>
                                <span>{order.total} ريال</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">معلومات التواصل:</h4>
                          <p>العنوان: {order.address}</p>
                          <p>رقم الهاتف: {order.phone}</p>
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">تحديث الحالة:</h4>
                            <Select
                              value={order.status}
                              onValueChange={(value: "pending" | "completed") => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد التنفيذ</SelectItem>
                                <SelectItem value="completed">تم التنفيذ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب رقم: {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">معلومات العميل:</h4>
                <p>الاسم: {selectedOrder.customerName}</p>
                <p>العنوان: {selectedOrder.address}</p>
                <p>رقم الهاتف: {selectedOrder.phone}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">المنتجات المطلوبة:</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.price} ريال</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>الإجمالي:</span>
                    <span>{selectedOrder.total} ريال</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">حالة الطلب:</h4>
                <Select
                  value={selectedOrder.status}
                  onValueChange={(value : "pending" | "completed") => {
                    updateOrderStatus(selectedOrder.id, value);
                    setSelectedOrder(prev => prev ? {...prev, status: value} : null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">تم التنفيذ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;