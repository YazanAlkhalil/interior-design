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
import { Download } from "lucide-react";
import { Button } from "../../components/ui/button";

interface DesignOrder {
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
    section_details: {
      title: string;
    };
    area: string;
    plan_details: {
      title: string;
      price: string;
    };
    prefered_colors_details: Array<{
      hex_code: string;
    }>;
    address: string;
    city: string;
    files: Array<{
      file: string;
      file_type: string;
    }>;
    status: string;
  };
}

const DesignService = () => {
    const [orders, setOrders] = useState<DesignOrder[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10; // You can adjust this value
    const { authFetch } = useAuthenticatedFetch();

    const fetchDesignService = async () => {
        const response = await authFetch(`admin/services/?type=design&page=${currentPage}&page_size=${pageSize}`);
        if (response.ok) {
            const data = await response.json();
            setOrders(data.results);
            setTotalPages(Math.ceil(data.count / pageSize));
        }
    };

    useEffect(() => {
        fetchDesignService();
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

    const downloadFile = (fileUrl: string, fileName: string) => {
        const fullUrl = fileUrl.startsWith('http') 
            ? fileUrl 
            : `${process.env.NEXT_PUBLIC_API_URL}${fileUrl}`;

        fetch(fullUrl, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(error => console.error('Error downloading file:', error));
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Design Service Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Number</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Design Details</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Files</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
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
                                                {order.service_details.section_details.title}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Area: {order.service_details.area} m²
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Plan: {order.service_details.plan_details.title}
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {order.service_details.prefered_colors_details.map((color, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-4 h-4 rounded-full border"
                                                        style={{ backgroundColor: color.hex_code }}
                                                        title={color.hex_code}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div>{order.service_details.address}</div>
                                            <div className="text-sm text-gray-500">
                                                {order.service_details.city}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {order.service_details.files.map((file, index) => {
                                                const fileName = file.file.split('/').pop() || 'file';
                                                return (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <Badge variant="outline" className="mr-1">
                                                            {file.file_type}
                                                        </Badge>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => downloadFile(file.file, fileName)}
                                                            title={`Download ${file.file_type}`}
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell>${order.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
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

export default DesignService;