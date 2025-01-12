import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";


interface PaymentFees {
    subtotal: number;
    fee: number;
    total: number;
}

export const calculatePaymentFees = (subtotal: number, paymentMethod: 'STRIPE' | 'PAYPAL'): PaymentFees => {
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
interface ConsultationOrder {
  uuid: string;
  customer: {
    full_name: string;
    email: string;
    phone: string;
  };
  service_number: string;
  status: string;
  amount: string;
  created_at: string;
  service_details: {
    scheduled_date: string;
    scheduled_time: string;
    duration: number;
    method_details: {
      name: string;
    };
    consultant_details: {
      user: {
        first_name: string;
        last_name: string;
        department: string;
      };
      department: {
        name: string;
      };
    };
    status: string;
  };
  payment_method: 'STRIPE' | 'PAYPAL';
}

const ConsultationService = () => {
    const [orders, setOrders] = useState<ConsultationOrder[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10; // You can adjust this value
    const { authFetch } = useAuthenticatedFetch();

    const fetchConsultationService = async () => {
        const response = await authFetch(`admin/services/?type=consulting&page=${currentPage}&page_size=${pageSize}`);
        if (response.ok) {
            const data = await response.json();
            setOrders(data.results);
            setTotalPages(Math.ceil(data.count / pageSize));
        } else {
            setOrders([]);
            console.error('Error fetching consultation service:', response.status);
        }
    };

    useEffect(() => {
        fetchConsultationService();
    }, [currentPage]); // Add currentPage as dependency

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PROCESSING':
                return 'bg-yellow-500';
            case 'COMPLETED':
                return 'bg-green-500';
            case 'PENDING':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatDateTime = (date: string, time: string) => {
        return new Date(`${date}T${time}`).toLocaleString();
    };

    const renderPaymentDetails = (order: ConsultationOrder) => {
        const fees = calculatePaymentFees(Number(order.amount), order.payment_method);
        
        return (
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${fees.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing Fee ({order.payment_method === 'PAYPAL' ? 'PayPal' : 'Credit Card'}):</span>
                    <span>${fees.fee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${fees.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Consultation Service Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Number</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Consultant</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payment Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.uuid}>
                                    <TableCell>{order.service_number}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{order.customer.full_name}</div>
                                            <div className="text-sm text-gray-500">{order.customer.email}</div>
                                            <div className="text-sm text-gray-500">{order.customer.phone}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">
                                                {order.service_details.consultant_details.user.first_name} {' '}
                                                {order.service_details.consultant_details.user.last_name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.service_details.consultant_details.department.name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div>{formatDateTime(
                                                order.service_details.scheduled_date,
                                                order.service_details.scheduled_time
                                            )}</div>
                                            <div className="text-sm text-gray-500">
                                                Duration: {order.service_details.duration} minutes
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {order.service_details.method_details.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>${order.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {renderPaymentDetails(order)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConsultationService; 