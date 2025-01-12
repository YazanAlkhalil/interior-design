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
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface SuperVisionServiceData {
    uuid: string;
    title: string;
    description: string;
    notes: string;
    section: string;
    type: string;
    phone_number: string;
    email: string;
    address: string;
    city: string;
}

const SuperVisionService = () => {
    const [services, setServices] = useState<SuperVisionServiceData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10; // You can adjust this value
    const { authFetch } = useAuthenticatedFetch();

    const getSuperVisionService = async () => {
        const response = await authFetch(`supervision-service/?page=${currentPage}&page_size=${pageSize}`);
        if (response.ok) {
            const data = await response.json();
            setServices(data.results);
            // Assuming the API returns total pages in the response
            setTotalPages(Math.ceil(data.count / pageSize));
        } else {
            console.error('Error fetching supervision service:', response.status);
        }
    };

    useEffect(() => {
        getSuperVisionService();
    }, [currentPage]); // Add currentPage as dependency

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Supervision Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service.uuid}>
                                    <TableCell>{service.title}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="text-sm">{service.email}</div>
                                            <div className="text-sm text-gray-500">{service.phone_number}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {service.address}, {service.city}
                                    </TableCell>
                                    <TableCell>{service.type}</TableCell>
                                    <TableCell>{service.description}</TableCell>
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

export default SuperVisionService;