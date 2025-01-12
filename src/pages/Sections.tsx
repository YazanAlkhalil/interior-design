import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Lottie from "lottie-react";
import animationData from "../assets/SK.json";

interface SectionCard {
  title: string;
  description: string;
  image: string;
  uuid: string;
}



const Sections = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuthenticatedFetch();
  const { t } = useLanguage();

  const [sections, setSections] = useState<SectionCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSections = async () => {
      try {
        const res = await authFetch("sections/?page=1&page_size=30");
        if(res.ok) {
          const data = await res.json();
          setSections(data.results);
        }
      } finally {
        setLoading(false);
      }
    };
    getSections();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Lottie
          animationData={animationData}
          className="w-96"
          loop={true}
          autoplay={true}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            {t('sections.title')}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {t('sections.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="overflow-hidden hover:shadow-lg hover:cursor-pointer transition-shadow"
                onClick={() =>
                  navigate(
                    `/home/sections/${encodeURIComponent(section.uuid)}`
                  )
                }
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <button className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
                    {t('sections.learnMore')}
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sections;
