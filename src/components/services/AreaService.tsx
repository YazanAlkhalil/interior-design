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

interface AreaServiceOrder {
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
    address: string;
    city: string;
    status: string;
  };
}

const AreaService = () => {
    const [orders, setOrders] = useState<AreaServiceOrder[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10; // You can adjust this value
    const { authFetch } = useAuthenticatedFetch();

    const fetchAreaService = async () => {
        const response = await authFetch(`admin/services/?type=area&page=${currentPage}&page_size=${pageSize}`);
        if (response.ok) {
            const data = await response.json();
            setOrders(data.results);
            setTotalPages(Math.ceil(data.count / pageSize));
        } else {
            console.error('Error fetching area service:', response.status);
        }
    };

    useEffect(() => {
        fetchAreaService();
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

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Area Service Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Number</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
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
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {order.service_details.address}, {order.service_details.city}
                                    </TableCell>
                                    <TableCell>${order.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.created_at).toLocaleDateString()}
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

export default AreaService;