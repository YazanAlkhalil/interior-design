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

interface ImplementationServiceData {
    uuid: string;
    title: string;
    notes: string;
    start_date: string;
    end_date: string;
    section: string;
    area: string;
    phone_number: string;
    email: string;
    address: string;
    city: string;
    files: Array<{
        uuid: string;
        file: string;
        file_type: string;
        created_at: string;
    }>;
}

const ImplementationService = () => {
    const [services, setServices] = useState<ImplementationServiceData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;
    const { authFetch } = useAuthenticatedFetch();

    const getImplementationService = async () => {
        const response = await authFetch(`implementaion-service/?page=${currentPage}&page_size=${pageSize}`);
        if (response.ok) {
            const data = await response.json();
            setServices(data.results);
            // Assuming the API returns total pages in the response
            setTotalPages(Math.ceil(data.count / pageSize));
        } else {
            console.error('Error fetching implementation service:', response.status);
        }
    };

    useEffect(() => {
        getImplementationService();
    }, [currentPage]); // Add currentPage as dependency

    const downloadFile = (fileUrl: string, fileName: string) => {
        fetch(fileUrl, {
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
                    <CardTitle>Implementation Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Project Details</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Files</TableHead>
                                <TableHead>Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service) => (
                                <TableRow key={service.uuid}>
                                    <TableCell>{service.title}</TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{service.email}</div>
                                            <div className="text-sm text-gray-500">{service.phone_number}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">Area: {service.area} m²</div>
                                            <div className="text-sm text-gray-500">Notes: {service.notes}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div>{service.address}</div>
                                            <div className="text-sm text-gray-500">{service.city}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {service.files.map((file) => {
                                                const fileName = file.file.split('/').pop() || 'file';
                                                return (
                                                    <div key={file.uuid} className="flex items-center gap-2">
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
                                    <TableCell>
                                        <div>
                                            <div className="text-sm">Start: {new Date(service.start_date).toLocaleDateString()}</div>
                                            <div className="text-sm">End: {new Date(service.end_date).toLocaleDateString()}</div>
                                        </div>
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

export default ImplementationService;