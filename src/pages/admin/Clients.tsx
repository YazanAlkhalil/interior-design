import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";

interface Client {
  id: string;
  name: string;
  image: string;
  mobile: string;
  email: string;
  joinedDate: string;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([
        {
        id: "1",
        name: "John Doe",
        image: "https://github.com/shadcn.png",
        mobile: "+1 234 567 890",
        email: "john@example.com",
        joinedDate: "2024-01-15",
        },
        {
        id: "1",
        name: "John Doe",
        image: "https://github.com/shadcn.png",
        mobile: "+1 234 567 890",
        email: "john@example.com",
        joinedDate: "2024-01-15",
        },
        {
        id: "1",
        name: "John Doe",
        image: "https://github.com/shadcn.png",
        mobile: "+1 234 567 890",
        email: "john@example.com",
        joinedDate: "2024-01-15",
        },
        {
        id: "1",
        name: "John Doe",
        image: "https://github.com/shadcn.png",
        mobile: "+1 234 567 890",
        email: "john@example.com",
        joinedDate: "2024-01-15",
        },
    ]);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.mobile.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDeleteClient = (clientId: string) => {
        setClients(clients.filter((client) => client.id !== clientId));
    };

    return (
        <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Clients</h1>
        <div className="mb-4">
            <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            />
        </div>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredClients.map((client) => (
                <TableRow key={client.id}>
                    <TableCell className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={client.image} alt={client.name} />
                        <AvatarFallback>
                        {client.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                    </Avatar>
                    <span>{client.name}</span>
                    </TableCell>
                    <TableCell>{client.mobile}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{new Date(client.joinedDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            Delete
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            client's data from the system.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                            onClick={() => handleDeleteClient(client.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            >
                            Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        </div>
    );
    }