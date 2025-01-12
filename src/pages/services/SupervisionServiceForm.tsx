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
import { useLanguage } from "../../context/LanguageContext";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import { toast } from "react-hot-toast";

interface FormData {
  title: string;
  description: string;
  section: string;
  plan: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

const SupervisionServiceForm = () => {
  const { t, language } = useLanguage();
  const { authFetch } = useAuthenticatedFetch();
  const [sections, setSections] = useState<{ uuid: string; title: string; }[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    section: "",
    plan: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    notes: "",
  });

  const rtlClass = language === 'ar' ? '[direction:rtl]' : '';

  const plans = language === 'ar' 
    ? ['يومية', 'اسبوعية', 'شهرية']
    : ['Daily', 'Weekly', 'Monthly'];

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await authFetch("sections/?page_size=100");
        const data = await response.json();
        setSections(data.results || []);
      } catch (error) {
        console.error("Error fetching sections:", error);
        toast.error(t('errors.failedToFetchSections'));
        setSections([]);
      }
    };
    fetchSections();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || 
        !formData.section || 
        !formData.plan || 
        !formData.phoneNumber || 
        !formData.email || 
        !formData.address) {
      toast.error(t('errors.fillAllRequired'));
      return;
    }

    // Convert plan to English for API
    const planMapping: { [key: string]: string } = {
      'يومية': 'daily',
      'اسبوعية': 'weekly',
      'شهرية': 'monthly',
      'Daily': 'daily',
      'Weekly': 'weekly',
      'Monthly': 'monthly'
    };

    const dataToSend = {
      title: formData.title,
      description: formData.description,
      notes: formData.notes,
      section: formData.section,
      type: planMapping[formData.plan],
      phone_number: formData.phoneNumber,
      email: formData.email,
      address: formData.address,
      city: formData.city
    };

    try {
      const response = await authFetch("supervision-service/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      if (response.ok) {
        toast.success(t('success.supervisionRequestSubmitted'));
        // Optionally reset form or redirect
      } else {
        const data = await response.json();
        toast.error(data.message || t('errors.failedToSubmit'));
      }
    } catch (error) {
      toast.error(t('errors.submissionError'));
    }
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
            <CardTitle>{t('services.supervisionServiceBooking')}</CardTitle>
            <CardDescription>
              {t('services.provideYourDetailsAndWeWillArrangeASupervisionServiceForYou')}
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
                  className={rtlClass}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={t('services.enterProjectTitle')}
                  required
                />
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('services.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  className={rtlClass}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={t('services.enterDescription')}
                  required
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

              {/* Plan Selection */}
              <div className="space-y-2">
                <Label htmlFor="plan">{t('services.selectPlan')}</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, plan: value }))
                  }
                >
                  <SelectTrigger className={rtlClass}>
                    <SelectValue placeholder={t('services.selectPlan')} />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">{t('services.phoneNumber')}</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  className={rtlClass}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  placeholder={t('services.enterYourPhoneNumber')}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t('services.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  className={rtlClass}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder={t('services.enterYourEmail')}
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">{t('services.address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  className={rtlClass}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder={t('services.enterYourAddress')}
                  required
                />
              </div>

              {/* Add City Input */}
              <div className="space-y-2">
                <Label htmlFor="city">{t('services.city')}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  className={rtlClass}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder={t('services.enterCity')}
                  required
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">{t('services.additionalNotes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  className={rtlClass}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder={t('services.anySpecificRequirementsOrPreferences')}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button className="text-white" type="submit" size="lg">
                  {t('services.bookService')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SupervisionServiceForm; 