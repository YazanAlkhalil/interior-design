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

interface SectionCard {
  title: string;
  description: string;
  imageUrl: string;
  uuid: string;
}



const Sections = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuthenticatedFetch();

  const [sections, setSections] = useState<SectionCard[]>([]);
  useEffect(() => {
    console.log('useEffect')
    const getSections = async () => {
      console.log('getSections')
      const res = await authFetch("sections/?page=1&page_size=30");
      if(res.ok) {
        const data = await res.json();
        setSections(data.results);
        console.log(data);
      }
    };
    getSections();
  }, []);

  return (
    <div className="container mx-auto py-12">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Our Design Sections
          </h1>
          <p className="mt-4 text-muted-foreground">
            Discover our comprehensive range of design solutions
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
                    src={section.imageUrl}
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
                    Learn More
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
