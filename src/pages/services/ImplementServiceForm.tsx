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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";


interface FormData {
  title: string;
  section: string;
  startDate: Date | null;
  endDate: Date | null;
  area: string;
  areaFile: File | null;
  designFile: File | null;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

const ImplementServiceForm = () => {
  const { t, language } = useLanguage();
  const rtlClass = language === 'ar' ? '[direction:rtl]' : '';
  const { authFetch } = useAuthenticatedFetch();
  const [sections, setSections] = useState<{ uuid: string; title: string; }[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    section: "",
    startDate: null,
    endDate: null,
    area: "",
    areaFile: null,
    designFile: null,
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  // Add useEffect to fetch sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await authFetch("sections/?page_size=100");
        const data = await response.json();
        setSections(data.results || []);
      } catch (error) {
        console.error("Error fetching sections:", error);
        toast.error("Failed to fetch sections");
        setSections([]);
      }
    };
    fetchSections();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || 
        !formData.section || 
        !formData.startDate || 
        !formData.endDate || 
        !formData.area || 
        !formData.phoneNumber || 
        !formData.email || 
        !formData.address) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('notes', formData.notes);
    formDataToSend.append('start_date', format(formData.startDate!, 'yyyy-MM-dd'));
    formDataToSend.append('end_date', format(formData.endDate!, 'yyyy-MM-dd'));
    formDataToSend.append('section', formData.section);
    formDataToSend.append('area', formData.area);
    formDataToSend.append('city', formData.city);
    if (formData.areaFile) formDataToSend.append('area_file', formData.areaFile);
    if (formData.designFile) formDataToSend.append('design_file', formData.designFile);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone_number', formData.phoneNumber);

    try {
      const response = await authFetch("implementaion-service/", {
        method: "POST",
        body: formDataToSend,
      });
      
      if (response.ok) {
        toast.success("Implementation service request submitted successfully!");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to submit request");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the request");
    }
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
            <CardTitle>{t('services.implementServiceBooking')}</CardTitle>
            <CardDescription>
              {t('services.provideProjectDetailsForImplementation')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title">{t('services.projectTitle')}</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={t('services.enterProjectTitle')}
                  required
                  className={rtlClass}
                />
              </div>

              {/* Section Selection */}
              <div className="space-y-2">
                <Label htmlFor="section">{t('services.selectSection')}</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, section: value }))
                  }
                >
                  <SelectTrigger className={rtlClass}>
                    <SelectValue placeholder={t('services.selectSection')} />
                  </SelectTrigger>
                  <SelectContent>
                    {sections && sections.length > 0 ? (
                      sections.map((section) => (
                        <SelectItem key={section.uuid} value={section.uuid}>
                          {section.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-sections" disabled>
                        {t('services.noSectionsAvailable')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Start Date */}
              <div className="space-y-2">
                <Label>{t('services.projectStartDate')}</Label>
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
                      {formData.startDate ? format(formData.startDate, "PPP") : <span>{t('services.pickStartDate')}</span>}
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
                <Label>{t('services.projectEndDate')}</Label>
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
                      {formData.endDate ? format(formData.endDate, "PPP") : <span>{t('services.pickEndDate')}</span>}
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
                <Label htmlFor="area">{t('services.areaOfPlace')}</Label>
                <Input
                  id="area"
                  type="text"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, area: e.target.value }))
                  }
                  placeholder={t('services.enterArea')}
                  className={rtlClass}
                />
              </div>

              {/* Area File Input */}
              <div className="space-y-2">
                <Label htmlFor="areaFile">{t('services.areaFile')}</Label>
                <div className="flex gap-4 items-end">
                  <Input
                    id="areaFile"
                    type="file"
                    onChange={(e) => handleFileChange(e, "areaFile")}
                    className={rtlClass}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/home/services/area'}
                  >
                    {t('services.bookAreaService')}
                  </Button>
                </div>
              </div>

              {/* Design File Input */}
              <div className="space-y-2">
                <Label htmlFor="designFile">{t('services.designFile')}</Label>
                <div className="flex gap-4 items-end">
                  <Input
                    id="designFile"
                    type="file"
                    onChange={(e) => handleFileChange(e, "designFile")}
                    className={rtlClass}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/home/services/interior-design'}
                  >
                    {t('services.bookDesignService')}
                  </Button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('services.phoneNumber')}</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  placeholder={t('services.enterPhoneNumber')}
                  required
                  className={rtlClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('services.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder={t('services.enterEmail')}
                  required
                  className={rtlClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('services.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder={t('services.enterAddress')}
                  required
                  className={rtlClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t('services.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder={t('services.enterCity')}
                  required
                  className={rtlClass}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t('services.additionalNotes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder={t('services.anySpecificRequirementsOrPreferences')}
                  rows={4}
                  className={rtlClass}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button className="text-white" type="submit" size="lg">
                  {t('services.submitImplementationRequest')}
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