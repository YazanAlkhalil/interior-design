import { Card, CardContent, CardFooter, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// You can move this to a separate types file
export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
}

// You can move this to a separate data file
const services = [
  {
    id: "1",
    title: "Design service",
    description: "Our expert designers will work with you to create a personalized design plan that fits your style and budget.",
    image: require('../assets/images/2.jpeg'),
    icon: "✏️",
    url:"services/interior-design",
  },
  {
    id: "2",
    title: "Consultation service",
    description: "Get professional advice and guidance on your interior design project with our consultation service.",
    image: require('../assets/images/super.webp'),
    url:"services/consultation",
    icon: "💬",
  },
  {
    id: "3",
    title: "Implementation service",
    description: "We'll handle the entire implementation process, from sourcing materials to coordinating with contractors.",
    image: require('../assets/images/implement.jpg'),
    icon: "🔨",
    url:"services/implementation",
  },
  {
    id: "4",
    title: "Area service",
    description: "Our area-specific services cater to the unique design needs of different spaces, from kitchens to bedrooms.",
    image: require('../assets/images/Design.png'),
    icon: "🏠",
    url:"services/area",
  },
  {
    id: "5",
    title: "Supervision service",
    description: "We'll oversee the entire project from start to finish, ensuring that everything is completed to your satisfaction.",
    image: require('../assets/images/Choose-best-Interior-Designer-1.webp'),
    icon: "📝",
    url:"services/supervision",
  },
]

const Services = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Our Services</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our range of professional services designed to help you create your perfect space.
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
                    Book Service
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