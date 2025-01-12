import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";

interface Plan {
  uuid: string;
  title: string;
  description: string;
  price: number;
}

export default function Plans() {
  const { authFetch, isLoading } = useAuthenticatedFetch();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await authFetch('plans/');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        // Update existing plan
        const response = await authFetch(`plans/${editingPlan.uuid}/`, {
          method: 'PUT',
          body: JSON.stringify({
            title: formData.name,
            description: formData.description,
            price: formData.price,
          }),
        });
        if (response.ok) {
          fetchPlans(); // Refresh plans after update
        }
      } else {
        // Add new plan
        const response = await authFetch('plans/', {
          method: 'POST',
          body: JSON.stringify({
            title: formData.name,
            description: formData.description,
            price: formData.price,
          }),
        });
        if (response.ok) {
          fetchPlans(); // Refresh plans after creation
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingPlan(null);
    setFormData({ name: "", description: "", price: "" });
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.title,
      description: plan.description,
      price: plan.price.toString(),
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await authFetch(`plans/${id}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPlans(); // Refresh plans after deletion
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Plan" : "Add New Plan"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Plan Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full text-white">
                {editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.uuid}>
              <TableCell>{plan.title}</TableCell>
              <TableCell>{plan.description}</TableCell>
              <TableCell>${plan.price}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(plan)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(plan.uuid)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
