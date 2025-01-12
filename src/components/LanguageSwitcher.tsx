import { Button } from "./ui/button";
import { useLanguage } from "../context/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="fixed top-4 right-4"
    >
      {language === 'en' ? 'العربية' : 'English'}
    </Button>
  );
} 