import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
// You can move this to a separate types file
export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

// You can move this to a separate data file

const Services = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const services = [
    {
      id: "1",
      title: t('home.designService'),
      description: t('home.designServiceDescription'),
      image: require('../assets/images/design_service.jpg'),
      icon: "✏️",
      url:"services/interior-design",
    },
    {
      id: "2",
      title: t('home.consultationService'),
      description: t('home.consultationServiceDescription'),
      image: require('../assets/images/consulting_service.png'),
      url:"services/consultation",
      icon: "💬",
    },
    {
      id: "3",
      title: t('home.implementationService'),
      description: t('home.implementationServiceDescription'),
      image: require('../assets/images/implement_service.jpg'),
      icon: "🔨",
      url:"services/implementation",
    },
    {
      id: "4",
      title: t('home.areaService'),
      description: t('home.areaServiceDescription'),
      image: require('../assets/images/area_service.jpg'),
      icon: "🏠",
      url:"services/area",
    },
    {
      id: "5",
      title: t('home.supervisionService'),
      description: t('home.supervisionServiceDescription'),
      image: require('../assets/images/supervision_service.jpg'),
      icon: "📝",
      url:"services/supervision",
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{t('services.title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('services.description')}
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card onClick={() => navigate(`/home/${service.url}`)} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader className="relative p-0">
                  <div className="overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center text-xl">
                    {service.icon}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full text-white"
                    onClick={() => navigate(`/home/services/${service.id}`)}
                  >
                    {t('services.bookService')}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Services;