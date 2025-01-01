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
import { ImagePlus, X } from "lucide-react";
import { Label } from "../../components/ui/label";

// Mock data - move to separate file in production
const sections = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office"];
const plans = ["Basic", "Standard", "Premium"];
const colors = ["Neutral", "Warm", "Cool", "Bold", "Pastel"];
const FIXED_PRICE = 299.99;

interface FormData {
  section: string;
  images: File[];
  address: string;
  size: string;
  plan: string;
  favoriteColor: string;
  notes: string;
  areaFile: File | null;
}

const DesignServiceForm = () => {
  const [formData, setFormData] = useState<FormData>({
    section: "",
    images: [],
    address: "",
    size: "",
    plan: "",
    favoriteColor: "",
    notes: "",
    areaFile: null,
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      alert("You can only upload up to 5 images");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));

    // Create URLs for preview
    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImageUrls((prev) => [...prev, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, areaFile: file }));
  };

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Design Service Booking</CardTitle>
            <CardDescription>
              Fill in the details below to book our professional design service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Selection */}
              <div className="space-y-2">
                <Label htmlFor="section">Select Section</Label>
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

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Upload Place Images (Max 5)</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.images.length < 5 && (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        id="images"
                        onChange={handleImageChange}
                      />
                      <Label
                        htmlFor="images"
                        className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary"
                      >
                        <ImagePlus className="w-6 h-6" />
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Area File Input */}
              <div className="space-y-2">
                <Label htmlFor="areaFile">Area File</Label>
                <div className="flex gap-4 items-end">
                  <Input
                    id="areaFile"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/home/services/area'}
                  >
                    Book Area Service
                  </Button>
                </div>
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
                />
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label htmlFor="size">Room Size (in square meters)</Label>
                <Input
                  id="size"
                  type="number"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, size: e.target.value }))
                  }
                  placeholder="Enter room size"
                />
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <Label htmlFor="plan">Select Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, plan: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan} value={plan.toLowerCase()}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Preference */}
              <div className="space-y-2">
                <Label htmlFor="color">Favorite Color Scheme</Label>
                <Select
                  value={formData.favoriteColor}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, favoriteColor: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color.toLowerCase()}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  Total: ${FIXED_PRICE}
                </div>
                <Button type="submit" className="text-white" size="lg">
                  Book Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DesignServiceForm;
