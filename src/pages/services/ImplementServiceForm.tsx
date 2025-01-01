import { useState } from "react";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";

// Mock data - Move to a separate file in production
const sections = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office"];

interface FormData {
  section: string;
  startDate: Date | null;
  endDate: Date | null;
  area: string;
  areaFile: File | null;
  designFile: File | null;
  phoneNumber: string;
  email: string;
  address: string;
  notes: string;
}

const ImplementServiceForm = () => {
  const [formData, setFormData] = useState<FormData>({
    section: "",
    startDate: null,
    endDate: null,
    area: "",
    areaFile: null,
    designFile: null,
    phoneNumber: "",
    email: "",
    address: "",
    notes: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

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
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Implement Service Booking</CardTitle>
            <CardDescription>
              Provide your project details to start the implementation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Selection */}
              <div className="space-y-2">
                <Label htmlFor="section">Select a Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, section: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section.toLowerCase()}>
                        {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Start Date */}
              <div className="space-y-2">
                <Label>Project Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate!}
                      onSelect={(date:any) => setFormData(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Project End Date */}
              <div className="space-y-2">
                <Label>Project End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick an end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate!}
                      onSelect={(date:any) => setFormData(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Area of the Place */}
              <div className="space-y-2">
                <Label htmlFor="area">Area of the Place (sq ft)</Label>
                <Input
                  id="area"
                  type="text"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, area: e.target.value }))
                  }
                  placeholder="Enter the area in square feet"
                />
              </div>

              {/* Area File Input */}
              <div className="space-y-2">
                <Label htmlFor="areaFile">Area File</Label>
                <div className="flex gap-4 items-end">
                  <Input
                    id="areaFile"
                    type="file"
                    onChange={(e) => handleFileChange(e, "areaFile")}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/home/services/area'}
                  >
                    Book Area Service
                  </Button>
                </div>
              </div>

              {/* Design File Input */}
              <div className="space-y-2">
                <Label htmlFor="designFile">Design File</Label>
                <div className="flex gap-4 items-end">
                  <Input
                    id="designFile"
                    type="file"
                    onChange={(e) => handleFileChange(e, "designFile")}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/home/services/interior-design'}
                  >
                    Book Design Service
                  </Button>
                </div>
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

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Enter your address"
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

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button className="text-white" type="submit" size="lg">
                  Submit Implementation Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ImplementServiceForm; 