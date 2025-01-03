import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Calendar } from "../../components/ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { CalendarIcon } from "lucide-react";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { toast } from "react-hot-toast";

// Mock data - Move to a separate file in production


interface Employee {

  uuid: string;

  user: {
    first_name: string;
    last_name: string;

  }
  specialization: string;
}

interface ConsultationMethod {
  uuid: string;
  name: string;
  is_available: boolean;
}

interface TimeSlot {
  time: string;
  end_time: string;
}

// Mock employees data
// const employees: Employee[] = [
//   { id: "1", name: "John Smith", specialization: "Interior Designer" },
//   { id: "2", name: "Sarah Johnson", specialization: "Color Specialist" },
//   { id: "3", name: "Mike Brown", specialization: "Space Planning" },
// ];

const ConsultationServiceForm = () => {
  const { authFetch } = useAuthenticatedFetch();
  const [formData, setFormData] = useState({
    section: "",
    employeeId: "",
    date: null as Date | null,
    minutes: "",
    timeSlot: "",
    method: "",
    phoneNumber: "",
    notes: "",
  });

  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [methods, setMethods] = useState<ConsultationMethod[]>([]);
  const [employees,setEmployees] = useState([])
  const [consulting_hourly_rate,setConsultingHourlyRate] = useState('')

  // Fetch available hours based on employee and date selection
  useEffect(() => {
    if (formData.employeeId && formData.date) {
      // Mock API call - replace with actual API call
      const mockAvailableHours = ["1", "2", "3", "4"];
      setAvailableHours(mockAvailableHours);
    }
  }, [formData.employeeId, formData.date]);

  // Add new useEffects for fetching methods and consultants
  useEffect(() => {
    fetchMethods();
    fetchConsultants();
    fetchHours()
  }, []);

  const fetchHours = async () => {
    try {
      const response = await authFetch("service-settings/");
      const data = await response.json();
      setConsultingHourlyRate(data.consulting_hourly_rate);
    } catch (error) {
      toast.error("Failed to fetch Hourly rate");
    }
  };

  const fetchMethods = async () => {
    try {
      const response = await authFetch("service-methods/available/");
      const data = await response.json();
      setMethods(data.data.filter((method: ConsultationMethod) => method.is_available));
    } catch (error) {
      toast.error("Failed to fetch consultation methods");
    }
  };

  const fetchConsultants = async () => {
    try {
      const response = await authFetch("employees/?is_consultable=true");
      const data = await response.json();
      setEmployees(data.data);
    } catch (error) {
      toast.error("Failed to fetch consultants");
    }
  };

  // Update the time slots fetching logic
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (formData.employeeId && formData.date && formData.minutes) {
        try {
          const response = await authFetch(`consulting-services/available_slots/?consultant_uuid=${formData.employeeId}&date=${format(formData.date, "yyyy-MM-dd")}&duration=${formData.minutes}`, {
      
            
          });
          
          const data = await response.json();
          if (response.ok) {
            setAvailableTimeSlots(data.slots);
          } else {
            toast.error("Failed to fetch available time slots");
          }
        } catch (error) {
          toast.error("Failed to fetch available time slots");
        }
      }
    };

    fetchTimeSlots();
  }, [formData.employeeId, formData.date, formData.minutes]);

  // Calculate total price
  useEffect(() => {
    if (formData.minutes) {
      setTotalPrice(parseInt(formData.minutes) * Number(consulting_hourly_rate) / 60);
    }
  }, [formData.minutes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Consultation Service Booking</CardTitle>
            <CardDescription>
              Schedule a consultation with our professional team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              

              {/* Employee Selection */}
              <div className="space-y-2">
                <Label htmlFor="employee">Select Consultant</Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, employeeId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a consultant" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee:Employee) => (
                      <SelectItem key={employee.uuid} value={employee.uuid}>
                        {employee.user.first_name} - {employee.user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date!}
                      onSelect={(date) =>
                        setFormData((prev:any) => ({ ...prev, date }))
                      }
                      disabled={(date) =>
                        date < new Date() || date > new Date(2025, 10, 1)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Minutes Selection */}
              <div className="space-y-2">
                <Label htmlFor="hours">Number of Hours</Label>
                <Select
                  value={formData.minutes}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, minutes: value }))
                  }
                  disabled={!formData.date || !formData.employeeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour} {parseInt(hour) === 1 ? "hour" : "hours"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="time">Select Time</Label>
                <Select
                  value={formData.timeSlot}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, timeSlot: value }))
                  }
                  disabled={!formData.minutes}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots
                      .filter((slot) => slot.available)
                      .map((slot) => (
                        <SelectItem key={slot.time} value={slot.time}>
                          {slot.time}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Method Selection */}
              <div className="space-y-2">
                <Label htmlFor="method">Consultation Method</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((method) => (
                      <SelectItem key={method.uuid} value={method.uuid}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Any specific requirements or preferences..."
                  rows={4}
                />
              </div>

              {/* Submit Button with Price */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-xl font-semibold">
                  Total: ${totalPrice}
                </div>
                <Button 
                  type="submit" 
                  className="text-white"
                  size="lg"
                  disabled={
                    !formData.section ||
                    !formData.employeeId ||
                    !formData.date ||
                    !formData.minutes ||
                    !formData.timeSlot ||
                    !formData.method ||
                    !formData.phoneNumber
                  }
                >
                  Book Consultation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ConsultationServiceForm; 