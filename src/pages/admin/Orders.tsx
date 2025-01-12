import React, { useEffect, useState } from 'react';
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
import { useAuthenticatedFetch } from '../../hooks/useAuthenticatedFetch';
import { Input } from "../../components/ui/input";
import { toast } from "react-hot-toast"

// Define interfaces for our data structures
interface OrderItem {
  uuid: string;
  product_color: {
    uuid: string;
    product_name: string;
    color_name: string;
    price: number;
    image: string | null;
  };
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface Order {
  uuid: string;
  reference_number: string;
  customer: {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    address: string | null;
  };
  status: string;
  status_display: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  total_amount: string;
  items: OrderItem[];
  created_at: string;
}

// Add OrderStatus type for better type safety
type OrderStatus = 'PROCESSING' | 'COMPLETED';

const OrderManagement = () => {
  // Sample initial data
  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const {authFetch} = useAuthenticatedFetch()
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 2;

  const fetchOrders = async () => {
    try {
      const response = await authFetch(`admin/orders?page=${currentPage}&page_size=${PAGE_SIZE}`);
      if (response.status === 200) {
        const data = await response.json();
        setOrders(data.data);
        // Assuming the API returns total_pages in the response
        setTotalPages(data.total_pages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage]); // Re-fetch when page changes

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      let response;
      console.log(newStatus);
      
      
        // Use regular status update endpoint
        response = await authFetch(`admin/orders/${orderId}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: newStatus
          })
        });
      

      if (response.status === 200) {
        // Update local state
        setOrders(orders.map(order =>
          order.uuid === orderId
            ? { ...order, status: newStatus }
            : order
        ));
        
        // Close dialog and show success message
        setSelectedOrder(null);
        toast.success('Order status updated successfully'
        );
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    toast.error('Error updating order status');
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customer.full_name.includes(searchTerm) ||
    order.reference_number.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'PROCESSING':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'Completed';
      case 'PROCESSING':
        return 'Processing';
      default:
        return status;
    }
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Order Management</h1>
        {/* <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search by customer name or order number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div> */}
      </div>

      <div className="space-y-4">
        {filteredOrders.map(order => (
          <Card key={order.uuid} className="border">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(order.uuid)}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transform transition-transform ${
                        expandedOrder === order.uuid ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                  <div>
                    <h3 className="text-lg font-semibold">Order #: {order.reference_number}</h3>
                    <p className="text-sm text-gray-500">{order.customer.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
              
              {expandedOrder === order.uuid && (
                <div className="mt-4 pl-12">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Order Details:</h4>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.uuid} className="flex justify-between">
                            <span>{item.product_color.product_name} × {item.quantity}</span>
                            <span>${item.unit_price}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>${order.total_amount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Customer Information:</h4>
                      <div className="space-y-1">
                        <p>Name: {order.customer.full_name}</p>
                        <p>Email: {order.email}</p>
                        <p>Phone: {order.phone}</p>
                        <p>Address: {order.address}</p>
                        <p>City: {order.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="flex items-center px-4">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Order Information</h3>
                <div className="space-y-2">
                  <p>Order Number: {selectedOrder.reference_number}</p>
                  <p>Status: {getStatusText(selectedOrder.status)}</p>
                  <p>Date: {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Items:</h4>
                    {selectedOrder.items.map(item => (
                      <div key={item.uuid} className="flex justify-between py-1">
                        <span>{item.product_color.product_name} × {item.quantity}</span>
                        <span>${item.unit_price}</span>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-2">
                  <p>Name: {selectedOrder.customer.full_name}</p>
                  <p>Email: {selectedOrder.email}</p>
                  <p>Phone: {selectedOrder.phone}</p>
                  <p>Address: {selectedOrder.address}</p>
                  <p>City: {selectedOrder.city}</p>
                </div>
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Update Status</h3>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => 
                      updateOrderStatus(selectedOrder.uuid, value as OrderStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROCESSING">Processing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;