import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { toast } from "react-hot-toast";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";

interface WorkingHours {
  day: string;
  from_hour: string;
  to_hour: string;
}

interface Employee {
  uuid: string;
  user: {
    uuid: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    image: string | null;
  };
  salary: string;
  department: {
    uuid: string;
    name: string;
    description: string | null;
  };
  is_consultable: boolean;
  working_hours: WorkingHours[];
}

interface Department {
  uuid: string;
  name: string;
}

interface EmployeeFormData {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  salary: string;
  department_uuid: string;
  is_consultable: boolean;
  working_hours: {
    day: string;
    from_hour: string;
    to_hour: string;
  }[];
}

const Spinner = () => (
  <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authFetch } = useAuthenticatedFetch();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    salary: "",
    department_uuid: "",
    is_consultable: false,
    working_hours: [
      { day: "monday", from_hour: "", to_hour: "" },
      { day: "tuesday", from_hour: "", to_hour: "" },
      { day: "wednesday", from_hour: "", to_hour: "" },
      { day: "thursday", from_hour: "", to_hour: "" },
      { day: "friday", from_hour: "", to_hour: "" },
      { day: "saturday", from_hour: "", to_hour: "" },
      { day: "sunday", from_hour: "", to_hour: "" },
    ],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string>("");
  const [deletingEmployee, setDeletingEmployee] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const response = await authFetch("employees/");
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.data);
      } else {
        toast.error("Failed to fetch employees");
      }
    } catch (error) {
      toast.error("Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await authFetch("departments/");
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch departments");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const formatWorkingHours = (hours: WorkingHours[]) => {
    return hours.map(h => `${h.day}: ${h.from_hour} - ${h.to_hour}`).join('\n');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleWorkingHoursChange = (
    index: number,
    field: "from_hour" | "to_hour",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      working_hours: prev.working_hours.map((hours, i) =>
        i === index ? { ...hours, [field]: value } : hours
      ),
    }));
  };

  const handleEdit = (employee: Employee) => {
    setIsEditing(true);
    setEditingId(employee.uuid);
    setFormData({
      email: employee.user.email,
      first_name: employee.user.first_name,
      last_name: employee.user.last_name,
      phone: employee.user.phone,
      address: employee.user.address,
      salary: employee.salary,
      department_uuid: employee.department.uuid,
      is_consultable: employee.is_consultable,
      working_hours: [
        { day: "monday", from_hour: "", to_hour: "" },
        { day: "tuesday", from_hour: "", to_hour: "" },
        { day: "wednesday", from_hour: "", to_hour: "" },
        { day: "thursday", from_hour: "", to_hour: "" },
        { day: "friday", from_hour: "", to_hour: "" },
        { day: "saturday", from_hour: "", to_hour: "" },
        { day: "sunday", from_hour: "", to_hour: "" },
      ].map(defaultDay => {
        const existingHour = employee.working_hours.find(
          h => h.day === defaultDay.day
        );
        return existingHour || defaultDay;
      }),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const filteredWorkingHours = formData.working_hours.filter(
        (hours) => hours.from_hour !== "" && hours.to_hour !== ""
      );

      const dataToSubmit = {
        user: {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
        },
        working_hours: filteredWorkingHours,
        department_uuid: formData.department_uuid,
        salary: formData.salary,
        is_consultable: formData.is_consultable,
      };

      const url = isEditing 
        ? `employees/${editingId}/` 
        : "employees/";

      const response = await authFetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) throw new Error(isEditing ? "Failed to update employee" : "Failed to create employee");

      toast.success(isEditing ? "Employee updated successfully" : "Employee created successfully");
      setIsDialogOpen(false);
      setIsEditing(false);
      setEditingId("");
      resetForm();
      fetchEmployees();
    } catch (error) {
      toast.error(isEditing ? "Failed to update employee" : "Failed to create employee");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      address: "",
      salary: "",
      department_uuid: "",
      is_consultable: false,
      working_hours: [
        { day: "monday", from_hour: "", to_hour: "" },
        { day: "tuesday", from_hour: "", to_hour: "" },
        { day: "wednesday", from_hour: "", to_hour: "" },
        { day: "thursday", from_hour: "", to_hour: "" },
        { day: "friday", from_hour: "", to_hour: "" },
        { day: "saturday", from_hour: "", to_hour: "" },
        { day: "sunday", from_hour: "", to_hour: "" },
      ],
    });
  };

  const handleDialogOpen = () => {
    setIsEditing(false);
    setEditingId("");
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = async (employeeUuid: string) => {
    setDeletingEmployee(employeeUuid);
  };

  const confirmDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      const response = await authFetch(`employees/${deletingEmployee}/`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete employee');
      
      fetchEmployees();
      setDeletingEmployee(null);
    } catch (error) {
      toast.error('Failed to delete employee');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-white">Add Employee</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department_uuid}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        department_uuid: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.uuid} value={dept.uuid}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_consultable"
                  checked={formData.is_consultable}
                  onCheckedChange={(checked: CheckedState) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_consultable: checked as boolean,
                    }))
                  }
                />
                <Label htmlFor="is_consultable">Is Consultable</Label>
              </div>

              <div className="space-y-4">
                <Label>Working Hours</Label>
                {formData.working_hours.map((hours, index) => (
                  <div key={hours.day} className="grid grid-cols-3 gap-4">
                    <div className="capitalize">{hours.day}</div>
                    <Input
                      type="time"
                      value={hours.from_hour}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, "from_hour", e.target.value)
                      }
                    />
                    <Input
                      type="time"
                      value={hours.to_hour}
                      onChange={(e) =>
                        handleWorkingHoursChange(index, "to_hour", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="text-white">
                  Create Employee
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Spinner />
      ) : employees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No employees found
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Consultable</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.uuid}>
                  <TableCell className="font-medium">
                    {employee.user.first_name} {employee.user.last_name}
                  </TableCell>
                  <TableCell>{employee.user.email}</TableCell>
                  <TableCell>{employee.department.name}</TableCell>
                  <TableCell>{employee.user.phone}</TableCell>
                  <TableCell>
                    ${parseFloat(employee.salary).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        employee.is_consultable
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.is_consultable ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm">
                          View Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Working Hours</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {employee.working_hours.map((hours, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="capitalize">
                                    {hours.day}
                                  </TableCell>
                                  <TableCell>{hours.from_hour}</TableCell>
                                  <TableCell>{hours.to_hour}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(employee.uuid)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete this employee? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setDeletingEmployee(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteEmployee}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;