import { Button } from "../components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious} from '../components/ui/Carousel'
import { Product } from "../components/shared/Product"
import { useNavigate } from "react-router-dom"
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import BlackBoxProduct from "../components/shared/BlackBoxProduct";
// import serviceImage from '../assets/images/2.jpg'
// Mock data for services
const services = [
  {
    title: "Design service",
    description: "Order now",
    image: require('../assets/images/2.jpeg')
  },
  {
    title: "Consultation service",
    description: "Order now",
    image: require('../assets/images/super.webp')
  },
  {
    title: "Implement service",
    description: "Order now",
    image: require('../assets/images/implement.jpg')
  },
  {
    title: "Area service",
    description: "Order now",
    image: require('../assets/images/Design.png')
  },
  {
    title: "Supervision service",
    description: "Order now",
    image: require('../assets/images/Choose-best-Interior-Designer-1.webp')
  },
]

// Mock data for products
const topProducts = [
  {
    id: "1",
    name: "Product 1",
    price: 99.99,
    image: require('../assets/images/images (2).jpeg'),
    average_rating: 4,
    
  },
  {
    id: "2",
    name: "Product 2",
    price: 149.99,
    image: require('../assets/images/images (2).jpeg'),
    average_rating: 5
  },
  {
    id: "3",
    name: "Product 3",
    price: 79.99,
    image: require('../assets/images/images (2).jpeg'),
    average_rating: 4
  },
  {
    id: "4",
    name: "Product 4",
    price: 199.99,
    image: require('../assets/images/images (2).jpeg'),
    average_rating: 5
  },
  {
    id: "5",
    name: "Product 4",
    price: 199.99,
    image: require('../assets/images/images (2).jpeg'),
    average_rating: 5
  },
  {
    id: "6",
    name: "Product 4",
    price: 199.99,
    image: require('../assets/images/images (2).jpeg'),
    average_rating: 5
  },
  {
    id: "7",
    name: "Product 4",
    price: 199.99,
    image: require('../assets/images/images (2).jpeg'),
    average_rating: 5
  },
]

export const Home = () => {
  const navigate = useNavigate()
  const productsRef = useRef(null)
  const isInView = useInView(productsRef, { once: true, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const productContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const productVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.8,
      }
    }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Services Carousel */}
      <motion.section 
        className="mb-16"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold mb-6">Our Services</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {services.map((service, index) => (
              <CarouselItem key={index} className="basis-full">
                <motion.div 
                  className="bg-white rounded-lg text-center shadow-md hover:cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-[1024px] h-[450px] rounded mx-auto mb-4"
                  />
                  <h3 className="font-semibold text-lg">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </motion.section>

      {/* Top Products Section */}
      <motion.section 
        ref={productsRef}
        variants={productContainerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Top Products</h2>
          <Button 
            variant="outline"
            onClick={() => navigate('/products')}
          >
            See More
          </Button>
        </div>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {topProducts.map((product, index) => (
            <motion.div
              key={index}
              variants={productVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >

              <Product {...product} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </motion.div>
  )
}