import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "react-hot-toast";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { Loader2 } from "lucide-react";

interface Department {
  uuid: string;
  name: string;
  description: string;
}

const Spinner = () => (
  <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const { authFetch } = useAuthenticatedFetch();
  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await authFetch("departments/");
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.data);
      } else {
        toast.error("Failed to fetch departments");
      }
    } catch (error) {
      toast.error("Failed to fetch departments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDepartment
        ? `departments/${editingDepartment.uuid}`
        : "departments/";

      const method = editingDepartment ? "PUT" : "POST";

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save department");

      toast.success(
        editingDepartment
          ? "Department updated successfully"
          : "Department created successfully"
      );

      setIsDialogOpen(false);
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to save department");
    }
  };

  const handleDelete = async (id: string) => {
    // if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete department");

      toast.success("Department deleted successfully");
      fetchDepartments();
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingDepartment(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-white" onClick={resetForm}>
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? "Edit Department" : "Add New Department"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="text-white" type="submit">
                  {editingDepartment ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <Spinner />
          </div>
        ) : departments.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No departments found
          </div>
        ) : (
          departments.map((department) => (
            <div key={department.uuid} className="p-4 border rounded-lg shadow">
              <h3 className="font-semibold">{department.name}</h3>
              <p className="text-gray-600 mt-2">{department.description}</p>
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(department)}
                >
                  Edit
                </Button>
                <Button
                  className="text-white"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(department.uuid)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Departments;
